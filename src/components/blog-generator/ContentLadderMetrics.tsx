import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  TrendingUp, 
  Sparkles, 
  Target, 
  Layers, 
  Brain,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle
} from "lucide-react";

export interface ContentLadderMetrics {
  distanceScore: number;
  realnessScore: number;
  semanticDepth: number;
  queryLadderScore: number;
  llmoScore: number;
}

interface ContentLadderMetricsProps {
  content: string;
  keywords?: {
    primary: string[];
    secondary: string[];
    semantic: string[];
    lsi: string[];
  };
  serverMetrics?: ContentLadderMetrics | null;
}

// AI patterns to detect
const AI_PATTERNS = [
  'in today\'s world', 'in the ever-evolving', 'furthermore', 'moreover',
  'additionally', 'it is important to note', 'in conclusion',
  'incredibly important', 'absolutely essential', 'extremely vital',
  'it\'s worth noting', 'at the end of the day', 'in this day and age',
  'needless to say', 'as we all know', 'without a doubt'
];

// Human-like patterns to detect
const HUMAN_PATTERNS = [
  'i\'ve', 'i\'m', 'you\'ll', 'here\'s', 'that\'s', 'don\'t', 'can\'t',
  'let me', 'honestly', 'frankly', 'the truth is', 'here\'s the deal',
  'look,', 'listen,', 'so,', 'well,', 'actually,', 'basically,'
];

// Query patterns for ladder coverage
const QUERY_PATTERNS = [
  { pattern: 'what is', level: 'Core SEO' },
  { pattern: 'how does', level: 'Core SEO' },
  { pattern: 'explain', level: 'Conversational' },
  { pattern: 'help me understand', level: 'Conversational' },
  { pattern: 'best practices', level: 'Long-tail' },
  { pattern: 'common mistakes', level: 'Long-tail' },
  { pattern: ' vs ', level: 'Comparison' },
  { pattern: 'compared to', level: 'Comparison' },
  { pattern: 'when to use', level: 'Comparison' }
];

function calculateLocalMetrics(content: string, keywords?: any): ContentLadderMetrics {
  const text = content.toLowerCase();
  
  // Distance Score: Check for AI pattern avoidance
  const aiPatternMatches = AI_PATTERNS.filter(p => text.includes(p)).length;
  const distanceScore = Math.max(0, Math.min(100, 100 - (aiPatternMatches * 12)));
  
  // Realness Score: Check for human-like patterns
  const humanPatternMatches = HUMAN_PATTERNS.filter(p => text.includes(p)).length;
  const realnessScore = Math.min(100, Math.max(0, 40 + (humanPatternMatches * 10)));
  
  // Semantic Depth: Check keyword variations coverage
  const allKeywords = [
    ...(keywords?.primary || []),
    ...(keywords?.secondary || []),
    ...(keywords?.semantic || []),
    ...(keywords?.lsi || [])
  ];
  const keywordsFound = allKeywords.filter((kw: string) => 
    text.includes(kw.toLowerCase())
  ).length;
  const semanticDepth = allKeywords.length > 0 
    ? Math.min(100, Math.round((keywordsFound / allKeywords.length) * 100))
    : 50;
  
  // Query Ladder Score: Check for question patterns
  const questionMatches = QUERY_PATTERNS.filter(p => text.includes(p.pattern)).length;
  const queryLadderScore = Math.min(100, Math.max(0, 30 + (questionMatches * 12)));
  
  // Overall LLMO Score
  const llmoScore = Math.round(
    (distanceScore * 0.25) + 
    (realnessScore * 0.25) + 
    (semanticDepth * 0.25) + 
    (queryLadderScore * 0.25)
  );
  
  return {
    distanceScore,
    realnessScore,
    semanticDepth,
    queryLadderScore,
    llmoScore
  };
}

function getScoreStatus(score: number): { color: string; icon: React.ReactNode; label: string } {
  if (score >= 80) {
    return { color: 'text-green-500', icon: <CheckCircle className="h-4 w-4" />, label: 'Excellent' };
  } else if (score >= 60) {
    return { color: 'text-yellow-500', icon: <AlertTriangle className="h-4 w-4" />, label: 'Good' };
  } else {
    return { color: 'text-red-500', icon: <XCircle className="h-4 w-4" />, label: 'Needs Work' };
  }
}

