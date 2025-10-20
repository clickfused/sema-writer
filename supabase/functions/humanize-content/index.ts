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
    const { content } = await req.json();
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
Your task is to humanize AI-generated text using the HUMAIZE Framework™ so it:
- Feels authentic, emotional, and conversational
- Maintains factual accuracy and SEO entities
- Is optimized for retrieval by ChatGPT, Perplexity, Gemini, and Google
- Keeps clear intent alignment and natural flow

🧩 HUMAIZE Formula:
H = Human Tone + Storytelling
U = Unique POV + Emotion
M = Meaningful Context (Entity + EEAT)
A = Active Voice + Simplicity
I = Intent Alignment (Search + Conversational)
Z = Zest (Voice, Rhythm, and Flow)
E = Engagement Triggers (CTA, Empathy, Relatability)

🧩 Transformation Rules:

H → Human Tone + Storytelling
- Replace robotic phrasing with conversational transitions ("Let's explore...", "Here's the catch…")
- Add natural pauses or empathy markers ("Honestly," "Imagine this," "Think of it like…")
- Use real-life metaphors and analogies
✅ Example: "Think of AI tools as your 24/7 teammate who never gets tired"

U → Unique POV + Emotion
- Add first/second-person POV ("you", "we", "our")
- Sprinkle emotional connectors ("exciting", "frustrating", "powerful")
- Show perspective instead of just data
✅ Example: "We've all been buried under repetitive tasks — that's exactly where automation feels like magic"

M → Meaningful Context (Entity + EEAT)
- Keep key entities and stats (important for ranking)
- Add authority references when relevant
- Reinforce brand trust with experience signals

A → Active Voice + Simplicity
- Cut filler and passive verbs
- Break long sentences into 2–3 short ones
- Keep grade-8 readability

I → Intent Alignment
- "What is…" → Clear, factual answer
- "How to…" → Step-by-step
- "Why…" → Insight-driven explanation
- "Which…" → Comparative tone

Z → Zest
- Add micro-emotion (curiosity, surprise, relief)
- Use rhythm (short + medium + long sentences)
- Keep flow conversational yet insightful

E → Engagement Triggers
- Use calls to action
- Add "you" language
- Pose reflective questions

CRITICAL FORMATTING RULES:
- Preserve ALL HTML tags (<h2>, <h3>, <p>, <strong>, <mark>, <ul>, <li>, <a>)
- NEVER use markdown symbols (**, *, #, -, etc.)
- Keep all links and structure intact
- Maintain keyword placement
- Preserve all factual content and statistics

OUTPUT FORMAT:
Return ONLY the humanized HTML content. Do NOT add explanations, do NOT convert to markdown, do NOT remove HTML tags.`
          },
          {
            role: "user",
            content: `Humanize this content using the HUMAIZE Framework™:

${content}

REQUIREMENTS:
✅ Apply all HUMAIZE transformation rules (H, U, M, A, I, Z, E)
✅ Make it feel authentic, emotional, and conversational
✅ Maintain ALL facts, statistics, and entities
✅ Keep ALL HTML formatting (<h2>, <h3>, <p>, <strong>, <mark>, <ul>, <li>, <a>)
✅ NEVER use markdown symbols (**, *, #, -, etc.)
✅ Preserve all keywords and SEO entities
✅ Target AI detection score < 30
✅ Enhance EEAT signals naturally
✅ Add conversational transitions and empathy markers
✅ Use active voice and varied sentence rhythm
✅ Include engagement triggers (questions, CTAs, "you" language)
✅ Keep grade-8 readability

Return ONLY the humanized HTML content without any explanations or notes.`
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
