import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

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
  faqContent: Array<{ question: string; answer: string }>;
  setFaqContent: (faq: Array<{ question: string; answer: string }>) => void;
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

  const addFaq = () => {
    setFaqContent([...faqContent, { question: "", answer: "" }]);
  };

  const removeFaq = (index: number) => {
    setFaqContent(faqContent.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const updated = [...faqContent];
    updated[index][field] = value;
    setFaqContent(updated);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>FAQ Section (After Blog Content)</CardTitle>
              <CardDescription>
                Generate SEO-optimized FAQ schema for better visibility
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
                  <div className="flex items-start justify-between">
                    <Badge variant="secondary">FAQ {index + 1}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFaq(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Input
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => updateFaq(index, "question", e.target.value)}
                    />
                    <Textarea
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) => updateFaq(index, "answer", e.target.value)}
                      rows={3}
                    />
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
    </div>
  );
}
