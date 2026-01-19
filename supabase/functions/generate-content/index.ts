import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ToFu/MoFu/BoFu Content Framework Metrics
interface ContentMetrics {
  funnelAlignment: number;      // How well content matches funnel stage (0-100)
  entityDensity: number;        // Named entity coverage (0-100)
  semanticRelatedness: number;  // Keyword-content semantic distance (0-100)
  freshness: number;            // Current/updated content signals (0-100)
  llmoScore: number;            // Overall LLMO optimization (0-100)
}

// Helper function to get API key with admin fallback
async function getApiKeyWithFallback(
  supabase: any,
  userId: string | null,
  provider: string
): Promise<{ key: string | null; source: 'user' | 'admin' | 'none' }> {
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

function generateTofuMofuBofuPrompt(
  keywords: any, 
  funnelStage: string,
  brandName: string
): string {
  const primaryKw = keywords.primary?.[0] || '';
  const allKeywords = [
    ...(keywords.primary || []),
    ...(keywords.secondary || []),
    ...(keywords.semantic || []),
    ...(keywords.lsi || [])
  ].join(', ');

  const funnelGuidance: Record<string, string> = {
    tofu: `
## ToFu (Top of Funnel) - AWARENESS STAGE
Target: Users discovering the problem/topic for the first time

**Content Goals:**
- Educational, informative, problem-aware content
- Answer "What is...", "Why...", "Understanding..." queries
- Build trust through expertise demonstration
- NO hard sells, NO product pushing

**Intent Alignment:**
- Informational intent (80%)
- Discovery-focused questions
- Broad topic exploration
- Beginner-friendly explanations

**Content Style:**
- Explainer articles, ultimate guides, "101" content
- Definitions, concepts, fundamentals
- Industry trends, statistics, research
- Problem identification and validation`,

    mofu: `
## MoFu (Middle of Funnel) - CONSIDERATION STAGE  
Target: Users evaluating solutions and comparing options

**Content Goals:**
- Solution-oriented, comparison-focused content
- Answer "How to...", "Best...", "vs...", "Comparison" queries
- Demonstrate expertise with specific solutions
- Soft CTAs, value demonstrations

**Intent Alignment:**
- Commercial investigation intent (70%)
- Comparison and evaluation queries
- Feature/benefit analysis
- Use case scenarios

**Content Style:**
- Comparison guides, "Best X for Y" articles
- How-to tutorials with tool recommendations
- Case studies, success stories
- Pros/cons analysis, feature breakdowns`,

    bofu: `
## BoFu (Bottom of Funnel) - DECISION STAGE
Target: Users ready to make a purchase/action decision

**Content Goals:**
- Action-oriented, conversion-focused content
- Answer "Buy...", "Get...", "Sign up...", "Pricing" queries
- Remove final objections, build urgency
- Strong CTAs, clear next steps

**Intent Alignment:**
- Transactional intent (80%)
- Purchase-ready queries
- Specific product/service queries
- Implementation and getting started

**Content Style:**
- Product reviews, pricing guides
- Implementation guides, quick-start tutorials
- ROI calculators, testimonials
- Limited-time offers, guarantees`
  };

  return `
## ToFu/MoFu/BoFu CONTENT FRAMEWORK

${funnelGuidance[funnelStage] || funnelGuidance.tofu}

### Entity-Based Optimization
Include these entity types naturally throughout:
- **Named Entities:** People, companies, products, locations, dates
- **Conceptual Entities:** Processes, methodologies, frameworks
- **Quantitative Entities:** Statistics, percentages, metrics, years
- **Authority Entities:** Studies, reports, expert quotes

${brandName ? `### Brand Integration (NATURAL ONLY)
Integrate "${brandName}" naturally 3-5 times where contextually appropriate:
- In solution contexts: "${brandName} offers/provides..."
- In examples: "Tools like ${brandName}..."
- In recommendations: "Consider ${brandName} for..."
DO NOT force brand mentions - only where natural.` : ''}

### Content & Keyword Distance Optimization
**Semantic Relatedness Tiers:**
- **Core (0-20%):** Direct ${primaryKw} explanations
- **Close (20-40%):** Closely related concepts and synonyms
- **Related (40-60%):** Tangential topics and applications
- **Extended (60-80%):** Industry context and trends
- **Edge (80-100%):** Cross-domain connections

### Freshness Signals (2025)
- Reference current year data and trends
- Mention recent developments and updates
- Include forward-looking predictions
- Use current tools, platforms, technologies

### SEO + LLMO Query Types
**Traditional SEO Queries:**
- "What is ${primaryKw}"
- "How to ${primaryKw}"
- "${primaryKw} best practices"

**LLM-Optimized Queries:**
- "Explain ${primaryKw} simply"
- "Compare ${primaryKw} options"
- "Step-by-step ${primaryKw} guide"
- "Common ${primaryKw} mistakes"
- "${primaryKw} for beginners"

### Keywords to integrate naturally:
${allKeywords}
`;
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
      funnelStage = 'tofu',
      location = 'United States',
      brandName = '',
      targetWordCount = 2000,
      keywordDensity = 1.5,
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
        includeBulletPoints: true,
        includeExamples: true,
        includeComparisonTables: true,
      },
      brandVoice = null,
      internalLinkUrls = [],
      generateFaqs = true,
      faqCount = 20
    } = await req.json();
    
    console.log("Content generation started:", {
      model,
      funnelStage,
      targetWordCount,
      faqCount,
      hasKeywords: !!keywords,
      hasHeadings: !!headings,
      timestamp: new Date().toISOString()
    });
    
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
    
    let apiUrl: string;
    let apiKey: string | null = null;
    let modelId: string;
    let keySource: 'user' | 'admin' | 'none' = 'none';
    
    if (model === 'gemini-flash') {
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      apiKey = Deno.env.get("LOVABLE_API_KEY") || null;
      modelId = "google/gemini-2.5-flash";
      keySource = 'admin';
    } else if (model === 'claude-sonnet-4' || model === 'claude-sonnet-4.5') {
      apiUrl = "https://openrouter.ai/api/v1/chat/completions";
      modelId = model === 'claude-sonnet-4' ? 'anthropic/claude-sonnet-4' : 'anthropic/claude-sonnet-4-5';
      
      const keyResult = await getApiKeyWithFallback(supabase, userId, 'openrouter');
      apiKey = keyResult.key;
      keySource = keyResult.source;
      
      if (!apiKey) {
        throw new Error("OpenRouter API key not configured. Please add your API key in Settings or contact admin.");
      }
    } else if (model === 'gemini-free') {
      const keyResult = await getApiKeyWithFallback(supabase, userId, 'gemini');
      
      if (keyResult.key) {
        apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
        modelId = "gemini-2.0-flash";
        apiKey = keyResult.key;
        keySource = keyResult.source;
      } else {
        console.log("No Gemini key found, falling back to Lovable AI Gateway");
        apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
        apiKey = Deno.env.get("LOVABLE_API_KEY") || null;
        modelId = "google/gemini-2.5-flash";
        keySource = 'admin';
      }
    } else {
      apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
      apiKey = Deno.env.get("LOVABLE_API_KEY") || null;
      modelId = "google/gemini-2.5-flash";
      keySource = 'admin';
    }

    if (!apiKey) {
      throw new Error("API key not configured for selected model");
    }
    
    console.log(`API key source: ${keySource}, model: ${modelId}`);
    
    const isGoogleDirectApi = apiUrl.includes('generativelanguage.googleapis.com');

    const h2List = headings.h2s.map((h2: string, index: number) => {
      const h3s = headings.h3s
        .filter((h3: any) => h3.h2Index === index)
        .map((h3: any) => `  - ${h3.text}`)
        .join("\n");
      return `${h2}${h3s ? "\n" + h3s : ""}`;
    }).join("\n\n");

    const tofuMofuBofuPrompt = generateTofuMofuBofuPrompt(keywords, funnelStage, brandName);

    const systemPrompt = `You are an expert SEO content strategist and professional blog writer specializing in ToFu/MoFu/BoFu content optimization for both traditional search engines and Large Language Models (LLMO).

${tofuMofuBofuPrompt}

## CRITICAL FORMATTING RULES

### PARAGRAPH STRUCTURE (30-40 WORDS STRICT)
Every paragraph MUST be 30-40 words maximum.
- Split longer ideas into multiple short paragraphs
- Each paragraph = 2-3 sentences MAX
- Create visual breathing room
- Use <p></p> tags around every paragraph

### NATURAL BULLET POINTS
Insert bullet points where they improve readability:
- Feature lists
- Step-by-step processes
- Benefits/advantages
- Tips and best practices
- Key takeaways
Use <ul><li> for unordered, <ol><li> for ordered lists.

### REAL-WORLD EXAMPLES
Include concrete examples throughout:
- Industry-specific scenarios
- Before/after comparisons
- Case study snippets
- Practical applications
- Tool/product examples

### COMPARISON TABLES
${articleElements.includeComparisonTables ? `Include 1-2 HTML comparison tables where appropriate:
<table>
  <thead><tr><th>Feature</th><th>Option A</th><th>Option B</th></tr></thead>
  <tbody>
    <tr><td>...</td><td>...</td><td>...</td></tr>
  </tbody>
