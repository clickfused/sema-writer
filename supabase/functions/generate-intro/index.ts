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
    const { keywords, metaTags } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert SEO content writer specializing in E-E-A-T optimization and AEO (Answer Engine Optimization).

Create introductions optimized for:
- Featured snippets in Google
- Answer Engine citations (Perplexity, Bing Copilot)
- Generative Engine recommendations (ChatGPT, Gemini)

Format with HTML only:
- Use <p> for paragraphs
- Use <strong> for emphasis (never markdown)
- Write naturally to pass AI detection`
          },
          {
            role: "user",
            content: `Write a 100-word introduction for: "${metaTags.title}"

Primary keywords: ${keywords.primary.join(", ")}

Requirements:
- Exactly 100 words
- Include primary keyword in first sentence
- Hook readers with value proposition
- Signal expertise and experience
- Answer the main question immediately
- Use HTML <p> and <strong> tags
- Natural, human-like writing
- Optimized for featured snippets and AI citations`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to generate introduction");
    }

    const data = await response.json();
    const intro = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ intro }),
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