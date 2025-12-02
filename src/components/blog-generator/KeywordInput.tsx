import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles, Target, Lightbulb } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserIntent {
  primaryIntent: string;
  intentSignals: string[];
  searcherGoal: string;
  contentAngle: string;
}

interface KeywordInputProps {
  keywords: {
    primary: string[];
    secondary: string[];
    semantic: string[];
    lsi: string[];
    conversational?: string[];
    related?: string[];
    longTail?: string[];
    autoSuggestions?: string[];
  };
  setKeywords: (keywords: any) => void;
  userIntent: UserIntent | null;
  setUserIntent: (intent: UserIntent | null) => void;
  contextContent?: string;
  onNext: () => void;
}

export function KeywordInput({ keywords, setKeywords, userIntent, setUserIntent, contextContent, onNext }: KeywordInputProps) {
  const [primaryInput, setPrimaryInput] = useState("");
  const [secondaryInput, setSecondaryInput] = useState("");
  const [semanticInput, setSemanticInput] = useState("");
  const [lsiInput, setLsiInput] = useState("");
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatingAll, setGeneratingAll] = useState(false);

  const addKeyword = (type: keyof typeof keywords, value: string) => {
    if (value.trim()) {
      setKeywords({
        ...keywords,
        [type]: [...(keywords[type] || []), value.trim()],
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
      [type]: (keywords[type] || []).filter((_: string, i: number) => i !== index),
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

  const generateAllKeywords = async () => {
    if (keywords.primary.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one primary keyword first",
        variant: "destructive",
      });
      return;
    }

    setGeneratingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-keywords", {
        body: { 
          primaryKeywords: keywords.primary,
          topic: keywords.primary.join(", "),
          contextContent: contextContent || undefined
        },
      });

      if (error) throw error;

      // Update all keyword types from the response
      setKeywords({
        primary: data.primary || keywords.primary,
        secondary: data.secondary || [],
        semantic: data.semantic || [],
        lsi: data.lsi || [],
        conversational: data.conversational || [],
        related: data.related || [],
        longTail: data.longTail || [],
        autoSuggestions: data.autoSuggestions || [],
      });

      // Set user intent from response
      if (data.userIntent) {
        setUserIntent(data.userIntent);
      }

      toast({
        title: "Success",
        description: "Full keyword matrix generated with user intent analysis",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingAll(false);
    }
  };

  const canProceed = keywords.primary.length > 0;

  return (
    <div className="space-y-6">
      {/* User Intent Display */}
      {userIntent && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">User Intent Analysis</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Primary Intent</p>
                <Badge variant="default" className="mt-1">{userIntent.primaryIntent}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Searcher Goal</p>
                <p className="text-sm mt-1">{userIntent.searcherGoal}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Content Angle</p>
              <p className="text-sm mt-1">{userIntent.contentAngle}</p>
            </div>
            {userIntent.intentSignals.length > 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Intent Signals</p>
                <div className="flex flex-wrap gap-1">
                  {userIntent.intentSignals.map((signal, index) => (
                    <Badge key={index} variant="outline" className="text-xs">{signal}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Primary Keywords</CardTitle>
              <CardDescription>Main focus keyword for your blog post (at least 1 required)</CardDescription>
            </div>
            <Button 
              onClick={generateAllKeywords} 
              disabled={generatingAll || keywords.primary.length === 0}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              {generatingAll ? "Analyzing..." : "Generate All + Intent"}
            </Button>
          </div>
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

      {/* Auto Suggestions */}
      {keywords.autoSuggestions && keywords.autoSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <div>
                <CardTitle>Auto Suggestions</CardTitle>
                <CardDescription>AI-generated keyword suggestions based on your topic</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {keywords.autoSuggestions.map((keyword, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="gap-1 cursor-pointer hover:bg-primary/10"
                  onClick={() => addKeyword("secondary", keyword)}
                >
                  <Plus className="h-3 w-3" />
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Related & Long-tail Keywords */}
      {((keywords.related && keywords.related.length > 0) || (keywords.longTail && keywords.longTail.length > 0)) && (
        <Card>
          <CardHeader>
            <CardTitle>Related & Long-tail Keywords</CardTitle>
            <CardDescription>Click to add to secondary keywords</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {keywords.related && keywords.related.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Related Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {keywords.related.map((keyword, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="gap-1 cursor-pointer hover:bg-primary/10"
                      onClick={() => addKeyword("secondary", keyword)}
                    >
                      <Plus className="h-3 w-3" />
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {keywords.longTail && keywords.longTail.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Long-tail Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {keywords.longTail.map((keyword, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="gap-1 cursor-pointer hover:bg-primary/10"
                      onClick={() => addKeyword("lsi", keyword)}
                    >
                      <Plus className="h-3 w-3" />
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed} size="lg">
          Next: Headings
        </Button>
      </div>
    </div>
  );
}
