import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Map, Plus, Trash2, RefreshCw, Loader2, ExternalLink, CheckCircle, XCircle, Clock } from "lucide-react";

interface Sitemap {
  id: string;
  name: string;
  sitemap_url: string;
  discovered_urls: string[];
  last_crawled_at: string | null;
  status: string | null;
  error_message: string | null;
}

interface SitemapManagerProps {
  userId: string;
}

export function SitemapManager({ userId }: SitemapManagerProps) {
  const [sitemaps, setSitemaps] = useState<Sitemap[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [crawling, setCrawling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [newSitemap, setNewSitemap] = useState({
    name: "",
    url: "",
  });

  useEffect(() => {
    loadSitemaps();
  }, [userId]);

  const loadSitemaps = async () => {
    try {
      const { data, error } = await supabase
        .from("sitemap_collections")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Parse discovered_urls from JSONB
      const parsed = (data || []).map((s: any) => ({
        ...s,
        discovered_urls: Array.isArray(s.discovered_urls) ? s.discovered_urls : [],
      }));
      
      setSitemaps(parsed);
    } catch (error: any) {
      toast({
        title: "Error loading sitemaps",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addSitemap = async () => {
    if (!newSitemap.name.trim() || !newSitemap.url.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter both name and URL",
        variant: "destructive",
      });
      return;
    }

    // Validate URL
    try {
      new URL(newSitemap.url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid sitemap URL",
        variant: "destructive",
      });
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from("sitemap_collections")
        .insert({
          user_id: userId,
          name: newSitemap.name.trim(),
          sitemap_url: newSitemap.url.trim(),
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Sitemap added" });
      setNewSitemap({ name: "", url: "" });
      loadSitemaps();

      // Auto-crawl after adding
      if (data?.id) {
        crawlSitemap(data.id);
      }
    } catch (error: any) {
      toast({
        title: "Add Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  };

  const crawlSitemap = async (id: string) => {
    setCrawling(id);
    
    const sitemap = sitemaps.find(s => s.id === id);
    if (!sitemap) return;

    try {
      // Update status to crawling
      await supabase
        .from("sitemap_collections")
        .update({ status: "crawling" })
        .eq("id", id);

      // Fetch and parse sitemap
      const response = await fetch(sitemap.sitemap_url);
      const text = await response.text();
      
      // Parse XML sitemap
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/xml");
      
      const urls: string[] = [];
      
      // Check for sitemap index
      const sitemapNodes = doc.querySelectorAll("sitemap loc");
      if (sitemapNodes.length > 0) {
        // This is a sitemap index, we'd need to fetch each sub-sitemap
        // For now, just collect the sitemap URLs
        sitemapNodes.forEach((node) => {
          if (node.textContent) urls.push(node.textContent);
        });
      } else {
        // Regular sitemap
        const urlNodes = doc.querySelectorAll("url loc");
        urlNodes.forEach((node) => {
          if (node.textContent) urls.push(node.textContent);
        });
      }

      // Update with discovered URLs
      const { error } = await supabase
        .from("sitemap_collections")
        .update({
          discovered_urls: urls,
          last_crawled_at: new Date().toISOString(),
          status: "completed",
          error_message: null,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Sitemap crawled",
        description: `Found ${urls.length} URLs`,
      });
      loadSitemaps();
    } catch (error: any) {
      // Update with error
      await supabase
        .from("sitemap_collections")
        .update({
          status: "error",
          error_message: error.message,
        })
        .eq("id", id);

      toast({
        title: "Crawl Failed",
        description: error.message,
        variant: "destructive",
      });
      loadSitemaps();
    } finally {
      setCrawling(null);
    }
  };

  const deleteSitemap = async (id: string) => {
    if (!confirm("Are you sure you want to delete this sitemap?")) return;

    setDeleting(id);
    try {
      const { error } = await supabase
        .from("sitemap_collections")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Sitemap deleted" });
      loadSitemaps();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "completed":
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" /> Completed</Badge>;
      case "crawling":
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Crawling</Badge>;
      case "error":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          Sitemap Collections
        </CardTitle>
        <CardDescription>
          Add sitemaps to automatically discover internal links for your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Sitemap Form */}
        <div className="p-4 border rounded-lg space-y-4">
          <h4 className="font-medium">Add Sitemap Collection</h4>
          <p className="text-sm text-muted-foreground">
            Add a sitemap URL to automatically discover internal links for your content
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sitemap-name">Name</Label>
              <Input
                id="sitemap-name"
                value={newSitemap.name}
                onChange={(e) => setNewSitemap({ ...newSitemap, name: e.target.value })}
                placeholder="My Website"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sitemap-url">Sitemap URL</Label>
              <Input
                id="sitemap-url"
                value={newSitemap.url}
                onChange={(e) => setNewSitemap({ ...newSitemap, url: e.target.value })}
                placeholder="https://example.com/sitemap.xml"
              />
            </div>
          </div>
          <Button onClick={addSitemap} disabled={adding}>
            {adding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add Sitemap
          </Button>
        </div>

        {/* Supported Formats */}
        <div className="p-3 bg-muted rounded-lg text-sm">
          <p className="font-medium mb-2">Supported Sitemap Formats:</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li><code>sitemap.xml</code> - Standard XML sitemap</li>
            <li><code>wp-sitemap.xml</code> - WordPress default sitemap</li>
            <li><code>sitemap_index.xml</code> - Sitemap index (multiple sitemaps)</li>
          </ul>
          <p className="text-primary mt-2">
            💡 Tip: Most sitemaps are at yoursite.com/sitemap.xml. Check your robots.txt file or Google Search Console to find yours.
          </p>
        </div>

        {/* Sitemap List */}
        {sitemaps.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed rounded-lg">
            <Map className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No sitemaps yet. Add your first sitemap above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sitemaps.map((sitemap) => (
              <div
                key={sitemap.id}
                className="p-4 border rounded-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium">{sitemap.name}</h4>
                      {getStatusBadge(sitemap.status)}
                    </div>
                    <a
                      href={sitemap.sitemap_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      {sitemap.sitemap_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => crawlSitemap(sitemap.id)}
                      disabled={crawling === sitemap.id}
                      title="Re-crawl sitemap"
                    >
                      {crawling === sitemap.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSitemap(sitemap.id)}
                      disabled={deleting === sitemap.id}
                      className="text-destructive hover:text-destructive"
                    >
                      {deleting === sitemap.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {sitemap.status === "completed" && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{sitemap.discovered_urls.length} URLs discovered</span>
                    {sitemap.last_crawled_at && (
                      <span>
                        Last crawled: {new Date(sitemap.last_crawled_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                )}

                {sitemap.status === "error" && sitemap.error_message && (
                  <p className="text-sm text-destructive">{sitemap.error_message}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
