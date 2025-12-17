import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
      userIntent = null,
      model = 'gemini-flash'
    } = await req.json();
    
    // Get user ID from auth header for API key lookup
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }
    
    // Determine API endpoint and key based on model
    let apiUrl: string;
    let apiKey: string | null = null;
    let modelId: string;
    
    if (model === 'gemini-flash') {
      // Use Lovable AI Gateway
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      apiKey = Deno.env.get("LOVABLE_API_KEY") || null;
      modelId = "google/gemini-2.5-flash";
    } else if (model === 'claude-sonnet-4' || model === 'claude-sonnet-4.5') {
      // Use OpenRouter - need user's API key
      apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      modelId = model === 'claude-sonnet-4' ? 'anthropic/claude-sonnet-4' : 'anthropic/claude-sonnet-4-5';
      
      if (userId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data: apiKeyData } = await supabase
          .from('user_api_keys')
          .select('encrypted_key')
          .eq('user_id', userId)
          .eq('provider', 'openrouter')
          .single();
          
        apiKey = apiKeyData?.encrypted_key || null;
      }
      
      if (!apiKey) {
        throw new Error("OpenRouter API key not configured. Please add your API key in Settings → AI Keys.");
      }
    } else if (model === 'gemini-free') {
      // Use Google's Gemini API directly with user's key
      apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
      modelId = "gemini-2.0-flash";
      
      if (userId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        const { data: apiKeyData } = await supabase
          .from('user_api_keys')
          .select('encrypted_key')
          .eq('user_id', userId)
          .eq('provider', 'gemini')
          .single();
          
        apiKey = apiKeyData?.encrypted_key || null;
      }
      
      if (!apiKey) {
        throw new Error("Gemini API key not configured. Please add your API key in Settings → AI Keys.");
      }
    } else {
      // Default to Lovable AI Gateway
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      apiKey = Deno.env.get("LOVABLE_API_KEY") || null;
      modelId = "google/gemini-2.5-flash";
    }

    if (!apiKey) {
      throw new Error("API key not configured for selected model");
    }
    
    // Check if using Google's direct API (different format)
    const isGoogleDirectApi = model === 'gemini-free';

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

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          {
            role: "system",
            content: `Act like an expert SEO content strategist, senior NLP prompt engineer, and professional blog writer.

Your goal is to generate a full long-form blog using a Content Generation Framework with strong SEO, LLM-optimized structure, location-intent focus, and maximum user readability.

## STEP-BY-STEP REASONING PROCESS (Internal - Do Not Output)

Before generating, mentally:
1. Analyze the topic and keywords for search intent
2. Map location-intent signals throughout content
3. Plan paragraph distribution (~30 words each)
4. Identify natural H3 breakpoints
5. Mark bullet point opportunities
6. Ensure zero content repetition

## CONTENT GENERATION FRAMEWORK: ${selectedFramework.name}
Formula: ${selectedFramework.formula}

## USER INTENT OPTIMIZATION (CRITICAL)
${userIntent ? `
**Detected Intent:** ${userIntent.primaryIntent}
**Searcher Goal:** ${userIntent.searcherGoal}  
**Content Angle:** ${userIntent.contentAngle}
**Intent Signals:** ${userIntent.intentSignals?.join(', ') || 'N/A'}

ALIGN EVERY SECTION with this intent:
- Informational → Education, explanations, guides, how-tos
- Commercial Investigation → Comparisons, reviews, pros/cons, recommendations
- Transactional → Benefits, CTAs, pricing, getting started
- Navigational → Help find specific resources/pages
` : 'Analyze topic to determine user intent and align content accordingly.'}

## MANDATORY FORMATTING RULES

### RULE 1: PARAGRAPH SPLITTING (STRICT ~30 WORDS)
- EVERY paragraph MUST be approximately 30 words (28-35 word range)
- If content requires 90 words → Split into THREE 30-word paragraphs
- If content requires 60 words → Split into TWO 30-word paragraphs
- Each paragraph = 2-3 sentences MAXIMUM
- Add <p></p> tags around EVERY paragraph
- Visual breathing room between paragraphs

### RULE 2: NATURAL H3 SUBHEADINGS
- Add <h3> tags ONLY where content benefits from subdivision
- H3s break complex topics into digestible chunks
- NOT every H2 needs H3s - use judgment
- H3s should feel organic, not forced or mechanical

### RULE 3: NATURAL BULLET POINTS
- Use <ul><li> where lists improve clarity
- Bullets for: features, benefits, steps, tips, examples, comparisons
- Mix bullets with regular paragraphs for variety
- NOT every section needs bullets

### RULE 4: ZERO CONTENT REPETITION (CRITICAL)
- NEVER repeat the same information twice
- Each section provides NEW, UNIQUE insights
- Vary vocabulary and phrasing throughout
- No duplicate examples, statistics, or explanations

### RULE 5: SEO + LLM READABILITY BALANCE
- Write for HUMANS first, search engines second
- Natural keyword integration (${keywordDensity}% density target)
- Conversational authority tone
- Active voice 80%+
- Varied sentence lengths (5-25 words)
- Flesch Reading Ease: 60-70

## LOCATION-INTENT FOCUS: ${location}

### ${location}-Specific Requirements:
- US English spelling (color, optimize, center)
- US companies/brands (Google, Amazon, Microsoft, Apple)
- US market data, statistics, trends (2024-2025)
- USD currency ($) for any pricing
- Mention "${location}" naturally 3-5 times throughout
- Reference US regulations, standards where relevant

## FRAMEWORK APPLICATION

${framework === 'SAGE' ? `**SAGE Framework:**
- **S**tructure: Semantic HTML (h2, h3, p, ul). Clear information flow.
- **A**uthority: Industry data, expert insights, credible 2025 sources.
- **G**uidance: Step-by-step instructions, actionable tips.
- **E**ngagement: Real-world examples, analogies, relatable scenarios.` : ''}

${framework === 'READ' ? `**READ Framework:**
- **R**hythm: Mix short (5-10 word) + longer (20-25 word) sentences.
- **E**ngagement: Active voice, conversational "you" tone.
- **A**ccessibility: Simple language, ~30 word paragraphs.
- **D**irection: Clear transitions, logical flow between ideas.` : ''}

${framework === 'CRAFT' ? `**C.R.A.F.T Framework:**
- **C**lear: Simple, direct language. No jargon without explanation.
- **R**elevant: Stay on-topic, answer user intent directly.
- **A**ccurate: 2025-updated data and statistics.
- **F**actual: Evidence-based claims with authority.
- **T**erse: No fluff, every sentence adds value.` : ''}

${framework === 'HUMAIZE' ? `**HUMAIZE Framework:**
- **H**uman-like: Conversational, warm, relatable tone.
- **U**nique: Varied sentence structures and vocabulary.
- **M**eaningful: Real-world examples and applications.
- **A**uthentic: Knowledgeable friend explaining concepts.
- **I**ntuitive: Natural transitions between topics.
- **Z**ero AI: Target <20% AI detection score.
- **E**motion: Connect with reader pain points and goals.` : ''}

${framework === 'HYBRID' ? `**HYBRID Multi-Framework:**
Combine: SAGE (structure 30%) + READ (readability 25%) + CRAFT (clarity 25%) + HUMAIZE (human tone 20%)
Apply all framework principles simultaneously for maximum optimization.` : ''}

## CONTENT STRUCTURE

### Word Count: ${targetWordCount}+ words total
- **Introduction:** 100-150 words (4-5 short paragraphs)
- **Body Sections:** 150-250 words each (5-8 paragraphs per section)
- **Conclusion:** 80-120 words (3-4 paragraphs) + CTA

### Keyword Integration
- **Primary Keywords:** ${keywordDensity}% density, in H1, first 100 words, H2s, conclusion
- **Secondary/Semantic/LSI:** Distribute naturally throughout
- **NO keyword stuffing** - prioritize readability

### Brand Integration: ${brandName || 'N/A'}
${brandName ? `Mention "${brandName}" 2-4 times per major section naturally.` : 'No specific brand to integrate.'}

### CTA Integration
${includeCtaTypes.includes('course') ? '- Course CTA: Subtle enrollment/learning opportunities' : ''}
${includeCtaTypes.includes('alsoRead') ? '- Also Read: 1-2 internal link suggestions' : ''}
${includeCtaTypes.includes('related') ? '- Related Content: Suggest relevant topics' : ''}
${includeCtaTypes.includes('industry') ? '- Industry Solutions: US industry applications' : ''}
${includeCtaTypes.includes('usp') ? '- USP/Benefits: Unique value propositions' : ''}
${includeCtaTypes.includes('humanIntent') ? '- Human Intent: Emotional triggers, pain points' : ''}
${includeCtaTypes.includes('seoIntent') ? '- SEO Intent: Natural keyword CTAs' : ''}
${includeCtaTypes.includes('llmoIntent') ? '- LLMO Intent: LLM-friendly cite-worthy statements' : ''}

## HTML FORMATTING (MANDATORY)
- Use: <p>, <h2>, <h3>, <strong>, <em>, <ul>, <ol>, <li>
- Use <strong> NOT <b>
- Use <em> NOT <i>
- No inline styles
- Clean semantic HTML only

## HUMANIZATION TECHNIQUES (Apply 10-15)
- Contractions: it's, you'll, don't, can't, won't
- Sentence length variety (5-25 words)
- Natural transitions: "Here's the thing...", "That said...", "The truth is..."
- Specific examples with numbers
- Industry terminology (explained naturally)
- Rhetorical questions to engage reader
- Metaphors and analogies for complex concepts
- Direct address ("you", "your")

## SELF-CHECK BEFORE OUTPUT
✓ All paragraphs ~30 words?
✓ H3s added naturally where beneficial?
✓ Bullet points where lists help?
✓ Zero repeated content?
✓ SEO optimized but human-readable?
✓ Framework applied correctly?
✓ Location-intent present?
✓ LLM-friendly structure?

**OUTPUT: HTML CONTENT ONLY. NO EXPLANATIONS, NO META COMMENTARY.**`
          },
          {
            role: "user",
            content: `Generate a ${selectedFramework.name}-optimized blog post.

**Request ID:** ${Date.now()} (for unique content generation)

**TOPIC:** ${metaTags.title}
**LOCATION INTENT:** ${location}
**BRAND:** ${brandName || 'N/A'}
**TARGET WORD COUNT:** ${targetWordCount}+ words
**KEYWORD DENSITY:** ${keywordDensity}%

${contextContent ? `## PRIMARY CONTEXT DOCUMENT (USE AS FOUNDATION)
Transform this context into the blog post - do not add external information:
--- CONTEXT START ---
${contextContent.substring(0, 8000)}
--- CONTEXT END ---

` : ''}## KEYWORDS TO INTEGRATE
**Primary:** ${keywords.primary.join(", ")}
**Secondary:** ${keywords.secondary.join(", ")}
**Semantic:** ${keywords.semantic.join(", ")}
**LSI:** ${keywords.lsi.join(", ")}

## HEADING STRUCTURE TO FOLLOW
${h2List}

${faqContent && faqContent.length > 0 ? `## FAQ SECTION (Add at end)
${faqContent.map((faq: any) => `<h3>${faq.question}</h3>\n<p>${faq.answer}</p>`).join("\n")}` : ""}

## MANDATORY VALIDATION CHECKLIST
☑ ≥${targetWordCount} words total
☑ Every paragraph ~30 words (28-35 range)
☑ H3 subheadings added naturally
☑ Bullet points where appropriate
☑ ZERO content repetition
☑ ${keywordDensity}% keyword density
☑ "${location}" mentioned 3-5 times
${brandName ? `☑ "${brandName}" integrated naturally` : ''}
☑ All provided H2 headings used
☑ Clean semantic HTML
☑ 2025 content references
☑ Flesch Reading Ease 60+
☑ AI detection target <20%

**THINK STEP-BY-STEP. THEN OUTPUT HTML ONLY.**`
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
