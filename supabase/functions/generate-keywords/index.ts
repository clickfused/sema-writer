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
    const { primaryKeywords, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

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
    
    // Remove markdown code blocks if present
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/```\n?/g, '');
    }
    content = content.trim();
    
    // Parse the JSON array from the response
    const keywords = JSON.parse(content);

    return new Response(
      JSON.stringify({ keywords }),
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
