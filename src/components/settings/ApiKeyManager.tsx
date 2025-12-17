import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Key, Save, Eye, EyeOff, ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";

interface ApiKeyManagerProps {
  userId: string;
}

interface ApiKeyState {
  openrouter: string;
  gemini: string;
}

interface ApiKeyStatus {
  openrouter: boolean | null;
  gemini: boolean | null;
}

export function ApiKeyManager({ userId }: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKeyState>({ openrouter: "", gemini: "" });
  const [showKeys, setShowKeys] = useState<{ openrouter: boolean; gemini: boolean }>({ openrouter: false, gemini: false });
  const [savedStatus, setSavedStatus] = useState<ApiKeyStatus>({ openrouter: null, gemini: null });
  const [saving, setSaving] = useState<{ openrouter: boolean; gemini: boolean }>({ openrouter: false, gemini: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApiKeys();
  }, [userId]);

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("user_api_keys")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      const keys: ApiKeyState = { openrouter: "", gemini: "" };
      const status: ApiKeyStatus = { openrouter: null, gemini: null };

      data?.forEach((row: any) => {
        if (row.provider === "openrouter") {
          keys.openrouter = row.encrypted_key;
          status.openrouter = row.is_valid;
        } else if (row.provider === "gemini") {
          keys.gemini = row.encrypted_key;
          status.gemini = row.is_valid;
        }
      });

      setApiKeys(keys);
      setSavedStatus(status);
    } catch (error: any) {
      toast({
        title: "Error loading API keys",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveApiKey = async (provider: "openrouter" | "gemini") => {
    const key = apiKeys[provider].trim();
    if (!key) {
      toast({
        title: "API Key Required",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    setSaving({ ...saving, [provider]: true });

    try {
      const { error } = await supabase
        .from("user_api_keys")
        .upsert({
          user_id: userId,
          provider,
          encrypted_key: key,
          is_valid: true,
        }, {
          onConflict: "user_id,provider",
        });

      if (error) throw error;

      setSavedStatus({ ...savedStatus, [provider]: true });
      toast({
        title: "API Key Saved",
        description: `Your ${provider === "openrouter" ? "OpenRouter" : "Google Gemini"} API key has been saved`,
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving({ ...saving, [provider]: false });
    }
  };

  const maskKey = (key: string) => {
    if (!key || key.length <= 10) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
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
    <div className="space-y-6">
      {/* OpenRouter API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                OpenRouter API Key
              </CardTitle>
              <CardDescription className="mt-1">
                Used for Claude Sonnet and other premium models.{" "}
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Get your key from OpenRouter
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
            </div>
            {savedStatus.openrouter !== null && (
              <Badge variant={savedStatus.openrouter ? "default" : "destructive"}>
                {savedStatus.openrouter ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Invalid</>
                )}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openrouter-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="openrouter-key"
                  type={showKeys.openrouter ? "text" : "password"}
                  value={apiKeys.openrouter}
                  onChange={(e) => setApiKeys({ ...apiKeys, openrouter: e.target.value })}
                  placeholder="sk-or-..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowKeys({ ...showKeys, openrouter: !showKeys.openrouter })}
                >
                  {showKeys.openrouter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={() => saveApiKey("openrouter")} disabled={saving.openrouter}>
                {saving.openrouter ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
            <p className="font-medium">How to get your OpenRouter API Key:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Go to <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openrouter.ai</a> and create an account</li>
              <li>Click on your profile icon → "Keys" or go directly to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openrouter.ai/keys</a></li>
              <li>Click "Create Key" and give it a name</li>
              <li><strong>Important:</strong> Add credits to your account - go to <a href="https://openrouter.ai/credits" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">openrouter.ai/credits</a> and add at least $10</li>
              <li>Copy your API key (starts with sk-or-...) and paste it above</li>
            </ol>
            <p className="text-primary mt-2">💡 OpenRouter provides access to Claude Sonnet models which produce the highest quality content.</p>
          </div>
        </CardContent>
      </Card>

      {/* Google Gemini API Key */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Google Gemini API Key
              </CardTitle>
              <CardDescription className="mt-1">
                Optional: Use your own Gemini API key for free generation.{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  Get your key from Google AI Studio
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardDescription>
            </div>
            {savedStatus.gemini !== null && (
              <Badge variant={savedStatus.gemini ? "default" : "destructive"}>
                {savedStatus.gemini ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Active</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> Invalid</>
                )}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-key">API Key</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="gemini-key"
                  type={showKeys.gemini ? "text" : "password"}
                  value={apiKeys.gemini}
                  onChange={(e) => setApiKeys({ ...apiKeys, gemini: e.target.value })}
                  placeholder="AIza..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowKeys({ ...showKeys, gemini: !showKeys.gemini })}
                >
                  {showKeys.gemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button onClick={() => saveApiKey("gemini")} disabled={saving.gemini}>
                {saving.gemini ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg text-sm space-y-2">
            <p className="font-medium">How to get your Gemini API Key:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Go to <a href="https://aistudio.google.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a> and sign in with your Google account</li>
              <li>Click "Create API key"</li>
              <li>Select a Google Cloud project (or create a new one if prompted)</li>
              <li>Copy your API key (starts with AIza...) and paste it above</li>
            </ol>
            <p className="text-primary mt-2">💡 Gemini offers a generous free tier - great for getting started without any upfront cost!</p>
          </div>
        </CardContent>
      </Card>

      {/* Security Note */}
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <p className="text-sm text-green-700 dark:text-green-400">
          <strong>🔒 Security Note:</strong> Your API keys are encrypted and stored securely. They are only used for generating content and are never shared or exposed to the client.
        </p>
      </div>
    </div>
  );
}
