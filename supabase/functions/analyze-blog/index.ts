import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { url } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Fetching blog content from: ${url}`);

    // Fetch the blog content
    const blogResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlogAnalyzer/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!blogResponse.ok) {
      throw new Error(`Failed to fetch URL: ${blogResponse.status}`);
    }

    const htmlContent = await blogResponse.text();
    console.log(`Fetched ${htmlContent.length} characters of HTML`);

    // Use AI to analyze the blog structure and content
    const analysisPrompt = `You are an expert data analyst, content strategist, and NLP architect specializing in automated content-framework generation.

Analyze the following HTML blog content and extract a comprehensive, reusable framework dataset.

## ANALYSIS REQUIREMENTS:

### 1. STRUCTURAL ANALYSIS
- Document taxonomy and content hierarchy
- Heading patterns (H1-H4 usage, nesting, frequency)
- Paragraph structure (avg length, sentence count per paragraph)
- Formatting conventions (bold, italic, lists usage patterns)
- Content sections identification

### 2. SEO SIGNAL EXTRACTION
- Primary keyword identification
- Keyword frequency and placement patterns (title, headings, first paragraph, body)
- Internal linking patterns (anchor text style, link density)
- Meta patterns detected from content
- Semantic keyword clusters

### 3. LINGUISTIC PATTERNS
- Tone classification (formal/informal/conversational/technical)
- Voice (active/passive ratio estimate)
- Sentence complexity (simple/compound/complex distribution)
- Transition phrase patterns
- Opening/closing conventions

### 4. CONTENT ARCHITECTURE
- Introduction pattern (hook type, length, structure)
- Body content structure (how sections connect)
- Conclusion pattern (CTA type, summary style)
- FAQ/list integration patterns if present

### 5. GENERATED FRAMEWORK OUTPUT
Create a complete content generation framework with:
- name: A descriptive name for this style/framework
- description: 2-3 sentence summary of the content style
- formula: Weighted scoring formula representing content priorities
- system_prompt: A detailed AI system prompt (500-800 words) that can generate content in this exact style

## OUTPUT FORMAT (JSON):
{
  "analysis": {
    "structure": {
      "headingPattern": "description of H1-H4 usage",
      "paragraphAvgWords": number,
      "paragraphAvgSentences": number,
      "formattingConventions": ["list of conventions"],
      "sectionCount": number
    },
    "seo": {
      "primaryKeywords": ["list"],
      "keywordDensity": "estimated percentage",
      "keywordPlacement": ["title", "h1", "first_paragraph", etc],
      "internalLinkPattern": "description",
      "semanticClusters": ["list of topic clusters"]
    },
    "linguistics": {
      "tone": "classification",
      "voice": "active/passive ratio",
      "sentenceComplexity": "distribution description",
      "transitionPatterns": ["common transitions used"],
      "readabilityLevel": "grade level estimate"
    },
    "architecture": {
      "introPattern": "description",
      "bodyStructure": "description",
      "conclusionPattern": "description",
      "specialElements": ["FAQs", "lists", "quotes", etc]
    }
  },
  "framework": {
    "name": "Generated Framework Name",
    "description": "2-3 sentence description",
    "formula": "(Element × Weight) + (Element × Weight) formula",
    "system_prompt": "Detailed system prompt for AI content generation..."
  },
  "contentMetrics": {
    "wordCount": number,
    "headingCount": number,
    "paragraphCount": number,
    "linkCount": number,
    "listCount": number,
    "imageReferences": number
  }
}

HTML CONTENT TO ANALYZE:
${htmlContent.substring(0, 50000)}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert content analyst. Always respond with valid JSON only, no markdown code blocks or extra text.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add more credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const analysisContent = aiData.choices?.[0]?.message?.content;

    if (!analysisContent) {
      throw new Error('No analysis content received from AI');
    }

    console.log('AI analysis received, parsing...');

    // Parse the JSON response
    let parsedAnalysis;
    try {
      // Clean up potential markdown code blocks
      let cleanContent = analysisContent.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      parsedAnalysis = JSON.parse(cleanContent.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw response:', analysisContent.substring(0, 500));
      throw new Error('Failed to parse analysis results');
    }

    return new Response(JSON.stringify({
      success: true,
      sourceUrl: url,
      ...parsedAnalysis
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-blog function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Analysis failed' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
