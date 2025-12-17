import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
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
import { Save, Moon, Sun, Globe, Key, Copy, RefreshCw, Eye, EyeOff, ExternalLink } from "lucide-react";
import { ApiKeyManager } from "@/components/settings/ApiKeyManager";
import { BrandVoiceManager } from "@/components/settings/BrandVoiceManager";
import { SitemapManager } from "@/components/settings/SitemapManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
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

  const generateApiKey = () => {
    // Generate a secure random API key
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const apiKey = 'cf_' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return apiKey;
  };

  const handleGenerateApiKey = async () => {
    if (!user) return;
    
    // Show confirmation if key already exists
    if (settings.apiKey) {
      const confirmed = window.confirm(
        "Are you sure you want to regenerate your API key? Your old key will stop working immediately and you'll need to update it in your WordPress plugin."
      );
      if (!confirmed) return;
    }

    setGenerating(true);
    try {
      const newApiKey = generateApiKey();
      
      const { error } = await supabase
        .from("profiles")
        .update({ api_key: newApiKey })
        .eq("id", user.id);

      if (error) throw error;

      setSettings({ ...settings, apiKey: newApiKey });
      setShowApiKey(true);

      toast({
        title: "API Key Generated",
        description: "Your new API key has been created. Copy it now - you won't be able to see it again!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyApiKey = () => {
    if (settings.apiKey) {
      navigator.clipboard.writeText(settings.apiKey);
      toast({
        title: "Copied!",
        description: "API key copied to clipboard",
      });
    }
  };

  const maskApiKey = (key: string) => {
    if (!key) return "";
    if (key.length <= 10) return key;
    return `${key.substring(0, 7)}...${key.substring(key.length - 4)}`;
  };

  const testWordPressConnection = async () => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all WordPress credentials before testing",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("test-wordpress-connection", {
        body: {
          wordpressUrl: settings.wordpressUrl,
          username: settings.wordpressUsername,
          appPassword: settings.wordpressPassword,
        },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Connection Successful! ✓",
          description: `Connected as ${data.user.name} (${data.user.email})`,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
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
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Settings</h2>
                <p className="text-muted-foreground">
                  Manage your profile, API keys, and integrations
                </p>
              </div>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="ai-keys">AI Keys</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6 mt-6">
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
                      <CardTitle>Preferences</CardTitle>
                      <CardDescription>Customize your experience</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="theme">Theme</Label>
                          <p className="text-sm text-muted-foreground">
                            Choose your preferred color scheme
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={theme === "light" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("light")}
                          >
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </Button>
                          <Button
                            variant={theme === "dark" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setTheme("dark")}
                          >
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button onClick={saveSettings} disabled={saving} size="lg">
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? "Saving..." : "Save Settings"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="ai-keys" className="space-y-6 mt-6">
                  <ApiKeyManager userId={user.id} />
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-6">
                  <BrandVoiceManager userId={user.id} />
                  <SitemapManager userId={user.id} />
                </TabsContent>

                <TabsContent value="integrations" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Key className="h-5 w-5" />
                        ClickFused API Key
                      </CardTitle>
                      <CardDescription>
                        Generate an API key for WordPress plugin authentication. Keep it secure!
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {settings.apiKey ? (
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                            <div className="flex items-center justify-between">
                              <Label className="text-sm font-medium">Your API Key</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowApiKey(!showApiKey)}
                              >
                                {showApiKey ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                            <code className="block p-3 bg-background rounded border text-sm font-mono break-all">
                              {showApiKey ? settings.apiKey : maskApiKey(settings.apiKey)}
                            </code>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={copyApiKey}
                                className="flex-1"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Key
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleGenerateApiKey}
                                disabled={generating}
                                className="flex-1"
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Regenerate
                              </Button>
                            </div>
                          </div>
                          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                            <p className="text-sm text-yellow-600 dark:text-yellow-500">
                              <strong>⚠️ Keep this key secure!</strong> Anyone with this key can publish to your WordPress site.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-6 border-2 border-dashed rounded-lg text-center space-y-3">
                            <Key className="h-12 w-12 mx-auto text-muted-foreground" />
                            <div>
                              <h4 className="font-medium">No API Key Generated</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Generate an API key to connect your WordPress plugin
                              </p>
                            </div>
                            <Button 
                              onClick={handleGenerateApiKey} 
                              disabled={generating}
                              className="mt-2"
                            >
                              <Key className="h-4 w-4 mr-2" />
                              {generating ? "Generating..." : "Generate API Key"}
                            </Button>
                          </div>
                        </div>
                      )}
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
                      <Button 
                        variant="outline" 
                        onClick={testWordPressConnection}
                        disabled={testing || !settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressPassword}
                        className="w-full"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        {testing ? "Testing Connection..." : "Test WordPress Connection"}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Webhook Integration</CardTitle>
                      <CardDescription>
                        Configure webhook URL for automated notifications (optional)
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="webhookUrl">Webhook URL</Label>
                        <Input
                          id="webhookUrl"
                          value={settings.webhookUrl}
                          onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
                          placeholder="https://your-webhook-url.com"
                        />
                        <p className="text-xs text-muted-foreground">
                          Receive notifications when posts are published or updated
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
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
