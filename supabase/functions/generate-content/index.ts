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
      headings, 
      faqContent,
      framework = 'HYBRID',
      location = 'United States',
      brandName = '',
      targetWordCount = 1500,
      keywordDensity = 1.5,
      includeCtaTypes = ['course', 'alsoRead', 'related'],
      contextContent = '',
      userIntent = null
    } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const h2List = headings.h2s.map((h2: string, index: number) => {
      const h3s = headings.h3s
        .filter((h3: any) => h3.h2Index === index)
        .map((h3: any) => `  - ${h3.text}`)
        .join("\n");
      return `${h2}${h3s ? "\n" + h3s : ""}`;
    }).join("\n\n");

    const frameworks = {
      SAGE: { name: 'SAGE Framework', formula: '(Structure × 0.3) + (Authority × 0.25) + (Guidance × 0.25) + (Engagement × 0.2)' },
      READ: { name: 'READ Framework', formula: '(Rhythm × 0.25) + (Engagement × 0.3) + (Accessibility × 0.25) + (Direction × 0.2)' },
      CRAFT: { name: 'C.R.A.F.T Framework', formula: '(Clarity × 0.25) + (Relevance × 0.25) + (Accuracy × 0.2) + (Factual × 0.2) + (Terseness × 0.1)' },
      HUMAIZE: { name: 'HUMAIZE Framework', formula: '(Human-tone × 0.35) + (Natural-flow × 0.35) + (Context × 0.3)' },
      HYBRID: { name: 'Hybrid Multi-Framework', formula: '(SAGE × 0.3) + (READ × 0.25) + (CRAFT × 0.25) + (HUMAIZE × 0.2)' }
    };
    const selectedFramework = frameworks[framework as keyof typeof frameworks] || frameworks.HYBRID;

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
            content: `You are an elite SEO + AEO + GEO + LLMO content strategist specializing in 2025-optimized blog posts.

IMPORTANT: Generate UNIQUE content every time. Use timestamp ${Date.now()} and request ID for variation.

Generate comprehensive blog content using the **${selectedFramework.name}** (Formula: ${selectedFramework.formula}).

## USER INTENT OPTIMIZATION (CRITICAL)
${userIntent ? `
**Detected User Intent:** ${userIntent.primaryIntent}
**Searcher Goal:** ${userIntent.searcherGoal}
**Content Angle:** ${userIntent.contentAngle}

