import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Content Ladder Optimization System
interface ContentLadderMetrics {
  distanceScore: number;      // How far content is from generic AI patterns (0-100)
  realnessScore: number;      // Human-like authenticity (0-100)
  semanticDepth: number;      // Query variation coverage (0-100)
  queryLadderScore: number;   // Multi-intent query optimization (0-100)
  llmoScore: number;          // Overall LLMO optimization (0-100)
}

function generateContentLadderPrompt(keywords: any, metaTags: any): string {
  const primaryKw = keywords.primary?.[0] || '';
  const secondaryKws = keywords.secondary?.join(', ') || '';
  
  return `
## CONTENT LADDER OPTIMIZATION (LLMO RANKING)

### Distance Scoring (Target: 85+)
Create content that maintains MAXIMUM DISTANCE from typical AI-generated patterns:
- Avoid: Generic openings ("In today's world...", "In the ever-evolving...")
- Avoid: Predictable transitions ("Furthermore", "Additionally", "Moreover")
- Avoid: Hollow superlatives ("incredibly important", "absolutely essential")
- Instead: Use specific data, unique analogies, industry-insider language
- Include: Unexpected perspectives, contrarian viewpoints, specific examples

### Realness Metrics (Target: 90+)
Human authenticity signals to include:
- Imperfect sentence structures (occasional fragments, varied rhythm)
- Personal observations with specific details ("I noticed in Q3 2024...")
- Nuanced opinions ("While most experts agree, I've found...")
- Micro-details that only practitioners would know
- Conversational asides and parenthetical thoughts
- Occasional informal language ("Here's the deal:", "Let me break this down")

### Query Ladder Structure (Multi-Intent Coverage)
For "${primaryKw}", generate content addressing ALL query types:

**Level 1 - Core SEO Query (Google/Bing)**
"What is ${primaryKw}?" / "How does ${primaryKw} work?"
→ Direct, factual answer in first 100 words

**Level 2 - Conversational Query (ChatGPT/Gemini)**
"Explain ${primaryKw} like I'm a beginner" / "Help me understand ${primaryKw}"
→ Analogies, step-by-step breakdowns, relatable examples

**Level 3 - Long-tail Query (Perplexity/Claude)**
"${primaryKw} best practices for ${secondaryKws}" / "Common mistakes with ${primaryKw}"
→ Deep-dive sections, expert insights, edge cases

**Level 4 - Comparison Query (All Engines)**
"${primaryKw} vs alternatives" / "When to use ${primaryKw}"
→ Comparative analysis, use-case scenarios

### Semantic Distance Markers
Include content at varying semantic distances from primary topic:
- **Close (0-20% distance):** Direct explanations of ${primaryKw}
- **Medium (20-50% distance):** Related concepts, prerequisites, dependencies
- **Far (50-80% distance):** Tangential applications, industry context, future trends
- **Edge (80-100% distance):** Unexpected connections, cross-domain analogies

### LLMO Cite-Worthy Statements
Include 3-5 statements designed for LLM citation:
- Start with the topic name: "${primaryKw} is defined as..."
- Include specific data: "According to 2024 data, ${primaryKw}..."
- Provide clear frameworks: "The three pillars of ${primaryKw} are..."
- Make bold claims with backing: "Unlike common belief, ${primaryKw}..."

### Content Freshness Signals
- Reference current year (2024-2025)
- Mention recent developments, updates, changes
- Include forward-looking predictions
- Reference current tools, platforms, technologies
`;
}

