import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Download, Save, FileText, CheckCircle2, Wand2, Globe, Image, Search, Loader2, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { RichTextEditor } from "@/components/RichTextEditor";
import { KeywordDensityTracker } from "./KeywordDensityTracker";
import { ReadabilityAnalyzer } from "./ReadabilityAnalyzer";
import { AIDetectionChecker } from "./AIDetectionChecker";
import { ContentSuggestions } from "./ContentSuggestions";
import { KeywordHighlighter } from "./KeywordHighlighter";
import { SectionRegenerator } from "./SectionRegenerator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface BrandVoice {
  id: string;
  name: string;
  description: string | null;
  tone: string | null;
  style_guidelines: string | null;
  vocabulary_preferences: string | null;
  example_content: string | null;
}

interface SitemapCollection {
  id: string;
  name: string;
  sitemap_url: string;
  discovered_urls: string[];
}

interface Framework {
  id: string;
  name: string;
  description: string | null;
  formula: string | null;
  system_prompt: string | null;
}

interface UserIntent {
  primaryIntent: string;
  intentSignals: string[];
  searcherGoal: string;
  contentAngle: string;
}

interface GeneratedImage {
  type: string;
  prompt: string;
  imageUrl: string;
}

interface CompetitorAnalysis {
  keyword: string;
  analysis: string;
  recommendations: {
    wordCountRange: string;
    headingStructure: string[];
    suggestedSections: string[];
    keyTopics: string[];
    contentGaps: string[];
  };
  generatedAt: string;
}

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
  fullContent: string;
  setFullContent: (content: string) => void;
  contextContent?: string;
  userIntent?: UserIntent | null;
  onNext: () => void;
}

