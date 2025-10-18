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
    const { wordpressUrl, username, appPassword, post } = await req.json();

    if (!wordpressUrl || !username || !appPassword) {
      throw new Error("WordPress credentials not configured");
    }

    // Create WordPress post
    const response = await fetch(`${wordpressUrl}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${username}:${appPassword}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: post.title,
        content: post.content,
        status: "draft", // Can be 'draft' or 'publish'
        meta: {
          description: post.metaDescription,
        },
        slug: post.slug,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("WordPress API error:", response.status, errorText);
      throw new Error(`Failed to publish to WordPress: ${response.statusText}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ 
        success: true,
        postId: data.id,
        postUrl: data.link
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
