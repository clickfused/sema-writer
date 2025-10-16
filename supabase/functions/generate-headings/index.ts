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

    const allKeywords = [
      ...keywords.primary,
      ...keywords.secondary,
      ...keywords.semantic,
      ...keywords.lsi
    ].join(", ");

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
            content: "You are an expert content strategist. Create SEO-optimized heading structures for blog posts."
          },
          {
            role: "user",
            content: `Create a heading structure for a blog post about these keywords: ${allKeywords}

Return ONLY a JSON object with:
{
  "h1": "Main article title",
  "h2s": ["10+ H2 section headings"],
  "h3s": [{"h2Index": 0, "text": "H3 subheading"}]
}

Requirements:
- Minimum 10 H2 headings
- At least 5 H3 subheadings total, distributed across different H2s
- Integrate keywords naturally`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to generate headings");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const headings = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    return new Response(
      JSON.stringify(headings),
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