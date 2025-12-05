import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BlogAnalyzer } from "@/components/admin/BlogAnalyzer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Pencil, Trash2, Shield, Sparkles } from "lucide-react";

interface Framework {
  id: string;
  name: string;
  description: string | null;
  formula: string | null;
  system_prompt: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFramework, setEditingFramework] = useState<Framework | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    formula: "",
    system_prompt: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    checkAdminAndFetch();
  }, []);

  const checkAdminAndFetch = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        navigate("/auth");
        return;
      }
      setUser(currentUser);

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", currentUser.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError) throw roleError;

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
      await fetchFrameworks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchFrameworks = async () => {
    try {
      const { data, error } = await supabase
        .from("frameworks")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setFrameworks(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openCreateDialog = () => {
    setEditingFramework(null);
    setFormData({
      name: "",
      description: "",
      formula: "",
      system_prompt: "",
      is_active: true,
    });
    setDialogOpen(true);
  };

  const openEditDialog = (framework: Framework) => {
    setEditingFramework(framework);
    setFormData({
      name: framework.name,
      description: framework.description || "",
      formula: framework.formula || "",
      system_prompt: framework.system_prompt || "",
      is_active: framework.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Framework name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingFramework) {
        // Update existing framework
        const { error } = await supabase
          .from("frameworks")
          .update({
            name: formData.name,
            description: formData.description || null,
            formula: formData.formula || null,
            system_prompt: formData.system_prompt || null,
            is_active: formData.is_active,
          })
          .eq("id", editingFramework.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Framework updated successfully",
        });
      } else {
        // Create new framework
        const { error } = await supabase
          .from("frameworks")
          .insert({
            name: formData.name,
            description: formData.description || null,
            formula: formData.formula || null,
            system_prompt: formData.system_prompt || null,
            is_active: formData.is_active,
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Framework created successfully",
        });
      }

      setDialogOpen(false);
      await fetchFrameworks();
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

  const handleDelete = async (frameworkId: string) => {
    try {
      const { error } = await supabase
        .from("frameworks")
        .delete()
        .eq("id", frameworkId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Framework deleted successfully",
      });

      await fetchFrameworks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (framework: Framework) => {
    try {
      const { error } = await supabase
        .from("frameworks")
        .update({ is_active: !framework.is_active })
        .eq("id", framework.id);

      if (error) throw error;

      await fetchFrameworks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || !user) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <div className="container py-6 flex items-center justify-center">
              <p>Loading...</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!isAdmin) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <DashboardHeader user={user} />
          <div className="container py-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage content generation frameworks
                </p>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Manually
              </Button>
            </div>

            {/* Blog Analyzer Section */}
            <BlogAnalyzer onFrameworkSaved={fetchFrameworks} />

            <Separator className="my-6" />

            <h2 className="text-xl font-semibold">Existing Frameworks</h2>

            <div className="grid gap-4">
              {frameworks.map((framework) => (
                <Card key={framework.id} className={!framework.is_active ? "opacity-60" : ""}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          {framework.name}
                          {!framework.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{framework.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={framework.is_active}
                          onCheckedChange={() => toggleActive(framework)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(framework)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Framework</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{framework.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(framework.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {framework.formula && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Formula</Label>
                        <code className="block mt-1 p-2 bg-muted rounded text-xs">
                          {framework.formula}
                        </code>
                      </div>
                    )}
                    {framework.system_prompt && (
                      <div>
                        <Label className="text-xs text-muted-foreground">System Prompt</Label>
                        <p className="mt-1 p-2 bg-muted rounded text-xs text-muted-foreground line-clamp-3">
                          {framework.system_prompt}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {frameworks.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No Frameworks</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first content generation framework
                    </p>
                    <Button onClick={openCreateDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Framework
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingFramework ? "Edit Framework" : "Create Framework"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingFramework
                      ? "Update the framework details below"
                      : "Add a new content generation framework"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., SAGE, READ, CRAFT"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of the framework"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formula">Formula</Label>
                    <Input
                      id="formula"
                      value={formData.formula}
                      onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                      placeholder="e.g., (Structure × 0.3) + (Authority × 0.25)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="system_prompt">System Prompt</Label>
                    <Textarea
                      id="system_prompt"
                      value={formData.system_prompt}
                      onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                      placeholder="AI instructions for this framework..."
                      rows={6}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="is_active">Active</Label>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : editingFramework ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
