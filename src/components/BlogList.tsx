import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Trash2, Globe, Edit, Save, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BlogContentDisplay } from "./BlogContentDisplay";
import { RichTextEditor } from "./RichTextEditor";

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
  const [publishing, setPublishing] = useState<string | null>(null);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    meta_title: "",
    content: "",
  });
  const [saving, setSaving] = useState(false);

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
    const confirmed = window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.");
    if (!confirmed) return;

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

  const handleEdit = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setEditingBlog(data);
      setEditForm({
        title: data.title || "",
        meta_title: data.meta_title || "",
        content: data.content || "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!editingBlog) return;

    setSaving(true);
    try {
      const wordCount = editForm.content.replace(/<[^>]*>/g, '').split(/\s+/).length;

      const { error } = await supabase
        .from("blog_posts")
        .update({
          title: editForm.title,
          meta_title: editForm.meta_title,
          content: editForm.content,
          word_count: wordCount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingBlog.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Blog post updated successfully.",
      });

      setEditingBlog(null);
      fetchBlogs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
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

  const handlePublishToWordPress = async (id: string) => {
    setPublishing(id);
    try {
      const { data: blog, error: blogError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (blogError) throw blogError;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("wordpress_url, wordpress_username, wordpress_app_password")
        .eq("id", userId)
        .single();

      if (profileError) throw profileError;

      if (!profile?.wordpress_url || !profile?.wordpress_username || !profile?.wordpress_app_password) {
        toast({
          title: "WordPress Not Configured",
          description: "Please configure WordPress settings in Settings page",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("publish-to-wordpress", {
        body: {
          wordpressUrl: profile.wordpress_url,
          username: profile.wordpress_username,
          appPassword: profile.wordpress_app_password,
          post: {
            title: blog.title,
            content: blog.content,
            metaDescription: blog.meta_description,
            slug: blog.url_slug,
            status: "draft",
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Published to WordPress!",
        description: `Post published as draft. Post ID: ${data.postId}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPublishing(null);
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
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(blog.id)}
                    className="text-xs sm:text-sm"
                  >
                    <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
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
                    variant="secondary"
                    onClick={() => handlePublishToWordPress(blog.id)}
                    disabled={publishing === blog.id}
                    className="text-xs sm:text-sm"
                  >
                    <Globe className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                    <span className="hidden sm:inline">{publishing === blog.id ? "Publishing..." : "Publish"}</span>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingBlog} onOpenChange={(open) => !open && setEditingBlog(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Update your blog post content and metadata
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Blog post title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-meta-title">Meta Title</Label>
                <Input
                  id="edit-meta-title"
                  value={editForm.meta_title}
                  onChange={(e) => setEditForm({ ...editForm, meta_title: e.target.value })}
                  placeholder="SEO meta title"
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  content={editForm.content}
                  onChange={(content) => setEditForm({ ...editForm, content })}
                  placeholder="Start writing your blog content..."
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="py-4">
              <div className="border rounded-lg p-6 bg-background min-h-[400px]">
                <article className="max-w-3xl mx-auto">
                  <header className="mb-8 border-b pb-6">
                    <h1 className="text-4xl font-bold mb-3 text-foreground">
                      {editForm.title || "Untitled Blog Post"}
                    </h1>
                    {editForm.meta_title && (
                      <p className="text-lg text-muted-foreground">
                        {editForm.meta_title}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                      <time dateTime={new Date().toISOString()}>
                        {new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </time>
                      <span>•</span>
                      <span>
                        {editForm.content.replace(/<[^>]*>/g, '').split(/\s+/).length} words
                      </span>
                    </div>
                  </header>
                  
                  <div className="prose prose-lg max-w-none">
                    {editForm.content ? (
                      <BlogContentDisplay content={editForm.content} />
                    ) : (
                      <p className="text-muted-foreground italic">No content yet. Switch to Edit mode to add content.</p>
                    )}
                  </div>
                </article>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditingBlog(null)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}