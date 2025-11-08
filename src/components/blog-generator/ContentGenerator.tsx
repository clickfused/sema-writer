import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, Save, FileText, CheckCircle2, Wand2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { RichTextEditor } from "@/components/RichTextEditor";

interface ContentGeneratorProps {
  userId: string;
  keywords: {
    primary: string[];
    secondary: string[];
    semantic: string[];
    lsi: string[];
  };
  metaTags: {
    title: string;
    description: string;
    slug: string;
  };
  headings: {
    h1: string;
    h2s: string[];
    h3s: Array<{ h2Index: number; text: string }>;
  };
  faqContent: Array<{ question: string; answer: string }>;
  shortIntro: string;
  setShortIntro: (intro: string) => void;
  fullContent: string;
  setFullContent: (content: string) => void;
  onNext: () => void;
}

export function ContentGenerator({
  userId,
  keywords,
  metaTags,
  headings,
  faqContent,
  shortIntro,
  setShortIntro,
  fullContent,
  setFullContent,
  onNext,
}: ContentGeneratorProps) {
  const navigate = useNavigate();
  const [seoScore, setSeoScore] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [qualityMetrics, setQualityMetrics] = useState<{
    grammarScore: number;
    aiDetectionScore: number;
    overallQuality: number;
    spellingIssues: string[];
    humanizationSuggestions: string[];
  } | null>(null);
  const [checkingQuality, setCheckingQuality] = useState(false);
  const [humanizing, setHumanizing] = useState(false);
  
  const [framework, setFramework] = useState('HYBRID');
  const [location, setLocation] = useState('Chennai');
  const [brandName, setBrandName] = useState('');
  const [targetWordCount, setTargetWordCount] = useState(1500);
  const [keywordDensity, setKeywordDensity] = useState(1.5);
  const [includeCtaTypes, setIncludeCtaTypes] = useState(['course', 'alsoRead', 'related']);

  const generateShortIntro = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-intro", {
        body: { keywords, metaTags },
      });

      if (error) throw error;
      setShortIntro(data.intro);

      toast({
        title: "Success",
        description: "Short intro generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateFullContent = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { 
          keywords, 
          metaTags, 
          headings, 
          shortIntro, 
          faqContent: [],
          framework,
          location,
          brandName,
          targetWordCount,
          keywordDensity,
          includeCtaTypes
        },
      });

      if (error) throw error;
      
      setFullContent(data.content);
      setSeoScore(data.seoScore);

      // Automatically check content quality after generation
      await checkContentQuality(data.content);

      toast({
        title: "Success",
        description: "Full blog post generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const checkContentQuality = async (contentToCheck?: string) => {
    const content = contentToCheck || fullContent;
    if (!content) {
      toast({
        title: "Error",
        description: "No content to check",
        variant: "destructive",
      });
      return;
    }

    setCheckingQuality(true);
    try {
      const { data, error } = await supabase.functions.invoke("check-content-quality", {
        body: { content },
      });

      if (error) throw error;

      setQualityMetrics(data);

      toast({
        title: "Quality Check Complete",
        description: `Grammar: ${data.grammarScore}/100, AI Detection: ${data.aiDetectionScore}/100`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCheckingQuality(false);
    }
  };

  const humanizeContent = async () => {
    if (!fullContent) {
      toast({
        title: "Error",
        description: "No content to humanize",
        variant: "destructive",
      });
      return;
    }

    setHumanizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("humanize-content", {
        body: { content: fullContent },
      });

      if (error) throw error;

      setFullContent(data.humanizedContent);

      // Re-check quality after humanization
      await checkContentQuality(data.humanizedContent);

      toast({
        title: "Success",
        description: "Content humanized successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setHumanizing(false);
    }
  };

  const saveBlogPost = async () => {
    setSaving(true);
    try {
      const wordCount = fullContent.split(/\s+/).length;

      const { data: blogPost, error: blogError } = await supabase
        .from("blog_posts")
        .insert({
          user_id: userId,
          title: metaTags.title,
          meta_title: metaTags.title,
          meta_description: metaTags.description,
          url_slug: metaTags.slug,
          h1_title: headings.h1,
          short_intro: shortIntro,
          content: fullContent,
          faq_content: JSON.stringify(faqContent),
          word_count: wordCount,
          seo_score: seoScore,
          status: "draft",
        })
        .select()
        .single();

      if (blogError) throw blogError;

      const allKeywords = [
        ...keywords.primary.map((k) => ({ keyword_type: "primary", keyword_text: k })),
        ...keywords.secondary.map((k) => ({ keyword_type: "secondary", keyword_text: k })),
        ...keywords.semantic.map((k) => ({ keyword_type: "semantic", keyword_text: k })),
        ...keywords.lsi.map((k) => ({ keyword_type: "lsi", keyword_text: k })),
      ];

      const { error: keywordsError } = await supabase
        .from("keywords")
        .insert(
          allKeywords.map((k) => ({
            blog_post_id: blogPost.id,
            ...k,
          }))
        );

      if (keywordsError) throw keywordsError;

      const allHeadings = [
        { heading_level: "h1", heading_text: headings.h1, order_index: 0 },
        ...headings.h2s.map((h2, index) => ({
          heading_level: "h2",
          heading_text: h2,
          order_index: index + 1,
        })),
      ];

      const { error: headingsError } = await supabase
        .from("headings")
        .insert(
          allHeadings.map((h) => ({
            blog_post_id: blogPost.id,
            ...h,
          }))
        );

      if (headingsError) throw headingsError;

      toast({
        title: "Success",
        description: "Blog post saved successfully",
      });

      navigate("/my-blogs");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const exportContent = () => {
    const faqSection = faqContent.length > 0
      ? `\n\n## Frequently Asked Questions\n\n${faqContent
          .map((faq, i) => `### ${i + 1}. ${faq.question}\n\n${faq.answer}`)
          .join("\n\n")}`
      : "";

    const markdown = `# ${metaTags.title}\n\n**Meta Description:** ${metaTags.description}\n\n**URL Slug:** ${metaTags.slug}\n\n## Short Intro\n\n${shortIntro}\n\n## Full Content\n\n${fullContent}${faqSection}`;
    
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metaTags.slug || "blog-post"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Content exported successfully",
    });
  };

  const exportToDocx = async () => {
    const children: Paragraph[] = [
      new Paragraph({
        text: metaTags.title,
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Meta Description: ", bold: true }),
          new TextRun(metaTags.description),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "URL Slug: ", bold: true }),
          new TextRun(metaTags.slug),
        ],
      }),
      new Paragraph(""),
      new Paragraph({
        text: "Short Introduction",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph(shortIntro),
      new Paragraph(""),
      new Paragraph({
        text: "Full Content",
        heading: HeadingLevel.HEADING_2,
      }),
    ];

    const contentLines = fullContent.split("\n");
    contentLines.forEach((line) => {
      if (line.startsWith("# ")) {
        children.push(
          new Paragraph({
            text: line.replace("# ", ""),
            heading: HeadingLevel.HEADING_1,
          })
        );
      } else if (line.startsWith("## ")) {
        children.push(
          new Paragraph({
            text: line.replace("## ", ""),
            heading: HeadingLevel.HEADING_2,
          })
        );
      } else if (line.startsWith("### ")) {
        children.push(
          new Paragraph({
            text: line.replace("### ", ""),
            heading: HeadingLevel.HEADING_3,
          })
        );
      } else if (line.trim()) {
        children.push(new Paragraph(line));
      } else {
        children.push(new Paragraph(""));
      }
    });

    // Add FAQ section
    if (faqContent.length > 0) {
      children.push(new Paragraph(""));
      children.push(
        new Paragraph({
          text: "Frequently Asked Questions",
          heading: HeadingLevel.HEADING_2,
        })
      );
      faqContent.forEach((faq, index) => {
        children.push(
          new Paragraph({
            text: `${index + 1}. ${faq.question}`,
            heading: HeadingLevel.HEADING_3,
          })
        );
        children.push(new Paragraph(faq.answer));
        children.push(new Paragraph(""));
      });
    }

    const doc = new Document({
      sections: [
        {
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${metaTags.slug || "blog-post"}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Content exported to Google Docx successfully",
    });
  };

  const toggleCtaType = (type: string) => {
    setIncludeCtaTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const wordCount = fullContent.split(/\s+/).filter((word) => word.length > 0).length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Content Generation Framework
          </CardTitle>
          <CardDescription>
            Configure framework, location intent, and content parameters for 2025-optimized content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Framework Type</Label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="SAGE">SAGE (Structure + Authority + Guidance + Engagement)</option>
                <option value="READ">READ (Rhythm + Engagement + Accessibility + Direction)</option>
                <option value="CRAFT">C.R.A.F.T (Clear + Relevant + Accurate + Factual + Terse)</option>
                <option value="HUMAIZE">HUMAIZE (Human-like + Natural + Contextual)</option>
                <option value="HYBRID">HYBRID (All Frameworks Combined) ⭐</option>
              </select>
              <p className="text-xs text-muted-foreground">
                {framework === 'SAGE' && 'Structured, authoritative content with clear guidance'}
                {framework === 'READ' && 'Optimized for natural readability and flow'}
                {framework === 'CRAFT' && 'Focus on clarity, accuracy, and concise writing'}
                {framework === 'HUMAIZE' && 'Maximum human-like tone, passes AI detectors'}
                {framework === 'HYBRID' && 'Combines all frameworks for comprehensive SEO+AEO+GEO+LLMO'}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Location Intent</Label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Chennai, Mumbai, India"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Location keywords integrated naturally (e.g., "in {location}")
              </p>
            </div>

            <div className="space-y-2">
              <Label>Brand Name (Optional)</Label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Your brand or product name"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Mentioned 2–4 times per section naturally
              </p>
            </div>

            <div className="space-y-2">
              <Label>Target Word Count</Label>
              <input
                type="number"
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(Number(e.target.value))}
                min={1000}
                max={5000}
                step={100}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Minimum words: 1000–5000
              </p>
            </div>

            <div className="space-y-2">
              <Label>Keyword Density (%)</Label>
              <input
                type="number"
                value={keywordDensity}
                onChange={(e) => setKeywordDensity(Number(e.target.value))}
                min={1.0}
                max={1.8}
                step={0.1}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                1.0–1.8% (recommended: 1.5%)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Call-to-Action Types</Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={includeCtaTypes.includes('course') ? 'default' : 'outline'}
                  onClick={() => toggleCtaType('course')}
                >
                  Course CTA
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={includeCtaTypes.includes('alsoRead') ? 'default' : 'outline'}
                  onClick={() => toggleCtaType('alsoRead')}
                >
                  Also Read
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={includeCtaTypes.includes('related') ? 'default' : 'outline'}
                  onClick={() => toggleCtaType('related')}
                >
                  Related Content
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Active Framework Formula:</p>
            <code className="text-xs text-muted-foreground">
              {framework === 'SAGE' && '(Structure × 0.3) + (Authority × 0.25) + (Guidance × 0.25) + (Engagement × 0.2)'}
              {framework === 'READ' && '(Rhythm × 0.25) + (Engagement × 0.3) + (Accessibility × 0.25) + (Direction × 0.2)'}
              {framework === 'CRAFT' && '(Clarity × 0.25) + (Relevance × 0.25) + (Accuracy × 0.2) + (Factual × 0.2) + (Terseness × 0.1)'}
              {framework === 'HUMAIZE' && '(Human-tone × 0.35) + (Natural-flow × 0.35) + (Context × 0.3)'}
              {framework === 'HYBRID' && '(SAGE × 0.3) + (READ × 0.25) + (CRAFT × 0.25) + (HUMAIZE × 0.2)'}
            </code>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Short Intro / Summary</CardTitle>
              <CardDescription>100-word snippet for featured snippets</CardDescription>
            </div>
            <Button onClick={generateShortIntro} disabled={generating}>
              <Sparkles className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "AI Generate"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={shortIntro}
            onChange={(e) => setShortIntro(e.target.value)}
            placeholder="A concise 100-word introduction..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {shortIntro.split(/\s+/).filter((w) => w).length} words
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Full Blog Content</CardTitle>
              <CardDescription>AI-generated 2000+ word SEO-optimized content</CardDescription>
            </div>
            <Button onClick={generateFullContent} disabled={generating || !shortIntro}>
              <Sparkles className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "Generate Full Content"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <RichTextEditor
            content={fullContent}
            onChange={setFullContent}
            placeholder="Your full blog post content will appear here..."
          />
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant={wordCount >= 2000 ? "default" : "secondary"}>
                {wordCount} words
              </Badge>
              <Badge variant={seoScore >= 80 ? "default" : seoScore >= 60 ? "secondary" : "destructive"}>
                SEO Score: {seoScore}/100
              </Badge>
              {qualityMetrics && (
                <>
                  <Badge variant={qualityMetrics.grammarScore >= 90 ? "default" : "secondary"}>
                    Grammar: {qualityMetrics.grammarScore}/100
                  </Badge>
                  <Badge 
                    variant={qualityMetrics.aiDetectionScore <= 30 ? "default" : qualityMetrics.aiDetectionScore <= 60 ? "secondary" : "destructive"}
                  >
                    AI Detection: {qualityMetrics.aiDetectionScore}/100
                  </Badge>
                  <Badge variant={qualityMetrics.overallQuality >= 80 ? "default" : "secondary"}>
                    Quality: {qualityMetrics.overallQuality}/100
                  </Badge>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => checkContentQuality()}
                disabled={!fullContent || checkingQuality}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {checkingQuality ? "Checking..." : "Check Quality"}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={humanizeContent}
                disabled={!fullContent || humanizing}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {humanizing ? "Humanizing..." : "Humanize Content"}
              </Button>
            </div>
          </div>

          {qualityMetrics && qualityMetrics.spellingIssues.length > 0 && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <Label className="text-sm font-semibold mb-2 block">Spelling/Grammar Issues:</Label>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                {qualityMetrics.spellingIssues.slice(0, 5).map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {qualityMetrics && qualityMetrics.humanizationSuggestions.length > 0 && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <Label className="text-sm font-semibold mb-2 block">Humanization Suggestions:</Label>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                {qualityMetrics.humanizationSuggestions.slice(0, 5).map((suggestion, i) => (
                  <li key={i}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={exportContent} disabled={!fullContent}>
          <Download className="h-4 w-4 mr-2" />
          Export Markdown
        </Button>
        <Button variant="outline" onClick={exportToDocx} disabled={!fullContent}>
          <FileText className="h-4 w-4 mr-2" />
          Export Google Docx
        </Button>
        <Button onClick={saveBlogPost} disabled={!fullContent || saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Blog Post"}
        </Button>
        <Button onClick={onNext} disabled={!fullContent} size="lg">
          Next: FAQ & Links
        </Button>
      </div>
    </div>
  );
}