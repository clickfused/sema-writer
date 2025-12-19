import { useState, useEffect } from "react";
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
  Info,
  Zap
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
  const [validatingOpenrouter, setValidatingOpenrouter] = useState(false);
  const [validatingGemini, setValidatingGemini] = useState(false);
  const [openrouterStatus, setOpenrouterStatus] = useState<"valid" | "invalid" | null>(null);
  const [geminiStatus, setGeminiStatus] = useState<"valid" | "invalid" | null>(null);

  // Load existing API key status on mount
  useEffect(() => {
    loadExistingKeyStatus();
  }, [userId]);

  const loadExistingKeyStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("user_api_keys")
        .select("provider, is_valid")
        .eq("user_id", userId);

      if (error) throw error;

      data?.forEach((key) => {
        if (key.provider === "openrouter") {
          setOpenrouterStatus(key.is_valid ? "valid" : "invalid");
        } else if (key.provider === "gemini") {
          setGeminiStatus(key.is_valid ? "valid" : "invalid");
        }
      });
    } catch (error) {
      console.error("Error loading API key status:", error);
    }
  };

  // Validate OpenRouter API key
  const validateOpenrouterKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${key}`,
        },
      });
      return response.ok;
    } catch (error) {
      console.error("OpenRouter validation error:", error);
      return false;
    }
  };

  // Validate Gemini API key
  const validateGeminiKey = async (key: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
        { method: "GET" }
      );
      return response.ok;
    } catch (error) {
      console.error("Gemini validation error:", error);
      return false;
    }
  };

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
    const setValidating = provider === "openrouter" ? setValidatingOpenrouter : setValidatingGemini;
    const setStatus = provider === "openrouter" ? setOpenrouterStatus : setGeminiStatus;

    setSaving(true);
    setValidating(true);

    try {
      // Validate the key first
      toast({
        title: "Validating API Key",
        description: "Testing connection to the API...",
      });

      const isValid = provider === "openrouter" 
        ? await validateOpenrouterKey(key)
        : await validateGeminiKey(key);

      setValidating(false);

      if (!isValid) {
        setStatus("invalid");
        toast({
          title: "Invalid API Key",
          description: `The ${provider === "openrouter" ? "OpenRouter" : "Gemini"} API key is invalid. Please check and try again.`,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Key is valid, save it
      const { data: existing } = await supabase
        .from("user_api_keys")
        .select("id")
        .eq("user_id", userId)
        .eq("provider", provider)
        .single();

      if (existing) {
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
        title: "API Key Verified & Saved ✓",
        description: `Your ${provider === "openrouter" ? "OpenRouter" : "Gemini"} API key is working and has been saved.`,
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
      setValidating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription>
          Add your API keys to start generating AI content. Keys are validated before saving to ensure they work correctly.
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
                <CardDescription>Required for Claude Sonnet 4 & 4.5 models</CardDescription>
              </div>
            </div>
            {openrouterStatus === "valid" && (
              <Badge className="bg-primary/10 text-primary border-primary/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
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
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {validatingOpenrouter ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : savingOpenrouter ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Validate & Save
                </>
              )}
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
                <CardDescription>Free tier available - Best for getting started</CardDescription>
              </div>
            </div>
            {geminiStatus === "valid" && (
              <Badge className="bg-primary/10 text-primary border-primary/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Verified
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
              href="https://aistudio.google.com/app/apikey"
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
              className="bg-accent hover:bg-accent/90 gap-2"
            >
              {validatingGemini ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : savingGemini ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Validate & Save
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
