import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wordpressUrl, username, appPassword } = await req.json();

    if (!wordpressUrl || !username || !appPassword) {
      throw new Error("WordPress credentials are required");
    }

    // Clean up URL
    const cleanUrl = wordpressUrl.replace(/\/$/, '');
    console.log(`Testing WordPress connection to: ${cleanUrl}`);

    // Test connection by getting site info
    const response = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${btoa(`${username}:${appPassword}`)}`,
        "Content-Type": "application/json",
      },
    });

    // Get response text first to handle both JSON and HTML responses
    const responseText = await response.text();
    console.log(`WordPress response status: ${response.status}, content-type: ${response.headers.get('content-type')}`);

    if (!response.ok) {
      console.error("WordPress API error:", response.status, responseText.substring(0, 500));
      
      if (response.status === 401) {
        throw new Error("Authentication failed. Please check your username and application password.");
      } else if (response.status === 404) {
        throw new Error("WordPress REST API not found. Please ensure REST API is enabled on your site.");
      } else if (response.status === 403) {
        throw new Error("Access forbidden. Please check your user permissions.");
      } else if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
        throw new Error("WordPress REST API returned HTML instead of JSON. Please check if REST API is properly configured.");
      } else {
        throw new Error(`Connection failed (${response.status}): ${response.statusText}`);
      }
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json') && responseText.startsWith('<')) {
      console.error("Non-JSON response received:", responseText.substring(0, 200));
      throw new Error("WordPress REST API returned HTML instead of JSON. Please ensure REST API is enabled and accessible.");
    }

    let userData;
    try {
      userData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError, responseText.substring(0, 200));
      throw new Error("Invalid response from WordPress. Please check your site configuration.");
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "WordPress connection successful!",
        user: {
          name: userData.name,
          email: userData.email,
          roles: userData.roles
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("WordPress connection error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error connecting to WordPress" 
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
