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
    const { keywords, metaTags, content } = await req.json();
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
            role: "user",
            content: `Based on this blog content about "${metaTags.title}", suggest 8 relevant links (4 internal and 4 external) with anchor text.

Content preview: ${content.substring(0, 1000)}...

Primary keywords: ${keywords.primary.join(", ")}

Return ONLY a JSON array with this structure:
[
  {
    "anchor": "descriptive anchor text",
    "url": "https://example.com/relevant-page",
    "type": "internal" or "external"
  }
]

For internal links, suggest relevant topic URLs (use placeholder URLs like /blog/related-topic).
For external links, suggest authoritative sources related to the topic.`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to generate link suggestions");
    }

    const data = await response.json();
    let content_text = data.choices[0].message.content;
    
    // Remove markdown code blocks if present
    content_text = content_text.trim();
    if (content_text.startsWith('```json')) {
      content_text = content_text.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (content_text.startsWith('```')) {
      content_text = content_text.replace(/```\n?/g, '');
    }
    content_text = content_text.trim();
    
    // Parse the JSON array from the response
    const links = JSON.parse(content_text);

    return new Response(
      JSON.stringify({ links }),
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
