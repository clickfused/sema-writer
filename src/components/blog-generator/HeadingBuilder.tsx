import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HeadingBuilderProps {
  keywords: {
    primary: string[];
    secondary: string[];
    semantic: string[];
    lsi: string[];
  };
  headings: {
    h1: string;
    h2s: string[];
    h3s: Array<{ h2Index: number; text: string }>;
  };
  setHeadings: (headings: any) => void;
  onNext: () => void;
}

export function HeadingBuilder({ keywords, headings, setHeadings, onNext }: HeadingBuilderProps) {
  const [h1Input, setH1Input] = useState("");
  const [h2Input, setH2Input] = useState("");
  const [h3Input, setH3Input] = useState("");
  const [selectedH2Index, setSelectedH2Index] = useState(0);
  const [generating, setGenerating] = useState(false);

  const generateHeadings = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-headings", {
        body: { keywords },
      });

      if (error) throw error;

      setHeadings({
        h1: data.h1,
        h2s: data.h2s,
        h3s: data.h3s,
      });

      toast({
        title: "Success",
        description: "Headings generated successfully",
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

  const addH2 = () => {
    if (h2Input.trim()) {
      setHeadings({
        ...headings,
        h2s: [...headings.h2s, h2Input.trim()],
      });
      setH2Input("");
    }
  };

  const addH3 = () => {
    if (h3Input.trim()) {
      setHeadings({
        ...headings,
        h3s: [...headings.h3s, { h2Index: selectedH2Index, text: h3Input.trim() }],
      });
      setH3Input("");
    }
  };

  const removeH2 = (index: number) => {
    setHeadings({
      ...headings,
      h2s: headings.h2s.filter((_, i) => i !== index),
      h3s: headings.h3s.filter((h3) => h3.h2Index !== index),
    });
  };

  const removeH3 = (index: number) => {
    setHeadings({
      ...headings,
      h3s: headings.h3s.filter((_, i) => i !== index),
    });
  };

  const canProceed = headings.h1 && headings.h2s.length >= 10;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader className="pb-3 sm:pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">Heading Structure</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Build a well-structured content hierarchy</CardDescription>
            </div>
            <Button onClick={generateHeadings} disabled={generating || keywords.primary.length === 0} size="sm" className="w-full sm:w-auto">
              <Sparkles className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "AI Generate"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="h1" className="text-sm sm:text-base">H1 Title</Label>
            <Input
              id="h1"
              value={headings.h1}
              onChange={(e) => setHeadings({ ...headings, h1: e.target.value })}
              placeholder="Main article title"
              className="text-sm sm:text-base"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm sm:text-base">H2 Headings (Minimum 10)</Label>
            <div className="flex gap-2">
              <Input
                value={h2Input}
                onChange={(e) => setH2Input(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addH2()}
                placeholder="Add H2 heading"
                className="text-sm sm:text-base"
              />
              <Button onClick={addH2} size="sm" className="flex-shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {headings.h2s.map((h2, index) => (
                <Badge key={index} className="gap-1 text-xs">
                  <span className="max-w-[200px] sm:max-w-none truncate">{h2}</span>
                  <X
                    className="h-3 w-3 cursor-pointer flex-shrink-0"
                    onClick={() => removeH2(index)}
                  />
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{headings.h2s.length} H2 headings added</p>
          </div>

          {headings.h2s.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm sm:text-base">H3 Subheadings (Minimum 5 per H2)</Label>
              <div className="space-y-2">
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={selectedH2Index}
                  onChange={(e) => setSelectedH2Index(Number(e.target.value))}
                >
                  {headings.h2s.map((h2, index) => (
                    <option key={index} value={index}>
                      {h2}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Input
                    value={h3Input}
                    onChange={(e) => setH3Input(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addH3()}
                    placeholder="Add H3 subheading"
                    className="text-sm sm:text-base"
                  />
                  <Button onClick={addH3} size="sm" className="flex-shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                {headings.h2s.map((h2, h2Index) => {
                  const h3sForThisH2 = headings.h3s.filter((h3) => h3.h2Index === h2Index);
                  if (h3sForThisH2.length === 0) return null;
                  return (
                    <div key={h2Index} className="border rounded-md p-3">
                      <p className="font-medium text-xs sm:text-sm mb-2 line-clamp-2">{h2}</p>
                      <div className="flex flex-wrap gap-2">
                        {h3sForThisH2.map((h3, index) => (
                          <Badge key={index} variant="outline" className="gap-1 text-xs">
                            <span className="max-w-[150px] sm:max-w-none truncate">{h3.text}</span>
                            <X
                              className="h-3 w-3 cursor-pointer flex-shrink-0"
                              onClick={() => removeH3(headings.h3s.indexOf(h3))}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed} size="lg" className="w-full sm:w-auto">
          Next: Content
        </Button>
      </div>
    </div>
  );
}