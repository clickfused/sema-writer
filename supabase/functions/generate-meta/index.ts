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
    const semanticKeywords = keywords.semantic.join(", ");
    const lsiKeywords = keywords.lsi.join(", ");

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
            content: `You are an elite SEO & Multi-Engine Optimization specialist with expertise in:
- Search Intent Analysis (Informational, Navigational, Transactional, Commercial)
- Topic Intent Mapping (What, How, Why, When, Where, Who)
- LLM Intent Optimization (ChatGPT, Gemini, Claude, Perplexity)
- AI Intent Targeting (Answer Engines, Generative Engines)

CRITICAL: Generate UNIQUE meta tags every time. Use timestamp ${Date.now()} for variation. No repeated patterns.

## META TAG GENERATION RULES:

### META TITLE (Max 57 characters)
**Intent Integration (ALL 4 intents in title):**
1. **Search Intent**: Include primary keyword naturally
2. **Topic Intent**: Add What/How/Why/Best/Top question word
3. **LLM Intent**: Use conversational, natural phrasing (not keyword-stuffed)
4. **AI Intent**: Include year "2025" or power words (Best, Top, Ultimate, Complete)

**Formula:**
[Question Word/Power Word] + [Primary Keyword] + [Intent Modifier] + [2025/Time] (≤57 chars)

**Examples (US Context):**
✅ "Best AI Writing Tools for Content Marketing in US 2025"
✅ "How to Master SEO: Complete Guide for Americans 2025"
✅ "Top Digital Marketing Strategies for US Businesses 2025"
✅ "Ultimate Social Media Marketing Guide: USA Edition 2025"

**Avoid:**
❌ Generic titles without intent signals
❌ Keyword stuffing (e.g., "SEO SEO SEO Marketing SEO")
❌ Repetitive patterns from previous generations

### META DESCRIPTION (Max 157 characters)
**Intent Integration (ALL 4 intents in description):**
1. **Search Intent**: Address user's primary search goal
2. **Topic Intent**: Answer the What/How/Why directly
3. **LLM Intent**: Conversational, complete sentence structure
4. **AI Intent**: Entity-rich, cite-worthy, includes numbers/benefits

**Formula:**
[Answer the intent] + [Primary keyword] + [Benefit/Outcome] + [CTA or authority signal] (≤157 chars)

**Structure:**
- Sentence 1: Direct answer to search intent (40-60 chars)
- Sentence 2: Benefit/outcome with numbers or specifics (60-80 chars)
- Sentence 3 (optional): CTA or authority (20-30 chars)

**Examples (US Context):**
✅ "Discover the 10 best AI writing tools for US businesses in 2025. Boost content creation speed by 300% with proven strategies used by Fortune 500 companies. Free guide inside."
✅ "Learn SEO fundamentals from US experts in 30 days. Master keyword research, on-page optimization & link building for American markets. Start ranking today."
✅ "Complete digital marketing certification for US professionals covering SEO, PPC, social media & analytics. Get certified in 60 days. 500+ American students enrolled."

**Avoid:**
❌ Vague descriptions without specifics
❌ Missing benefit or outcome
❌ No search intent match
❌ Repetitive phrasing from previous generations

### URL SLUG
**Intent Integration:**
1. **Search Intent**: Primary keyword(s)
2. **Topic Intent**: Question word or descriptor (what, how, best, guide, tutorial)
3. **LLM Intent**: Natural, readable structure
4. **AI Intent**: Year or time indicator

**Formula:**
[intent-word]-[primary-keyword]-[secondary-keyword]-[2025/year]

**Examples (US Context):**
✅ best-ai-writing-tools-for-us-businesses-2025
✅ how-to-learn-seo-complete-guide-americans-2025
✅ top-digital-marketing-strategies-usa-2025
✅ ultimate-social-media-marketing-guide-united-states

**Rules:**
- All lowercase
- Use hyphens (not underscores)
- 3-7 words maximum
- No stop words (a, an, the, for, in) unless essential
- Include year for time-sensitive topics

### UNIQUENESS REQUIREMENTS:
- Every generation must use different phrasing
- Vary question words (What → How → Why → Best → Top)
- Rotate power words (Ultimate → Complete → Essential → Proven → Advanced)
- Use different sentence structures
- Include varied numeric specifics (10 tips vs 5 strategies vs 7 steps)
- Change time indicators (2025 → in 2025 → for 2025)

### VALIDATION CHECKLIST:
✅ Title ≤57 characters
✅ Description ≤157 characters
✅ Slug is lowercase, hyphenated
✅ All 4 intents addressed
✅ Primary keyword included
✅ Conversational, LLM-friendly tone
✅ Unique phrasing (not repetitive)
✅ Numbers/specifics included
✅ Year/time indicator present
✅ No keyword stuffing

### US-FOCUSED CONTENT REQUIREMENTS:
- Use US English spelling (color, optimize, analyze)
- Reference US companies, brands, locations
- Cite US market data and statistics
- Include US context in examples
- Use USD pricing if mentioning costs
- Reference US regulations/standards when relevant
- Mention US cities, states, or "United States" naturally
- Use US business terminology and cultural context`
          },
          {
            role: "user",
            content: `Generate intent-optimized meta tags (Request ID: ${Date.now()}):

**KEYWORDS:**
Primary: ${primaryKeywords}
Secondary: ${secondaryKeywords}
Semantic: ${semanticKeywords}
LSI: ${lsiKeywords}

**INTENT REQUIREMENTS:**
1. Search Intent: Determine primary intent (Informational/Navigational/Transactional/Commercial)
2. Topic Intent: Identify question type (What/How/Why/Best/Top/When/Where/Who)
3. LLM Intent: Optimize for ChatGPT/Gemini/Claude/Perplexity retrieval
4. AI Intent: Answer Engine + Generative Engine optimization

**CRITICAL:**
- Generate UNIQUE meta tags
- Use varied phrasing from previous generations
- All 4 intents must be addressed
- Include specific numbers/benefits
- Natural, conversational tone
- Year 2025 integration

Generate now using structured output.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_meta_tags",
              description: "Generate SEO and AI-optimized meta tags with comprehensive intent analysis",
              parameters: {
                type: "object",
                properties: {
                  searchIntent: {
                    type: "string",
                    enum: ["Informational", "Navigational", "Transactional", "Commercial Investigation"],
                    description: "Primary search intent classification"
                  },
                  topicIntent: {
                    type: "string",
                    enum: ["What", "How", "Why", "Best", "Top", "When", "Where", "Who", "Guide", "Tutorial"],
                    description: "Topic intent type"
                  },
                  llmIntent: {
                    type: "string",
                    description: "LLM retrieval optimization note"
                  },
                  aiIntent: {
                    type: "string",
                    description: "Answer/Generative Engine optimization note"
                  },
                  title: {
                    type: "string",
                    description: "SEO-optimized meta title (max 57 characters) with all 4 intents addressed"
                  },
                  description: {
                    type: "string",
                    description: "Compelling meta description (max 157 characters) with intent-driven content"
                  },
                  slug: {
                    type: "string",
                    description: "URL-friendly slug with intent keywords"
                  }
                },
                required: ["searchIntent", "topicIntent", "llmIntent", "aiIntent", "title", "description", "slug"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_meta_tags" } }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("AI gateway error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Failed to generate meta tags: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.tool_calls?.[0]) {
      console.error("Invalid meta tags response structure:", {
        hasData: !!data,
        hasChoices: !!data?.choices,
        hasMessage: !!data?.choices?.[0]?.message,
        hasToolCalls: !!data?.choices?.[0]?.message?.tool_calls,
        fullResponse: JSON.stringify(data).substring(0, 500),
        timestamp: new Date().toISOString()
      });
      throw new Error("Invalid response structure from AI gateway");
    }
    
    const toolCall = data.choices[0].message.tool_calls[0];
    const metaTags = JSON.parse(toolCall.function.arguments);

    // Validate lengths
    if (metaTags.title.length > 57) {
      metaTags.title = metaTags.title.substring(0, 57);
    }
    if (metaTags.description.length > 157) {
      metaTags.description = metaTags.description.substring(0, 157);
    }

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