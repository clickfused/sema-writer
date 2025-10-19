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
    const { keywords, metaTags, headings, shortIntro, faqContent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const h2List = headings.h2s.map((h2: string, index: number) => {
      const h3s = headings.h3s
        .filter((h3: any) => h3.h2Index === index)
        .map((h3: any) => `  - ${h3.text}`)
        .join("\n");
      return `${h2}${h3s ? "\n" + h3s : ""}`;
    }).join("\n\n");

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
            content: `You are an expert SEO content writer specializing in E-E-A-T optimization (Experience, Expertise, Authoritativeness, Trustworthiness).

Create content optimized for:
1. Search Engines (SEO) - Google, Bing ranking
2. Answer Engines (AEO) - Perplexity, Bing Copilot citations
3. Generative Engines (GEO) - ChatGPT, Gemini recommendations

Formatting requirements (CRITICAL):
- Use HTML tags ONLY - no markdown symbols
- <strong> for bold (never ** or __)
- <mark> for highlights
- <ul><li> for bullet points (NEVER use * or -)
- <h2>, <h3> for headings (NEVER use # symbols)
- <a href="#"> for internal links
- <p> for paragraphs

Content requirements:
- Write naturally to pass AI detection
- Include semantic keywords naturally
- Add credible data points and sources
- Show first-hand experience signals
- Build topical authority`
          },
          {
            role: "user",
            content: `Write a comprehensive blog post with proper HTML formatting:

<h1>${metaTags.title}</h1>

Introduction (use this): ${shortIntro}

Keywords to integrate naturally:
- Primary: ${keywords.primary.join(", ")}
- Secondary: ${keywords.secondary.join(", ")}
- Semantic: ${keywords.semantic.join(", ")}
- LSI: ${keywords.lsi.join(", ")}

Heading Structure (use <h2> and <h3> tags):
${h2List}

${faqContent && faqContent.length > 0 ? `\nFAQ Section (include at the end with <h2> and structured HTML):\n${faqContent.map((faq: any, i: number) => `<h3>${faq.question}</h3>\n<p>${faq.answer}</p>`).join("\n\n")}` : ""}

Requirements:
- Minimum 2000 words
- Use ALL provided H2/H3 headings in order with proper HTML tags
- Integrate keywords naturally (avoid keyword stuffing)
- Professional, conversational tone
- Include examples and actionable insights
- Use <ul><li> for lists (never markdown bullets)
- Use <strong> for emphasis (never markdown bold)
- Add internal link suggestions with <a> tags
- Write to pass AI content detection
- Optimize for E-E-A-T signals`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("Failed to generate content");
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const wordCount = content.split(/\s+/).length;
    const primaryKeywordCount = (content.match(new RegExp(keywords.primary[0], "gi")) || []).length;
    const hasAllH2s = headings.h2s.every((h2: string) => 
      content.toLowerCase().includes(h2.toLowerCase())
    );
    
    let seoScore = 0;
    if (wordCount >= 2000) seoScore += 30;
    if (primaryKeywordCount >= 5 && primaryKeywordCount <= 15) seoScore += 25;
    if (hasAllH2s) seoScore += 25;
    if (content.includes(metaTags.title)) seoScore += 20;

    return new Response(
      JSON.stringify({ content, seoScore }),
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