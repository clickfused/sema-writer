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
Reference local context naturally without forcing it.

### 5. Brand Name: ${brandName || 'N/A'}
${brandName ? `Mention **${brandName}** 2–4 times per section naturally. Use variants: "${brandName}", "our platform", "the tool".` : ''}

### 6. Call-to-Action Integration
${includeCtaTypes.includes('course') ? '- Course CTA: 1–2 subtle mentions' : ''}
${includeCtaTypes.includes('alsoRead') ? '- Also Read: 1–2 internal links' : ''}
${includeCtaTypes.includes('related') ? '- Related Content: Suggest topics' : ''}
- Conclusion: Strong action-oriented CTA

### 7. SEO + LLM Optimization (Every Title & Para)
**Titles (H2/H3):**
- Include 1 keyword naturally
- <60 characters
- User intent (What/How/Why)

**Paragraphs:**
- Topic sentence (keyword-rich if natural)
- 3–5 sentences, 50–80 words
- 1–2 keywords
- End with transition/micro-CTA
- Flesch score 60+

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
            content: `Generate a ${selectedFramework.name}-optimized blog post:

**TOPIC:** ${metaTags.title}
**LOCATION INTENT:** ${location}
**BRAND:** ${brandName || 'N/A'}
**TARGET WORD COUNT:** ${targetWordCount}+
**KEYWORD DENSITY:** ${keywordDensity}%

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
✅ Flesch 60+
✅ AI detection <20%

**RETURN ONLY HTML CONTENT. NO EXPLANATIONS.**`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to generate content");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

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
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});