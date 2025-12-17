import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, keywords, numberOfImages = 2, generateCover = true } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const images: { type: string; prompt: string; imageUrl: string }[] = [];

    // Generate cover image if requested
    if (generateCover) {
      console.log("Generating cover image...");
      const coverPrompt = `Professional blog cover image for article about "${topic}". Modern, clean design with relevant visual elements. High quality, 16:9 aspect ratio, suitable for featured image.`;
      
      const coverResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: coverPrompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!coverResponse.ok) {
        const errorText = await coverResponse.text();
        console.error("Cover image generation error:", coverResponse.status, errorText);
        if (coverResponse.status === 429) {
          throw new Error("Rate limits exceeded, please try again later.");
        }
        if (coverResponse.status === 402) {
          throw new Error("Payment required, please add funds to your Lovable AI workspace.");
        }
        throw new Error(`Cover image generation failed: ${errorText}`);
      }

      const coverData = await coverResponse.json();
      const coverImageUrl = coverData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (coverImageUrl) {
        images.push({
          type: "cover",
          prompt: coverPrompt,
          imageUrl: coverImageUrl,
        });
        console.log("Cover image generated successfully");
      }
    }

    // Generate content images
    const primaryKeyword = keywords?.primary?.[0] || topic;
    const contentPrompts = [
      `Informative illustration for blog section about "${primaryKeyword}". Clean, professional, educational visual.`,
      `Visual diagram or infographic style image explaining concepts related to "${primaryKeyword}". Modern design.`,
      `Professional photograph style image representing "${topic}" concept. High quality, relevant imagery.`,
      `Abstract or conceptual art representing "${primaryKeyword}" theme. Modern, engaging visual.`,
      `Data visualization or chart style image related to "${topic}". Clean, professional design.`,
    ];

    const numContentImages = Math.min(numberOfImages, 5);
    for (let i = 0; i < numContentImages; i++) {
      console.log(`Generating content image ${i + 1}/${numContentImages}...`);
      const prompt = contentPrompts[i % contentPrompts.length];

      const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });

      if (!imageResponse.ok) {
        const errorText = await imageResponse.text();
        console.error(`Content image ${i + 1} generation error:`, imageResponse.status, errorText);
        if (imageResponse.status === 429) {
          throw new Error("Rate limits exceeded, please try again later.");
        }
        if (imageResponse.status === 402) {
          throw new Error("Payment required, please add funds to your Lovable AI workspace.");
        }
        continue; // Skip this image but continue with others
      }

      const imageData = await imageResponse.json();
      const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (imageUrl) {
        images.push({
          type: "content",
          prompt: prompt,
          imageUrl: imageUrl,
        });
        console.log(`Content image ${i + 1} generated successfully`);
      }
    }

    console.log(`Total images generated: ${images.length}`);

    return new Response(JSON.stringify({ success: true, images }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Error generating images:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
