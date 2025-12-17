import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Globe, 
  Loader2, 
  FileText, 
  BarChart3, 
  Type, 
  Layout, 
  Save,
  CheckCircle,
  AlertCircle,
  Pencil
} from "lucide-react";

interface AnalysisResult {
  sourceUrl: string;
  analysis: {
    structure: {
      headingPattern: string;
      paragraphAvgWords: number;
      paragraphAvgSentences: number;
      formattingConventions: string[];
      sectionCount: number;
    };
    seo: {
      primaryKeywords: string[];
      keywordDensity: string;
      keywordPlacement: string[];
      internalLinkPattern: string;
      semanticClusters: string[];
    };
    linguistics: {
      tone: string;
      voice: string;
      sentenceComplexity: string;
      transitionPatterns: string[];
      readabilityLevel: string;
    };
    architecture: {
      introPattern: string;
      bodyStructure: string;
      conclusionPattern: string;
      specialElements: string[];
    };
  };
  framework: {
    name: string;
    description: string;
    formula: string;
    system_prompt: string;
  };
  contentMetrics: {
    wordCount: number;
    headingCount: number;
    paragraphCount: number;
    linkCount: number;
    listCount: number;
    imageReferences: number;
  };
}

interface EditableFramework {
  name: string;
  description: string;
  formula: string;
  system_prompt: string;
}

interface BlogAnalyzerProps {
  onFrameworkSaved: () => void;
}

