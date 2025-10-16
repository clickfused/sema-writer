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
    const { keywords } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const primaryKeywords = keywords.primary.join(", ");
    const secondaryKeywords = keywords.secondary.join(", ");

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
            content: "You are an expert SEO specialist. Generate optimized meta tags for blog posts."
          },
          {
            role: "user",
            content: `Generate meta tags for a blog post with these keywords:
Primary: ${primaryKeywords}
Secondary: ${secondaryKeywords}

Return ONLY a JSON object with:
{
  "title": "SEO-optimized title (max 57 characters)",
  "description": "Compelling meta description (max 157 characters)",
  "slug": "url-friendly-slug"
}`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to generate meta tags");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const metaTags = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    return new Response(
      JSON.stringify(metaTags),
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