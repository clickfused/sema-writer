import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    fullName: "",
    email: "",
    apiKey: "",
    webhookUrl: "",
    autoSaveEnabled: true,
    wordpressUrl: "",
    wordpressUsername: "",
    wordpressPassword: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadSettings(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data) {
        setSettings({
          fullName: data.full_name || "",
          email: data.email || "",
          apiKey: data.api_key || "",
          webhookUrl: data.webhook_url || "",
          autoSaveEnabled: data.auto_save_enabled ?? true,
          wordpressUrl: data.wordpress_url || "",
          wordpressUsername: data.wordpress_username || "",
          wordpressPassword: data.wordpress_app_password || "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: settings.fullName,
          api_key: settings.apiKey,
          webhook_url: settings.webhookUrl,
          auto_save_enabled: settings.autoSaveEnabled,
          wordpress_url: settings.wordpressUrl,
          wordpress_username: settings.wordpressUsername,
          wordpress_app_password: settings.wordpressPassword,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          <main className="flex-1 p-6">
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Settings</h2>
                <p className="text-muted-foreground">
                  Manage your profile and integration settings
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={settings.fullName}
                      onChange={(e) => setSettings({ ...settings, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.email}
                      disabled
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>API & Webhook Integration</CardTitle>
                  <CardDescription>
                    Configure external integrations for automated publishing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={settings.apiKey}
                      onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
                      placeholder="Enter your API key"
                    />
                    <p className="text-xs text-muted-foreground">
                      API key for external publishing platforms
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    <Input
                      id="webhookUrl"
                      value={settings.webhookUrl}
                      onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                      placeholder="https://your-webhook-url.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      Webhook URL for automated notifications
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your experience</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoSave">Auto-save</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save your work as you type
                      </p>
                    </div>
                    <Switch
                      id="autoSave"
                      checked={settings.autoSaveEnabled}
                      onCheckedChange={(checked) =>
                        setSettings({ ...settings, autoSaveEnabled: checked })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>WordPress Integration</CardTitle>
                  <CardDescription>
                    Configure WordPress for auto-publishing blog posts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wordpressUrl">WordPress Site URL</Label>
                    <Input
                      id="wordpressUrl"
                      type="url"
                      value={settings.wordpressUrl}
                      onChange={(e) => setSettings({ ...settings, wordpressUrl: e.target.value })}
                      placeholder="https://yoursite.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wordpressUsername">WordPress Username</Label>
                    <Input
                      id="wordpressUsername"
                      value={settings.wordpressUsername}
                      onChange={(e) => setSettings({ ...settings, wordpressUsername: e.target.value })}
                      placeholder="admin"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wordpressPassword">WordPress Application Password</Label>
                    <Input
                      id="wordpressPassword"
                      type="password"
                      value={settings.wordpressPassword}
                      onChange={(e) => setSettings({ ...settings, wordpressPassword: e.target.value })}
                      placeholder="xxxx xxxx xxxx xxxx"
                    />
                    <p className="text-xs text-muted-foreground">
                      Generate an Application Password in WordPress under Users → Profile
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={saveSettings} disabled={saving} size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
