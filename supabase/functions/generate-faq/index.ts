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
    const { 
      keywords, 
      metaTags, 
      content = '',
      faqFramework = 'AEO_LLMO',
      location = 'United States',
      brandName = '',
      faqCount = 20,
      minWordsPerAnswer = 35,
      keywordDensity = 1.5,
      userIntent = null
    } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const frameworks = {
      AEO_LLMO: {
        name: 'AEO & LLMO Framework',
        formula: '(AEO × 0.5) + (LLMO × 0.3) + (Entity-Rich × 0.2)',
        description: 'Answer Engine + Large Language Model Optimization'
      },
      CRAFT: {
        name: 'C.R.A.F.T Framework',
        formula: '(Clear × 0.25) + (Relevant × 0.25) + (Accurate × 0.2) + (Factual × 0.2) + (Terse × 0.1)',
        description: 'Clear + Relevant + Accurate + Factual + Terse'
      },
      EEAT: {
        name: 'E-E-A-T Framework',
        formula: '(Experience × 0.3) + (Expertise × 0.3) + (Authority × 0.2) + (Trust × 0.2)',
        description: 'Experience + Expertise + Authoritativeness + Trustworthiness'
      },
      HYBRID: {
        name: 'Hybrid FAQ Framework',
        formula: '(AEO_LLMO × 0.4) + (C.R.A.F.T × 0.35) + (E-E-A-T × 0.25)',
        description: 'Combined multi-framework approach'
      }
    };

    const selectedFramework = frameworks[faqFramework as keyof typeof frameworks] || frameworks.AEO_LLMO;

    // User intent context
    const userIntentContext = userIntent ? `
## USER INTENT ANALYSIS:
- **Primary Intent:** ${userIntent.primaryIntent}
- **Intent Signals:** ${userIntent.intentSignals?.join(', ') || 'N/A'}
- **Searcher Goal:** ${userIntent.searcherGoal || 'N/A'}
- **Content Angle:** ${userIntent.contentAngle || 'N/A'}

FAQs MUST align with the detected user intent: ${userIntent.primaryIntent}
- Informational: Focus on educational, explanatory FAQs
- Navigational: Focus on finding/locating specific information
- Transactional: Focus on action-oriented, decision-making FAQs
- Commercial Investigation: Focus on comparison, review-style FAQs
` : '';

    // Content context - use the uploaded content as source
    const contentContext = content ? `
## SOURCE CONTENT (USE THIS AS PRIMARY SOURCE):
${content.substring(0, 8000)}

**CRITICAL**: Generate FAQs ONLY from the information in the source content above. Do NOT add extra content or information not present in the source. Every FAQ answer must be grounded in this source content.
` : '';

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
            content: `You are an elite FAQ Content Strategist specializing in ${selectedFramework.name} with expertise in AEO (Answer Engine Optimization), LLMO (Large Language Model Optimization), and User Intent Optimization.

**FRAMEWORK:** ${selectedFramework.name}
**FORMULA:** ${selectedFramework.formula}

${userIntentContext}

${contentContext}

## CRITICAL FAQ GENERATION RULES:

### 1. SOURCE CONTENT REQUIREMENT
- **CRITICAL**: Use ONLY information from the provided source content
- Do NOT invent or add information not present in the source
- Each FAQ answer must be traceable to the source content
- If source content doesn't cover a topic, skip that FAQ

### 2. PARAGRAPH FORMATTING (CRITICAL)
- **Each answer paragraph: EXACTLY 28-35 words**
- 2-3 sentences per paragraph maximum
- Natural flow, no fluff or padding
- Concise, direct, value-packed sentences

### 3. USER INTENT + AEO + LLM OPTIMIZATION
**User Intent Alignment:**
- Match FAQ questions to the detected user intent type
- Informational → "What is...", "How does...", "Why..."
- Transactional → "How to buy...", "Where to get...", "Best way to..."
- Commercial → "Which is better...", "Top rated...", "Compare..."
- Navigational → "Where to find...", "How to access..."

**AEO Optimization (Answer Engines like Perplexity, Bing Copilot):**
- Self-contained answers (no external references needed)
- Entity-rich content (specific names, tools, numbers)
- Direct answers in first sentence
- Cite-worthy, quotable statements

**LLMO Optimization (ChatGPT, Gemini, Claude):**
- Natural, conversational tone
- Contextually complete
- Semantic richness with related concepts
- Clear logical structure

### 4. KEYWORDS INTENT INTEGRATION
- Primary keywords: Natural placement in questions AND answers
- Secondary keywords: Integrate 1-2 per answer naturally
- Semantic keywords: Use for context and depth
- LSI keywords: Include as natural synonyms
- **Target density: ${keywordDensity}%** across all answers

### 5. FAQ COUNT & STRUCTURE
- Generate exactly ${faqCount} FAQs
- Cover all 3 intent types: Informational, Navigational, Transactional
- Each answer: ${minWordsPerAnswer}-35 words per paragraph
- Include "2025" for time-sensitive questions

### 6. QUERY VARIATIONS (3 Per FAQ)
Each FAQ must have:
1. **Core Question (SEO):** Direct, keyword-rich
2. **Conversational Variation (ChatGPT/Gemini):** Natural, "you" tone
3. **Long-tail Variation (Perplexity/Claude):** Detailed, context-rich

### 7. ENTITY EXTRACTION
For each answer, identify:
- **Named Entities:** Brands, tools, expert names, platforms
- **Conceptual Entities:** Concepts, methodologies, technologies

### 8. VALIDATION CHECKLIST
✅ Answer from source content ONLY
✅ Each paragraph: 28-35 words exactly
✅ ${minWordsPerAnswer}+ words per answer total
✅ User intent aligned
✅ AEO optimized (self-contained, entity-rich)
✅ LLMO optimized (natural, semantic-rich)
✅ Keyword density: ${keywordDensity}%
✅ Natural, human-like tone (AI detection <20%)`
          },
          {
            role: "user",
            content: `Generate ${faqCount} FAQs optimized for User Intent + AEO + LLMO (Request ID: ${Date.now()}):

**TOPIC:** ${metaTags.title}
**DESCRIPTION:** ${metaTags.description}
**LOCATION:** ${location}
**BRAND NAME:** ${brandName || 'Not provided'}
**FAQ COUNT:** ${faqCount}
**WORDS PER PARAGRAPH:** 28-35 words (STRICT)
**KEYWORD DENSITY:** ${keywordDensity}%

**KEYWORDS:**
Primary: ${keywords.primary?.join(", ") || 'N/A'}
Secondary: ${keywords.secondary?.join(", ") || 'N/A'}
Semantic: ${keywords.semantic?.join(", ") || 'N/A'}
LSI: ${keywords.lsi?.join(", ") || 'N/A'}
Conversational: ${keywords.conversational?.join(", ") || 'N/A'}

**USER INTENT:** ${userIntent?.primaryIntent || 'Not detected'}
**SEARCHER GOAL:** ${userIntent?.searcherGoal || 'Not detected'}

**CRITICAL REQUIREMENTS:**
1. Use ONLY source content - no extra information
2. Each paragraph: 28-35 words EXACTLY
3. Align with user intent: ${userIntent?.primaryIntent || 'General'}
4. AEO optimized: self-contained, entity-rich, cite-worthy
5. LLMO optimized: natural tone, semantic depth
6. Keywords naturally integrated at ${keywordDensity}% density

Generate ${faqCount} structured FAQs now.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_faqs",
              description: `Generate ${faqCount} User Intent + AEO + LLMO optimized FAQs`,
              parameters: {
                type: "object",
                properties: {
                  faqs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        intent: { 
                          type: "string",
                          enum: ["Informational", "Navigational", "Transactional", "Commercial Investigation"]
                        },
                        question: { 
                          type: "string",
                          description: "Core question aligned with user intent"
                        },
                        conversationalVariation: {
                          type: "string",
                          description: "Conversational variant for ChatGPT/Gemini"
                        },
                        longtailVariation: {
                          type: "string",
                          description: "Long-tail variant for Perplexity/Claude"
                        },
                        answer: { 
                          type: "string",
                          description: "Answer with 28-35 words per paragraph, from source content only"
                        },
                        namedEntities: {
                          type: "array",
                          items: { type: "string" }
                        },
                        conceptualEntities: {
                          type: "array",
                          items: { type: "string" }
                        }
                      },
                      required: ["intent", "question", "conversationalVariation", "longtailVariation", "answer", "namedEntities", "conceptualEntities"]
                    }
                  }
                },
                required: ["faqs"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_faqs" } }
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
      throw new Error(`Failed to generate FAQs: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.tool_calls?.[0]) {
      console.error("Invalid FAQ response structure:", {
        hasData: !!data,
        hasChoices: !!data?.choices,
        hasMessage: !!data?.choices?.[0]?.message,
        hasToolCalls: !!data?.choices?.[0]?.message?.tool_calls,
        fullResponse: JSON.stringify(data),
        timestamp: new Date().toISOString()
      });
      throw new Error("Invalid response structure from AI gateway");
    }
    
    const toolCall = data.choices[0].message.tool_calls[0];
    const faqs = JSON.parse(toolCall.function.arguments).faqs;

    return new Response(
      JSON.stringify({ faqs }),
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