// Helper function to get API key with admin fallback
async function getApiKeyWithFallback(
  supabase: any,
  userId: string | null,
  provider: string
): Promise<{ key: string | null; source: 'user' | 'admin' | 'none' }> {
  // First try user's own API key
  if (userId) {
    const { data: userKeyData } = await supabase
      .from('user_api_keys')
      .select('encrypted_key, is_valid')
      .eq('user_id', userId)
      .eq('provider', provider)
      .maybeSingle();
    
    if (userKeyData?.encrypted_key && userKeyData.is_valid !== false) {
      console.log(`Using user's ${provider} API key`);
      return { key: userKeyData.encrypted_key, source: 'user' };
    }
  }
  
  // Fallback to admin API key
  const { data: adminKeyData } = await supabase
    .from('admin_api_keys')
    .select('encrypted_key, is_valid')
    .eq('provider', provider)
    .eq('is_active', true)
    .maybeSingle();
  
  if (adminKeyData?.encrypted_key && adminKeyData.is_valid !== false) {
    console.log(`Using admin fallback ${provider} API key`);
    return { key: adminKeyData.encrypted_key, source: 'admin' };
  }
  
  return { key: null, source: 'none' };
}

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
      model = 'gemini-flash',
      articleElements = {
        useFirstPerson: true,
        includeStories: true,
        includeHook: true,
        includeHtmlElement: false,
        includeCitations: true,
        includeInternalLinks: true,
      },
      brandVoice = null,
      internalLinkUrls = []
    } = await req.json();
    
    console.log("Content generation started:", {
      model,
      framework,
      targetWordCount,
      hasKeywords: !!keywords,
      hasHeadings: !!headings,
      timestamp: new Date().toISOString()
    });
    
    // Get user ID from auth header for API key lookup
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }
    
    // Determine API endpoint and key based on model
    let apiUrl: string;
    let apiKey: string | null = null;
    let modelId: string;
    let keySource: 'user' | 'admin' | 'none' = 'none';
    
    if (model === 'gemini-flash') {
      // Use Lovable AI Gateway
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      apiKey = Deno.env.get("LOVABLE_API_KEY") || null;
      modelId = "google/gemini-2.5-flash";
      keySource = 'admin';
    } else if (model === 'claude-sonnet-4' || model === 'claude-sonnet-4.5') {
      // Use OpenRouter - try user's key first, then admin fallback
      apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      modelId = model === 'claude-sonnet-4' ? 'anthropic/claude-sonnet-4' : 'anthropic/claude-sonnet-4-5';
      
      const keyResult = await getApiKeyWithFallback(supabase, userId, 'openrouter');
      apiKey = keyResult.key;
      keySource = keyResult.source;
      
      if (!apiKey) {
        throw new Error("OpenRouter API key not configured. Please add your API key in Settings or contact admin.");
      }
    } else if (model === 'gemini-free') {
      // Use Google's Gemini API directly
      apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
      modelId = "gemini-2.0-flash";
      
      const keyResult = await getApiKeyWithFallback(supabase, userId, 'gemini');
      apiKey = keyResult.key;
      keySource = keyResult.source;
      
      if (!apiKey) {
        throw new Error("Gemini API key not configured. Please add your API key in Settings or contact admin.");
      }
    } else {
      // Default to Lovable AI Gateway
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      apiKey = Deno.env.get("LOVABLE_API_KEY") || null;
      modelId = "google/gemini-2.5-flash";
      keySource = 'admin';
    }

    if (!apiKey) {
      throw new Error("API key not configured for selected model");
    }
    
    console.log(`API key source: ${keySource}, model: ${modelId}`);
    
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

    // Generate Content Ladder optimization prompt
    const contentLadderPrompt = generateContentLadderPrompt(keywords, metaTags);

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
            content: `Act like an expert SEO content strategist, senior NLP prompt engineer, and professional blog writer with deep expertise in LLMO (Large Language Model Optimization).

Your goal is to generate a full long-form blog using a Content Generation Framework with strong SEO, LLM-optimized structure, location-intent focus, and maximum user readability.

${contentLadderPrompt}

## STEP-BY-STEP REASONING PROCESS (Internal - Do Not Output)

Before generating, mentally:
1. Analyze the topic and keywords for search intent
2. Map location-intent signals throughout content
3. Plan paragraph distribution (~30 words each)
4. Identify natural H3 breakpoints
5. Mark bullet point opportunities
6. Ensure zero content repetition
7. Apply Content Ladder at each section
8. Insert LLMO cite-worthy statements

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

## ARTICLE ELEMENT SETTINGS (Apply Based on Selection)
${articleElements.useFirstPerson ? `- **First Person:** Write from an "I" perspective. Share personal experiences and opinions. Use phrases like "I've found", "In my experience", "I recommend".` : '- **Third Person:** Write in objective third person. Avoid "I" statements. Use authoritative, journalistic tone.'}
${articleElements.includeStories ? `- **Stories & Examples:** Include personal anecdotes, case studies, and real-world examples. Make content relatable with specific scenarios.` : '- **No Stories:** Focus on direct information delivery. Skip personal anecdotes and extended examples.'}
${articleElements.includeHook ? `- **Engaging Hook:** Start with a compelling introduction - a surprising fact, thought-provoking question, bold statement, or relatable scenario to grab attention immediately.` : '- **Direct Start:** Begin directly with the topic. Skip hooks and jump straight to the main content.'}
${articleElements.includeHtmlElement ? `- **HTML Interactive Element:** Include ONE interactive HTML element (calculator, quiz, comparison table, checklist, or FAQ accordion) relevant to the topic.` : ''}
${articleElements.includeCitations ? `- **Citations:** Include authoritative references, statistics, and expert quotes. Add [Source: ...] notations or inline links to studies/reports.` : '- **No Citations:** Write based on general knowledge without explicit source citations.'}
${articleElements.includeInternalLinks ? `- **Internal Links:** ${internalLinkUrls && internalLinkUrls.length > 0 ? `Include 2-4 internal links from this list of available URLs:
${internalLinkUrls.slice(0, 15).map((url: string) => `  - ${url}`).join('\n')}
Choose the most contextually relevant URLs and insert them as proper anchor tags: <a href="URL">descriptive anchor text</a>` : 'Include 2-4 placeholder internal link suggestions like [Internal Link: Related Topic Here] where relevant content could be linked.'}` : ''}

${brandVoice ? `## BRAND VOICE (Apply Throughout)
**Voice Name:** ${brandVoice.name}
**Tone:** ${brandVoice.tone || 'Not specified'}
${brandVoice.styleGuidelines ? `**Style Guidelines:** ${brandVoice.styleGuidelines}` : ''}
${brandVoice.vocabularyPreferences ? `**Vocabulary Preferences:** ${brandVoice.vocabularyPreferences}` : ''}
${brandVoice.exampleContent ? `**Example of Brand Voice:**
${brandVoice.exampleContent.substring(0, 500)}` : ''}

