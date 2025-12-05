import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, AlertTriangle, CheckCircle, TrendingUp, Wand2 } from "lucide-react";

interface ContentSuggestionsProps {
  content: string;
  keywords?: {
    primary?: string[];
    secondary?: string[];
    semantic?: string[];
    lsi?: string[];
  };
  onOptimize?: () => void;
  isOptimizing?: boolean;
}

interface Suggestion {
  type: "warning" | "tip" | "success" | "improvement";
  category: string;
  message: string;
  priority: "high" | "medium" | "low";
}

export const ContentSuggestions = ({ content, keywords, onOptimize, isOptimizing }: ContentSuggestionsProps) => {
  const suggestions = useMemo(() => {
    const tips: Suggestion[] = [];
    const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = content.split(/<\/p>/i).filter(p => p.trim().length > 0);

    // Word count suggestions
    if (wordCount < 300) {
      tips.push({
        type: "warning",
        category: "Length",
        message: "Content is too short. Aim for at least 1500 words for comprehensive SEO coverage.",
        priority: "high"
      });
    } else if (wordCount < 1000) {
      tips.push({
        type: "tip",
        category: "Length",
        message: `Good start! Add ${1500 - wordCount} more words to reach the recommended 1500+ word count.`,
        priority: "medium"
      });
    } else if (wordCount >= 1500) {
      tips.push({
        type: "success",
        category: "Length",
        message: "Excellent word count for SEO! Your content has sufficient depth.",
        priority: "low"
      });
    }

    // Heading structure
    const h2Count = (content.match(/<h2/gi) || []).length;
    const h3Count = (content.match(/<h3/gi) || []).length;
    
    if (h2Count === 0 && wordCount > 300) {
      tips.push({
        type: "warning",
        category: "Structure",
        message: "Add H2 headings to break up content and improve scannability.",
        priority: "high"
      });
    }
    
    if (h3Count === 0 && wordCount > 500) {
      tips.push({
        type: "tip",
        category: "Structure",
        message: "Consider adding H3 subheadings for better content hierarchy.",
        priority: "medium"
      });
    }

    // Paragraph length analysis
    const longParagraphs = paragraphs.filter(p => {
      const pText = p.replace(/<[^>]*>/g, " ").trim();
      const pWords = pText.split(/\s+/).filter(Boolean);
      return pWords.length > 50;
    });

    if (longParagraphs.length > 0) {
      tips.push({
        type: "warning",
        category: "Readability",
        message: `${longParagraphs.length} paragraph(s) exceed 50 words. Split into 30-word chunks for better readability.`,
        priority: "high"
      });
    }

    // Sentence variety
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;
    
    if (avgSentenceLength > 25) {
      tips.push({
        type: "tip",
        category: "Readability",
        message: "Sentences are quite long. Mix in shorter sentences for better rhythm.",
        priority: "medium"
      });
    }

    // Bullet/list usage
    const hasBullets = /<ul|<ol/i.test(content);
    if (!hasBullets && wordCount > 500) {
      tips.push({
        type: "improvement",
        category: "Engagement",
        message: "Add bullet points or numbered lists to highlight key information.",
        priority: "medium"
      });
    }

    // Internal linking
    const linkCount = (content.match(/<a /gi) || []).length;
    if (linkCount === 0 && wordCount > 300) {
      tips.push({
        type: "tip",
        category: "SEO",
        message: "Add internal or external links to boost authority and user navigation.",
        priority: "medium"
      });
    }

    // Keyword usage
    if (keywords?.primary && keywords.primary.length > 0) {
      const primaryKeyword = keywords.primary[0].toLowerCase();
      const keywordCount = (text.toLowerCase().match(new RegExp(primaryKeyword, "gi")) || []).length;
      const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;

      if (density < 0.5 && wordCount > 200) {
        tips.push({
          type: "warning",
          category: "Keywords",
          message: `Primary keyword "${keywords.primary[0]}" appears rarely. Increase usage naturally.`,
          priority: "high"
        });
      } else if (density > 3) {
        tips.push({
          type: "warning",
          category: "Keywords",
          message: `Primary keyword density too high (${density.toFixed(1)}%). Reduce to avoid keyword stuffing.`,
          priority: "high"
        });
      }
    }

    // Opening hook
    if (sentences.length > 0) {
      const firstSentence = sentences[0].trim();
      const weakOpeners = ["this article", "in this blog", "this post", "today we"];
      const hasWeakOpener = weakOpeners.some(w => firstSentence.toLowerCase().includes(w));
      
      if (hasWeakOpener) {
        tips.push({
          type: "tip",
          category: "Engagement",
          message: "Start with a stronger hook. Avoid generic openers like 'In this article...'",
          priority: "medium"
        });
      }
    }

    // Call-to-action
    const ctaPatterns = /contact|call|get started|sign up|learn more|try now|book|schedule/i;
    if (!ctaPatterns.test(text) && wordCount > 500) {
      tips.push({
        type: "improvement",
        category: "Conversion",
        message: "Add a clear call-to-action to guide readers toward next steps.",
        priority: "low"
      });
    }

    // Bold/emphasis usage
    const strongCount = (content.match(/<strong|<b>/gi) || []).length;
    if (strongCount === 0 && wordCount > 300) {
      tips.push({
        type: "tip",
        category: "Formatting",
        message: "Use bold text to emphasize key points and improve scannability.",
        priority: "low"
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return tips.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [content, keywords]);

  const getIcon = (type: Suggestion["type"]) => {
    switch (type) {
      case "warning": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "tip": return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "improvement": return <TrendingUp className="h-4 w-4 text-primary" />;
    }
  };

  const getPriorityColor = (priority: Suggestion["priority"]) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "secondary";
      case "low": return "outline";
    }
  };

  if (!content || content.length < 10) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Content Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Start writing to see improvement suggestions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          Content Suggestions
          <Badge variant="secondary" className="ml-2">{suggestions.length} tips</Badge>
          {onOptimize && suggestions.filter(s => s.priority === 'high').length > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={onOptimize}
              disabled={isOptimizing}
              className="ml-auto h-7 text-xs"
            >
              <Wand2 className="h-3 w-3 mr-1" />
              {isOptimizing ? "Optimizing..." : "Fix All"}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[300px] overflow-y-auto">
        {suggestions.length === 0 ? (
          <p className="text-sm text-green-600">Great job! No improvements needed.</p>
        ) : (
          suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-2 rounded-md bg-muted/50">
              {getIcon(suggestion.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">{suggestion.category}</span>
                  <Badge variant={getPriorityColor(suggestion.priority)} className="text-xs h-5">
                    {suggestion.priority}
                  </Badge>
                </div>
                <p className="text-sm">{suggestion.message}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
