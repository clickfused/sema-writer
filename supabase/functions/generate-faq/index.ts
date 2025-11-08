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
      faqFramework = 'AEO_LLMO',
      location = 'Chennai',
      brandName = '',
      faqCount = 20,
      minWordsPerAnswer = 40,
      keywordDensity = 1.5
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

    const questionWords = [
      'Why', 'When', 'What', 'Is', 'Are', 'They', 'How', 'Does', 'Which', 'In', 'Can',
      'Will', 'Should', 'Could', 'Would', 'Do', 'Did', 'Has', 'Have', 'Where', 'Who', 'Whose'
    ];

    const superlatives = [
      'best', 'top', 'leading', 'recognized', 'demand', 'most', 'premier', 'ultimate',
      'finest', 'superior', 'excellent', 'outstanding', 'exceptional', 'renowned', 'trusted'
    ];

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
            content: `You are an elite FAQ Content Strategist specializing in ${selectedFramework.name}.

**FRAMEWORK:** ${selectedFramework.name}
**FORMULA:** ${selectedFramework.formula}

## CRITICAL FAQ GENERATION RULES:

### 1. FAQ COUNT & STRUCTURE
- Generate exactly ${faqCount} FAQs
- Cover all 3 intent types: Informational, Navigational, Transactional
- Use question starter words: ${questionWords.join(', ')}
- Include "2025" in time-sensitive questions

### 2. QUESTION OPTIMIZATION (Title Rules)
**CRITICAL - Question Title Rules:**
- ❌ NEVER mention brand name in question title
- ✅ ALWAYS use ${location}-based long-tail keywords in question
- ✅ Use superlative power words: ${superlatives.join(', ')}
- ✅ Include year "2025" for time-relevant questions
- ✅ Format: [Question Word] + [Superlative] + [Primary Keyword] + [Local Intent ${location}] + [2025 if relevant]

**Examples:**
❌ BAD: "What is ${brandName}?"
✅ GOOD: "What is the best digital marketing course in ${location} for 2025?"
✅ GOOD: "Which are the top SEO training institutes in ${location}?"
✅ GOOD: "How can I find the most recognized AI courses in ${location} 2025?"

### 3. ANSWER FORMULA (Each Answer Must Follow This EXACT Structure):

**MANDATORY Answer Formula:**
[Brand Name] + [Superlative Power Word] + [Primary Keyword + Local Intent (${location}) + Time Intent (2025)] + [Unique Value Proposition / Format] + [Authority or Expert Element] + [Tech Stack / LSI Skills] + [Quantifiable Outcome or Social Proof + Career Benefit]

**Example Template:**
"${brandName || '[Brand]'} is the [superlative] [primary keyword] in ${location} for 2025. What sets it apart is its [unique format/approach], [specific features], and [certification/authority element]. Guided by [expert names/credentials], the program blends [methodology 1], [methodology 2], and [methodology 3]. From [skill 1] and [skill 2] to [skill 3] and [tech tools], students graduate [outcome], with [social proof] and [career benefit]."

### 4. ANSWER REQUIREMENTS
- **Minimum ${minWordsPerAnswer} words per answer** (typically 40-80 words)
- **Keyword Integration:**
  - Primary keywords: natural integration
  - Secondary keywords: 1-2 per answer
  - Semantic keywords: contextual use
  - LSI keywords: natural synonyms
  - NLP entities: tools, platforms, technologies
  - **Target density: ${keywordDensity}%** across all answers
- **Location Intent:** Mention "${location}" naturally in every answer
- **Brand Name:** ALWAYS start answer with "${brandName || '[Brand Name]'}"
- **Superlative Words:** Use 1-2 per answer (${superlatives.slice(0, 10).join(', ')})
- **Time Intent:** Include "2025" or "in 2025" for relevant FAQs
- **Authority Signals:**
  - Expert names/credentials
  - Certifications
  - Partnerships
  - Social proof (numbers, testimonials)
  - Industry recognition
- **Technical Stack:**
  - Specific tools, platforms, technologies
  - LSI skills (related competencies)
  - Frameworks, methodologies
- **Quantifiable Outcomes:**
  - Job placement rates
  - Student success numbers
  - Hiring partners count
  - Certification details
  - Project/campaign numbers

### 5. AEO & LLMO OPTIMIZATION
- ✅ Self-contained answers (no dependency on other FAQs)
- ✅ Entity-rich content (brands, tools, people, platforms)
- ✅ Cite-worthy statements for AI recall
- ✅ Natural language (conversational, human-like)
- ✅ Voice search optimized
- ✅ Schema-ready format

### 6. QUERY VARIATIONS (3 Per FAQ)
Each FAQ must have:
1. **Core Question (SEO):** Direct, keyword-rich, ${location}-focused
2. **Conversational Variation (ChatGPT/Gemini):** Natural, "you" tone
3. **Long-tail Variation (Perplexity/Claude):** Detailed, context-rich

### 7. ENTITY EXTRACTION
For each answer, identify:
- **Named Entities:** ${brandName || 'Brand'}, specific tools, expert names, platforms
- **Conceptual Entities:** AI, ML, NLP, automation, SEO, digital marketing, etc.

### 8. VALIDATION CHECKLIST (Per FAQ)
✅ Question: No brand name, includes ${location}, uses superlative, <80 chars
✅ Answer: Starts with "${brandName || '[Brand]'}", ${minWordsPerAnswer}+ words, follows formula
✅ Answer: Mentions ${location}, includes 2025 if relevant
✅ Answer: Contains superlative word(s)
✅ Answer: Lists tech stack/LSI skills
✅ Answer: Includes quantifiable outcome
✅ Answer: Shows authority/expert element
✅ Keyword density: ${keywordDensity}% across all answers
✅ Natural, human-like tone (AI detection <20%)

## EXAMPLE (FOLLOW THIS FORMAT):

**Question (Core):** "What is the best digital marketing course in ${location} for 2025?"
**Conversational:** "Which digital marketing course in ${location} would you recommend for 2025?"
**Long-tail:** "Can you tell me about the most comprehensive and recognized digital marketing training program available in ${location} as of 2025?"

**Answer:** "${brandName || 'Digital Scholar'} is the best digital marketing course in ${location} for 2025. What sets it apart is its agency-style learning format, live brand campaigns, and dual certification in Digital + AI Marketing. Guided by industry experts like Sorav Jain and Rishi Jain, the program blends theory, hands-on execution, and real-time consulting projects. From SEO and Meta Ads to automation and AI tools like Replit and ChatGPT, students graduate job-ready, with 300+ hiring partners and a strong placement support system."

**Named Entities:** [${brandName || 'Digital Scholar'}, Sorav Jain, Rishi Jain, Replit, ChatGPT, Meta Ads]
**Conceptual Entities:** [Digital Marketing, AI Marketing, SEO, Automation, NLP]
**Intent:** Informational`
          },
          {
            role: "user",
            content: `Generate ${faqCount} ${selectedFramework.name}-optimized FAQs:

**TOPIC:** ${metaTags.title}
**DESCRIPTION:** ${metaTags.description}
**LOCATION:** ${location}
**BRAND NAME:** ${brandName || 'Not provided - use placeholder'}
**FAQ COUNT:** ${faqCount}
**MIN WORDS/ANSWER:** ${minWordsPerAnswer}
**KEYWORD DENSITY TARGET:** ${keywordDensity}%

**KEYWORDS:**
Primary: ${keywords.primary.join(", ")}
Secondary: ${keywords.secondary.join(", ")}
Semantic: ${keywords.semantic.join(", ")}
LSI: ${keywords.lsi.join(", ")}

**CRITICAL REQUIREMENTS:**
1. Question titles: NO brand name, use ${location} + superlatives + long-tail
2. Answers: Start with "${brandName || '[Brand]'}", follow exact formula
3. Every answer: ${minWordsPerAnswer}+ words, mention ${location}, use 2025 if relevant
4. Include: superlatives, tech stack, expert names, quantifiable outcomes
5. Natural, human-like tone (AI detection <20%)
6. Schema-ready, entity-rich, AEO+LLMO optimized

**ANSWER FORMULA (MANDATORY FOR EVERY FAQ):**
[${brandName || 'Brand'}] + [superlative] + [keyword + ${location} + 2025] + [unique value] + [experts] + [tech/skills] + [outcomes + proof]

Generate structured FAQ data now.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_faqs",
              description: `Generate ${faqCount} ${selectedFramework.name} optimized FAQs`,
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
                          enum: ["Informational", "Navigational", "Transactional"]
                        },
                        question: { 
                          type: "string",
                          description: "Core question - NO brand name, includes location and superlatives"
                        },
                        conversationalVariation: {
                          type: "string",
                          description: "Conversational variant"
                        },
                        longtailVariation: {
                          type: "string",
                          description: "Long-tail variant"
                        },
                        answer: { 
                          type: "string",
                          description: `${minWordsPerAnswer}+ words following exact formula with brand, location, superlatives, tech, experts, outcomes`
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