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

    // Check for grammar, spelling, AI detection, and suggest humanization
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
            content: `You are an expert content quality analyzer specializing in SEO, AEO (Answer Engine Optimization), and GEO (Generative Engine Optimization).

Analyze content for:
1. **Grammar & Spelling**: Identify errors that hurt credibility and search rankings
2. **AI Detection Score**: How AI-generated the content appears (0-100, where 100 = obviously AI-written, 0 = naturally human)
3. **SEO/AEO/GEO Readiness**: E-E-A-T signals, answer clarity, entity consistency
4. **Humanization Needs**: Specific suggestions to make content sound more authentic and trustworthy

Focus on detecting:
- Repetitive phrasing patterns typical of AI
- Overly formal or robotic sentence structures
- Lack of personal voice, anecdotes, or specific examples
- Missing transitional phrases and natural flow
- Generic statements without depth or nuance

Return structured, actionable analysis.`
          },
          {
            role: "user",
            content: `Analyze this content for quality, grammar, spelling, AI detection, and SEO/AEO/GEO optimization:

${content}

Provide comprehensive analysis in this JSON format:
{
  "grammarScore": 0-100 (quality of grammar),
  "spellingIssues": ["specific issue 1", "specific issue 2"] (max 10 most critical),
  "aiDetectionScore": 0-100 (0 = very human, 100 = obviously AI-generated),
  "humanizationSuggestions": [
    "Add personal anecdotes or real-world examples",
    "Vary sentence structure more naturally",
    "Include conversational transitions",
    "Specific suggestion 4"
  ] (max 10 actionable suggestions),
  "overallQuality": 0-100 (combined score considering grammar, originality, E-E-A-T signals, and optimization)
}`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_content_quality",
              description: "Analyze content quality metrics",
              parameters: {
                type: "object",
                properties: {
                  grammarScore: {
                    type: "number",
                    description: "Grammar quality score 0-100"
                  },
                  spellingIssues: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of spelling/grammar issues found"
                  },
                  aiDetectionScore: {
                    type: "number",
                    description: "How AI-like the content is (0-100, higher = more AI-like)"
                  },
                  humanizationSuggestions: {
                    type: "array",
                    items: { type: "string" },
                    description: "Suggestions to make content more human-like"
                  },
                  overallQuality: {
                    type: "number",
                    description: "Overall content quality score 0-100"
                  }
                },
                required: ["grammarScore", "spellingIssues", "aiDetectionScore", "humanizationSuggestions", "overallQuality"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "analyze_content_quality" } }
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to analyze content quality");
    }

    const data = await response.json();
    const toolCall = data.choices[0].message.tool_calls?.[0];
    const analysis = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing content:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