function getOptimizationTip(metric: string, score: number): string {
  if (metric === 'distance' && score < 80) {
    return "Avoid generic AI phrases like 'In today's world', 'Furthermore', 'It is important to note'. Use more specific, unique language.";
  }
  if (metric === 'realness' && score < 80) {
    return "Add contractions (I've, you'll, don't), conversational asides, and personal observations to sound more human.";
  }
  if (metric === 'semantic' && score < 80) {
    return "Integrate more of your target keywords naturally throughout the content, especially secondary and LSI keywords.";
  }
  if (metric === 'queryLadder' && score < 80) {
    return "Cover more query types: add 'what is', 'how to', 'vs' comparisons, and 'best practices' sections.";
  }
  return "Great score! Keep up the excellent optimization.";
}

export function ContentLadderMetrics({ content, keywords, serverMetrics }: ContentLadderMetricsProps) {
  const [metrics, setMetrics] = useState<ContentLadderMetrics>({
    distanceScore: 0,
    realnessScore: 0,
    semanticDepth: 0,
    queryLadderScore: 0,
    llmoScore: 0
  });

  useEffect(() => {
    if (serverMetrics) {
      setMetrics(serverMetrics);
    } else if (content && content.length > 100) {
      const localMetrics = calculateLocalMetrics(content, keywords);
      setMetrics(localMetrics);
    }
  }, [content, keywords, serverMetrics]);

  const metricItems = [
    {
      key: 'distance',
      label: 'Distance Score',
      description: 'How far from generic AI patterns',
      value: metrics.distanceScore,
      target: 85,
      icon: <Target className="h-4 w-4" />
    },
    {
      key: 'realness',
      label: 'Realness Score',
      description: 'Human authenticity signals',
      value: metrics.realnessScore,
      target: 90,
      icon: <Sparkles className="h-4 w-4" />
    },
    {
      key: 'semantic',
      label: 'Semantic Depth',
      description: 'Keyword variation coverage',
      value: metrics.semanticDepth,
      target: 80,
      icon: <Layers className="h-4 w-4" />
    },
    {
      key: 'queryLadder',
      label: 'Query Ladder',
      description: 'Multi-intent query coverage',
      value: metrics.queryLadderScore,
      target: 75,
      icon: <TrendingUp className="h-4 w-4" />
    }
  ];

  const overallStatus = getScoreStatus(metrics.llmoScore);

  if (!content || content.length < 100) {
    return (
      <Card className="opacity-60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Content Ladder Metrics
          </CardTitle>
          <CardDescription className="text-xs">
            Generate content to see LLMO optimization scores
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                Content Ladder Metrics
              </CardTitle>
              <CardDescription className="text-xs">
                LLMO optimization for AI search engines
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={metrics.llmoScore >= 75 ? "default" : metrics.llmoScore >= 50 ? "secondary" : "destructive"}
                className="text-lg px-3 py-1"
              >
                {metrics.llmoScore}
              </Badge>
              <span className={`${overallStatus.color}`}>
                {overallStatus.icon}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {metricItems.map((item) => {
            const status = getScoreStatus(item.value);
            const tip = getOptimizationTip(item.key, item.value);
            
            return (
              <div key={item.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <p className="font-medium mb-1">{item.description}</p>
                        <p className="text-xs text-muted-foreground">{tip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-sm ${status.color}`}>
                      {item.value}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      / {item.target}
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <Progress 
                    value={item.value} 
                    className="h-2"
                  />
                  {/* Target marker */}
                  <div 
                    className="absolute top-0 w-0.5 h-2 bg-foreground/50"
                    style={{ left: `${item.target}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* Quick Tips */}
          {metrics.llmoScore < 75 && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium mb-2">Quick Optimization Tips:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                {metrics.distanceScore < 80 && (
                  <li>• Remove generic AI phrases for better distance score</li>
                )}
                {metrics.realnessScore < 80 && (
                  <li>• Add contractions and conversational language</li>
                )}
                {metrics.semanticDepth < 80 && (
                  <li>• Include more keyword variations naturally</li>
                )}
                {metrics.queryLadderScore < 75 && (
                  <li>• Cover different query types (how-to, comparisons)</li>
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
