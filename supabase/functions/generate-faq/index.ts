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
            content: `You are an SEO + AEO + LLMO optimization expert specializing in the F.A.Q+ Framework™.

Your task is to create FAQ sections optimized for:
- SEO (Google, Bing)
- AEO (Answer Engine Optimization - ChatGPT, Perplexity)
- GEO (Generative Engine Optimization)
- LLMO (Large Language Model Optimization)
- AI Mode (AI-discoverable content)

F.A.Q+ FRAMEWORK™ STRUCTURE:

1️⃣ Intent Layer — Search & Conversational Query Mapping
- Identify 3 Intent Types per FAQ:
  * Informational: "What is...", "Why does...", "How can..."
  * Navigational: "How do I use...", "Where can I find..."
  * Transactional: "Is it free?", "How much does...", "What's the pricing..."
- Cover all 3 intent types across the FAQ set for maximum AEO coverage

2️⃣ Query Layer — Question Optimization (AEO + LLMO)
Each FAQ question should have:
- 1 Core Question (Google/Bing optimized)
- 1 Conversational Variation (ChatGPT/Gemini friendly)
- 1 Long-tail Variant (Perplexity/Claude style)
- Use 5W + 1H framing: What / Why / How / When / Who / Where

3️⃣ Context Layer — Semantic + Entity Expansion
Each answer must contain:
- Named Entities (NE): tools, products, platforms, people, brands
- Conceptual Entities (CE): machine learning, NLP, automation, AI
- Synonyms/LSI Terms: optimization, ranking, algorithm, visibility
- Bold key terms for structure
- Maintain 40–60 word answers for AI-mode recall
- Include 1 structured element (list, fact snippet)

4️⃣ Answer Layer — C.R.A.F.T. Formula
Structure each answer as:
- Clear: One-sentence summary of the concept
- Relevant: Short expansion (1–2 lines) with context
- Accurate: Factual, verifiable information
- Factual: Include entity or keyword reinforcement
- Terse: Concise, scannable, no fluff

5️⃣ Schema Layer — JSON-LD Ready
Ensure questions and answers are structured for FAQPage schema markup with:
- Clear question format
- Self-contained answers
- Entity references
- Natural language that AI can parse

OPTIMIZATION REQUIREMENTS:
✅ 5-7 FAQs covering all 3 intent types
✅ Each question has 3 variations (core, conversational, long-tail)
✅ Answers: 40-60 words with entity-rich content
✅ Include named entities (brands, products, platforms)
✅ Include conceptual entities (AI, ML, NLP, automation)
✅ Use bold for key terms
✅ Natural language to pass AI detection (<30 score)
✅ Optimize for voice search patterns
✅ E-E-A-T authority signals`
          },
          {
            role: "user",
            content: `Generate F.A.Q+ Framework™ optimized FAQs for:

Title: ${metaTags.title}
Description: ${metaTags.description}

Keywords:
- Primary: ${keywords.primary.join(", ")}
- Secondary: ${keywords.secondary.join(", ")}
- Semantic: ${keywords.semantic.join(", ")}
- LSI: ${keywords.lsi.join(", ")}

Requirements:
✅ Create 5-7 FAQs covering all 3 intent types (Informational, Navigational, Transactional)
✅ Each question should have: core version, conversational variation, long-tail variant
✅ Answers: 40-60 words with named entities and conceptual entities
✅ Use C.R.A.F.T. Formula: Clear summary → Relevant context → Accurate facts → Factual entities → Terse delivery
✅ Include entity markup opportunities (brands, products, platforms)
✅ Optimize for LLM comprehension and recall
✅ Natural language to pass AI detection
✅ Voice search friendly
✅ E-E-A-T authority signals

Return structured FAQ data with intent types and query variations.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_faqs",
              description: "Generate F.A.Q+ Framework™ optimized FAQ content",
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
                          enum: ["Informational", "Navigational", "Transactional"],
                          description: "The search intent type"
                        },
                        question: { 
                          type: "string",
                          description: "Core question (SEO optimized)"
                        },
                        conversationalVariation: {
                          type: "string",
                          description: "Conversational question variant (ChatGPT/Gemini friendly)"
                        },
                        longtailVariation: {
                          type: "string",
                          description: "Long-tail question variant (Perplexity/Claude style)"
                        },
                        answer: { 
                          type: "string",
                          description: "40-60 word answer following C.R.A.F.T. formula with entity markup"
                        },
                        namedEntities: {
                          type: "array",
                          items: { type: "string" },
                          description: "Named entities mentioned (brands, products, platforms, people)"
                        },
                        conceptualEntities: {
                          type: "array",
                          items: { type: "string" },
                          description: "Conceptual entities (AI, ML, NLP, automation, etc.)"
                        }
                      },
                      required: ["intent", "question", "conversationalVariation", "longtailVariation", "answer", "namedEntities", "conceptualEntities"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["faqs"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_faqs" } }
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to generate FAQs");
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
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