Align ALL content with this user intent:
- **Informational**: Focus on education, explanations, how-tos, guides
- **Commercial Investigation**: Include comparisons, reviews, pros/cons, recommendations
- **Transactional**: Emphasize benefits, CTAs, pricing info, getting started
- **Navigational**: Help users find specific resources/pages
` : ''}

## CRITICAL CONTENT STRUCTURE REQUIREMENTS:

### 1. PARAGRAPH READABILITY (MANDATORY)
- Each paragraph MUST be ~30 words maximum
- Split long paragraphs into 2-3 shorter ones
- Every paragraph should be 2-3 sentences only
- Use line breaks between paragraphs for visual breathing room
- Flesch Reading Ease score: 60-70

### 2. NATURAL H3 SUBHEADINGS (MANDATORY)
- Add H3 subheadings NATURALLY within H2 sections where logical
- H3s should break down complex topics into digestible parts
- NOT every H2 needs H3s - only add when content benefits from subdivision
- H3s should feel organic, not forced

### 3. NATURAL BULLET POINTS (MANDATORY)
- Add bullet points (<ul><li>) where lists make content clearer
- Use bullets for: features, benefits, steps, tips, examples
- NOT every section needs bullets - only where appropriate
- Mix bullet lists with regular paragraphs for variety

### 4. NO REPEATED CONTENT (CRITICAL)
- NEVER repeat the same information twice
- Each section must provide NEW, UNIQUE insights
- Check that examples, statistics, and explanations are not duplicated
- Use varied vocabulary and phrasing throughout

### 5. SEO + USER READABILITY BALANCE
- Write for humans FIRST, search engines SECOND
- Natural keyword integration (${keywordDensity}% density)
- Conversational tone with authority
- Active voice 80%+
- Varied sentence lengths (5-25 words)

## FRAMEWORK APPLICATION:

${framework === 'SAGE' ? `**SAGE Framework:**
- **S**tructure: Semantic HTML hierarchy (h2, h3, p, ul). Clear flow.
- **A**uthority: Industry data, expert insights, credible sources.
- **G**uidance: Step-by-step instructions, actionable tips.
- **E**ngagement: Analogies, examples, relatable scenarios.` : ''}

${framework === 'READ' ? `**READ Framework:**
- **R**hythm: Mix 5–10 word + 20–25 word sentences.
- **E**ngagement: Active voice, conversational "you" tone.
- **A**ccessibility: Simple language, 3–4 line paragraphs max.
- **D**irection: Clear transitions, logical flow.` : ''}

${framework === 'CRAFT' ? `**C.R.A.F.T Framework:**
- **C**lear: Simple, direct language.
- **R**elevant: Stay on-topic, answer intent.
- **A**ccurate: 2025-updated data.
- **F**actual: Evidence-based.
- **T**erse: No fluff.` : ''}

${framework === 'HUMAIZE' ? `**HUMAIZE Framework:**
- **H**uman-like: Conversational, warm, relatable.
- **U**nique: Varied sentence structures.
- **M**eaningful: Real-world examples.
- **A**uthentic: Knowledgeable friend tone.
- **I**ntuitive: Natural transitions.
- **Z**ero AI: <20% AI detection score.
- **E**motion: Connect with reader.` : ''}

${framework === 'HYBRID' ? `**HYBRID Framework:**
Combine SAGE (structure) + READ (readability) + C.R.A.F.T (clarity) + HUMAIZE (human tone).` : ''}

## CONTENT REQUIREMENTS:

### Word Count: ${targetWordCount}+ words
- Introduction: 100-150 words (2-3 short paragraphs)
- Body sections: 150-250 words each
- Conclusion: 80-120 words + CTA

### Keyword Integration (${location}-Based Intent)
- **Primary:** ${keywordDensity}% density, use in H1, first 100 words, H2s, conclusion
- **Secondary/Semantic/LSI:** Natural throughout
- **Location:** Mention "${location}" 3–5 times naturally
- **NO keyword stuffing**

### ${location}-Specific SEO
- US English spelling (color, optimize)
- US companies, brands, platforms (Google, Amazon, Microsoft)
- US market data, statistics, trends
- USD currency ($) for pricing

### Brand Name: ${brandName || 'N/A'}
${brandName ? `Mention **${brandName}** 2–4 times per section naturally.` : ''}

### Call-to-Action Integration
${includeCtaTypes.includes('course') ? '- Course CTA: Subtle enrollment opportunities' : ''}
${includeCtaTypes.includes('alsoRead') ? '- Also Read: 1-2 internal links' : ''}
${includeCtaTypes.includes('related') ? '- Related Content: Suggest relevant topics' : ''}
${includeCtaTypes.includes('industry') ? '- Industry Solutions: US industry applications' : ''}
${includeCtaTypes.includes('usp') ? '- USP/Benefits: Unique value propositions' : ''}
${includeCtaTypes.includes('humanIntent') ? '- Human Intent: Emotional triggers, pain points' : ''}
${includeCtaTypes.includes('seoIntent') ? '- SEO Intent: Natural keyword CTAs' : ''}
${includeCtaTypes.includes('llmoIntent') ? '- LLMO Intent: LLM-friendly cite-worthy statements' : ''}

### HTML Formatting (MANDATORY)
- Use <p>, <h2>, <h3>, <strong>, <em>, <ul>, <ol>, <li>
- Use <strong> not <b>
- Use <em> not <i>
- No inline styles

## HUMANIZATION (Apply 10–15):
- Contractions (it's, you'll, don't)
- Vary sentence length
- Transitions ("Here's the thing...", "That said...")
- Specific examples
- Industry terminology naturally
- Concrete numbers
- Rhetorical questions
- Metaphors/analogies`
          },
          {
            role: "user",
            content: `Generate a ${selectedFramework.name}-optimized blog post (Request ID: ${Date.now()}):

**TOPIC:** ${metaTags.title}
**LOCATION INTENT:** ${location}
**BRAND:** ${brandName || 'N/A'}
**TARGET WORD COUNT:** ${targetWordCount}+
**KEYWORD DENSITY:** ${keywordDensity}%

CRITICAL REQUIREMENTS:
✅ Paragraphs ~30 words each (2-3 sentences max)
✅ Add H3 subheadings NATURALLY where logical
✅ Add bullet points NATURALLY where appropriate
✅ NO repeated content - each section unique
✅ SEO optimized but human-readable FIRST

${contextContent ? `**PRIMARY CONTEXT DOCUMENT (MANDATORY USE):**
Use this as the foundation for the blog post:
--- CONTEXT DOCUMENT START ---
${contextContent.substring(0, 8000)}
--- CONTEXT DOCUMENT END ---

` : ''}**KEYWORDS:**
Primary: ${keywords.primary.join(", ")}
Secondary: ${keywords.secondary.join(", ")}
Semantic: ${keywords.semantic.join(", ")}
LSI: ${keywords.lsi.join(", ")}

**HEADINGS:**
${h2List}

${faqContent && faqContent.length > 0 ? `\n**FAQ (integrate at end):**\n${faqContent.map((faq: any) => `<h3>${faq.question}</h3>\n<p>${faq.answer}</p>`).join("\n")}` : ""}

**VALIDATION CHECKLIST:**
✅ ≥${targetWordCount} words
✅ ~30 word paragraphs
✅ Natural H3s where beneficial
✅ Natural bullet points where helpful
✅ NO content repetition
✅ ${keywordDensity}% keyword density
✅ "${location}" mentioned 3–5 times
${brandName ? `✅ "${brandName}" naturally integrated` : ''}
✅ All provided headings used
✅ Semantic HTML only
✅ 2025 content
✅ Flesch 60+
✅ AI detection <20%

**RETURN ONLY HTML CONTENT. NO EXPLANATIONS.**`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("AI gateway HTTP error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        timestamp: new Date().toISOString()
      });
      throw new Error(`AI gateway returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data?.choices?.[0]?.message?.content) {
      console.error("Invalid AI response structure:", {
        hasData: !!data,
        hasChoices: !!data?.choices,
        choicesLength: data?.choices?.length,
        fullResponse: JSON.stringify(data).substring(0, 500),
        timestamp: new Date().toISOString()
      });
      throw new Error("Invalid response structure from AI gateway");
    }
    
    let content = data.choices[0].message.content;

    const wordCount = content.split(/\s+/).length;
    const primaryKeywordCount = (content.match(new RegExp(keywords.primary[0], "gi")) || []).length;
    const hasAllH2s = headings.h2s.every((h2: string) => 
      content.toLowerCase().includes(h2.toLowerCase())
    );
    
    let seoScore = 0;
    if (wordCount >= targetWordCount) seoScore += 30;
    if (primaryKeywordCount >= 5 && primaryKeywordCount <= 15) seoScore += 25;
    if (hasAllH2s) seoScore += 25;
    if (content.includes(metaTags.title)) seoScore += 20;

    return new Response(
      JSON.stringify({ content, seoScore }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Content generation error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred during content generation",
        details: "Check edge function logs for more information"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
