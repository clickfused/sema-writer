import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Trash2, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface FaqItem {
  intent?: string;
  question: string;
  conversationalVariation?: string;
  longtailVariation?: string;
  answer: string;
  namedEntities?: string[];
  conceptualEntities?: string[];
}

interface FaqGeneratorProps {
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
  faqContent: Array<FaqItem>;
  setFaqContent: (faq: Array<FaqItem>) => void;
  fullContent: string;
  onNext: () => void;
}

export function FaqGenerator({
  keywords,
  metaTags,
  faqContent,
  setFaqContent,
  fullContent,
  onNext,
}: FaqGeneratorProps) {
  const [generating, setGenerating] = useState(false);
  const [generatingLinks, setGeneratingLinks] = useState(false);
  const [linkSuggestions, setLinkSuggestions] = useState<Array<{ anchor: string; url: string; type: 'internal' | 'external' }>>([]);

  const generateFaqs = async () => {
    if (!fullContent) {
      toast({
        title: "Error",
        description: "Please generate blog content first",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-faq", {
        body: { keywords, metaTags, content: fullContent },
      });

      if (error) throw error;

      setFaqContent(data.faqs);

      toast({
        title: "Success",
        description: "FAQs generated successfully",
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

  const generateLinks = async () => {
    if (!fullContent) {
      toast({
        title: "Error",
        description: "Please generate blog content first",
        variant: "destructive",
      });
      return;
    }

    setGeneratingLinks(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-links", {
        body: { keywords, metaTags, content: fullContent },
      });

      if (error) throw error;

      setLinkSuggestions(data.links);

      toast({
        title: "Success",
        description: `${data.links.length} link suggestions generated`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingLinks(false);
    }
  };

  const publishToWordPress = async () => {
    if (!fullContent || faqContent.length === 0) {
      toast({
        title: "Error",
        description: "Please generate blog content and FAQs first",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    try {
      // Get WordPress credentials
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("wordpress_url, wordpress_username, wordpress_app_password")
        .eq("id", user.id)
        .single();

      if (!profile?.wordpress_url || !profile?.wordpress_username || !profile?.wordpress_app_password) {
        toast({
          title: "WordPress Not Configured",
          description: "Please configure WordPress credentials in Settings",
          variant: "destructive",
        });
        return;
      }

      // Format content with FAQ
      const faqSection = `\n\n<h2>Frequently Asked Questions</h2>\n\n${faqContent
        .map((faq) => `<h3>${faq.question}</h3>\n<p>${faq.answer}</p>`)
        .join("\n\n")}`;

      const fullPostContent = fullContent + faqSection;

      // Publish to WordPress
      const { data, error } = await supabase.functions.invoke("publish-to-wordpress", {
        body: {
          wordpressUrl: profile.wordpress_url,
          username: profile.wordpress_username,
          appPassword: profile.wordpress_app_password,
          post: {
            title: metaTags.title,
            content: fullPostContent,
            metaDescription: metaTags.description,
            slug: metaTags.slug,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Blog post published to WordPress as draft`,
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

  const addFaq = () => {
    setFaqContent([...faqContent, { 
      intent: "Informational",
      question: "", 
      conversationalVariation: "",
      longtailVariation: "",
      answer: "",
      namedEntities: [],
      conceptualEntities: []
    }]);
  };

  const removeFaq = (index: number) => {
    setFaqContent(faqContent.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: keyof FaqItem, value: string) => {
    const updated = [...faqContent];
    if (field === "namedEntities" || field === "conceptualEntities") {
      updated[index][field] = value.split(",").map(s => s.trim()).filter(Boolean);
    } else {
      updated[index][field] = value as any;
    }
    setFaqContent(updated);
  };

  const getIntentColor = (intent?: string) => {
    switch (intent) {
      case "Informational": return "default";
      case "Navigational": return "secondary";
      case "Transactional": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>F.A.Q+ Framework™ Section</CardTitle>
              <CardDescription>
                Generate SEO + AEO + GEO + LLMO optimized FAQs with intent mapping & query variations
              </CardDescription>
            </div>
            <Button onClick={generateFaqs} disabled={generating || !fullContent}>
              <Sparkles className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "AI Generate FAQs"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {faqContent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No FAQs yet. Generate or add manually.</p>
            </div>
          ) : (
            faqContent.map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="secondary">FAQ {index + 1}</Badge>
                      {faq.intent && (
                        <Badge variant={getIntentColor(faq.intent)}>
                          {faq.intent}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFaq(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Core Question (SEO)</label>
                      <Input
                        placeholder="What is...?"
                        value={faq.question}
                        onChange={(e) => updateFaq(index, "question", e.target.value)}
                      />
                    </div>
                    {faq.conversationalVariation !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Conversational Variant (ChatGPT)</label>
                        <Input
                          placeholder="How does...?"
                          value={faq.conversationalVariation}
                          onChange={(e) => updateFaq(index, "conversationalVariation", e.target.value)}
                        />
                      </div>
                    )}
                    {faq.longtailVariation !== undefined && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Long-tail Variant (Perplexity)</label>
                        <Input
                          placeholder="Can AI systems...?"
                          value={faq.longtailVariation}
                          onChange={(e) => updateFaq(index, "longtailVariation", e.target.value)}
                        />
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Answer (40-60 words)</label>
                      <Textarea
                        placeholder="Clear, relevant, accurate, factual, terse..."
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, "answer", e.target.value)}
                        rows={3}
                      />
                    </div>
                    {faq.namedEntities !== undefined && faq.namedEntities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {faq.namedEntities.map((entity, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {faq.conceptualEntities !== undefined && faq.conceptualEntities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {faq.conceptualEntities.map((entity, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}

          <Button variant="outline" onClick={addFaq} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ Manually
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Link Suggestions</CardTitle>
              <CardDescription>
                AI-generated internal & external link suggestions with anchor text
              </CardDescription>
            </div>
            <Button onClick={generateLinks} disabled={generatingLinks || !fullContent}>
              <Sparkles className="h-4 w-4 mr-2" />
              {generatingLinks ? "Generating..." : "AI Suggest Links"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {linkSuggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No link suggestions yet. Click the button to generate.</p>
            </div>
          ) : (
            linkSuggestions.map((link, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={link.type === 'internal' ? 'default' : 'secondary'}>
                        {link.type}
                      </Badge>
                      <span className="font-medium">{link.anchor}</span>
                    </div>
                    <p className="text-sm text-muted-foreground break-all">{link.url}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={publishToWordPress} disabled={generating || !fullContent || faqContent.length === 0} size="lg">
          <Send className="h-4 w-4 mr-2" />
          {generating ? "Publishing..." : "Publish to WordPress"}
        </Button>
      </div>
    </div>
  );
}