export function ContentGenerator({
  userId,
  keywords,
  metaTags,
  headings,
  faqContent,
  fullContent,
  setFullContent,
  contextContent = "",
  userIntent = null,
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
  const [publishing, setPublishing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("gemini-free");
  const [location, setLocation] = useState('United States');
  const [brandName, setBrandName] = useState('');
  const [targetWordCount, setTargetWordCount] = useState(1500);
  const [keywordDensity, setKeywordDensity] = useState(1.5);
  const [includeCtaTypes, setIncludeCtaTypes] = useState([
    'course',
    'alsoRead', 
    'related',
    'industry',
    'usp',
    'humanIntent',
    'seoIntent',
    'llmoIntent'
  ]);

  // Image generation settings
  const [generateImages, setGenerateImages] = useState(false);
  const [numberOfImages, setNumberOfImages] = useState(2);
  const [generateCoverImage, setGenerateCoverImage] = useState(true);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatingImages, setGeneratingImages] = useState(false);

  // Competitor analysis settings
  const [enableCompetitorAnalysis, setEnableCompetitorAnalysis] = useState(false);
  const [competitorAnalysis, setCompetitorAnalysis] = useState<CompetitorAnalysis | null>(null);
  const [analyzingCompetitors, setAnalyzingCompetitors] = useState(false);

  // Article element toggles
  const [useFirstPerson, setUseFirstPerson] = useState(true);
  const [includeStories, setIncludeStories] = useState(true);
  const [includeHook, setIncludeHook] = useState(true);
  const [includeHtmlElement, setIncludeHtmlElement] = useState(false);
  const [includeCitations, setIncludeCitations] = useState(true);
  const [includeInternalLinks, setIncludeInternalLinks] = useState(true);

  // Brand Voice settings
  const [brandVoices, setBrandVoices] = useState<BrandVoice[]>([]);
  const [selectedBrandVoice, setSelectedBrandVoice] = useState<string>("");

  // Sitemap internal links
  const [sitemapCollections, setSitemapCollections] = useState<SitemapCollection[]>([]);
  const [selectedSitemap, setSelectedSitemap] = useState<string>("");

  // Keyword highlighting
  const [highlightKeywords, setHighlightKeywords] = useState(false);
  const [activeKeywordTypes, setActiveKeywordTypes] = useState<string[]>(['primary', 'secondary']);

  // Settings panel state
  const [settingsOpen, setSettingsOpen] = useState(true);

  // Fetch frameworks, brand voices, and sitemaps on mount
  useEffect(() => {
    fetchFrameworks();
    fetchBrandVoices();
    fetchSitemaps();
  }, [userId]);

  const fetchFrameworks = async () => {
    try {
      const { data, error } = await supabase
        .from("frameworks")
        .select("id, name, description, formula, system_prompt")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setFrameworks(data || []);
      
      // Set default to HYBRID if exists
      const hybrid = data?.find(f => f.name === "HYBRID");
      if (hybrid) {
        setSelectedFramework(hybrid.id);
      } else if (data && data.length > 0) {
        setSelectedFramework(data[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching frameworks:", error);
    }
  };

  const fetchBrandVoices = async () => {
    try {
      const { data, error } = await supabase
        .from("brand_voices")
        .select("id, name, description, tone, style_guidelines, vocabulary_preferences, example_content, is_default")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setBrandVoices(data || []);
      
      // Set default brand voice if exists
      const defaultVoice = data?.find(v => v.is_default);
      if (defaultVoice) {
        setSelectedBrandVoice(defaultVoice.id);
      }
    } catch (error: any) {
      console.error("Error fetching brand voices:", error);
    }
  };

  const fetchSitemaps = async () => {
    try {
      const { data, error } = await supabase
        .from("sitemap_collections")
        .select("id, name, sitemap_url, discovered_urls")
        .eq("user_id", userId)
        .eq("status", "crawled")
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      // Parse discovered_urls from JSON with proper type casting
      const collections: SitemapCollection[] = (data || []).map(s => ({
        id: s.id,
        name: s.name,
        sitemap_url: s.sitemap_url,
        discovered_urls: Array.isArray(s.discovered_urls) 
          ? (s.discovered_urls as unknown[]).filter((url): url is string => typeof url === 'string')
          : []
      }));
      
      setSitemapCollections(collections);
      
      // Auto-select first sitemap if available
      if (collections.length > 0) {
        setSelectedSitemap(collections[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching sitemaps:", error);
    }
  };

  const getSelectedFrameworkData = () => {
    return frameworks.find(f => f.id === selectedFramework);
  };

  const getSelectedBrandVoiceData = () => {
    return brandVoices.find(v => v.id === selectedBrandVoice);
  };

  const getSelectedSitemapUrls = () => {
    const sitemap = sitemapCollections.find(s => s.id === selectedSitemap);
    return sitemap?.discovered_urls || [];
  };

  // Run competitor analysis
  const runCompetitorAnalysis = async () => {
    const primaryKeyword = keywords.primary[0];
    if (!primaryKeyword) {
      toast({
        title: "Error",
        description: "Please add a primary keyword first",
        variant: "destructive",
      });
      return;
    }

    setAnalyzingCompetitors(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-competitors", {
        body: { keyword: primaryKeyword, numberOfResults: 5 },
      });

      if (error) throw error;

      if (data.success) {
        setCompetitorAnalysis(data.data);
        toast({
          title: "Analysis Complete",
          description: "Competitor analysis finished successfully",
        });
      } else {
        throw new Error(data.error || "Analysis failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAnalyzingCompetitors(false);
    }
  };

  // Generate images for the blog post
  const generateBlogImages = async () => {
    const topic = metaTags.title || keywords.primary[0] || "blog post";
    
    setGeneratingImages(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-images", {
        body: { 
          topic, 
          keywords, 
          numberOfImages, 
          generateCover: generateCoverImage 
        },
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedImages(data.images || []);
        toast({
          title: "Images Generated",
          description: `Successfully generated ${data.images?.length || 0} images`,
        });
      } else {
        throw new Error(data.error || "Image generation failed");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingImages(false);
    }
  };

  const generateFullContent = async () => {
    setGenerating(true);
    try {
      const frameworkData = getSelectedFrameworkData();
      
      const brandVoiceData = getSelectedBrandVoiceData();
      const internalLinkUrls = includeInternalLinks ? getSelectedSitemapUrls() : [];
      
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { 
          keywords, 
          metaTags, 
          headings, 
          faqContent: [],
          framework: frameworkData?.name || 'HYBRID',
          frameworkPrompt: frameworkData?.system_prompt || undefined,
          location,
          brandName,
          targetWordCount,
          keywordDensity,
          includeCtaTypes,
          contextContent: contextContent || undefined,
          userIntent: userIntent || undefined,
          model: selectedModel,
          articleElements: {
            useFirstPerson,
            includeStories,
            includeHook,
            includeHtmlElement,
            includeCitations,
            includeInternalLinks,
          },
          brandVoice: brandVoiceData ? {
            name: brandVoiceData.name,
            tone: brandVoiceData.tone,
            styleGuidelines: brandVoiceData.style_guidelines,
            vocabularyPreferences: brandVoiceData.vocabulary_preferences,
            exampleContent: brandVoiceData.example_content,
          } : undefined,
          internalLinkUrls: internalLinkUrls.slice(0, 20), // Limit to 20 URLs
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

  // One-click optimize content based on issues
  const optimizeContent = async (optimizeType: 'readability' | 'ai' | 'keywords' | 'all') => {
    if (!fullContent) {
      toast({
        title: "Error",
        description: "No content to optimize",
        variant: "destructive",
      });
      return;
    }

    setOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("humanize-content", {
        body: { 
          content: fullContent,
          optimizeType,
          keywords,
          targetKeywordDensity: keywordDensity,
        },
      });

      if (error) throw error;

      setFullContent(data.humanizedContent);
      await checkContentQuality(data.humanizedContent);

      toast({
        title: "Content Optimized!",
        description: `Content has been optimized for ${optimizeType === 'all' ? 'all metrics' : optimizeType}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setOptimizing(false);
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
          short_intro: "",
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

    const markdown = `# ${metaTags.title}\n\n**Meta Description:** ${metaTags.description}\n\n**URL Slug:** ${metaTags.slug}\n\n## Full Content\n\n${fullContent}${faqSection}`;
    
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

  const publishToWordPress = async () => {
    if (!fullContent || !metaTags.title) {
      toast({
        title: "Error",
        description: "Please generate content before publishing",
        variant: "destructive",
      });
      return;
    }

    setPublishing(true);
    try {
      // Get WordPress credentials from user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wordpress_url, wordpress_username, wordpress_app_password")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      if (!profile?.wordpress_url || !profile?.wordpress_username || !profile?.wordpress_app_password) {
        toast({
          title: "WordPress Not Configured",
          description: "Please configure WordPress settings in Settings page",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("publish-to-wordpress", {
        body: {
          wordpressUrl: profile.wordpress_url,
          username: profile.wordpress_username,
          appPassword: profile.wordpress_app_password,
          post: {
            title: metaTags.title,
            content: fullContent,
            metaDescription: metaTags.description,
            slug: metaTags.slug,
            status: "draft",
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Published to WordPress!",
        description: `Post published as draft. Post ID: ${data.postId}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const wordCount = fullContent.split(/\s+/).filter((word) => word.length > 0).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 sm:pb-6 cursor-pointer hover:bg-muted/50 transition-colors rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-lg sm:text-xl">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  Content Generation Settings
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedModel === 'gemini-flash' ? 'Gemini Flash' : 
                     selectedModel === 'claude-sonnet-4' ? 'Claude 4' :
                     selectedModel === 'claude-sonnet-4.5' ? 'Claude 4.5' : 'Gemini Free'}
                  </Badge>
                  {settingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure AI model, framework, and content parameters
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* AI Model Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                AI Model
                <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                  Your API Key Required
                </Badge>
              </Label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <optgroup label="🔑 OpenRouter Models (Requires API Key)">
                  <option value="claude-sonnet-4">Claude Sonnet 4 ⭐ Best Quality</option>
                  <option value="claude-sonnet-4.5">Claude Sonnet 4.5 (Latest)</option>
                </optgroup>
                <optgroup label="🔑 Google Gemini (Requires API Key)">
                  <option value="gemini-free">Gemini 2.0 Flash (Free Tier Available)</option>
                </optgroup>
              </select>
              <div className="p-2 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  {selectedModel === 'claude-sonnet-4' && '🏆 Best for SEO content. Add OpenRouter API key in Settings → API Keys'}
                  {selectedModel === 'claude-sonnet-4.5' && '🆕 Latest Claude model. Add OpenRouter API key in Settings → API Keys'}
                  {selectedModel === 'gemini-free' && '💸 Free tier available! Add Gemini API key in Settings → API Keys'}
                </p>
              </div>
            </div>
            
            {/* Framework Selection */}
            <div className="space-y-2">
              <Label>Content Framework</Label>
              <select
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                {frameworks.map((framework) => (
                  <option key={framework.id} value={framework.id}>
                    {framework.name} {framework.name === 'HYBRID' ? '⭐' : ''}
                  </option>
                ))}
              </select>
              {getSelectedFrameworkData()?.description && (
                <p className="text-xs text-muted-foreground">
                  {getSelectedFrameworkData()?.description}
                </p>
              )}
            </div>

            {/* Brand Voice Selection */}
            <div className="space-y-2">
              <Label>Brand Voice</Label>
              <select
                value={selectedBrandVoice}
                onChange={(e) => setSelectedBrandVoice(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">No Brand Voice (Default)</option>
                {brandVoices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} {voice.tone ? `(${voice.tone})` : ''}
                  </option>
                ))}
              </select>
              {getSelectedBrandVoiceData()?.description && (
                <p className="text-xs text-muted-foreground">
                  {getSelectedBrandVoiceData()?.description}
                </p>
              )}
              {brandVoices.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  No brand voices configured. Add them in Settings → Content.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location Intent</Label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., New York, California, United States"
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                US location keywords integrated naturally (e.g., "in {location}")
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

            <div className="space-y-2 col-span-full">
              <Label>Call-to-Action Types</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select multiple CTA types to naturally integrate throughout content
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={includeCtaTypes.includes('course') ? 'default' : 'outline'}
                  onClick={() => toggleCtaType('course')}
                >
                  📚 Course CTA
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={includeCtaTypes.includes('alsoRead') ? 'default' : 'outline'}
                  onClick={() => toggleCtaType('alsoRead')}
                >
                  📖 Also Read
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={includeCtaTypes.includes('related') ? 'default' : 'outline'}
                  onClick={() => toggleCtaType('related')}
                >
                  🔗 Related Content
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={includeCtaTypes.includes('industry') ? 'default' : 'outline'}
                  onClick={() => toggleCtaType('industry')}
                >
                  🏢 Industry Solutions
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={includeCtaTypes.includes('usp') ? 'default' : 'outline'}
                  onClick={() => toggleCtaType('usp')}
                >
                  ⭐ USP/Benefits
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={includeCtaTypes.includes('humanIntent') ? 'default' : 'outline'}
                  onClick={() => toggleCtaType('humanIntent')}
                >
                  💬 Human Intent
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={includeCtaTypes.includes('seoIntent') ? 'default' : 'outline'}
                  onClick={() => toggleCtaType('seoIntent')}
                >
                  🔍 SEO Intent
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={includeCtaTypes.includes('llmoIntent') ? 'default' : 'outline'}
                  onClick={() => toggleCtaType('llmoIntent')}
                >
                  🤖 LLMO Intent
                </Button>
              </div>
            </div>

            {/* Article Elements */}
            <div className="space-y-3 col-span-full border-t pt-4">
              <Label>Article Elements</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select which elements to include in your content
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-sm">First Person</Label>
                    <p className="text-xs text-muted-foreground">Use "I" perspective</p>
                  </div>
                  <Switch
                    checked={useFirstPerson}
                    onCheckedChange={setUseFirstPerson}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Stories & Examples</Label>
                    <p className="text-xs text-muted-foreground">Include anecdotes</p>
                  </div>
                  <Switch
                    checked={includeStories}
                    onCheckedChange={setIncludeStories}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Hook</Label>
                    <p className="text-xs text-muted-foreground">Engaging introduction</p>
                  </div>
                  <Switch
                    checked={includeHook}
                    onCheckedChange={setIncludeHook}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-sm">HTML Element</Label>
                    <p className="text-xs text-muted-foreground">Interactive widget</p>
                  </div>
                  <Switch
                    checked={includeHtmlElement}
                    onCheckedChange={setIncludeHtmlElement}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Citations</Label>
                    <p className="text-xs text-muted-foreground">Include references</p>
                  </div>
                  <Switch
                    checked={includeCitations}
                    onCheckedChange={setIncludeCitations}
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Internal Links</Label>
                    <p className="text-xs text-muted-foreground">Link to your content</p>
                  </div>
                  <Switch
                    checked={includeInternalLinks}
                    onCheckedChange={setIncludeInternalLinks}
                  />
                </div>
              </div>

              {/* Sitemap Selector for Internal Links */}
              {includeInternalLinks && (
                <div className="space-y-2 mt-4">
                  <Label>Internal Links Source (Sitemap)</Label>
                  <select
                    value={selectedSitemap}
                    onChange={(e) => setSelectedSitemap(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    <option value="">Use placeholder links</option>
                    {sitemapCollections.map((sitemap) => (
                      <option key={sitemap.id} value={sitemap.id}>
                        {sitemap.name} ({sitemap.discovered_urls.length} URLs)
                      </option>
                    ))}
                  </select>
                  {selectedSitemap && getSelectedSitemapUrls().length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium mb-1">Sample URLs from sitemap:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {getSelectedSitemapUrls().slice(0, 3).map((url, i) => (
                          <li key={i} className="truncate">{url}</li>
                        ))}
                        {getSelectedSitemapUrls().length > 3 && (
                          <li>...and {getSelectedSitemapUrls().length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  {sitemapCollections.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No sitemaps configured. Add them in Settings → Integrations.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Competitor Analysis Card */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            Competitor Analysis
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Analyze top-ranking articles to create better content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Competitor Analysis</Label>
              <p className="text-xs text-muted-foreground">
                Analyze competitor content before generating
              </p>
            </div>
            <Switch
              checked={enableCompetitorAnalysis}
              onCheckedChange={setEnableCompetitorAnalysis}
            />
          </div>

          {enableCompetitorAnalysis && (
            <div className="space-y-4">
              <Button
                onClick={runCompetitorAnalysis}
                disabled={analyzingCompetitors || !keywords.primary[0]}
                variant="outline"
                className="w-full"
              >
                {analyzingCompetitors ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze Competitors for "{keywords.primary[0] || 'keyword'}"
                  </>
                )}
              </Button>

              {competitorAnalysis && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                  <Label className="text-sm font-semibold">Analysis Results:</Label>
                  <div className="prose prose-sm max-w-none text-muted-foreground">
                    <pre className="whitespace-pre-wrap text-xs overflow-auto max-h-64">
                      {competitorAnalysis.analysis}
                    </pre>
                  </div>
                  {competitorAnalysis.recommendations.keyTopics.length > 0 && (
                    <div>
                      <Label className="text-xs">Key Topics to Cover:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {competitorAnalysis.recommendations.keyTopics.slice(0, 8).map((topic, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {topic.slice(0, 40)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Settings Card */}
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Image className="h-4 w-4 sm:h-5 sm:w-5" />
            Image Settings
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Configure automatic image generation for your article
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Generate Images</Label>
              <p className="text-xs text-muted-foreground">
                Automatically generate images for your article
              </p>
            </div>
            <Switch
              checked={generateImages}
              onCheckedChange={setGenerateImages}
            />
          </div>

          {generateImages && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Number of Content Images: {numberOfImages}</Label>
                </div>
                <Slider
                  value={[numberOfImages]}
                  onValueChange={(value) => setNumberOfImages(value[0])}
                  min={0}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">0-5 images</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Generate Cover Image</Label>
                  <p className="text-xs text-muted-foreground">
                    Create a cover image for your article
                  </p>
                </div>
                <Switch
                  checked={generateCoverImage}
                  onCheckedChange={setGenerateCoverImage}
                />
              </div>

              <Button
                onClick={generateBlogImages}
                disabled={generatingImages || (!numberOfImages && !generateCoverImage)}
                variant="outline"
                className="w-full"
              >
                {generatingImages ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Images...
                  </>
                ) : (
                  <>
                    <Image className="h-4 w-4 mr-2" />
                    Generate {generateCoverImage ? 'Cover + ' : ''}{numberOfImages} Content Images
                  </>
                )}
              </Button>

              {generatedImages.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Generated Images:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {generatedImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={img.imageUrl}
                          alt={`Generated ${img.type} image`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Badge 
                          variant={img.type === 'cover' ? 'default' : 'secondary'}
                          className="absolute top-2 left-2 text-xs"
                        >
                          {img.type === 'cover' ? 'Cover' : `Image ${i}`}
                        </Badge>
                        <a
                          href={img.imageUrl}
                          download={`blog-${img.type}-${i}.png`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Button size="sm" variant="secondary">
                            <Download className="h-3 w-3" />
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Full Blog Content</CardTitle>
              <CardDescription>AI-generated 2000+ word SEO-optimized content</CardDescription>
            </div>
            <Button onClick={generateFullContent} disabled={generating}>
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

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Keyword Highlighter */}
        <KeywordHighlighter
          content={fullContent}
          keywords={keywords}
          highlightEnabled={highlightKeywords}
          onToggleHighlight={setHighlightKeywords}
          activeKeywordTypes={activeKeywordTypes}
          onToggleKeywordType={(type) => {
            setActiveKeywordTypes(prev => 
              prev.includes(type) 
                ? prev.filter(t => t !== type)
                : [...prev, type]
            );
          }}
        />

        {/* Section Regenerator */}
        <SectionRegenerator
          content={fullContent}
          keywords={keywords}
          onContentUpdate={setFullContent}
          selectedModel={selectedModel}
        />

        {/* Keyword Density Tracker */}
        <KeywordDensityTracker 
          content={fullContent}
          keywords={keywords}
          targetDensity={keywordDensity}
          onOptimize={() => optimizeContent('keywords')}
          isOptimizing={optimizing}
        />

        {/* Readability Analyzer */}
        <ReadabilityAnalyzer 
          content={fullContent}
          onOptimize={() => optimizeContent('readability')}
          isOptimizing={optimizing}
        />

        {/* Content Suggestions */}
        <ContentSuggestions 
          content={fullContent}
          keywords={keywords}
          onOptimize={() => optimizeContent('all')}
          isOptimizing={optimizing}
        />

        {/* AI Detection Checker */}
        <AIDetectionChecker 
          content={fullContent} 
          aiScore={qualityMetrics?.aiDetectionScore}
          onOptimize={() => optimizeContent('ai')}
          isOptimizing={optimizing}
        />
      </div>

      {/* Final Action - Publish to WordPress */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Ready to Publish?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Publish your content directly to WordPress
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={saveBlogPost} 
                disabled={!fullContent || saving}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Draft"}
              </Button>
              <Button 
                onClick={publishToWordPress} 
                disabled={!fullContent || publishing}
                className="bg-primary hover:bg-primary/90 gap-2"
                size="lg"
              >
                <Globe className="h-4 w-4" />
                {publishing ? "Publishing..." : "Publish to WordPress"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}