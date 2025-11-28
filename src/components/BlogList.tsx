import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BlogContentDisplay } from "./BlogContentDisplay";

interface BlogPost {
  id: string;
  title: string;
  meta_title: string | null;
  content: string | null;
  word_count: number;
  seo_score: number;
  status: string;
  url_slug: string | null;
  created_at: string;
}

interface BlogListProps {
  userId: string;
}

export function BlogList({ userId }: BlogListProps) {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, [userId]);

  const fetchBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post deleted successfully.",
      });
      fetchBlogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExport = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const content = `# ${data.title}\n\n${data.content}`;
      const blob = new Blob([content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.url_slug || "blog-post"}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Blog post exported successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-2xl font-semibold mb-2">No blog posts yet</h3>
        <p className="text-muted-foreground">
          Start creating your first SEO-optimized blog post
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold">My Blog Posts</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your generated content</p>
      </div>

      <div className="grid gap-3 sm:gap-4">
        {blogs.map((blog) => (
          <Card key={blog.id}>
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl truncate">{blog.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2">{blog.meta_title}</CardDescription>
                </div>
                <Badge variant={blog.status === "published" ? "default" : "secondary"} className="self-start flex-shrink-0">
                  {blog.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span>{blog.word_count} words</span>
                  <span>SEO: {blog.seo_score}/100</span>
                  <span className="hidden sm:inline">{new Date(blog.created_at).toLocaleDateString()}</span>
                  <span className="sm:hidden">{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(blog.id)}
                    className="text-xs sm:text-sm"
                  >
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(blog.id)}
                    className="text-xs sm:text-sm"
                  >
                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}