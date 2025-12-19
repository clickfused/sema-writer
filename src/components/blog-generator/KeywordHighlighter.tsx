import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Highlighter, Eye, EyeOff } from "lucide-react";

interface KeywordHighlighterProps {
  content: string;
  keywords: {
    primary: string[];
    secondary: string[];
    semantic: string[];
    lsi: string[];
  };
  highlightEnabled: boolean;
  onToggleHighlight: (enabled: boolean) => void;
  activeKeywordTypes: string[];
  onToggleKeywordType: (type: string) => void;
}

interface KeywordMatch {
  keyword: string;
  type: string;
  count: number;
  color: string;
}

export function KeywordHighlighter({
  content,
  keywords,
  highlightEnabled,
  onToggleHighlight,
  activeKeywordTypes,
  onToggleKeywordType
}: KeywordHighlighterProps) {
  const keywordColors = {
    primary: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-300' },
    secondary: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-300' },
    semantic: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-300' },
    lsi: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-300' }
  };

  const keywordStats = useMemo(() => {
    if (!content) return [];
    
    const stats: KeywordMatch[] = [];
    const textContent = content.replace(/<[^>]*>/g, ' ');
    
    const processKeywords = (list: string[], type: string, color: typeof keywordColors.primary) => {
      list.forEach(keyword => {
        if (!keyword) return;
        const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const matches = textContent.match(regex) || [];
        if (matches.length > 0) {
          stats.push({
            keyword,
            type,
            count: matches.length,
            color: color.bg
          });
        }
      });
    };

    processKeywords(keywords.primary, 'primary', keywordColors.primary);
    processKeywords(keywords.secondary, 'secondary', keywordColors.secondary);
    processKeywords(keywords.semantic, 'semantic', keywordColors.semantic);
    processKeywords(keywords.lsi, 'lsi', keywordColors.lsi);

    return stats.sort((a, b) => b.count - a.count);
  }, [content, keywords]);

  const totalKeywords = keywordStats.reduce((sum, k) => sum + k.count, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Highlighter className="h-4 w-4" />
            Keyword Highlighter
          </div>
          <div className="flex items-center gap-2">
            {highlightEnabled ? (
              <Eye className="h-4 w-4 text-primary" />
            ) : (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            )}
            <Switch
              checked={highlightEnabled}
              onCheckedChange={onToggleHighlight}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Keyword Type Toggles */}
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(keywordColors).map(([type, colors]) => {
            const count = keywordStats.filter(k => k.type === type).reduce((sum, k) => sum + k.count, 0);
            const isActive = activeKeywordTypes.includes(type);
            
            return (
              <button
                key={type}
                onClick={() => onToggleKeywordType(type)}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  isActive 
                    ? `${colors.bg} ${colors.border} border-2` 
                    : 'border-border hover:border-muted-foreground/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors.bg.replace('100', '500').replace('/30', '')}`} />
                  <span className={`text-xs font-medium capitalize ${isActive ? colors.text : 'text-muted-foreground'}`}>
                    {type}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs h-5">
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>

        {/* Stats Summary */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Total Keywords Found</span>
          <Badge variant="default">{totalKeywords}</Badge>
        </div>

        {/* Top Keywords */}
        {keywordStats.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Top Keywords</Label>
            <div className="flex flex-wrap gap-1">
              {keywordStats.slice(0, 10).map((stat, i) => (
                <Badge 
                  key={i} 
                  variant="outline"
                  className={`text-xs ${keywordColors[stat.type as keyof typeof keywordColors].bg}`}
                >
                  {stat.keyword} ({stat.count})
                </Badge>
              ))}
            </div>
          </div>
        )}

        {highlightEnabled && (
          <p className="text-xs text-muted-foreground">
            Keywords are highlighted in the editor based on your selection above.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to apply highlights to HTML content
export function applyKeywordHighlights(
  content: string,
  keywords: {
    primary: string[];
    secondary: string[];
    semantic: string[];
    lsi: string[];
  },
  activeTypes: string[]
): string {
  if (!content || activeTypes.length === 0) return content;

  let highlightedContent = content;
  
  const colors = {
    primary: 'background-color: rgba(244, 63, 94, 0.2);',
    secondary: 'background-color: rgba(168, 85, 247, 0.2);',
    semantic: 'background-color: rgba(59, 130, 246, 0.2);',
    lsi: 'background-color: rgba(20, 184, 166, 0.2);'
  };

  const processType = (list: string[], type: string) => {
    if (!activeTypes.includes(type)) return;
    
    list.forEach(keyword => {
      if (!keyword || keyword.length < 2) return;
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(>)([^<]*?)(${escapedKeyword})([^<]*?)(<)`, 'gi');
      highlightedContent = highlightedContent.replace(regex, 
        `$1$2<mark style="${colors[type as keyof typeof colors]}" data-keyword-type="${type}">$3</mark>$4$5`
      );
    });
  };

  processType(keywords.primary, 'primary');
  processType(keywords.secondary, 'secondary');
  processType(keywords.semantic, 'semantic');
  processType(keywords.lsi, 'lsi');

  return highlightedContent;
}
