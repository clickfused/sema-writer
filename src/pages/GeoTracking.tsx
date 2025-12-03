import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { BarChart3, TrendingUp, Eye, Bot, Search, Globe, Sparkles, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TrackingData {
  brandMentions: number;
  aiCitations: number;
  llmVisibility: number;
  searchVisibility: number;
  aeoScore: number;
  geoScore: number;
  platforms: {
    name: string;
    mentions: number;
    sentiment: "positive" | "neutral" | "negative";
    lastSeen: string;
  }[];
  keywords: {
    keyword: string;
    aiRank: number;
    searchRank: number;
    trend: "up" | "down" | "stable";
  }[];
}

export default function GeoTracking() {
  const [brandName, setBrandName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [tracking, setTracking] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);

  const trackBrandVisibility = async () => {
    if (!brandName) {
      toast({
        title: "Error",
        description: "Please enter your brand name",
        variant: "destructive",
      });
      return;
    }

    setTracking(true);

    // Simulate tracking data (in production, this would call actual APIs)
    setTimeout(() => {
      const mockData: TrackingData = {
        brandMentions: Math.floor(Math.random() * 500) + 100,
        aiCitations: Math.floor(Math.random() * 200) + 50,
        llmVisibility: Math.floor(Math.random() * 40) + 30,
        searchVisibility: Math.floor(Math.random() * 30) + 50,
        aeoScore: Math.floor(Math.random() * 30) + 60,
        geoScore: Math.floor(Math.random() * 25) + 55,
        platforms: [
          {
            name: "ChatGPT",
            mentions: Math.floor(Math.random() * 100) + 20,
            sentiment: ["positive", "neutral", "negative"][Math.floor(Math.random() * 3)] as any,
            lastSeen: "2 hours ago"
          },
          {
            name: "Perplexity",
            mentions: Math.floor(Math.random() * 80) + 15,
            sentiment: ["positive", "neutral"][Math.floor(Math.random() * 2)] as any,
            lastSeen: "5 hours ago"
          },
          {
            name: "Google Gemini",
            mentions: Math.floor(Math.random() * 60) + 10,
            sentiment: "positive",
            lastSeen: "1 day ago"
          },
          {
            name: "Bing Copilot",
            mentions: Math.floor(Math.random() * 50) + 8,
            sentiment: "neutral",
            lastSeen: "3 hours ago"
          },
          {
            name: "Claude",
            mentions: Math.floor(Math.random() * 40) + 5,
            sentiment: "positive",
            lastSeen: "12 hours ago"
          }
        ],
        keywords: [
          {
            keyword: brandName.toLowerCase(),
            aiRank: Math.floor(Math.random() * 10) + 1,
            searchRank: Math.floor(Math.random() * 20) + 1,
            trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as any
          },
          {
            keyword: `${brandName.toLowerCase()} review`,
            aiRank: Math.floor(Math.random() * 15) + 3,
            searchRank: Math.floor(Math.random() * 30) + 5,
            trend: "up"
          },
          {
            keyword: `best ${brandName.toLowerCase()}`,
            aiRank: Math.floor(Math.random() * 20) + 5,
            searchRank: Math.floor(Math.random() * 25) + 10,
            trend: "stable"
          }
        ]
      };

      setTrackingData(mockData);
      setTracking(false);
      toast({
        title: "Tracking Complete",
        description: "Brand visibility data updated",
      });
    }, 2000);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "bg-green-500/20 text-green-700 border-green-500/30";
      case "negative": return "bg-red-500/20 text-red-700 border-red-500/30";
      default: return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "↑";
      case "down": return "↓";
      default: return "→";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return "text-green-600";
      case "down": return "text-red-600";
      default: return "text-yellow-600";
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          GEO Tracking & AI Visibility
        </h1>
        <p className="text-muted-foreground">
          Track your brand visibility across AI platforms, LLMs, and search engines
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Brand Configuration
          </CardTitle>
          <CardDescription>Enter your brand details to track AI visibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Brand Name</label>
              <Input
                placeholder="Your Brand Name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Website URL (Optional)</label>
              <Input
                placeholder="https://yourwebsite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={trackBrandVisibility} disabled={tracking} className="w-full">
            {tracking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Tracking...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Track Brand Visibility
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {trackingData && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Brand Mentions</p>
                    <p className="text-2xl font-bold">{trackingData.brandMentions}</p>
                  </div>
                  <Eye className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Citations</p>
                    <p className="text-2xl font-bold">{trackingData.aiCitations}</p>
                  </div>
                  <Bot className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AEO Score</p>
                    <p className="text-2xl font-bold">{trackingData.aeoScore}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">GEO Score</p>
                    <p className="text-2xl font-bold">{trackingData.geoScore}%</p>
                  </div>
                  <Globe className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visibility Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  LLM Visibility Score
                </CardTitle>
                <CardDescription>How visible is your brand in AI responses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Overall LLM Visibility</span>
                      <span className="text-sm font-bold">{trackingData.llmVisibility}%</span>
                    </div>
                    <Progress value={trackingData.llmVisibility} className="h-3" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on brand mentions across ChatGPT, Perplexity, Claude, Gemini, and Copilot
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Visibility Score
                </CardTitle>
                <CardDescription>Traditional search engine visibility</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Overall Search Visibility</span>
                      <span className="text-sm font-bold">{trackingData.searchVisibility}%</span>
                    </div>
                    <Progress value={trackingData.searchVisibility} className="h-3" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on rankings in Google, Bing, and other search engines
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Breakdown */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Platform Breakdown
              </CardTitle>
              <CardDescription>Brand visibility across different AI platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trackingData.platforms.map((platform, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{platform.name}</p>
                        <p className="text-xs text-muted-foreground">Last seen: {platform.lastSeen}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getSentimentColor(platform.sentiment)}>
                        {platform.sentiment}
                      </Badge>
                      <div className="text-right">
                        <p className="font-bold">{platform.mentions}</p>
                        <p className="text-xs text-muted-foreground">mentions</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Keyword Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Keyword Rankings
              </CardTitle>
              <CardDescription>AI vs Search engine rankings for your keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Keyword</th>
                      <th className="text-center p-3 font-medium">AI Rank</th>
                      <th className="text-center p-3 font-medium">Search Rank</th>
                      <th className="text-center p-3 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trackingData.keywords.map((kw, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="p-3">
                          <span className="font-medium">{kw.keyword}</span>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="secondary">#{kw.aiRank}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline">#{kw.searchRank}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`text-lg font-bold ${getTrendColor(kw.trend)}`}>
                            {getTrendIcon(kw.trend)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!trackingData && !tracking && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Tracking Data Yet</h3>
            <p className="text-muted-foreground mb-4">
              Enter your brand name and click "Track Brand Visibility" to see your AI visibility metrics
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
