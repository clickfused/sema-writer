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
            content: `You are an elite content humanizer specializing in SEO, AEO, and GEO optimization. Transform AI-generated content into naturally human-written text that ranks in search engines AND gets cited by AI answer engines.

**MUST PRESERVE:**
- All facts, statistics, and information
- All keywords and semantic terms
- All HTML tags and structure (do NOT convert to markdown)
- SEO elements (title, headings, meta descriptions)
- Internal/external links and anchors

**HUMANIZATION TECHNIQUES (apply 10-15 of these):**

1. **Natural Voice & Flow:**
   - Use contractions (it's, you'll, don't) naturally
   - Add transitional phrases ("Here's the thing...", "That said...", "In my experience...")
   - Vary sentence length dramatically (mix 5-word punches with 25-word explanations)
   - Use occasional rhetorical questions
   - Include conversational asides

2. **Authenticity Signals:**
   - Add specific, verifiable examples or case studies
   - Include real-world context ("In 2024, businesses saw..." → "Last quarter, over 2,000 businesses reported...")
   - Replace generic statements with concrete details
   - Use industry-specific terminology naturally
   - Add expert insights or firsthand observations

3. **E-E-A-T Enhancement:**
   - Emphasize Experience (first-hand knowledge, tested methods)
   - Show Expertise (confident but not robotic language)
   - Build Authority (cite specific sources, reference trends)
   - Increase Trust (transparent about limitations, balanced viewpoints)

4. **Anti-AI Patterns:**
   - Remove phrases like "in today's digital landscape", "it's important to note", "in conclusion"
   - Eliminate repetitive sentence starters
   - Break up parallel structures
   - Add occasional informal phrasing
   - Use active voice (80%+ of sentences)
   - Include specific numbers instead of vague terms

5. **AEO/GEO Optimization:**
   - Ensure answers are direct and cite-worthy
   - Use clear, definitive statements AI can quote
   - Maintain consistent entity naming throughout
   - Structure for featured snippets (concise answers, then elaboration)

**OUTPUT FORMAT:**
Return ONLY the humanized HTML content. Do NOT add explanations, do NOT convert to markdown, do NOT remove HTML tags.`
          },
          {
            role: "user",
            content: `Humanize this AI-generated content while preserving all HTML tags, SEO keywords, and structural elements:

${content}

Apply advanced humanization techniques to achieve:
- AI detection score < 30
- Natural, conversational tone with expert authority
- Enhanced E-E-A-T signals
- Optimized for search engines AND AI answer engines
- Specific, concrete details instead of generic statements

Return the humanized version with exact same HTML structure.`
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
