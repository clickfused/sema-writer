import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keyword, numberOfResults = 5 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!keyword) {
      throw new Error("Keyword is required for competitor analysis");
    }

    console.log(`Analyzing competitors for keyword: "${keyword}"`);

    // Use AI to analyze what top-ranking content typically includes
    const analysisPrompt = `You are an SEO expert analyzing top-ranking content for the search query: "${keyword}"

Based on your knowledge of what typically ranks well for this type of query, provide a detailed competitor analysis report. Include:

1. **Content Structure Analysis**
   - Typical word count range for top articles
   - Common heading structure (H1, H2, H3 patterns)
   - Recommended sections to include

2. **Keyword Usage Patterns**
   - Primary keyword placement recommendations
   - Related keywords commonly used
   - LSI (Latent Semantic Indexing) terms to include

3. **Content Elements**
   - Common content formats (lists, tables, images, videos)
   - FAQ sections - common questions answered
   - Call-to-action patterns

4. **SEO Factors**
   - Meta title patterns that work well
   - Meta description strategies
   - Internal/external linking recommendations

5. **Content Gaps & Opportunities**
   - Topics competitors might miss
   - Unique angles to differentiate
   - User intent signals to address

6. **Recommended Outline**
   - Suggested H1 title
   - Suggested H2 sections (5-7 sections)
   - Key points to cover in each section

Provide actionable, specific recommendations that will help create content that outranks existing articles.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert SEO analyst with deep knowledge of content marketing and search engine optimization. Provide detailed, actionable competitor analysis."
          },
          { role: "user", content: analysisPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Competitor analysis error:", response.status, errorText);
      if (response.status === 429) {
        throw new Error("Rate limits exceeded, please try again later.");
      }
      if (response.status === 402) {
        throw new Error("Payment required, please add funds to your Lovable AI workspace.");
      }
      throw new Error(`Analysis failed: ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content || "";

    // Parse analysis into structured data
    const structuredAnalysis = {
      keyword,
      analysis,
      recommendations: {
        wordCountRange: extractRecommendation(analysis, "word count"),
        headingStructure: extractHeadings(analysis),
        suggestedSections: extractSections(analysis),
        keyTopics: extractTopics(analysis),
        contentGaps: extractGaps(analysis),
      },
      generatedAt: new Date().toISOString(),
    };

    console.log("Competitor analysis completed successfully");

    return new Response(JSON.stringify({ success: true, data: structuredAnalysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error("Error analyzing competitors:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function extractRecommendation(text: string, type: string): string {
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.toLowerCase().includes(type)) {
      return line.replace(/[*#-]/g, '').trim();
    }
  }
  return "";
}

function extractHeadings(text: string): string[] {
  const headings: string[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.includes('H1') || line.includes('H2') || line.includes('H3')) {
      headings.push(line.replace(/[*#-]/g, '').trim());
    }
  }
  return headings.slice(0, 10);
}

function extractSections(text: string): string[] {
  const sections: string[] = [];
  const sectionRegex = /(?:section|topic|chapter|part)[\s:]+([^\n]+)/gi;
  let match;
  while ((match = sectionRegex.exec(text)) !== null) {
    sections.push(match[1].trim());
  }
  return sections.slice(0, 10);
}

function extractTopics(text: string): string[] {
  const topics: string[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.match(/^\s*[-•*]\s+/)) {
      const topic = line.replace(/^\s*[-•*]\s+/, '').trim();
      if (topic.length > 5 && topic.length < 100) {
        topics.push(topic);
      }
    }
  }
  return topics.slice(0, 15);
}

function extractGaps(text: string): string[] {
  const gaps: string[] = [];
  const gapSection = text.toLowerCase().indexOf('gap');
  if (gapSection !== -1) {
    const gapText = text.substring(gapSection, gapSection + 500);
    const lines = gapText.split('\n');
    for (const line of lines) {
      if (line.match(/[-•*]/)) {
        gaps.push(line.replace(/[*#-•]/g, '').trim());
      }
    }
  }
  return gaps.filter(g => g.length > 10).slice(0, 5);
}
