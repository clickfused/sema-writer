import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Key, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Loader2,
  Info
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ApiKeySetupProps {
  userId: string;
  onComplete?: () => void;
}

export function ApiKeySetup({ userId, onComplete }: ApiKeySetupProps) {
  const [openrouterKey, setOpenrouterKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [showOpenrouter, setShowOpenrouter] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [savingOpenrouter, setSavingOpenrouter] = useState(false);
  const [savingGemini, setSavingGemini] = useState(false);
  const [openrouterStatus, setOpenrouterStatus] = useState<"valid" | "invalid" | null>(null);
  const [geminiStatus, setGeminiStatus] = useState<"valid" | "invalid" | null>(null);

  const saveApiKey = async (provider: string, key: string) => {
    if (!key.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }

    const setSaving = provider === "openrouter" ? setSavingOpenrouter : setSavingGemini;
    const setStatus = provider === "openrouter" ? setOpenrouterStatus : setGeminiStatus;

    setSaving(true);
    try {
      // Check if key exists
      const { data: existing } = await supabase
        .from("user_api_keys")
        .select("id")
        .eq("user_id", userId)
        .eq("provider", provider)
        .single();

      if (existing) {
        // Update existing key
        const { error } = await supabase
          .from("user_api_keys")
          .update({
            encrypted_key: key,
            is_valid: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Insert new key
        const { error } = await supabase
          .from("user_api_keys")
          .insert({
            user_id: userId,
            provider,
            encrypted_key: key,
            is_valid: true,
          });

        if (error) throw error;
      }

      setStatus("valid");
      toast({
        title: "API Key Saved",
        description: `Your ${provider === "openrouter" ? "OpenRouter" : "Gemini"} API key has been saved successfully.`,
      });

      if (onComplete) onComplete();
    } catch (error: any) {
      setStatus("invalid");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription>
          Add your API keys to start generating AI content. Your keys are stored securely and used only for content generation.
        </AlertDescription>
      </Alert>

      {/* OpenRouter API Key */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">OpenRouter API Key</CardTitle>
                <CardDescription>Required for Claude Sonnet models</CardDescription>
              </div>
            </div>
            {openrouterStatus === "valid" && (
              <Badge className="bg-primary/10 text-primary border-primary/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
            {openrouterStatus === "invalid" && (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Invalid
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openrouter-key">API Key</Label>
            <div className="relative">
              <Input
                id="openrouter-key"
                type={showOpenrouter ? "text" : "password"}
                placeholder="sk-or-v1-..."
                value={openrouterKey}
                onChange={(e) => setOpenrouterKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowOpenrouter(!showOpenrouter)}
              >
                {showOpenrouter ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              Get your OpenRouter API key
              <ExternalLink className="h-3 w-3" />
            </a>
            <Button
              onClick={() => saveApiKey("openrouter", openrouterKey)}
              disabled={savingOpenrouter || !openrouterKey.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              {savingOpenrouter && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gemini API Key */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
                <Key className="h-5 w-5 text-accent" />
              </div>
              <div>
                <CardTitle className="text-lg">Google Gemini API Key</CardTitle>
                <CardDescription>Required for Gemini models (Free tier available)</CardDescription>
              </div>
            </div>
            {geminiStatus === "valid" && (
              <Badge className="bg-primary/10 text-primary border-primary/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            )}
            {geminiStatus === "invalid" && (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Invalid
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-key">API Key</Label>
            <div className="relative">
              <Input
                id="gemini-key"
                type={showGemini ? "text" : "password"}
                placeholder="AIza..."
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowGemini(!showGemini)}
              >
                {showGemini ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <a
              href="https://makersuite.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline flex items-center gap-1"
            >
              Get your Gemini API key (Free)
              <ExternalLink className="h-3 w-3" />
            </a>
            <Button
              onClick={() => saveApiKey("gemini", geminiKey)}
              disabled={savingGemini || !geminiKey.trim()}
              className="bg-accent hover:bg-accent/90"
            >
              {savingGemini && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Key
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
