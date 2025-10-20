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
            content: `You are a Senior SEO, AEO, and GEO Optimization Expert with 10+ years of experience.

Your task is to create blog content using the SAGE Framework that ranks across Google, Bing, ChatGPT, Perplexity, and Gemini:

S: Search Optimization (SEO)
A: Answer Optimization (AEO)
G: Generative Optimization (GEO)
E: Experience Optimization (UX)

CRITICAL FORMATTING (HTML ONLY):
- Use <strong> for bold (NEVER ** or __)
- Use <mark> for highlights
- Use <ul><li> for bullet points (NEVER * or -)
- Use <h2>, <h3> for headings (NEVER # symbols)
- Use <a href="#"> for internal links
- Use <p> for paragraphs
- NO markdown symbols allowed

SAGE FRAMEWORK REQUIREMENTS:

1️⃣ Search Optimization (SEO Layer):
- Entity-rich introduction (what, who, why)
- Natural keyword integration (primary + semantic)
- E-E-A-T principles (Experience, Expertise, Authority, Trust)
- Internal + external links with descriptive anchors
- Structured for featured snippets

2️⃣ Answer Optimization (AEO Layer):
- Question-based H2/H3 headings ("What is...", "How does...")
- 2-3 line direct factual answers after each question
- Short, scannable paragraphs (≤120 words)
- Citations and data points
- FAQ-ready structure

3️⃣ Generative Optimization (GEO Layer):
- Entity consistency (exact phrasing throughout)
- Self-contained paragraphs (no dependency on previous sections)
- Natural query tone in subheadings
- Clear, cite-worthy statements AI can quote
- Recap summary with key takeaways

4️⃣ Experience Optimization (UX Layer):
- Active voice (80%+ of sentences)
- Grade-8 readability
- Lists, bold highlights for scannability
- Actionable insights and examples
- Strong CTA conclusion

HUMANIZATION TACTICS (apply 10-15):
- Use contractions naturally (it's, you'll, don't)
- Vary sentence length (5-25 words)
- Add transitional phrases ("Here's the thing...", "That said...")
- Include specific, verifiable examples
- Remove AI phrases like "in today's digital landscape"
- Use industry-specific terminology naturally
- Add expert insights or observations
- Break up parallel structures
- Include concrete numbers instead of vague terms`
          },
          {
            role: "user",
            content: `Create a SAGE Framework-optimized blog post using HTML formatting:

TOPIC: ${metaTags.title}
AUDIENCE: Professional readers seeking expert guidance

INTRODUCTION (expand on this): ${shortIntro}

KEYWORDS (integrate naturally, density 1-2%):
Primary: ${keywords.primary.join(", ")}
Secondary: ${keywords.secondary.join(", ")}
Semantic: ${keywords.semantic.join(", ")}
LSI: ${keywords.lsi.join(", ")}

HEADING STRUCTURE (use <h2> and <h3> tags):
${h2List}

${faqContent && faqContent.length > 0 ? `\nFAQ SECTION (add at end with proper HTML):\n${faqContent.map((faq: any, i: number) => `<h3>${faq.question}</h3>\n<p>${faq.answer}</p>`).join("\n\n")}` : ""}

REQUIREMENTS:
✅ Minimum 2500 words
✅ Start with TL;DR summary (2-3 lines in <p> with <strong>TL;DR:</strong>)
✅ Entity-rich intro with clear context
✅ Use ALL H2/H3 headings as questions where possible
✅ Provide 2-3 line factual answers after each H2
✅ Integrate keywords naturally (no stuffing)
✅ Add 3-5 internal link suggestions with <a href="#">anchor text</a>
✅ Include data points, statistics, examples
✅ Use <ul><li> for lists (NEVER markdown)
✅ Use <strong> for emphasis (NEVER **)
✅ Short paragraphs (≤120 words each)
✅ Active voice, conversational tone
✅ End with Recap Summary section (<h2>Key Takeaways</h2> + bullet points)
✅ Write to achieve AI detection score < 30
✅ Optimize for E-E-A-T signals (experience, expertise, authority, trust)
✅ Self-contained paragraphs for LLM retrieval`
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