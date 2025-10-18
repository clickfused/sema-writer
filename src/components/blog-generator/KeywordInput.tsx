import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface KeywordInputProps {
  keywords: {
    primary: string[];
    secondary: string[];
    semantic: string[];
    lsi: string[];
  };
  setKeywords: (keywords: any) => void;
  onNext: () => void;
}

export function KeywordInput({ keywords, setKeywords, onNext }: KeywordInputProps) {
  const [primaryInput, setPrimaryInput] = useState("");
  const [secondaryInput, setSecondaryInput] = useState("");
  const [semanticInput, setSemanticInput] = useState("");
  const [lsiInput, setLsiInput] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);

  const addKeyword = (type: keyof typeof keywords, value: string) => {
    if (value.trim()) {
      setKeywords({
        ...keywords,
        [type]: [...keywords[type], value.trim()],
      });
      if (type === "primary") setPrimaryInput("");
      if (type === "secondary") setSecondaryInput("");
      if (type === "semantic") setSemanticInput("");
      if (type === "lsi") setLsiInput("");
    }
  };

  const removeKeyword = (type: keyof typeof keywords, index: number) => {
    setKeywords({
      ...keywords,
      [type]: keywords[type].filter((_, i) => i !== index),
    });
  };

  const generateKeywords = async (type: 'secondary' | 'semantic' | 'lsi') => {
    if (keywords.primary.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one primary keyword first",
        variant: "destructive",
      });
      return;
    }

    setGenerating(type);
    try {
      const { data, error } = await supabase.functions.invoke("generate-keywords", {
        body: { primaryKeywords: keywords.primary, type },
      });

      if (error) throw error;

      setKeywords({
        ...keywords,
        [type]: data.keywords,
      });

      toast({
        title: "Success",
        description: `${data.keywords.length} ${type} keywords generated`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const canProceed = keywords.primary.length > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Primary Keywords</CardTitle>
          <CardDescription>Main focus keyword for your blog post (at least 1 required)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., AI SEO Tools"
              value={primaryInput}
              onChange={(e) => setPrimaryInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addKeyword("primary", primaryInput)}
            />
            <Button onClick={() => addKeyword("primary", primaryInput)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.primary.map((keyword, index) => (
              <Badge key={index} variant="default" className="gap-1">
                {keyword}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeKeyword("primary", index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Secondary Keywords</CardTitle>
              <CardDescription>Supporting keywords to expand the topic (min 8)</CardDescription>
            </div>
            <Button 
              onClick={() => generateKeywords('secondary')} 
              disabled={generating === 'secondary' || keywords.primary.length === 0}
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {generating === 'secondary' ? "Generating..." : "AI Suggest"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., AI content generator"
              value={secondaryInput}
              onChange={(e) => setSecondaryInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addKeyword("secondary", secondaryInput)}
            />
            <Button onClick={() => addKeyword("secondary", secondaryInput)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.secondary.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {keyword}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeKeyword("secondary", index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Semantic Keywords</CardTitle>
              <CardDescription>Contextually relevant terms (min 8)</CardDescription>
            </div>
            <Button 
              onClick={() => generateKeywords('semantic')} 
              disabled={generating === 'semantic' || keywords.primary.length === 0}
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {generating === 'semantic' ? "Generating..." : "AI Suggest"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., keyword density, search intent"
              value={semanticInput}
              onChange={(e) => setSemanticInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addKeyword("semantic", semanticInput)}
            />
            <Button onClick={() => addKeyword("semantic", semanticInput)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.semantic.map((keyword, index) => (
              <Badge key={index} variant="outline" className="gap-1">
                {keyword}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeKeyword("semantic", index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>LSI Keywords</CardTitle>
              <CardDescription>Latent Semantic Indexing - related terms (min 8)</CardDescription>
            </div>
            <Button 
              onClick={() => generateKeywords('lsi')} 
              disabled={generating === 'lsi' || keywords.primary.length === 0}
              variant="outline"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {generating === 'lsi' ? "Generating..." : "AI Suggest"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., SEO optimization software"
              value={lsiInput}
              onChange={(e) => setLsiInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addKeyword("lsi", lsiInput)}
            />
            <Button onClick={() => addKeyword("lsi", lsiInput)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.lsi.map((keyword, index) => (
              <Badge key={index} variant="outline" className="gap-1">
                {keyword}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeKeyword("lsi", index)}
                />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed} size="lg">
          Next: Meta Tags
        </Button>
      </div>
    </div>
  );
}