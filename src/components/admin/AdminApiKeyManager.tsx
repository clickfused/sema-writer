import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Key, 
  Save, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Trash2,
  Plus,
  RefreshCw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdminApiKey {
  id: string;
  provider: string;
  encrypted_key: string;
  is_active: boolean;
  is_valid: boolean | null;
  last_validated_at: string | null;
  created_at: string;
  updated_at: string;
}

const PROVIDERS = [
  { value: "openrouter", label: "OpenRouter", prefix: "sk-or-", description: "Claude Sonnet & premium models" },
  { value: "gemini", label: "Google Gemini", prefix: "AIza", description: "Gemini Pro & Flash models" },
  { value: "openai", label: "OpenAI", prefix: "sk-", description: "GPT-4 & GPT-3.5 models" },
  { value: "anthropic", label: "Anthropic", prefix: "sk-ant-", description: "Claude direct API" },
];

export function AdminApiKeyManager() {
  const [apiKeys, setApiKeys] = useState<AdminApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<AdminApiKey | null>(null);
  const [formData, setFormData] = useState({
    provider: "",
    encrypted_key: "",
    is_active: true,
  });
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState<string | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_api_keys")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      setApiKeys(data || []);
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

  const validateApiKey = async (provider: string, key: string): Promise<boolean> => {
    try {
      if (provider === "openrouter") {
        const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
          headers: { Authorization: `Bearer ${key}` },
        });
        return response.ok;
      } else if (provider === "gemini") {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
        );
        return response.ok;
      } else if (provider === "openai") {
        const response = await fetch("https://api.openai.com/v1/models", {
          headers: { Authorization: `Bearer ${key}` },
        });
        return response.ok;
      } else if (provider === "anthropic") {
        // Anthropic doesn't have a simple validation endpoint
        // We'll assume it's valid if it matches the format
        return key.startsWith("sk-ant-");
      }
      return false;
    } catch {
      return false;
    }
  };

  const openCreateDialog = () => {
    setEditingKey(null);
    setFormData({ provider: "", encrypted_key: "", is_active: true });
    setShowKey(false);
    setDialogOpen(true);
  };

  const openEditDialog = (apiKey: AdminApiKey) => {
    setEditingKey(apiKey);
    setFormData({
      provider: apiKey.provider,
      encrypted_key: apiKey.encrypted_key,
      is_active: apiKey.is_active,
    });
    setShowKey(false);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.provider || !formData.encrypted_key.trim()) {
      toast({
        title: "Error",
        description: "Provider and API key are required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Validate the API key
      const isValid = await validateApiKey(formData.provider, formData.encrypted_key.trim());

      if (editingKey) {
        const { error } = await supabase
          .from("admin_api_keys")
          .update({
            encrypted_key: formData.encrypted_key.trim(),
            is_active: formData.is_active,
            is_valid: isValid,
            last_validated_at: new Date().toISOString(),
          })
          .eq("id", editingKey.id);

        if (error) throw error;

        toast({
          title: isValid ? "API Key Updated" : "Key Saved (Invalid)",
          description: isValid
            ? `${formData.provider} API key has been updated and validated`
            : "Key saved but validation failed. Please check the key.",
          variant: isValid ? "default" : "destructive",
        });
      } else {
        // Check if provider already exists
        const existing = apiKeys.find((k) => k.provider === formData.provider);
        if (existing) {
          toast({
            title: "Provider Exists",
            description: "An API key for this provider already exists. Edit it instead.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }

        const { error } = await supabase.from("admin_api_keys").insert({
          provider: formData.provider,
          encrypted_key: formData.encrypted_key.trim(),
          is_active: formData.is_active,
          is_valid: isValid,
          last_validated_at: new Date().toISOString(),
        });

        if (error) throw error;

        toast({
          title: isValid ? "API Key Added" : "Key Added (Invalid)",
          description: isValid
            ? `${formData.provider} API key has been added and validated`
            : "Key added but validation failed. Please check the key.",
          variant: isValid ? "default" : "destructive",
        });
      }

      setDialogOpen(false);
      await loadApiKeys();
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

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("admin_api_keys").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "API Key Deleted",
        description: "The API key has been removed",
      });

      await loadApiKeys();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (apiKey: AdminApiKey) => {
    try {
      const { error } = await supabase
        .from("admin_api_keys")
        .update({ is_active: !apiKey.is_active })
        .eq("id", apiKey.id);

      if (error) throw error;

      await loadApiKeys();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const revalidateKey = async (apiKey: AdminApiKey) => {
    setValidating(apiKey.id);
    try {
      const isValid = await validateApiKey(apiKey.provider, apiKey.encrypted_key);

      const { error } = await supabase
        .from("admin_api_keys")
        .update({
          is_valid: isValid,
          last_validated_at: new Date().toISOString(),
        })
        .eq("id", apiKey.id);

      if (error) throw error;

      toast({
        title: isValid ? "Key Valid" : "Key Invalid",
        description: isValid
          ? "API key is working correctly"
          : "API key validation failed. Please update the key.",
        variant: isValid ? "default" : "destructive",
      });

      await loadApiKeys();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setValidating(null);
    }
  };

  const maskKey = (key: string) => {
    if (!key || key.length <= 10) return key;
    return `${key.substring(0, 8)}...${key.substring(key.length - 4)}`;
  };

  const getProviderInfo = (provider: string) => {
    return PROVIDERS.find((p) => p.value === provider) || { label: provider, description: "" };
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            System API Keys
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage API keys for all users (fallback when users don't have their own keys)
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add API Key
        </Button>
      </div>

      <div className="grid gap-4">
        {apiKeys.map((apiKey) => {
          const providerInfo = getProviderInfo(apiKey.provider);
          return (
            <Card key={apiKey.id} className={!apiKey.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Key className="h-4 w-4" />
                      {providerInfo.label}
                      {apiKey.is_valid === true && (
                        <Badge variant="default" className="ml-2">
                          <CheckCircle className="h-3 w-3 mr-1" /> Valid
                        </Badge>
                      )}
                      {apiKey.is_valid === false && (
                        <Badge variant="destructive" className="ml-2">
                          <XCircle className="h-3 w-3 mr-1" /> Invalid
                        </Badge>
                      )}
                      {!apiKey.is_active && (
                        <Badge variant="secondary" className="ml-2">
                          Inactive
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{providerInfo.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => revalidateKey(apiKey)}
                      disabled={validating === apiKey.id}
                    >
                      {validating === apiKey.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Switch
                      checked={apiKey.is_active}
                      onCheckedChange={() => toggleActive(apiKey)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(apiKey)}
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the {providerInfo.label} API key? This
                            action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(apiKey.id)}
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
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Key: {maskKey(apiKey.encrypted_key)}</span>
                  {apiKey.last_validated_at && (
                    <span>
                      Last validated:{" "}
                      {new Date(apiKey.last_validated_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {apiKeys.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No System API Keys</h3>
              <p className="text-muted-foreground mb-4">
                Add API keys that will be used as fallback for content generation
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add First API Key
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingKey ? "Edit API Key" : "Add API Key"}</DialogTitle>
            <DialogDescription>
              {editingKey
                ? "Update the API key details"
                : "Add a new system-wide API key for content generation"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editingKey && (
              <div className="space-y-2">
                <Label htmlFor="provider">Provider *</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(value) => setFormData({ ...formData, provider: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.filter(
                      (p) => !apiKeys.find((k) => k.provider === p.value)
                    ).map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        <div>
                          <span className="font-medium">{provider.label}</span>
                          <span className="text-muted-foreground ml-2">
                            - {provider.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key *</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  value={formData.encrypted_key}
                  onChange={(e) =>
                    setFormData({ ...formData, encrypted_key: e.target.value })
                  }
                  placeholder={
                    formData.provider
                      ? PROVIDERS.find((p) => p.value === formData.provider)?.prefix + "..."
                      : "Enter API key..."
                  }
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>

            {formData.provider && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-2">Get your API key:</p>
                {formData.provider === "openrouter" && (
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    OpenRouter API Keys <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {formData.provider === "gemini" && (
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Google AI Studio <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {formData.provider === "openai" && (
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    OpenAI API Keys <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {formData.provider === "anthropic" && (
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Anthropic Console <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingKey ? "Update" : "Add"} & Validate
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
