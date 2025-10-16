import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

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
          <CardTitle>Secondary Keywords</CardTitle>
          <CardDescription>Supporting keywords to expand the topic</CardDescription>
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
          <CardTitle>Semantic Keywords</CardTitle>
          <CardDescription>Contextually relevant terms</CardDescription>
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
          <CardTitle>LSI Keywords</CardTitle>
          <CardDescription>Latent Semantic Indexing - related terms</CardDescription>
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