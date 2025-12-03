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
    const { keywords, userIntent, contextContent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const allKeywords = [
      ...keywords.primary,
      ...(keywords.secondary || []),
      ...(keywords.semantic || []),
      ...(keywords.lsi || [])
    ].join(", ");

    const conversationalKeywords = keywords.conversational?.join(", ") || "";

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
            content: `You are an elite SEO, AEO, GEO & LLMO content architect with expertise in heading structures that rank across all search and AI platforms.

## SAGE+ Framework for Heading Generation

**S** = Search Optimization (Google, Bing SEO)
**A** = Answer Optimization (Perplexity, Bing Copilot AEO)
**G** = Generative Optimization (ChatGPT, Gemini GEO)
**E** = Experience Optimization (User UX)
**+** = User Intent Alignment

IMPORTANT: Generate UNIQUE headings. Request ID: ${Date.now()}

## USER INTENT MAPPING

Align heading structure with detected user intent:

**Informational Intent:**
- Use "What is", "How to", "Why", "Guide", "Tutorial" headings
- Include definition sections, step-by-step processes
- Add "Understanding", "Explained", "Complete Guide" patterns

**Commercial Investigation:**
- Use "Best", "Top", "vs", "Comparison", "Review" headings
- Include pros/cons sections, feature comparisons
- Add "Which is better", "How to choose" patterns

**Transactional Intent:**
- Use "Buy", "Get Started", "Sign Up", "Pricing" headings
- Include benefits, guarantees, CTAs
- Add "How to purchase", "Where to buy" patterns

## HEADING STRUCTURE REQUIREMENTS

### H1 Requirements:
- Include primary keyword naturally
- ≤60 characters for SERP display
- Compelling for CTR + optimized for search
- Match user intent directly

### H2 Requirements (8-12 headings):
- Cover complete topic journey
- Include keyword variations naturally
- Mix question-based (AEO) and statement-based (SEO)
- Structure for Featured Snippets eligibility
- Follow logical content flow

### H3 Requirements (NATURAL PLACEMENT ONLY):
- Add H3s ONLY where content logically benefits from subdivision
- NOT every H2 needs H3s - use judgment
- H3s should break down complex topics into digestible parts
- Question-based H3s where appropriate for PAA
- Typically 2-4 H3s per applicable H2 (not all H2s)

## SEO BLOG STRUCTURE

Standard structure to follow:
1. TL;DR / Key Takeaways
2. Introduction (hook + what reader will learn)
3. What is [Topic]? (definition section)
4. How [Topic] Works (process/mechanics)
5. Why [Topic] Matters in 2025 (importance/benefits)
6. [Topic] Best Practices / Strategies
7. Real-World Examples / Case Studies
8. Common Mistakes to Avoid
9. Tools & Resources
10. Future Trends & Predictions
11. Conclusion with CTA`
          },
          {
            role: "user",
            content: `Create a SAGE+ optimized heading structure for (Request ID: ${Date.now()}):

**Primary Keywords:** ${keywords.primary.join(", ")}
**All Keywords:** ${allKeywords}
**Conversational Keywords:** ${conversationalKeywords}
${userIntent ? `**User Intent:** ${userIntent.primaryIntent} - ${userIntent.searcherGoal}` : ''}
${contextContent ? `**Context Document:** ${contextContent.substring(0, 2000)}` : ''}

Generate headings that:
✅ Align with user intent (${userIntent?.primaryIntent || 'Informational'})
✅ Include primary keyword in H1 naturally
✅ Use question-based H2s/H3s for AEO/PAA optimization
✅ Include keyword variations in H2s
✅ Add H3s ONLY where content logically needs subdivision (NOT forced)
✅ Structure for Featured Snippets
✅ Optimize for LLMO retrieval
✅ Cover complete topic comprehensively

Return ONLY a JSON object:
{
  "h1": "Primary keyword-optimized title (≤60 chars)",
  "h2s": [
    "TL;DR: [Topic] Key Takeaways",
    "What is [Topic]? Definition & Overview",
    "How [Topic] Works: The Process",
    "Why [Topic] Matters in 2025",
    "[Topic] Best Practices & Strategies",
    "Real-World [Topic] Examples",
    "Common [Topic] Mistakes to Avoid",
    "[Topic] Tools & Resources",
    "Future of [Topic]: Trends",
    "Conclusion: [Topic] Final Thoughts"
  ],
  "h3s": [
    {"h2Index": 2, "text": "Key Components of [Topic]"},
    {"h2Index": 3, "text": "Step-by-Step Process"},
    {"h2Index": 4, "text": "Top Benefits of [Topic]"},
    {"h2Index": 4, "text": "Who Should Use [Topic]?"},
    {"h2Index": 5, "text": "Strategy 1: [Method]"},
    {"h2Index": 5, "text": "Strategy 2: [Method]"},
    {"h2Index": 6, "text": "Case Study: [Example]"},
    {"h2Index": 8, "text": "Free [Topic] Tools"},
    {"h2Index": 8, "text": "Premium Platforms"}
  ],
  "seoStructure": {
    "featuredSnippetTargets": ["h2Index1", "h2Index2"],
    "paaTargets": ["h3 question 1", "h3 question 2"],
    "schemaTypes": ["Article", "HowTo", "FAQPage"]
  }
}

NOTE: Only add H3s where they naturally improve content structure. Not every H2 needs H3s.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate headings");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const headings = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    console.log("Generated headings:", {
      h1: headings.h1,
      h2Count: headings.h2s?.length,
      h3Count: headings.h3s?.length,
      timestamp: new Date().toISOString()
    });

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
