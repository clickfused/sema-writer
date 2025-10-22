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
    const { primaryKeywords, type, topic, audience, searchIntent } = await req.json();
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
      
      // Remove markdown code blocks if present
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

    // K.I.D Framework™ - Full keyword intelligence generation
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
            content: `You are a keyword strategy expert specializing in SEO, AEO, and GEO optimization.

Your task is to create a complete keyword framework using the K.I.D Framework™:

**K.I.D Framework™ = Keyword Intelligence Design**

Layer Structure:
1. Core Layer (Primary) - Main intent topic that defines the content
2. Context Layer (Secondary) - Supporting keywords that expand coverage
3. Meaning Layer (Semantic) - Contextual keywords adding meaning, entities, and NLP relationships
4. Relevance Layer (LSI) - Latent Semantic Indexing keywords (synonyms and conceptually related terms)
5. Intent Layer (Conversational) - Query-based keywords aligned with user/LLM prompts

**Keyword Distribution:**
- Primary Keywords: 1-3 main focus keywords
- Secondary Keywords: 8-12 supporting/expansion keywords
- Semantic Keywords: 8-10 NLP/Entity-based keywords
- LSI Keywords: 8-10 conceptually related or synonym terms
- Conversational Keywords: 5-8 natural query-style keywords (questions)

**Keyword Clusters:**
Organize keywords into 3 thematic clusters:
- Cluster 1: Intent/Topic Group
- Cluster 2: Feature/Benefit Group
- Cluster 3: Use Case Group

Return a structured JSON object with all keyword layers.`
          },
          {
            role: "user",
            content: `Generate a complete K.I.D Framework™ keyword matrix:

Topic: ${topic || primaryKeywords.join(", ")}
Primary Keyword: ${primaryKeywords[0]}
Target Audience: ${audience || "general professional readers"}
Search Intent: ${searchIntent || "Informational"}

Return ONLY a JSON object in this exact format:
{
  "primary": ["keyword1", "keyword2"],
  "secondary": ["keyword1", "keyword2", ...],
  "semantic": ["keyword1", "keyword2", ...],
  "lsi": ["keyword1", "keyword2", ...],
  "conversational": ["What is...", "How to...", ...],
  "clusters": {
    "intent": ["keyword1", "keyword2", ...],
    "features": ["keyword1", "keyword2", ...],
    "useCases": ["keyword1", "keyword2", ...]
  },
  "optimization": {
    "density": "1-1.5%",
    "primaryPlacement": "H1, first 100 words, meta title/description, one subheading",
    "secondaryPlacement": "H2/H3 headings, body paragraphs, internal links",
    "semanticPlacement": "Factual paragraphs, explanations, examples, AEO sections",
    "lsiPlacement": "Image ALT tags, meta description, FAQ, TL;DR",
    "conversationalPlacement": "FAQ section, H2/H3 as questions, meta Q&A"
  }
}`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to generate K.I.D Framework keywords");
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
    
    const keywordMatrix = JSON.parse(content);

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