</table>
Use for: features comparison, pricing tiers, pros/cons, tool comparisons.` : 'Skip comparison tables.'}

### KEYWORD INTENT OPTIMIZATION
Map keywords to user intent:
- **Informational:** "what is", "how to", "guide", "tutorial"
- **Commercial:** "best", "review", "comparison", "vs"
- **Transactional:** "buy", "price", "discount", "sign up"
- **Navigational:** brand names, specific products

Current keyword density target: ${keywordDensity}%

## USER INTENT ALIGNMENT
${userIntent ? `
**Detected Intent:** ${userIntent.primaryIntent}
**Searcher Goal:** ${userIntent.searcherGoal}
**Content Angle:** ${userIntent.contentAngle}
**Intent Signals:** ${userIntent.intentSignals?.join(', ') || 'N/A'}

Align ALL content sections with this detected intent.
` : 'Analyze topic to determine and align with user intent.'}

## LOCATION FOCUS: ${location}
- Use ${location} English spelling and conventions
- Reference ${location} companies, brands, regulations
- Include ${location} market data and statistics
- Mention "${location}" naturally 2-4 times

## ARTICLE ELEMENTS
${articleElements.useFirstPerson ? '- Use first person ("I", "we") for personal, relatable tone' : '- Use third person for objective, authoritative tone'}
${articleElements.includeStories ? '- Include personal anecdotes and mini case studies' : ''}
${articleElements.includeHook ? '- Start with compelling hook: surprising fact, question, or bold statement' : ''}
${articleElements.includeCitations ? '- Include [Source: ...] citations for statistics and claims' : ''}
${articleElements.includeInternalLinks && internalLinkUrls?.length > 0 ? `- Include 2-4 internal links from: ${internalLinkUrls.slice(0, 10).join(', ')}` : ''}

${brandVoice ? `## BRAND VOICE
**Voice:** ${brandVoice.name}
**Tone:** ${brandVoice.tone || 'Professional'}
${brandVoice.styleGuidelines ? `**Style:** ${brandVoice.styleGuidelines}` : ''}
` : ''}

## HTML OUTPUT FORMAT
Use semantic HTML only:
- <h2>, <h3> for headings
- <p> for paragraphs (30-40 words each)
- <ul>/<ol> with <li> for lists
- <strong> for emphasis (not <b>)
- <em> for italics (not <i>)
- <table> for comparisons
- <blockquote> for quotes/callouts

## HUMANIZATION TECHNIQUES
Apply 10+ of these:
- Contractions (it's, you'll, don't, can't)
- Varied sentence lengths (5-25 words)
- Natural transitions ("Here's the thing...", "That said...")
- Specific numbers and data
- Rhetorical questions
- Metaphors and analogies
- Direct "you" address
- Occasional informal language

## FAQ SECTION (${generateFaqs ? `Generate ${faqCount} FAQs` : 'Skip FAQs'})
${generateFaqs ? `
Generate exactly ${faqCount} FAQs at the end of the article.
Format each FAQ as:
<div class="faq-item">
  <h3>Q: [Question targeting specific keyword intent]</h3>
  <p>[Comprehensive 50-80 word answer with entity references]</p>
