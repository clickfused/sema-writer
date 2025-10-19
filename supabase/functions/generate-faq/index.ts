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
    const { keywords, metaTags } = await req.json();
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
            content: `You are an SEO expert specializing in Answer Engine Optimization (AEO) and FAQ schema.

Create FAQ content optimized for:
- Answer Engine citations (Perplexity, Bing Copilot)
- Google Featured Snippets
- Voice search (Alexa, Siri, Google Assistant)
- E-E-A-T authority signals

Requirements:
- Direct, concise answers (40-60 words)
- Natural language matching search intent
- Include semantic keywords naturally
- Write to pass AI content detection
- Add credibility and expertise signals`
          },
          {
            role: "user",
            content: `Generate 5-7 FAQs optimized for Answer Engines about:

Title: ${metaTags.title}
Description: ${metaTags.description}

Keywords:
- Primary: ${keywords.primary.join(", ")}
- Secondary: ${keywords.secondary.join(", ")}
- Semantic: ${keywords.semantic.join(", ")}

Requirements:
- Questions should match natural search queries
- Answers: 40-60 words (concise for featured snippets)
- Include keywords naturally (avoid stuffing)
- Optimize for voice search patterns
- Show expertise and authority
- Write naturally to pass AI detection`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_faqs",
              description: "Generate FAQ content for blog post",
              parameters: {
                type: "object",
                properties: {
                  faqs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" }
                      },
                      required: ["question", "answer"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["faqs"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_faqs" } }
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to generate FAQs");
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    const faqs = JSON.parse(toolCall.function.arguments).faqs;

    return new Response(
      JSON.stringify({ faqs }),
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
