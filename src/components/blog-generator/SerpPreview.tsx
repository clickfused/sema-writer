import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface SerpPreviewProps {
  title: string;
  description: string;
  slug: string;
}

export function SerpPreview({ title, description, slug }: SerpPreviewProps) {
  const displayUrl = `yoursite.com/${slug || "blog-post"}`;
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Google Search Preview</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Preview how your meta tags will appear in search results
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Google Search Result Preview */}
        <div className="border rounded-lg p-4 bg-background space-y-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-muted-foreground">yoursite.com</span>
            <span className="text-muted-foreground">›</span>
            <span className="text-muted-foreground">{slug ? slug.split('-').slice(0, 2).join(' ') : 'blog'}</span>
          </div>

          {/* Title - Blue clickable link */}
          <h3 className="text-lg font-normal">
            <a href="#" className="text-[#1a0dab] hover:underline line-clamp-2">
              {title || "Your SEO-optimized title will appear here"}
            </a>
          </h3>

          {/* URL */}
          <div className="text-sm text-[#006621]">
            {displayUrl}
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {currentDate} — {description || "Your compelling meta description will appear here. Make it engaging to improve click-through rates."}
          </p>

          {/* Rich Snippet - Breadcrumbs */}
          {slug && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2 pt-2 border-t">
              <span>🏠 Home</span>
              <span>›</span>
              <span>📄 {slug.split('-').slice(0, 3).join(' ')}</span>
            </div>
          )}
        </div>

        {/* Tips */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-2">
          <p className="text-xs font-semibold">SERP Optimization Tips:</p>
          <ul className="text-xs space-y-1 text-muted-foreground list-disc list-inside">
            <li>Title: {title.length}/57 chars {title.length < 50 && title.length > 0 ? "✓ Good length" : title.length > 57 ? "⚠ Too long, may be truncated" : ""}</li>
            <li>Description: {description.length}/157 chars {description.length > 120 && description.length <= 157 ? "✓ Optimal length" : description.length > 157 ? "⚠ Too long, will be cut off" : description.length < 120 && description.length > 0 ? "⚠ Could be longer" : ""}</li>
            <li>Include power words to improve CTR (Best, Ultimate, Guide, 2025)</li>
            <li>Add numbers or statistics for credibility</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
