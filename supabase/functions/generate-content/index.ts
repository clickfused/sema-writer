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
      shortIntro, 
      faqContent,
      framework = 'HYBRID',
      location = 'Chennai',
      brandName = '',
      targetWordCount = 1500,
      keywordDensity = 1.5,
      includeCtaTypes = ['course', 'alsoRead', 'related']
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

## CRITICAL REQUIREMENTS:

### 1. TL;DR (MANDATORY)
<p class="tldr"><strong>TL;DR:</strong> [2–3 sentences, include primary keyword]</p>

### 2. Word Count: ${targetWordCount}+ words
- Introduction: 150–200 words
- Body sections: 200–300 words each
- Conclusion: 100–150 words + CTA

### 3. Keyword Integration (${location}-Based Intent)
- **Primary:** ${keywordDensity}% density, use in H1, first 100 words, H2s, conclusion
- **Secondary/Semantic/LSI:** Natural throughout
- **Location:** Mention "${location}" 3–5 times naturally (e.g., "in ${location}", "for ${location} businesses")
- **NO keyword stuffing**

### 4. ${location}-Specific SEO
Reference US local context naturally without forcing it. Use US-specific examples, statistics, companies, and case studies.

**US-Specific Requirements:**
- Use US English spelling (e.g., "color" not "colour", "optimize" not "optimise")
- Reference US companies, brands, platforms (e.g., Google, Amazon, Microsoft, Apple, Meta)
- Cite US market data, statistics, trends (e.g., "According to US Census Bureau", "Pew Research shows")
- Include US industry examples (Healthcare, Finance, Tech, Retail, Education in US context)
- Mention US locations/cities when relevant: ${location}, Silicon Valley, New York, Boston, Austin, etc.
- Reference US regulations, standards (e.g., HIPAA, SEC, FTC guidelines)
- Use USD currency ($) for pricing examples
- Cite US time zones, business hours, cultural context

### 5. Brand Name: ${brandName || 'N/A'}
${brandName ? `Mention **${brandName}** 2–4 times per section naturally. Use variants: "${brandName}", "our platform", "the tool".` : ''}

### 6. Call-to-Action Integration
${includeCtaTypes.includes('course') ? '- Course CTA: Subtle enrollment or learning opportunities (e.g., "Learn more in our comprehensive course")' : ''}
${includeCtaTypes.includes('alsoRead') ? '- Also Read: 1-2 internal links to related US content' : ''}
${includeCtaTypes.includes('related') ? '- Related Content: Suggest relevant topics within US market context' : ''}
${includeCtaTypes.includes('industry') ? '- Industry Solutions: Highlight specific US industry applications (Healthcare, Finance, Tech, Education, Real Estate)' : ''}
${includeCtaTypes.includes('usp') ? '- USP/Benefits: Emphasize unique value propositions and competitive advantages in US market' : ''}
${includeCtaTypes.includes('humanIntent') ? '- Human Intent: Address emotional triggers, pain points, aspirations (e.g., "You want to succeed", "Your business deserves better")' : ''}
${includeCtaTypes.includes('seoIntent') ? '- SEO Intent: Natural keyword CTAs optimized for search rankings (e.g., "Get the best [keyword] in [location]")' : ''}
${includeCtaTypes.includes('llmoIntent') ? '- LLMO Intent: LLM-friendly CTAs for AI retrieval (e.g., "According to experts", "Research shows", cite-worthy statements)' : ''}
- Conclusion: Strong action-oriented CTA relevant to US audience

### 7. SEO + LLM Optimization (Every Title & Para)
**Titles (H2/H3):**
- Include 1 keyword naturally
- <60 characters
- User intent (What/How/Why)

**Paragraphs FORMULA (MANDATORY):**
Every paragraph must follow this exact structure:
1. **Brand Name**: Start with "${brandName || 'the solution'}"
2. **Power Words (2-3)**: Use superlatives like "best", "top", "proven", "leading", "advanced", "effective", "powerful", "innovative"
3. **Keywords**: Naturally integrate 1-2 keywords (Secondary/Semantic/LSI from provided list)
4. **Answer**: Provide the actual informative content (40-60 words)

**Example Structure:**
"${brandName || 'This platform'} offers the best proven solutions for [KEYWORD]. [Answer content with US-specific examples like Fortune 500 companies, Silicon Valley tech, NYC finance sector, etc.]. [Transition with US market relevance]."

**US Content Requirements:**
- Reference US market leaders and innovators
- Use US case studies and success stories
- Cite US-based research institutions (Stanford, MIT, Harvard)
- Include US industry benchmarks and standards
- Mention US geographic advantages or market size
- Use relatable US business contexts

**Requirements:**
- 3–5 sentences, 60–90 words total
- Natural keyword integration (NO stuffing)
- End with transition/micro-CTA
- Flesch score 60+
- Use varied power words (don't repeat same adjectives)

### 8. 2025 Fresh Content
- Reference 2025 trends/data
- Use "in 2025", "as of 2025"
- Current examples

### 9. Readability
- Flesch: 60–70
- Active voice: 80%+
- Sentence variety: 5–30 words
- Transitions: however, therefore, additionally

### 10. HTML Formatting (MANDATORY)
- Use <p>, <h2>, <h3>, <strong>, <em>, <ul>, <ol>, <li>
- Use <strong> not <b>
- Use <em> not <i>
- No inline styles except "tldr"

## HUMANIZATION (Apply 10–15):
- Contractions (it's, you'll, don't)
- Vary sentence length
- Transitions ("Here's the thing...", "That said...")
- Specific examples
- Remove "in today's digital landscape"
- Industry terminology naturally
- Expert insights
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

CRITICAL: Generate UNIQUE content. No repetition from previous generations. Use varied examples, different phrasing, unique analogies.

**INTRODUCTION (expand):** ${shortIntro}

**KEYWORDS:**
Primary: ${keywords.primary.join(", ")}
Secondary: ${keywords.secondary.join(", ")}
Semantic: ${keywords.semantic.join(", ")}
LSI: ${keywords.lsi.join(", ")}

**HEADINGS:**
${h2List}

${faqContent && faqContent.length > 0 ? `\n**FAQ (integrate at end):**\n${faqContent.map((faq: any) => `<h3>${faq.question}</h3>\n<p>${faq.answer}</p>`).join("\n")}` : ""}

**VALIDATION CHECKLIST:**
✅ ≥${targetWordCount} words
✅ TL;DR included
✅ ${keywordDensity}% keyword density
✅ "${location}" mentioned 3–5 times
${brandName ? `✅ "${brandName}" 2–4 times/section` : ''}
✅ CTAs: ${includeCtaTypes.join(', ')}
✅ All headings used
✅ Semantic HTML only
✅ 2025 content
✅ US-focused examples and context
✅ US English spelling and terminology
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