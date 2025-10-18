import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, Save, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

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
          faqContent: [] // Don't include FAQ in content generation
        },
      });

      if (error) throw error;
      
      setFullContent(data.content);
      setSeoScore(data.seoScore);

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

  const wordCount = fullContent.split(/\s+/).filter((word) => word.length > 0).length;

  return (
    <div className="space-y-6">
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
          <Textarea
            value={fullContent}
            onChange={(e) => setFullContent(e.target.value)}
            placeholder="Your full blog post content will appear here..."
            rows={20}
            className="font-mono text-sm"
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-4">
              <Badge variant={wordCount >= 2000 ? "default" : "secondary"}>
                {wordCount} words
              </Badge>
              <Badge variant={seoScore >= 80 ? "default" : seoScore >= 60 ? "secondary" : "destructive"}>
                SEO Score: {seoScore}/100
              </Badge>
            </div>
          </div>
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