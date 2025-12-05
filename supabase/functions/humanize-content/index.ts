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
      content, 
      targetHumanization = 80,
      optimizeType = 'humanize', // 'humanize' | 'readability' | 'ai' | 'keywords' | 'all'
      keywords = {},
      targetKeywordDensity = 1.5
    } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build optimization instructions based on type
    let optimizationInstructions = "";
    
    if (optimizeType === 'readability' || optimizeType === 'all') {
      optimizationInstructions += `
📖 READABILITY OPTIMIZATION:
- Target Flesch Reading Ease: 60-70 (standard web content)
- Break long sentences (>25 words) into shorter ones
- Split long paragraphs (>35 words) into smaller chunks of 20-30 words
- Use simple, common words instead of complex vocabulary
- Add transition phrases between paragraphs
- Ensure 2-3 sentences per paragraph maximum
- Use active voice throughout
`;
    }

    if (optimizeType === 'ai' || optimizeType === 'all') {
      optimizationInstructions += `
🤖 AI DETECTION REDUCTION:
- Remove AI-typical phrases: "in today's world", "it's important to note", "let's dive in", "furthermore", "moreover"
- Add contractions naturally: "it's", "don't", "won't", "can't", "you're", "they're"
- Vary sentence length dramatically (mix 5-word and 20-word sentences)
- Use different sentence starters (avoid repetitive patterns)
- Add colloquialisms and conversational phrases
- Include occasional rhetorical questions
- Add personal perspective markers: "honestly", "frankly", "in my experience"
- Use first person ("I", "we") and second person ("you") naturally
`;
    }

    if (optimizeType === 'keywords' || optimizeType === 'all') {
      const allKeywords = [
        ...(keywords.primary || []),
        ...(keywords.secondary || []),
        ...(keywords.semantic || []),
        ...(keywords.lsi || [])
      ];
      optimizationInstructions += `
🎯 KEYWORD OPTIMIZATION:
- Target keyword density: ${targetKeywordDensity}% (1.0-1.8% optimal)
- Keywords to integrate: ${allKeywords.join(', ')}
- If density is too low: Add keywords naturally in context
- If density is too high: Replace some instances with synonyms or rephrase
- Ensure primary keywords appear in first 100 words
- Use keyword variations and related terms
`;
    }

    if (optimizeType === 'humanize' || !optimizationInstructions) {
      optimizationInstructions = `
🧩 HUMAIZE Framework™ (Balanced Application):

H = Human Tone + Storytelling (apply moderately)
- Add conversational transitions ("Let's explore...", "Here's the thing…")
- Use empathy markers sparingly ("Honestly," "Imagine this")
- Include real-life metaphors where natural

U = Unique POV + Emotion (apply moderately)
- Add first/second-person POV ("you", "we")
- Sprinkle emotional connectors naturally
- Show perspective alongside data

M = Meaningful Context (preserve fully)
- KEEP all entities, stats, facts
- Maintain authority references
- Preserve brand mentions and keywords

A = Active Voice + Simplicity (apply fully)
- Cut filler and passive verbs
- Keep sentences 10-25 words
- Grade-8 readability

I = Intent Alignment (preserve)
- Maintain search intent optimization
- Keep answer structure for featured snippets

Z = Zest (apply moderately)
- Add micro-emotions (curiosity, surprise)
- Vary sentence rhythm
- Keep conversational yet professional

E = Engagement Triggers (apply moderately)
- Use "you" language
- Occasional rhetorical questions
- Subtle CTAs
`;
    }

    const systemPrompt = `You are an expert content optimizer specializing in SEO, readability, and humanization.
Your task is to optimize the provided content based on specific requirements.

${optimizationInstructions}

⚠️ CRITICAL RULES:
- Target ${targetHumanization}% humanization, NOT 100%
- Preserve ALL HTML tags (<h2>, <h3>, <p>, <strong>, <mark>, <ul>, <li>, <a>)
- NEVER use markdown symbols (**, *, #, -, etc.)
- Keep all links and structure intact
- Maintain keyword placement for SEO
- Preserve all factual content and statistics
- Keep SEO-optimized structure (headings, lists)
- DO NOT change the core message or remove important information

OUTPUT: Return ONLY the optimized HTML content.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Optimize this content for ${optimizeType === 'all' ? 'readability, AI detection, and keywords' : optimizeType}:

${content}

REQUIREMENTS:
✅ Apply the specified optimizations
✅ Maintain ALL facts, statistics, and entities
✅ Keep ALL HTML formatting
✅ NEVER use markdown symbols
✅ Preserve overall structure and message
✅ Keep grade-8 readability

Return ONLY the optimized HTML content without explanations.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to optimize content");
    }

    const data = await response.json();
    const humanizedContent = data.choices[0].message.content;

    console.log(`Content optimized successfully. Type: ${optimizeType}`);

    return new Response(
      JSON.stringify({ humanizedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error optimizing content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
