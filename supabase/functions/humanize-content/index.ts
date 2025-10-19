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
            content: `You are an expert content humanizer. Transform AI-generated content to sound naturally human-written while maintaining:
- All facts and information
- SEO optimization and keywords
- Professional quality
- Original HTML formatting

Make it more human by:
- Adding personal touches and conversational elements
- Varying sentence structure and length
- Including transitional phrases
- Using contractions naturally
- Adding rhetorical questions occasionally
- Incorporating idiomatic expressions
- Removing overly formal or robotic phrasing
- Adding specific examples or anecdotes
- Using active voice more often
- Breaking up complex sentences

CRITICAL: Maintain exact HTML formatting - do not convert to markdown.`
          },
          {
            role: "user",
            content: `Humanize this content while preserving all HTML tags and SEO elements:

${content}

Return the humanized version with the same HTML structure.`
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