</div>

FAQ Types to include:
- Definition questions (What is...)
- How-to questions (How do I...)
- Comparison questions (What's the difference...)
- Best practice questions (What's the best way...)
- Troubleshooting questions (Why isn't... working)
- Cost/pricing questions (How much does... cost)
- Time questions (How long does... take)
- Recommendation questions (Which... should I choose)
` : ''}

## OUTPUT
Generate complete HTML blog content following ALL guidelines above.
Do NOT include any meta-commentary, explanations, or markdown - HTML only.`;

    const userPrompt = `Generate a comprehensive ${funnelStage.toUpperCase()} blog post with LLMO optimization.

**TOPIC:** ${metaTags.title}
**FUNNEL STAGE:** ${funnelStage.toUpperCase()} (${funnelStage === 'tofu' ? 'Awareness' : funnelStage === 'mofu' ? 'Consideration' : 'Decision'})
**TARGET WORD COUNT:** ${targetWordCount}+ words
**FAQ COUNT:** ${generateFaqs ? faqCount : 0}
**LOCATION:** ${location}
${brandName ? `**BRAND:** ${brandName} (integrate naturally)` : ''}

${contextContent ? `## CONTEXT DOCUMENT
Use this as primary content foundation:
---
${contextContent.substring(0, 8000)}
---
` : ''}

## KEYWORDS (Integrate at ${keywordDensity}% density)
**Primary:** ${keywords.primary.join(", ")}
**Secondary:** ${keywords.secondary.join(", ")}
**Semantic:** ${keywords.semantic.join(", ")}
**LSI:** ${keywords.lsi.join(", ")}
${keywords.conversational?.length ? `**Conversational:** ${keywords.conversational.join(", ")}` : ''}
${keywords.longTail?.length ? `**Long-tail:** ${keywords.longTail.join(", ")}` : ''}

## HEADING STRUCTURE
${h2List}

## VALIDATION CHECKLIST
☑ ${targetWordCount}+ words total
☑ Every paragraph 30-40 words
☑ Natural bullet points included
☑ Real-world examples throughout
${articleElements.includeComparisonTables ? '☑ 1-2 comparison tables' : ''}
☑ Keywords at ${keywordDensity}% density
☑ ${funnelStage.toUpperCase()} intent alignment
☑ Entity-rich content (names, data, sources)
☑ 2025 freshness signals
${generateFaqs ? `☑ ${faqCount} FAQs at end` : ''}
${brandName ? `☑ "${brandName}" integrated naturally` : ''}

**OUTPUT HTML ONLY. NO EXPLANATIONS.**`;

    async function makeApiRequest(
      url: string, 
      key: string, 
      model: string, 
      isGoogleDirect: boolean
    ): Promise<Response> {
      if (isGoogleDirect) {
        return fetch(`${url}?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 16384 }
          }),
        });
      } else {
        return fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
          }),
        });
      }
    }

    let response = await makeApiRequest(apiUrl, apiKey, modelId, isGoogleDirectApi);
    let usedFallback = false;

    if (!response.ok && isGoogleDirectApi && (response.status === 401 || response.status === 403)) {
      console.log("Google Gemini API failed, falling back to Lovable AI Gateway");
      
      const lovableKey = Deno.env.get("LOVABLE_API_KEY");
      if (lovableKey) {
        apiUrl = "https://ai.gateway.lovable.dev/v1/chat/completions";
        apiKey = lovableKey;
        modelId = "google/gemini-2.5-flash";
        keySource = 'admin';
        usedFallback = true;
        
        response = await makeApiRequest(apiUrl, apiKey, modelId, false);
      }
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("AI gateway HTTP error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        keySource,
        usedFallback,
        timestamp: new Date().toISOString()
      });
      throw new Error(`AI gateway returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    let content: string;
    let tokenUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    
    if (isGoogleDirectApi && !usedFallback) {
      if (!data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Invalid Gemini response:", JSON.stringify(data).substring(0, 500));
        throw new Error("Invalid response structure from Gemini API");
      }
      content = data.candidates[0].content.parts[0].text;
      
      if (data.usageMetadata) {
        tokenUsage = {
          promptTokens: data.usageMetadata.promptTokenCount || 0,
          completionTokens: data.usageMetadata.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata.totalTokenCount || 0
        };
      }
    } else {
      if (!data?.choices?.[0]?.message?.content) {
        console.error("Invalid AI response:", JSON.stringify(data).substring(0, 500));
        throw new Error("Invalid response structure from AI gateway");
      }
      content = data.choices[0].message.content;
      
      if (data.usage) {
        tokenUsage = {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0
        };
      }
    }

    // Calculate metrics
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

    const contentMetrics = calculateContentMetrics(content, keywords, funnelStage);

    console.log("Content generation completed:", {
      wordCount,
      seoScore,
      contentMetrics,
      keySource,
      usedFallback,
      timestamp: new Date().toISOString()
    });

    // Calculate estimated cost
    let estimatedCost = 0;
    const pricing: Record<string, { input: number; output: number }> = {
      'claude-sonnet-4': { input: 3, output: 15 },
      'claude-sonnet-4.5': { input: 3, output: 15 },
      'gemini-free': { input: 0, output: 0 },
      'gemini-flash': { input: 0, output: 0 },
    };
    
    const modelPricing = pricing[model] || { input: 0, output: 0 };
    estimatedCost = (
      (tokenUsage.promptTokens / 1000000) * modelPricing.input +
      (tokenUsage.completionTokens / 1000000) * modelPricing.output
    );

    return new Response(
      JSON.stringify({ 
        content, 
        seoScore,
        contentMetrics,
        keySource: usedFallback ? 'admin (fallback)' : keySource,
        tokenUsage,
        estimatedCost: Math.round(estimatedCost * 10000) / 10000
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

function calculateContentMetrics(content: string, keywords: any, funnelStage: string): ContentMetrics {
  const text = content.toLowerCase();
  
  // Funnel Alignment: Check for stage-appropriate content patterns
  const funnelPatterns: Record<string, string[]> = {
    tofu: ['what is', 'introduction', 'basics', 'understanding', 'guide', 'learn', 'discover'],
    mofu: ['how to', 'compare', 'best', 'review', 'vs', 'alternative', 'solution'],
    bofu: ['buy', 'price', 'get started', 'sign up', 'try', 'demo', 'contact']
  };
  const patterns = funnelPatterns[funnelStage] || funnelPatterns.tofu;
  const funnelMatches = patterns.filter(p => text.includes(p)).length;
  const funnelAlignment = Math.min(100, 40 + (funnelMatches * 12));
  
  // Entity Density: Check for named entities
  const entityPatterns = [
    /\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b/g,  // Proper nouns
    /\b\d{4}\b/g,  // Years
    /\b\d+%\b/g,   // Percentages
    /\$[\d,]+/g,   // Dollar amounts
  ];
  let entityCount = 0;
  entityPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) entityCount += matches.length;
  });
  const entityDensity = Math.min(100, 30 + (entityCount * 2));
  
  // Semantic Relatedness: Keyword coverage
  const allKeywords = [
    ...(keywords.primary || []),
    ...(keywords.secondary || []),
    ...(keywords.semantic || []),
    ...(keywords.lsi || [])
  ];
  const keywordsFound = allKeywords.filter((kw: string) => 
    text.includes(kw.toLowerCase())
  ).length;
  const semanticRelatedness = Math.min(100, Math.round((keywordsFound / Math.max(1, allKeywords.length)) * 100));
  
  // Freshness: Check for current year references
  const freshnessPatterns = ['2025', '2024', 'recently', 'latest', 'new', 'updated', 'current'];
  const freshnessMatches = freshnessPatterns.filter(p => text.includes(p)).length;
  const freshness = Math.min(100, 40 + (freshnessMatches * 12));
  
  // Overall LLMO Score
  const llmoScore = Math.round(
    (funnelAlignment * 0.25) + 
    (entityDensity * 0.25) + 
    (semanticRelatedness * 0.25) + 
    (freshness * 0.25)
  );
  
  return {
    funnelAlignment,
    entityDensity,
    semanticRelatedness,
    freshness,
    llmoScore
  };
}