export function BlogAnalyzer({ onFrameworkSaved }: BlogAnalyzerProps) {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [editableFramework, setEditableFramework] = useState<EditableFramework | null>(null);

  // Sync editable framework when result changes
  useEffect(() => {
    if (result?.framework) {
      setEditableFramework({
        name: result.framework.name,
        description: result.framework.description,
        formula: result.framework.formula,
        system_prompt: result.framework.system_prompt,
      });
    } else {
      setEditableFramework(null);
    }
  }, [result]);

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a blog URL to analyze",
        variant: "destructive",
      });
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-blog', {
        body: { url }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      toast({
        title: "Analysis Complete",
        description: "Blog structure and patterns extracted successfully",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze the blog",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveFramework = async () => {
    if (!editableFramework) return;

    if (!editableFramework.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a framework name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('frameworks')
        .insert({
          name: editableFramework.name.trim(),
          description: editableFramework.description.trim(),
          formula: editableFramework.formula.trim(),
          system_prompt: editableFramework.system_prompt.trim(),
          is_active: true,
        });

      if (error) throw error;

      toast({
        title: "Framework Saved",
        description: `"${editableFramework.name}" has been added to your frameworks`,
      });
      
      onFrameworkSaved();
      setResult(null);
      setEditableFramework(null);
      setUrl("");
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateFrameworkField = (field: keyof EditableFramework, value: string) => {
    if (editableFramework) {
      setEditableFramework({ ...editableFramework, [field]: value });
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          Blog Analyzer
        </CardTitle>
        <CardDescription>
          Analyze any blog URL to extract content patterns, SEO signals, and generate a reusable framework
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* URL Input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="blog-url" className="sr-only">Blog URL</Label>
            <Input
              id="blog-url"
              type="url"
              placeholder="https://example.com/blog/article-title"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={analyzing}
            />
          </div>
          <Button onClick={handleAnalyze} disabled={analyzing || !url.trim()}>
            {analyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <Separator />
            
            {/* Metrics Summary */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <MetricCard label="Words" value={result.contentMetrics.wordCount} />
              <MetricCard label="Headings" value={result.contentMetrics.headingCount} />
              <MetricCard label="Paragraphs" value={result.contentMetrics.paragraphCount} />
              <MetricCard label="Links" value={result.contentMetrics.linkCount} />
              <MetricCard label="Lists" value={result.contentMetrics.listCount} />
              <MetricCard label="Images" value={result.contentMetrics.imageReferences} />
            </div>

            {/* Detailed Analysis Tabs */}
            <Tabs defaultValue="structure" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="structure" className="text-xs">
                  <Layout className="h-3 w-3 mr-1" />
                  Structure
                </TabsTrigger>
                <TabsTrigger value="seo" className="text-xs">
                  <BarChart3 className="h-3 w-3 mr-1" />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="linguistics" className="text-xs">
                  <Type className="h-3 w-3 mr-1" />
                  Linguistics
                </TabsTrigger>
                <TabsTrigger value="framework" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  Framework
                </TabsTrigger>
              </TabsList>

              <TabsContent value="structure" className="mt-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4 pr-4">
                    <AnalysisSection title="Heading Pattern">
                      <p className="text-sm text-muted-foreground">{result.analysis.structure.headingPattern}</p>
                    </AnalysisSection>
                    <AnalysisSection title="Paragraph Structure">
                      <p className="text-sm text-muted-foreground">
                        Average {result.analysis.structure.paragraphAvgWords} words / {result.analysis.structure.paragraphAvgSentences} sentences per paragraph
                      </p>
                    </AnalysisSection>
                    <AnalysisSection title="Formatting Conventions">
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.structure.formattingConventions.map((conv, i) => (
                          <Badge key={i} variant="secondary">{conv}</Badge>
                        ))}
                      </div>
                    </AnalysisSection>
                    <AnalysisSection title="Content Architecture">
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p><strong>Intro:</strong> {result.analysis.architecture.introPattern}</p>
                        <p><strong>Body:</strong> {result.analysis.architecture.bodyStructure}</p>
                        <p><strong>Conclusion:</strong> {result.analysis.architecture.conclusionPattern}</p>
                      </div>
                    </AnalysisSection>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="seo" className="mt-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4 pr-4">
                    <AnalysisSection title="Primary Keywords">
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.seo.primaryKeywords.map((kw, i) => (
                          <Badge key={i} variant="default">{kw}</Badge>
                        ))}
                      </div>
                    </AnalysisSection>
                    <AnalysisSection title="Keyword Density">
                      <p className="text-sm text-muted-foreground">{result.analysis.seo.keywordDensity}</p>
                    </AnalysisSection>
                    <AnalysisSection title="Keyword Placement">
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.seo.keywordPlacement.map((place, i) => (
                          <Badge key={i} variant="outline">{place}</Badge>
                        ))}
                      </div>
                    </AnalysisSection>
                    <AnalysisSection title="Internal Link Pattern">
                      <p className="text-sm text-muted-foreground">{result.analysis.seo.internalLinkPattern}</p>
                    </AnalysisSection>
                    <AnalysisSection title="Semantic Clusters">
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.seo.semanticClusters.map((cluster, i) => (
                          <Badge key={i} variant="secondary">{cluster}</Badge>
                        ))}
                      </div>
                    </AnalysisSection>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="linguistics" className="mt-4">
                <ScrollArea className="h-[300px]">
                  <div className="space-y-4 pr-4">
                    <AnalysisSection title="Tone">
                      <Badge variant="default" className="text-sm">{result.analysis.linguistics.tone}</Badge>
                    </AnalysisSection>
                    <AnalysisSection title="Voice">
                      <p className="text-sm text-muted-foreground">{result.analysis.linguistics.voice}</p>
                    </AnalysisSection>
                    <AnalysisSection title="Sentence Complexity">
                      <p className="text-sm text-muted-foreground">{result.analysis.linguistics.sentenceComplexity}</p>
                    </AnalysisSection>
                    <AnalysisSection title="Readability Level">
                      <Badge variant="outline">{result.analysis.linguistics.readabilityLevel}</Badge>
                    </AnalysisSection>
                    <AnalysisSection title="Transition Patterns">
                      <div className="flex flex-wrap gap-2">
                        {result.analysis.linguistics.transitionPatterns.map((trans, i) => (
                          <Badge key={i} variant="secondary">{trans}</Badge>
                        ))}
                      </div>
                    </AnalysisSection>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="framework" className="mt-4">
                <ScrollArea className="h-[400px]">
                  {editableFramework && (
                    <div className="space-y-4 pr-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Pencil className="h-4 w-4" />
                        Edit the generated framework before saving
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="framework-name">Name</Label>
                        <Input
                          id="framework-name"
                          value={editableFramework.name}
                          onChange={(e) => updateFrameworkField('name', e.target.value)}
                          placeholder="Framework name"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="framework-description">Description</Label>
                        <Textarea
                          id="framework-description"
                          value={editableFramework.description}
                          onChange={(e) => updateFrameworkField('description', e.target.value)}
                          placeholder="Framework description"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="framework-formula">Formula</Label>
                        <Textarea
                          id="framework-formula"
                          value={editableFramework.formula}
                          onChange={(e) => updateFrameworkField('formula', e.target.value)}
                          placeholder="Content formula pattern"
                          rows={3}
                          className="font-mono text-xs"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="framework-prompt">System Prompt</Label>
                        <Textarea
                          id="framework-prompt"
                          value={editableFramework.system_prompt}
                          onChange={(e) => updateFrameworkField('system_prompt', e.target.value)}
                          placeholder="System prompt for content generation"
                          rows={6}
                          className="text-xs"
                        />
                      </div>

                      <Button onClick={handleSaveFramework} disabled={saving} className="w-full">
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Save Framework
                      </Button>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-3 bg-muted/50 rounded-lg text-center">
      <p className="text-2xl font-bold">{value.toLocaleString()}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function AnalysisSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      {children}
    </div>
  );
}