Apply this brand voice consistently throughout all content - match the tone, vocabulary, and style.` : ''}

## SELF-CHECK BEFORE OUTPUT
✓ All paragraphs ~30 words?
✓ H3s added naturally where beneficial?
✓ Bullet points where lists help?
✓ Zero repeated content?
✓ SEO optimized but human-readable?
✓ Framework applied correctly?
✓ Location-intent present?
✓ LLM-friendly structure?
✓ Content Ladder applied (distance, realness, query variations)?
✓ LLMO cite-worthy statements included?
${articleElements.useFirstPerson ? '✓ First person perspective used?' : '✓ Third person perspective maintained?'}
${articleElements.includeStories ? '✓ Stories/examples included?' : ''}
${articleElements.includeHook ? '✓ Engaging hook in introduction?' : ''}
${articleElements.includeCitations ? '✓ Citations/references added?' : ''}

**OUTPUT: HTML CONTENT ONLY. NO EXPLANATIONS, NO META COMMENTARY.**`
          },
          {
            role: "user",
            content: `Generate a ${selectedFramework.name}-optimized blog post with Content Ladder LLMO optimization.

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

## CONTENT LADDER REQUIREMENTS
☑ Distance Score: 85+ (avoid AI patterns)
☑ Realness Score: 90+ (human authenticity)
☑ Query Ladder: All 4 levels covered
☑ Semantic Distance: Close/Medium/Far/Edge content
☑ 3-5 LLMO cite-worthy statements

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
        keySource,
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

    // Calculate SEO score
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

    // Calculate Content Ladder metrics
    const contentLadderMetrics: ContentLadderMetrics = calculateContentLadderMetrics(content, keywords);

    console.log("Content generation completed:", {
      wordCount,
      seoScore,
      contentLadderMetrics,
      keySource,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        content, 
        seoScore,
        contentLadderMetrics,
        keySource 
      }),
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

// Calculate Content Ladder metrics from generated content
function calculateContentLadderMetrics(content: string, keywords: any): ContentLadderMetrics {
  const text = content.toLowerCase();
  
  // Distance Score: Check for AI pattern avoidance
  const aiPatterns = [
    'in today\'s world', 'in the ever-evolving', 'furthermore', 'moreover',
    'additionally', 'it is important to note', 'in conclusion',
    'incredibly important', 'absolutely essential', 'extremely vital'
  ];
  const aiPatternMatches = aiPatterns.filter(p => text.includes(p)).length;
  const distanceScore = Math.max(0, 100 - (aiPatternMatches * 15));
  
  // Realness Score: Check for human-like patterns
  const humanPatterns = [
    'i\'ve', 'i\'m', 'you\'ll', 'here\'s', 'that\'s', 'don\'t', 'can\'t',
    'let me', 'honestly', 'frankly', 'the truth is', 'here\'s the deal'
  ];
  const humanPatternMatches = humanPatterns.filter(p => text.includes(p)).length;
  const realnessScore = Math.min(100, 50 + (humanPatternMatches * 8));
  
  // Semantic Depth: Check keyword variations coverage
  const allKeywords = [
    ...(keywords.primary || []),
    ...(keywords.secondary || []),
    ...(keywords.semantic || []),
    ...(keywords.lsi || [])
  ];
  const keywordsFound = allKeywords.filter((kw: string) => 
    text.includes(kw.toLowerCase())
  ).length;
  const semanticDepth = Math.min(100, Math.round((keywordsFound / Math.max(1, allKeywords.length)) * 100));
  
  // Query Ladder Score: Check for question patterns
  const questionPatterns = [
    'what is', 'how does', 'why', 'when to', 'how to',
    'best practices', 'common mistakes', 'vs', 'compared to'
  ];
  const questionMatches = questionPatterns.filter(p => text.includes(p)).length;
  const queryLadderScore = Math.min(100, 40 + (questionMatches * 10));
  
  // Overall LLMO Score
  const llmoScore = Math.round(
    (distanceScore * 0.25) + 
    (realnessScore * 0.25) + 
    (semanticDepth * 0.25) + 
    (queryLadderScore * 0.25)
  );
  
  return {
    distanceScore,
    realnessScore,
    semanticDepth,
    queryLadderScore,
    llmoScore
  };
}
