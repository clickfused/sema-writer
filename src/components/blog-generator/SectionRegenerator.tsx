import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Section {
  type: 'h2' | 'h3' | 'content';
  heading: string;
  content: string;
  startIndex: number;
  endIndex: number;
}

interface SectionRegeneratorProps {
  content: string;
  keywords: {
    primary: string[];
    secondary: string[];
    semantic: string[];
    lsi: string[];
  };
  onContentUpdate: (newContent: string) => void;
  selectedModel: string;
}

export function SectionRegenerator({ 
  content, 
  keywords, 
  onContentUpdate,
  selectedModel
}: SectionRegeneratorProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [regeneratingSection, setRegeneratingSection] = useState<number | null>(null);

  // Parse content into sections
  const parseSections = (): Section[] => {
    if (!content) return [];
    
    const sections: Section[] = [];
    const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
    let match;
    let lastIndex = 0;

    while ((match = h2Regex.exec(content)) !== null) {
      const headingText = match[1].replace(/<[^>]*>/g, '');
      const startIndex = match.index;
      
      // Find the end of this section (next h2 or end of content)
      const nextH2Match = h2Regex.exec(content);
      const endIndex = nextH2Match ? nextH2Match.index : content.length;
      
      // Reset regex position
      h2Regex.lastIndex = match.index + match[0].length;
      
      sections.push({
        type: 'h2',
        heading: headingText,
        content: content.substring(startIndex, endIndex),
        startIndex,
        endIndex
      });
      
      lastIndex = endIndex;
    }

    return sections;
  };

  const sections = parseSections();

  const regenerateSection = async (sectionIndex: number, section: Section) => {
    setRegeneratingSection(sectionIndex);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: {
          keywords,
          metaTags: { title: section.heading },
          headings: { h1: section.heading, h2s: [section.heading], h3s: [] },
          faqContent: [],
          framework: 'HYBRID',
          targetWordCount: 300,
          keywordDensity: 1.5,
          model: selectedModel,
          regenerateSection: true,
          sectionHeading: section.heading
        }
      });

      if (error) throw error;

      // Replace the section content
      const newContent = 
        content.substring(0, section.startIndex) + 
        data.content + 
        content.substring(section.endIndex);
      
      onContentUpdate(newContent);

      toast({
        title: "Section Regenerated",
        description: `"${section.heading}" has been regenerated successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRegeneratingSection(null);
    }
  };

  const getWordCount = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ');
    return text.split(/\s+/).filter(w => w.length > 0).length;
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Section Regenerator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground mb-3">
          Click on any section to regenerate it without affecting the rest of your content.
        </p>
        
        {sections.map((section, index) => (
          <div 
            key={index} 
            className="border rounded-lg overflow-hidden"
          >
            <div 
              className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedSection(expandedSection === index ? null : index)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Badge variant="outline" className="shrink-0">H2</Badge>
                <span className="font-medium text-sm truncate">{section.heading}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-xs">
                  {getWordCount(section.content)} words
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    regenerateSection(index, section);
                  }}
                  disabled={regeneratingSection !== null}
                  className="h-7 w-7 p-0"
                >
                  {regeneratingSection === index ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                </Button>
                {expandedSection === index ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
            
            {expandedSection === index && (
              <div className="p-3 border-t bg-background">
                <div 
                  className="prose prose-sm max-w-none text-muted-foreground text-xs max-h-40 overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: section.content.substring(0, 500) + '...' }}
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => regenerateSection(index, section)}
                    disabled={regeneratingSection !== null}
                    className="flex-1"
                  >
                    {regeneratingSection === index ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Regenerate This Section
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
