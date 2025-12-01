import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Check, ExternalLink, Code, Settings, Globe } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";

export default function WordPressPlugin() {
  const [downloading, setDownloading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [navigate]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // In a real implementation, this would create a ZIP file
      // For now, we'll just show instructions for manual download
      toast({
        title: "Download Instructions",
        description: "Download the plugin files from /public/wordpress-plugin folder",
      });
      
      // Open the folder location in a new tab
      window.open('/wordpress-plugin/', '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download plugin",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: "Download Plugin",
      description: "Download the ClickFused Connector plugin ZIP file",
      icon: Download
    },
    {
      number: 2,
      title: "Install on WordPress",
      description: "Go to Plugins > Add New > Upload Plugin in your WordPress admin",
      icon: Globe
    },
    {
      number: 3,
      title: "Activate Plugin",
      description: "Activate the ClickFused Connector plugin",
      icon: Check
    },
    {
      number: 4,
      title: "Generate API Key",
      description: "Go to Settings page and generate your API key for authentication",
      icon: Code,
      action: () => navigate("/settings")
    },
    {
      number: 5,
      title: "Configure WordPress",
      description: "Enter the API key in WordPress plugin settings",
      icon: Settings
    }
  ] as Array<{
    number: number;
    title: string;
    description: string;
    icon: any;
    action?: () => void;
  }>;

  const features = [
    "Publish posts directly from ClickFused dashboard",
    "Edit existing WordPress posts remotely",
    "Delete posts from ClickFused interface",
    "Sync SEO meta descriptions automatically",
    "Secure API key authentication",
    "Support for draft and published status",
    "Connection testing built-in"
  ];

  const apiEndpoints = [
    {
      method: "GET",
      path: "/wp-json/clickfused/v1/verify",
      description: "Verify connection and API key"
    },
    {
      method: "POST",
      path: "/wp-json/clickfused/v1/posts",
      description: "Create or update a post"
    },
    {
      method: "DELETE",
      path: "/wp-json/clickfused/v1/posts/{id}",
      description: "Delete a post"
    },
    {
      method: "GET",
      path: "/wp-json/clickfused/v1/posts",
      description: "Get synced posts"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {user && <DashboardHeader user={user} />}
      
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold">WordPress Plugin</h1>
            <p className="text-lg text-muted-foreground">
              Connect your WordPress site to ClickFused for seamless content management
            </p>
            <div className="flex justify-center gap-2">
              <Badge variant="secondary">Free Forever</Badge>
              <Badge variant="secondary">v1.0.0</Badge>
              <Badge variant="secondary">WordPress 5.8+</Badge>
            </div>
          </div>

          {/* Download Card */}
          <Card className="border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Download ClickFused Connector</CardTitle>
              <CardDescription>
                Install this plugin on your WordPress site to enable remote publishing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                size="lg" 
                className="w-full" 
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="mr-2 h-5 w-5" />
                {downloading ? "Preparing Download..." : "Download Plugin"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Compatible with WordPress 5.8+ and PHP 7.4+
              </p>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
              <CardDescription>
                Everything you need for seamless WordPress integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
              <CardDescription>
                Follow these steps to connect your WordPress site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.number} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold">
                          {step.number}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <h3 className="font-semibold">{step.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        {step.action && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={step.action}
                            className="mt-2"
                          >
                            Go to Settings
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* API Endpoints */}
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>
                REST API endpoints created by the plugin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiEndpoints.map((endpoint, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{endpoint.method}</Badge>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {endpoint.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium mb-2">Authentication</p>
                <p className="text-sm text-muted-foreground">
                  All requests require the <code className="bg-background px-1 py-0.5 rounded">X-ClickFused-API-Key</code> header
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>Documentation & Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="https://clickfused.com/docs" target="_blank" rel="noopener noreferrer">
                  <span>View Full Documentation</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-between" asChild>
                <a href="https://clickfused.com/support" target="_blank" rel="noopener noreferrer">
                  <span>Get Support</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-2">WordPress</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Version 5.8 or higher</li>
                    <li>• Admin access</li>
                    <li>• Plugin installation rights</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium mb-2">Server</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• PHP 7.4 or higher</li>
                    <li>• REST API enabled</li>
                    <li>• HTTPS recommended</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
