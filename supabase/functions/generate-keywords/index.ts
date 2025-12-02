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
    const { primaryKeywords, type, topic, audience, searchIntent, contextContent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // If type is specified, use legacy single-type generation
    if (type) {
      const typeDescriptions = {
        secondary: "supporting keywords that expand on the primary keywords",
        semantic: "contextually relevant terms that are semantically related to the topic",
        lsi: "Latent Semantic Indexing keywords - terms that search engines associate with the topic"
      };

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
              role: "user",
              content: `Generate exactly 8 ${type} keywords for the following primary keywords: ${primaryKeywords.join(", ")}

${type === "secondary" ? "Secondary keywords should be supporting keywords that expand on the primary keywords." : ""}
${type === "semantic" ? "Semantic keywords should be contextually relevant terms." : ""}
${type === "lsi" ? "LSI keywords should be terms that search engines associate with this topic." : ""}

Return ONLY a JSON array of 8 keyword strings, nothing else. Example: ["keyword1", "keyword2", ...]`
            }
          ],
        }),
      });

      if (!response.ok) {
        console.error("AI gateway error:", response.status);
        throw new Error("Failed to generate keywords");
      }

      const data = await response.json();
      let content = data.choices[0].message.content;
      
      content = content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/```\n?/g, '');
      }
      content = content.trim();
      
      const keywords = JSON.parse(content);

      return new Response(
        JSON.stringify({ keywords }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enhanced K.I.D Framework™ with User Intent Analysis
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
            content: `You are an elite keyword strategist specializing in SEO, AEO, GEO, and LLMO optimization.

Your task is to create a complete keyword framework using the Enhanced K.I.D Framework™ with User Intent Analysis:

**K.I.D Framework™ = Keyword Intelligence Design + User Intent**

## USER INTENT ANALYSIS (MANDATORY)
Before generating keywords, analyze and classify the user's search intent:

**Intent Types:**
1. **Informational** - User wants to learn (What, Why, How, Guide, Tutorial)
2. **Navigational** - User wants to find a specific page/site
3. **Transactional** - User wants to buy/sign up (Buy, Price, Discount, Free)
4. **Commercial Investigation** - User comparing options (Best, vs, Review, Top 10)

**Intent Signals to Detect:**
- Question modifiers (what, how, why, when, where)
- Action words (buy, download, sign up, get, hire)
- Comparison words (best, vs, alternative, compare, review)
- Location modifiers (near me, in [city], local)

## KEYWORD LAYERS

Layer Structure:
1. **Core Layer (Primary)** - Main intent topic that defines the content
2. **Context Layer (Secondary)** - Supporting keywords that expand coverage (12-15 keywords)
3. **Meaning Layer (Semantic)** - Contextual keywords adding meaning, entities, NLP relationships (10-12 keywords)
4. **Relevance Layer (LSI)** - Latent Semantic Indexing keywords, synonyms, conceptually related (10-12 keywords)
5. **Intent Layer (Conversational)** - Query-based keywords aligned with user/LLM prompts (8-10 keywords)
6. **Related Keywords** - Trending, competitor, and alternative keywords (8-10 keywords)
7. **Long-tail Keywords** - Specific 4-6 word phrases with lower competition (8-10 keywords)
8. **Auto-Suggestions** - Google/Bing autocomplete style suggestions (10-15 keywords)

## SEO & LLMO OPTIMIZATION
- Include keywords optimized for Google Featured Snippets
- Include keywords for ChatGPT/Gemini/Perplexity retrieval
- Include entity-based keywords for Knowledge Graph
- Include question-based keywords for PAA (People Also Ask)

Return comprehensive keyword intelligence with user intent analysis.`
          },
          {
            role: "user",
            content: `Generate Enhanced K.I.D Framework™ keyword matrix with User Intent Analysis:

Topic: ${topic || primaryKeywords.join(", ")}
Primary Keyword: ${primaryKeywords[0]}
Target Audience: ${audience || "general professional readers"}
Search Intent: ${searchIntent || "Auto-detect from topic"}
${contextContent ? `\nContext Document (use for keyword extraction):\n${contextContent.substring(0, 3000)}` : ''}

**ANALYZE USER INTENT FIRST**, then generate keywords aligned with that intent.

Return ONLY a JSON object in this exact format:
{
  "userIntent": {
    "primaryIntent": "Informational|Navigational|Transactional|Commercial",
    "intentSignals": ["signal1", "signal2"],
    "searcherGoal": "What the user ultimately wants to achieve",
    "contentAngle": "Recommended content approach based on intent"
  },
  "primary": ["keyword1", "keyword2", "keyword3"],
  "secondary": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10", "keyword11", "keyword12"],
  "semantic": ["entity1", "concept1", "nlp_term1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10"],
  "lsi": ["synonym1", "related1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8", "keyword9", "keyword10"],
  "conversational": ["What is...", "How to...", "Why does...", "When should...", "Where can...", "Can I...", "Is it...", "Does..."],
  "related": ["trending_keyword1", "competitor_keyword1", "alternative1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
  "longTail": ["specific 4-5 word phrase 1", "specific phrase 2", "phrase 3", "phrase 4", "phrase 5", "phrase 6", "phrase 7", "phrase 8"],
  "autoSuggestions": ["topic + suggestion1", "topic + suggestion2", "how to topic", "best topic for", "topic vs", "topic examples", "topic guide", "topic tutorial", "topic benefits", "topic tips", "topic 2025", "topic for beginners", "topic strategy"],
  "clusters": {
    "intent": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "features": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "useCases": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "benefits": ["keyword1", "keyword2", "keyword3", "keyword4"]
  },
  "optimization": {
    "density": "1-1.5%",
    "primaryPlacement": "H1, first 100 words, meta title/description, one subheading",
    "secondaryPlacement": "H2/H3 headings, body paragraphs, internal links",
    "semanticPlacement": "Factual paragraphs, explanations, examples, AEO sections",
    "lsiPlacement": "Image ALT tags, meta description, FAQ, TL;DR",
    "conversationalPlacement": "FAQ section, H2/H3 as questions, meta Q&A",
    "llmoOptimization": "Use in cite-worthy statements, definitions, structured answers"
  }
}`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate K.I.D Framework keywords");
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/g, '');
    }
    content = content.trim();
    
    const keywordMatrix = JSON.parse(content);

    console.log("Generated keyword matrix with user intent:", {
      userIntent: keywordMatrix.userIntent,
      primaryCount: keywordMatrix.primary?.length,
      secondaryCount: keywordMatrix.secondary?.length,
      autoSuggestionsCount: keywordMatrix.autoSuggestions?.length,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify(keywordMatrix),
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
