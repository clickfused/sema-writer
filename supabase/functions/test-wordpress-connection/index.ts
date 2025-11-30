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

    // Test connection by getting site info
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/users/me`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${btoa(`${username}:${appPassword}`)}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WordPress API error:", response.status, errorText);
      
      if (response.status === 401) {
        throw new Error("Authentication failed. Please check your username and application password.");
      } else if (response.status === 404) {
        throw new Error("WordPress site not found. Please check your site URL.");
      } else {
        throw new Error(`Connection failed: ${response.statusText}`);
      }
    }

    const userData = await response.json();

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
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
