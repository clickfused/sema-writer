import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, AlignLeft, Type, CheckCircle2, AlertTriangle, XCircle, Wand2 } from "lucide-react";

interface ReadabilityAnalyzerProps {
  content: string;
  onOptimize?: () => void;
  isOptimizing?: boolean;
}

interface ReadabilityMetrics {
  fleschReadingEase: number;
  fleschGrade: string;
  avgWordsPerParagraph: number;
  avgWordsPerSentence: number;
  totalParagraphs: number;
  totalSentences: number;
  totalWords: number;
  paragraphsOver30Words: number;
  paragraphsUnder20Words: number;
  paragraphsOptimal: number;
  h2Count: number;
  h3Count: number;
  bulletListCount: number;
  structureScore: number;
}

export function ReadabilityAnalyzer({ content, onOptimize, isOptimizing }: ReadabilityAnalyzerProps) {
  const metrics = useMemo((): ReadabilityMetrics | null => {
    if (!content || content.trim().length === 0) return null;

    // Strip HTML tags for text analysis
    const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Count words
    const words = plainText.split(/\s+/).filter(w => w.length > 0);
    const totalWords = words.length;
    if (totalWords === 0) return null;

    // Count sentences (basic: split by . ! ?)
    const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const totalSentences = Math.max(sentences.length, 1);

    // Count syllables (approximate)
    const countSyllables = (word: string): number => {
      word = word.toLowerCase().replace(/[^a-z]/g, '');
      if (word.length <= 3) return 1;
      
      const vowels = 'aeiouy';
      let count = 0;
      let prevIsVowel = false;
      
      for (let i = 0; i < word.length; i++) {
        const isVowel = vowels.includes(word[i]);
        if (isVowel && !prevIsVowel) count++;
        prevIsVowel = isVowel;
      }
      
      // Adjust for silent e
      if (word.endsWith('e') && count > 1) count--;
      // Adjust for -le ending
      if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) count++;
      
      return Math.max(count, 1);
    };

    const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);

    // Flesch Reading Ease score
    const avgWordsPerSentence = totalWords / totalSentences;
    const avgSyllablesPerWord = totalSyllables / totalWords;
    const fleschReadingEase = Math.max(0, Math.min(100, 
      206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
    ));

    // Flesch grade interpretation
    const getFleschGrade = (score: number): string => {
      if (score >= 90) return "5th grade (Very Easy)";
      if (score >= 80) return "6th grade (Easy)";
      if (score >= 70) return "7th grade (Fairly Easy)";
      if (score >= 60) return "8th-9th grade (Standard)";
      if (score >= 50) return "10th-12th grade (Fairly Hard)";
      if (score >= 30) return "College (Hard)";
      return "Graduate (Very Hard)";
    };

    // Extract paragraphs (from <p> tags or double newlines)
    const paragraphMatches = content.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
    const paragraphs = paragraphMatches.map(p => {
      const text = p.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return text.split(/\s+/).filter(w => w.length > 0).length;
    });
    
    const totalParagraphs = paragraphs.length || 1;
    const avgWordsPerParagraph = paragraphs.length > 0 
      ? paragraphs.reduce((a, b) => a + b, 0) / paragraphs.length 
      : totalWords;

    // Paragraph analysis
    const paragraphsOver30Words = paragraphs.filter(w => w > 35).length;
    const paragraphsUnder20Words = paragraphs.filter(w => w < 20 && w > 0).length;
    const paragraphsOptimal = paragraphs.filter(w => w >= 20 && w <= 35).length;

    // Structure analysis
    const h2Count = (content.match(/<h2[^>]*>/gi) || []).length;
    const h3Count = (content.match(/<h3[^>]*>/gi) || []).length;
    const bulletListCount = (content.match(/<ul[^>]*>/gi) || []).length + 
                           (content.match(/<ol[^>]*>/gi) || []).length;

    // Calculate structure score
    let structureScore = 0;
    if (h2Count >= 3) structureScore += 25;
    else if (h2Count >= 1) structureScore += 15;
    if (h3Count >= 3) structureScore += 25;
    else if (h3Count >= 1) structureScore += 15;
    if (bulletListCount >= 2) structureScore += 25;
    else if (bulletListCount >= 1) structureScore += 15;
    if (paragraphsOptimal / totalParagraphs >= 0.7) structureScore += 25;
    else if (paragraphsOptimal / totalParagraphs >= 0.5) structureScore += 15;

    return {
      fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
      fleschGrade: getFleschGrade(fleschReadingEase),
      avgWordsPerParagraph: Math.round(avgWordsPerParagraph * 10) / 10,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      totalParagraphs,
      totalSentences,
      totalWords,
      paragraphsOver30Words,
      paragraphsUnder20Words,
      paragraphsOptimal,
      h2Count,
      h3Count,
      bulletListCount,
      structureScore
    };
  }, [content]);

  const getFleschColor = (score: number) => {
    if (score >= 60) return "text-green-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getFleschBadge = (score: number) => {
    if (score >= 60) return "default";
    if (score >= 40) return "secondary";
    return "destructive";
  };

  const getScoreIcon = (isGood: boolean) => {
    return isGood ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-yellow-500" />
    );
  };

  if (!metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Readability Analyzer
          </CardTitle>
          <CardDescription>Generate content to see readability analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
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
            <BookOpen className="h-4 w-4" />
            Readability Analyzer
          </span>
          <div className="flex items-center gap-2">
            <Badge variant={getFleschBadge(metrics.fleschReadingEase)}>
              Flesch: {metrics.fleschReadingEase}
            </Badge>
            {onOptimize && metrics.fleschReadingEase < 60 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={onOptimize}
                disabled={isOptimizing}
                className="h-7 text-xs"
              >
                <Wand2 className="h-3 w-3 mr-1" />
                {isOptimizing ? "Optimizing..." : "Optimize"}
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          {metrics.fleschGrade} • Target: 60-70 (Standard)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Flesch Reading Ease */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Flesch Reading Ease</span>
            <span className={getFleschColor(metrics.fleschReadingEase)}>
              {metrics.fleschReadingEase}/100
            </span>
          </div>
          <Progress 
            value={metrics.fleschReadingEase} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Hard (0)</span>
            <span className="text-green-500 font-medium">Optimal (60-70)</span>
            <span>Easy (100)</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2 rounded-md bg-muted/50 text-center">
            <FileText className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{metrics.totalWords.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Words</p>
          </div>
          <div className="p-2 rounded-md bg-muted/50 text-center">
            <AlignLeft className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{metrics.totalParagraphs}</p>
            <p className="text-xs text-muted-foreground">Paragraphs</p>
          </div>
          <div className="p-2 rounded-md bg-muted/50 text-center">
            <Type className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{metrics.totalSentences}</p>
            <p className="text-xs text-muted-foreground">Sentences</p>
          </div>
          <div className="p-2 rounded-md bg-muted/50 text-center">
            <BookOpen className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-lg font-bold">{metrics.structureScore}%</p>
            <p className="text-xs text-muted-foreground">Structure</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Paragraph Analysis */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Paragraph Analysis</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {getScoreIcon(metrics.avgWordsPerParagraph >= 25 && metrics.avgWordsPerParagraph <= 35)}
                Avg Words/Paragraph
              </span>
              <span className="text-muted-foreground">{metrics.avgWordsPerParagraph}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {getScoreIcon(metrics.avgWordsPerSentence <= 20)}
                Avg Words/Sentence
              </span>
              <span className="text-muted-foreground">{metrics.avgWordsPerSentence}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Optimal Paragraphs (20-35 words)
              </span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                {metrics.paragraphsOptimal}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Too Long (&gt;35 words)
              </span>
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                {metrics.paragraphsOver30Words}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-blue-500" />
                Too Short (&lt;20 words)
              </span>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
                {metrics.paragraphsUnder20Words}
              </Badge>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Structure Analysis */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Structure Analysis</h4>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-md border">
              <p className="text-lg font-bold text-purple-500">{metrics.h2Count}</p>
              <p className="text-xs text-muted-foreground">H2 Headings</p>
            </div>
            <div className="p-2 rounded-md border">
              <p className="text-lg font-bold text-blue-500">{metrics.h3Count}</p>
              <p className="text-xs text-muted-foreground">H3 Subheadings</p>
            </div>
            <div className="p-2 rounded-md border">
              <p className="text-lg font-bold text-teal-500">{metrics.bulletListCount}</p>
              <p className="text-xs text-muted-foreground">Bullet Lists</p>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="p-3 rounded-md bg-muted/50">
          <p className="text-xs text-muted-foreground">
            {metrics.fleschReadingEase < 60 && (
              <>💡 <strong>Tip:</strong> Simplify sentences and use shorter words to improve readability. Target 60-70 for standard web content.</>
            )}
            {metrics.fleschReadingEase >= 60 && metrics.fleschReadingEase <= 70 && (
              <>✅ <strong>Perfect!</strong> Your content readability is optimal for web audiences.</>
            )}
            {metrics.fleschReadingEase > 70 && (
              <>ℹ️ <strong>Note:</strong> Content is very easy to read. Consider adding technical depth if targeting professional audiences.</>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
