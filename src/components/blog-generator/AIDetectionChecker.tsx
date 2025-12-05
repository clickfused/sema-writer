import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot, CheckCircle2, AlertTriangle, XCircle, Wand2 } from "lucide-react";

interface AIDetectionCheckerProps {
  content: string;
  aiScore?: number | null;
  onOptimize?: () => void;
  isOptimizing?: boolean;
}

interface PatternAnalysis {
  pattern: string;
  count: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export function AIDetectionChecker({ content, aiScore, onOptimize, isOptimizing }: AIDetectionCheckerProps) {
  const analysis = useMemo(() => {
    if (!content || content.trim().length === 0) return null;

    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = plainText.split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;
    if (totalWords < 50) return null;

    const patterns: PatternAnalysis[] = [];

    // Check for AI-typical phrases
    const aiPhrases = [
      { phrase: /in today's (world|age|era|society)/gi, severity: 'high' as const, desc: '"In today\'s world" opener' },
      { phrase: /it's (important|crucial|essential) to (note|understand|remember)/gi, severity: 'high' as const, desc: 'Filler importance phrases' },
      { phrase: /in (conclusion|summary),?/gi, severity: 'medium' as const, desc: 'Generic conclusion phrases' },
      { phrase: /let's (dive|delve|explore) (into|deeper)/gi, severity: 'high' as const, desc: '"Let\'s dive in" phrases' },
      { phrase: /furthermore,|moreover,|additionally,/gi, severity: 'medium' as const, desc: 'Overused transition words' },
      { phrase: /it (is|was) worth (noting|mentioning)/gi, severity: 'medium' as const, desc: 'Worth noting phrases' },
      { phrase: /this (article|post|guide) will (explore|discuss|cover)/gi, severity: 'high' as const, desc: 'Meta self-reference' },
      { phrase: /plays a (crucial|vital|key|important) role/gi, severity: 'medium' as const, desc: '"Plays a role" patterns' },
      { phrase: /a wide (range|variety) of/gi, severity: 'low' as const, desc: 'Generic variety phrases' },
      { phrase: /the (world|landscape|realm) of/gi, severity: 'medium' as const, desc: '"The world of" patterns' },
      { phrase: /at the end of the day/gi, severity: 'high' as const, desc: 'Cliché phrases' },
      { phrase: /when it comes to/gi, severity: 'medium' as const, desc: '"When it comes to" pattern' },
      { phrase: /first and foremost/gi, severity: 'medium' as const, desc: 'Redundant emphasis' },
      { phrase: /\bin order to\b/gi, severity: 'low' as const, desc: '"In order to" (use "to")' },
      { phrase: /that being said/gi, severity: 'medium' as const, desc: '"That being said" transition' },
    ];

    aiPhrases.forEach(({ phrase, severity, desc }) => {
      const matches = plainText.match(phrase) || [];
      if (matches.length > 0) {
        patterns.push({
          pattern: matches[0],
          count: matches.length,
          severity,
          description: desc
        });
      }
    });

    // Check for repetitive sentence structure
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const sentenceStarters = sentences.map(s => {
      const words = s.trim().split(/\s+/).slice(0, 3).join(' ').toLowerCase();
      return words;
    });
    
    const starterCounts = sentenceStarters.reduce((acc, starter) => {
      acc[starter] = (acc[starter] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const repetitiveStarters = Object.entries(starterCounts)
      .filter(([_, count]) => count >= 3)
      .length;

    if (repetitiveStarters > 2) {
      patterns.push({
        pattern: 'Repetitive sentence starts',
        count: repetitiveStarters,
        severity: 'high',
        description: 'Multiple sentences start the same way'
      });
    }

    // Check for uniform sentence length
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev < 5 && sentences.length > 5) {
      patterns.push({
        pattern: 'Uniform sentence length',
        count: 1,
        severity: 'medium',
        description: `Low variation in sentence length (std: ${stdDev.toFixed(1)})`
      });
    }

    // Check for lack of contractions (AI tends to avoid them)
    const contractions = (plainText.match(/\b(can't|won't|don't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|wouldn't|couldn't|shouldn't|didn't|it's|that's|there's|here's|what's|who's|he's|she's|we're|they're|you're|I'm|I've|I'll|I'd)\b/gi) || []).length;
    const contractionRatio = (contractions / totalWords) * 100;

    if (contractionRatio < 0.5 && totalWords > 200) {
      patterns.push({
        pattern: 'Lack of contractions',
        count: contractions,
        severity: 'medium',
        description: 'Very few contractions (AI tends to avoid them)'
      });
    }

    // Calculate estimated AI score based on patterns
    let estimatedScore = 15; // Base score
    patterns.forEach(p => {
      if (p.severity === 'high') estimatedScore += 8 * p.count;
      if (p.severity === 'medium') estimatedScore += 4 * p.count;
      if (p.severity === 'low') estimatedScore += 2 * p.count;
    });
    estimatedScore = Math.min(Math.max(estimatedScore, 0), 100);

    return {
      patterns,
      estimatedScore: aiScore ?? estimatedScore,
      contractionRatio,
      sentenceVariation: stdDev,
      totalPatterns: patterns.length,
      highSeverity: patterns.filter(p => p.severity === 'high').length,
      mediumSeverity: patterns.filter(p => p.severity === 'medium').length,
      lowSeverity: patterns.filter(p => p.severity === 'low').length,
    };
  }, [content, aiScore]);

  const getScoreColor = (score: number) => {
    if (score <= 20) return "text-green-500";
    if (score <= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreBadge = (score: number) => {
    if (score <= 20) return "default";
    if (score <= 40) return "secondary";
    return "destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score <= 20) return "Human-like";
    if (score <= 40) return "Mixed Signals";
    return "AI Detected";
  };

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high': return <XCircle className="h-3 w-3 text-red-500" />;
      case 'medium': return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
      case 'low': return <CheckCircle2 className="h-3 w-3 text-blue-500" />;
    }
  };

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Detection Checker
          </CardTitle>
          <CardDescription>Generate content to analyze AI patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Bot className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No content generated yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            AI Detection Checker
          </span>
          <div className="flex items-center gap-2">
            <Badge variant={getScoreBadge(analysis.estimatedScore)}>
              {getScoreLabel(analysis.estimatedScore)}
            </Badge>
            {onOptimize && analysis.estimatedScore > 20 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onOptimize}
                disabled={isOptimizing}
                className="h-7 text-xs"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                {isOptimizing ? "Optimizing..." : "Humanize"}
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Estimated AI Score: {analysis.estimatedScore}% • Target: &lt;20%
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* AI Score Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">AI Detection Probability</span>
            <span className={getScoreColor(analysis.estimatedScore)}>
              {analysis.estimatedScore}%
            </span>
          </div>
          <Progress 
            value={analysis.estimatedScore} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="text-green-500">Human (0-20%)</span>
            <span className="text-yellow-500">Mixed (20-40%)</span>
            <span className="text-red-500">AI (40-100%)</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Pattern Summary */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-md border border-red-200 bg-red-50 dark:bg-red-950/20">
            <p className="text-lg font-bold text-red-500">{analysis.highSeverity}</p>
            <p className="text-xs text-muted-foreground">High Risk</p>
          </div>
          <div className="p-2 rounded-md border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
            <p className="text-lg font-bold text-yellow-500">{analysis.mediumSeverity}</p>
            <p className="text-xs text-muted-foreground">Medium Risk</p>
          </div>
          <div className="p-2 rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <p className="text-lg font-bold text-blue-500">{analysis.lowSeverity}</p>
            <p className="text-xs text-muted-foreground">Low Risk</p>
          </div>
        </div>

        {/* Detected Patterns */}
        {analysis.patterns.length > 0 && (
          <>
            <div className="h-px bg-border" />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Detected AI Patterns</h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {analysis.patterns.slice(0, 8).map((pattern, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/50"
                  >
                    <span className="flex items-center gap-2">
                      {getSeverityIcon(pattern.severity)}
                      <span className="text-muted-foreground">{pattern.description}</span>
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {pattern.count}×
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Quick Stats */}
        <div className="h-px bg-border" />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Contractions Used</span>
            <Badge variant="outline">
              {analysis.contractionRatio.toFixed(1)}%
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Sentence Variation</span>
            <Badge variant="outline">
              {analysis.sentenceVariation.toFixed(1)} std
            </Badge>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-3 rounded-md bg-muted/50">
          <p className="text-xs text-muted-foreground">
            {analysis.estimatedScore <= 20 && (
              <>✅ <strong>Excellent!</strong> Content appears human-written with natural variation and authentic voice.</>
            )}
            {analysis.estimatedScore > 20 && analysis.estimatedScore <= 40 && (
              <>💡 <strong>Tip:</strong> Add more contractions, vary sentence structure, and avoid cliché phrases to improve human-likeness.</>
            )}
            {analysis.estimatedScore > 40 && (
              <>⚠️ <strong>Warning:</strong> High AI patterns detected. Use the "Humanize Content" button to reduce AI signals.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
