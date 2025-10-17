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
  onNext: () => void;
}

export function FaqGenerator({
  keywords,
  metaTags,
  faqContent,
  setFaqContent,
  onNext,
}: FaqGeneratorProps) {
  const [generating, setGenerating] = useState(false);

  const generateFaqs = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-faq", {
        body: { keywords, metaTags },
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
              <CardTitle>FAQ Section</CardTitle>
              <CardDescription>
                Generate SEO-optimized FAQ schema for better visibility
              </CardDescription>
            </div>
            <Button onClick={generateFaqs} disabled={generating}>
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

      <div className="flex justify-end">
        <Button
          onClick={onNext}
          disabled={faqContent.length === 0}
          size="lg"
        >
          Continue to Content
        </Button>
      </div>
    </div>
  );
}
