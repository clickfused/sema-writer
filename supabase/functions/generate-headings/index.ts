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
            content: `You are a senior SEO, AEO & GEO strategist with 10+ years of experience.
Use the SAGE Framework to create heading structures that rank across:
- Search Engines (Google, Bing) 
- Answer Engines (Perplexity, Gemini)
- Generative Engines (ChatGPT, Claude)

SAGE Framework:
S = Search Optimization (SEO)
A = Answer Optimization (AEO) 
G = Generative Optimization (GEO)
E = Experience Optimization (UX)`
          },
          {
            role: "user",
            content: `Create a SAGE-optimized heading structure (H1–H3) for a blog post about: ${allKeywords}

Return ONLY a JSON object with this structure:
{
  "h1": "Search-optimized main title (≤60 chars, include primary keyword)",
  "h2s": [
    "TL;DR Summary",
    "Introduction", 
    "What is [Topic/Keyword]?",
    "How Does [Topic] Work?",
    "Why is [Topic] Important in 2025?",
    "[Topic] Strategies or Best Practices",
    "Real-World Examples or Case Studies",
    "Future Trends & Predictions",
    "Recap Summary",
    "FAQ Section",
    "Conclusion"
  ],
  "h3s": [
    {"h2Index": 2, "text": "Simple Definition"},
    {"h2Index": 2, "text": "Key Features or Elements"},
    {"h2Index": 2, "text": "Example in Real Use Case"},
    {"h2Index": 3, "text": "Step 1 – [Process Explanation]"},
    {"h2Index": 3, "text": "Step 2 – [Process Explanation]"},
    {"h2Index": 3, "text": "Step 3 – [Output/Result]"},
    {"h2Index": 4, "text": "Key Data & Trends"},
    {"h2Index": 4, "text": "Benefits & Opportunities"},
    {"h2Index": 4, "text": "Challenges & Limitations"},
    {"h2Index": 5, "text": "Strategy 1 – [Specific Tip/Method]"},
    {"h2Index": 5, "text": "Strategy 2 – [Specific Tip/Method]"},
    {"h2Index": 5, "text": "Strategy 3 – [Specific Tip/Method]"},
    {"h2Index": 6, "text": "Example 1 – [Entity/Brand]"},
    {"h2Index": 6, "text": "Example 2 – [Entity/Brand]"},
    {"h2Index": 6, "text": "Example 3 – [Entity/Brand]"},
    {"h2Index": 7, "text": "Emerging Tech / Tools"},
    {"h2Index": 7, "text": "AI Impact / Market Forecasts"},
    {"h2Index": 7, "text": "What to Watch Next"},
    {"h2Index": 9, "text": "What are the top [topic] in 2025?"},
    {"h2Index": 9, "text": "How does [topic] affect ranking factors?"},
    {"h2Index": 9, "text": "Is [topic] detectable by search engines?"},
    {"h2Index": 9, "text": "How to optimize for ChatGPT or Perplexity answers?"}
  ]
}

SAGE Requirements:
✅ H1: Include primary keyword, ≤60 characters, clickable for humans + search engines
✅ H2s: Follow SAGE structure (TL;DR, What/How/Why, Examples, FAQ, Conclusion)
✅ H3s: Question-based for AEO where relevant, distributed across H2s
✅ Integrate keywords naturally throughout
✅ Structure for Featured Snippets, HowTo schema, FAQ schema
✅ Optimize for LLM retrieval (ChatGPT, Gemini, Perplexity)
✅ Maintain entity consistency in phrasing`
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