import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SerpPreview } from "./SerpPreview";

interface MetaTagsFormProps {
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
  setMetaTags: (tags: any) => void;
  onNext: () => void;
}

export function MetaTagsForm({ keywords, metaTags, setMetaTags, onNext }: MetaTagsFormProps) {
  const [generating, setGenerating] = useState(false);
  const [intentAnalysis, setIntentAnalysis] = useState<{
    searchIntent?: string;
    topicIntent?: string;
    llmIntent?: string;
    aiIntent?: string;
  }>({});

  const generateMetaTags = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-meta", {
        body: { keywords },
      });

      if (error) throw error;

      setMetaTags({
        title: data.title,
        description: data.description,
        slug: data.slug,
      });

      setIntentAnalysis({
        searchIntent: data.searchIntent,
        topicIntent: data.topicIntent,
        llmIntent: data.llmIntent,
        aiIntent: data.aiIntent,
      });

      toast({
        title: "Success",
        description: "Intent-optimized meta tags generated successfully",
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

  const canProceed = metaTags.title && metaTags.description && metaTags.slug;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">Meta Tags</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                SEO-optimized meta information with multi-intent targeting
              </CardDescription>
            </div>
            <Button onClick={generateMetaTags} disabled={generating || keywords.primary.length === 0} size="sm" className="w-full sm:w-auto">
              <Sparkles className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "AI Generate"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {/* Intent Analysis Display */}
          {intentAnalysis.searchIntent && (
            <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-primary" />
                <Label className="text-sm font-semibold">Intent Analysis</Label>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium text-muted-foreground">Search Intent:</span>
                  <Badge variant="outline" className="ml-2">{intentAnalysis.searchIntent}</Badge>
                </div>
                <div>
                  <span className="font-medium text-muted-foreground">Topic Intent:</span>
                  <Badge variant="outline" className="ml-2">{intentAnalysis.topicIntent}</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs"><span className="font-medium">LLM:</span> {intentAnalysis.llmIntent}</p>
                <p className="text-xs"><span className="font-medium">AI Engine:</span> {intentAnalysis.aiIntent}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm sm:text-base">Meta Title (Max 57 characters)</Label>
            <Input
              id="title"
              value={metaTags.title}
              onChange={(e) => setMetaTags({ ...metaTags, title: e.target.value.slice(0, 57) })}
              maxLength={57}
              placeholder="Your SEO-optimized title"
              className="text-sm sm:text-base"
            />
            <p className="text-xs text-muted-foreground">{metaTags.title.length}/57 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm sm:text-base">Meta Description (Max 157 characters)</Label>
            <Textarea
              id="description"
              value={metaTags.description}
              onChange={(e) => setMetaTags({ ...metaTags, description: e.target.value.slice(0, 157) })}
              maxLength={157}
              placeholder="Brief, engaging description of your content"
              rows={3}
              className="text-sm sm:text-base"
            />
            <p className="text-xs text-muted-foreground">{metaTags.description.length}/157 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-sm sm:text-base">URL Slug</Label>
            <Input
              id="slug"
              value={metaTags.slug}
              onChange={(e) => {
                const slug = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, '-')
                  .replace(/--+/g, '-')
                  .replace(/^-|-$/g, '');
                setMetaTags({ ...metaTags, slug });
              }}
              placeholder="url-friendly-slug-2025"
              className="text-sm sm:text-base"
            />
            <p className="text-xs text-muted-foreground">
              Intent-optimized URL structure: [question-word]-[keyword]-[2025]
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SERP Preview */}
      {metaTags.title && metaTags.description && (
        <SerpPreview 
          title={metaTags.title}
          description={metaTags.description}
          slug={metaTags.slug}
        />
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed} size="lg" className="w-full sm:w-auto">
          Next: Headings
        </Button>
      </div>
    </div>
  );
}