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
    const { wordpressUrl, username, appPassword, imageUrl, fileName } = await req.json();

    if (!wordpressUrl || !username || !appPassword || !imageUrl) {
      throw new Error("Missing required parameters");
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Upload to WordPress Media Library
    const uploadResponse = await fetch(`${wordpressUrl}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${btoa(`${username}:${appPassword}`)}`,
        "Content-Disposition": `attachment; filename="${fileName || 'blog-image.jpg'}"`,
        "Content-Type": imageBlob.type,
      },
      body: imageBuffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("WordPress media upload error:", uploadResponse.status, errorText);
      throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
    }

    const mediaData = await uploadResponse.json();

    return new Response(
      JSON.stringify({ 
        success: true,
        mediaId: mediaData.id,
        mediaUrl: mediaData.source_url
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
