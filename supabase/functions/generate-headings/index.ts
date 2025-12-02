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

### H2 Requirements (10-12 headings):
- Cover complete topic journey
- Include keyword variations naturally
- Mix question-based (AEO) and statement-based (SEO)
- Structure for Featured Snippets eligibility
- Follow logical content flow

### H3 Requirements (3-5 per relevant H2):
- Detailed subtopics under each major H2
- Question-based where appropriate for PAA
- Include long-tail keyword opportunities
- Support scannable content structure
- Optimize for LLMO retrieval

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
11. FAQ Section
12. Conclusion with CTA`
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
✅ Have 3-5 detailed H3s under each major H2
✅ Structure for Featured Snippets
✅ Optimize for LLMO retrieval
✅ Cover complete topic comprehensively

Return ONLY a JSON object:
{
  "h1": "Primary keyword-optimized title (≤60 chars)",
  "h2s": [
    "TL;DR: [Topic] Key Takeaways",
    "Introduction to [Topic]",
    "What is [Topic]? Complete Definition",
    "How Does [Topic] Work? Step-by-Step",
    "Why [Topic] Matters in 2025",
    "[Topic] Best Practices & Strategies",
    "Real-World [Topic] Examples & Case Studies",
    "Common [Topic] Mistakes to Avoid",
    "[Topic] Tools & Resources",
    "Future of [Topic]: Trends & Predictions",
    "Frequently Asked Questions About [Topic]",
    "Conclusion: [Topic] Final Thoughts"
  ],
  "h3s": [
    {"h2Index": 2, "text": "Simple Definition of [Topic]"},
    {"h2Index": 2, "text": "Key Components of [Topic]"},
    {"h2Index": 2, "text": "[Topic] vs Related Concepts"},
    {"h2Index": 3, "text": "Step 1: [First Process Step]"},
    {"h2Index": 3, "text": "Step 2: [Second Process Step]"},
    {"h2Index": 3, "text": "Step 3: [Third Process Step]"},
    {"h2Index": 3, "text": "Step 4: [Fourth Process Step]"},
    {"h2Index": 4, "text": "Key Benefits of [Topic]"},
    {"h2Index": 4, "text": "[Topic] Industry Statistics 2025"},
    {"h2Index": 4, "text": "Who Should Use [Topic]?"},
    {"h2Index": 5, "text": "Strategy 1: [Specific Method]"},
    {"h2Index": 5, "text": "Strategy 2: [Specific Method]"},
    {"h2Index": 5, "text": "Strategy 3: [Specific Method]"},
    {"h2Index": 5, "text": "Strategy 4: [Specific Method]"},
    {"h2Index": 6, "text": "Case Study 1: [Company/Brand]"},
    {"h2Index": 6, "text": "Case Study 2: [Company/Brand]"},
    {"h2Index": 6, "text": "Case Study 3: [Company/Brand]"},
    {"h2Index": 7, "text": "Mistake 1: [Common Error]"},
    {"h2Index": 7, "text": "Mistake 2: [Common Error]"},
    {"h2Index": 7, "text": "Mistake 3: [Common Error]"},
    {"h2Index": 8, "text": "Top Free [Topic] Tools"},
    {"h2Index": 8, "text": "Premium [Topic] Platforms"},
    {"h2Index": 8, "text": "Learning Resources for [Topic]"},
    {"h2Index": 9, "text": "Emerging [Topic] Technologies"},
    {"h2Index": 9, "text": "AI Impact on [Topic]"},
    {"h2Index": 9, "text": "[Topic] Predictions for 2025-2026"},
    {"h2Index": 10, "text": "What is [Topic] and how does it work?"},
    {"h2Index": 10, "text": "How much does [Topic] cost?"},
    {"h2Index": 10, "text": "Is [Topic] worth it in 2025?"},
    {"h2Index": 10, "text": "What are the best [Topic] tools?"},
    {"h2Index": 10, "text": "How to get started with [Topic]?"}
  ],
  "seoStructure": {
    "featuredSnippetTargets": ["h2Index1", "h2Index2"],
    "paaTargets": ["h3 question 1", "h3 question 2"],
    "schemaTypes": ["Article", "HowTo", "FAQPage"]
  }
}`
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
