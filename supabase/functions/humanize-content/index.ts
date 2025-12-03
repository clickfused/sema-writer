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
    const { content, targetHumanization = 80 } = await req.json();
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
            content: `You are an SEO, AEO & GEO content strategist with 10+ years of experience.
Your task is to humanize AI-generated text to achieve ${targetHumanization}% human-like quality (max 80%).

🎯 TARGET: ${targetHumanization}% humanization (NOT 100% - keep some structure for SEO)

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

⚠️ CRITICAL RULES:
- Target ${targetHumanization}% humanization, NOT 100%
- Preserve ALL HTML tags (<h2>, <h3>, <p>, <strong>, <mark>, <ul>, <li>, <a>)
- NEVER use markdown symbols (**, *, #, -, etc.)
- Keep all links and structure intact
- Maintain keyword placement for SEO
- Preserve all factual content and statistics
- Keep SEO-optimized structure (headings, lists)

OUTPUT: Return ONLY the humanized HTML content.`
          },
          {
            role: "user",
            content: `Humanize this content to ${targetHumanization}% human-like quality:

${content}

REQUIREMENTS:
✅ Apply HUMAIZE framework at ${targetHumanization}% intensity (max 80%)
✅ Make it feel authentic and conversational
✅ Maintain ALL facts, statistics, and entities
✅ Keep ALL HTML formatting
✅ NEVER use markdown symbols
✅ Preserve keywords and SEO structure
✅ Target AI detection score: ${100 - targetHumanization}/100
✅ Keep grade-8 readability
✅ Balance human feel with SEO optimization

Return ONLY the humanized HTML content without explanations.`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to humanize content");
    }

    const data = await response.json();
    const humanizedContent = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ humanizedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error humanizing content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
