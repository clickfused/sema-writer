import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

interface KeywordDensityTrackerProps {
  content: string;
  keywords: {
    primary: string[];
    secondary: string[];
    semantic: string[];
    lsi: string[];
  };
  targetDensity?: number;
}

interface KeywordStats {
  keyword: string;
  count: number;
  density: number;
}

export function KeywordDensityTracker({ 
  content, 
  keywords,
  targetDensity = 1.5 
}: KeywordDensityTrackerProps) {
  const calculateKeywordStats = (keywordList: string[]): KeywordStats[] => {
    if (!content || !keywordList.length) return [];
    
    const totalWords = content.split(/\s+/).filter(w => w.length > 0).length;
    if (totalWords === 0) return [];

    return keywordList.map(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex) || [];
      const count = matches.length;
      const density = (count / totalWords) * 100;

      return { keyword, count, density };
    });
  };

  const primaryStats = calculateKeywordStats(keywords.primary);
  const secondaryStats = calculateKeywordStats(keywords.secondary);
  const semanticStats = calculateKeywordStats(keywords.semantic);
  const lsiStats = calculateKeywordStats(keywords.lsi);

  const allSupportingStats = [...secondaryStats, ...semanticStats, ...lsiStats];
  const totalSupportingCount = allSupportingStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalPrimaryCount = primaryStats.reduce((sum, stat) => sum + stat.count, 0);
  const totalWords = content.split(/\s+/).filter(w => w.length > 0).length;
  const overallDensity = totalWords > 0 ? (totalSupportingCount / totalWords) * 100 : 0;
  const primaryDensity = totalWords > 0 ? (totalPrimaryCount / totalWords) * 100 : 0;

  const getStatusIcon = (density: number) => {
    if (density >= 1.0 && density <= 1.8) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    } else if (density > 1.8) {
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
    return <TrendingUp className="h-4 w-4 text-blue-500" />;
  };

  const getStatusColor = (density: number) => {
    if (density >= 1.0 && density <= 1.8) return "bg-green-500";
    if (density > 1.8) return "bg-orange-500";
    return "bg-blue-500";
  };

  const getStatusText = (density: number) => {
    if (density >= 1.0 && density <= 1.8) return "Optimal";
    if (density > 1.8) return "High";
    return "Low";
  };

  const renderKeywordGroup = (
    title: string,
    stats: KeywordStats[],
    color: string
  ) => {
    if (!stats.length) return null;

    const groupTotal = stats.reduce((sum, stat) => sum + stat.count, 0);
    const groupDensity = totalWords > 0 ? (groupTotal / totalWords) * 100 : 0;

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold">{title}</h4>
            <Badge variant="outline" className={`${color} text-white`}>
              {groupTotal} uses
            </Badge>
            <Badge variant="outline">
              {groupDensity.toFixed(2)}%
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground truncate max-w-[200px]">
                  {stat.keyword}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {stat.count}× ({stat.density.toFixed(2)}%)
                  </span>
                </div>
              </div>
              <Progress 
                value={Math.min((stat.density / targetDensity) * 100, 100)} 
                className="h-1.5"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!content || totalWords === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Keyword Density Tracker</CardTitle>
          <CardDescription>Generate content to see real-time keyword usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No content generated yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Keyword Density Tracker</span>
          <div className="flex items-center gap-2">
            {getStatusIcon(overallDensity)}
            <Badge 
              variant="outline" 
              className={`${getStatusColor(overallDensity)} text-white`}
            >
              {getStatusText(overallDensity)}
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Overall: {overallDensity.toFixed(2)}% • Target: 1.0-1.8% • Words: {totalWords.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold">Combined Density</span>
            <span className="text-muted-foreground">
              {totalSupportingCount} total keywords
            </span>
          </div>
          <Progress 
            value={Math.min((overallDensity / 1.8) * 100, 100)} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span className="text-green-500 font-medium">1.0% - 1.8%</span>
            <span>2.5%</span>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Primary Keywords */}
        {renderKeywordGroup(
          "Primary Keywords",
          primaryStats,
          "bg-rose-500"
        )}

        {/* Secondary Keywords */}
        {renderKeywordGroup(
          "Secondary Keywords",
          secondaryStats,
          "bg-purple-500"
        )}

        {/* Semantic Keywords */}
        {renderKeywordGroup(
          "Semantic Keywords",
          semanticStats,
          "bg-blue-500"
        )}

        {/* LSI Keywords */}
        {renderKeywordGroup(
          "LSI Keywords",
          lsiStats,
          "bg-teal-500"
        )}

        {/* Recommendations */}
        {overallDensity > 0 && (
          <div className="mt-4 p-3 rounded-md bg-muted/50">
            <p className="text-xs text-muted-foreground">
              {overallDensity < 1.0 && (
                <>💡 <strong>Tip:</strong> Add more supporting keywords naturally throughout the content to reach optimal density.</>
              )}
              {overallDensity >= 1.0 && overallDensity <= 1.8 && (
                <>✅ <strong>Perfect!</strong> Your keyword density is within the optimal range for SEO.</>
              )}
              {overallDensity > 1.8 && (
                <>⚠️ <strong>Warning:</strong> Keyword density is high. Consider reducing repetition to avoid keyword stuffing.</>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
