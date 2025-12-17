import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react";

interface BrandVoice {
  id: string;
  name: string;
  description: string | null;
  tone: string | null;
  style_guidelines: string | null;
  vocabulary_preferences: string | null;
  example_content: string | null;
  is_default: boolean | null;
}

interface BrandVoiceManagerProps {
  userId: string;
}

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "conversational", label: "Conversational" },
  { value: "friendly", label: "Friendly" },
  { value: "authoritative", label: "Authoritative" },
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "witty", label: "Witty" },
  { value: "empathetic", label: "Empathetic" },
];

export function BrandVoiceManager({ userId }: BrandVoiceManagerProps) {
  const [voices, setVoices] = useState<BrandVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVoice, setEditingVoice] = useState<BrandVoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tone: "",
    style_guidelines: "",
    vocabulary_preferences: "",
    example_content: "",
  });

  useEffect(() => {
    loadVoices();
  }, [userId]);

  const loadVoices = async () => {
    try {
      const { data, error } = await supabase
        .from("brand_voices")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVoices(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading brand voices",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      tone: "",
      style_guidelines: "",
      vocabulary_preferences: "",
      example_content: "",
    });
    setEditingVoice(null);
  };

  const openEditDialog = (voice: BrandVoice) => {
    setEditingVoice(voice);
    setFormData({
      name: voice.name,
      description: voice.description || "",
      tone: voice.tone || "",
      style_guidelines: voice.style_guidelines || "",
      vocabulary_preferences: voice.vocabulary_preferences || "",
      example_content: voice.example_content || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for the brand voice",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      if (editingVoice) {
        const { error } = await supabase
          .from("brand_voices")
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            tone: formData.tone || null,
            style_guidelines: formData.style_guidelines.trim() || null,
            vocabulary_preferences: formData.vocabulary_preferences.trim() || null,
            example_content: formData.example_content.trim() || null,
          })
          .eq("id", editingVoice.id);

        if (error) throw error;
        toast({ title: "Brand voice updated" });
      } else {
        const { error } = await supabase
          .from("brand_voices")
          .insert({
            user_id: userId,
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            tone: formData.tone || null,
            style_guidelines: formData.style_guidelines.trim() || null,
            vocabulary_preferences: formData.vocabulary_preferences.trim() || null,
            example_content: formData.example_content.trim() || null,
            is_default: voices.length === 0,
          });

        if (error) throw error;
        toast({ title: "Brand voice created" });
      }

      setDialogOpen(false);
      resetForm();
      loadVoices();
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this brand voice?")) return;

    setDeleting(id);
    try {
      const { error } = await supabase
        .from("brand_voices")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Brand voice deleted" });
      loadVoices();
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleting(null);
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      // Clear existing default
      await supabase
        .from("brand_voices")
        .update({ is_default: false })
        .eq("user_id", userId);

      // Set new default
      const { error } = await supabase
        .from("brand_voices")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Default brand voice updated" });
      loadVoices();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-primary" />
              Brand Voice & Knowledge
            </CardTitle>
            <CardDescription>
              Define your brand's unique voice and style to ensure consistent content generation
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Brand Voice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingVoice ? "Edit Brand Voice" : "Create Brand Voice"}</DialogTitle>
                <DialogDescription>
                  Define your brand's personality and writing style
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="voice-name">Name *</Label>
                  <Input
                    id="voice-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Corporate Blog Voice"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice-description">Description</Label>
                  <Textarea
                    id="voice-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this brand voice..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice-tone">Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone" />
                    </SelectTrigger>
                    <SelectContent>
                      {TONE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice-style">Style Guidelines</Label>
                  <Textarea
                    id="voice-style"
                    value={formData.style_guidelines}
                    onChange={(e) => setFormData({ ...formData, style_guidelines: e.target.value })}
                    placeholder="Describe writing style preferences, sentence structure, use of jargon, etc."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice-vocab">Vocabulary Preferences</Label>
                  <Textarea
                    id="voice-vocab"
                    value={formData.vocabulary_preferences}
                    onChange={(e) => setFormData({ ...formData, vocabulary_preferences: e.target.value })}
                    placeholder="Words to use, words to avoid, terminology preferences..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="voice-example">Example Content</Label>
                  <Textarea
                    id="voice-example"
                    value={formData.example_content}
                    onChange={(e) => setFormData({ ...formData, example_content: e.target.value })}
                    placeholder="Paste example content that represents your brand voice..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingVoice ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {voices.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed rounded-lg">
            <Mic className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <h4 className="font-medium">No brand voices yet</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first brand voice to ensure consistent content
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {voices.map((voice) => (
              <div
                key={voice.id}
                className="p-4 border rounded-lg flex items-start justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{voice.name}</h4>
                    {voice.is_default && (
                      <Badge variant="secondary">
                        <Star className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    )}
                    {voice.tone && (
                      <Badge variant="outline">{voice.tone}</Badge>
                    )}
                  </div>
                  {voice.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {voice.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!voice.is_default && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAsDefault(voice.id)}
                      title="Set as default"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(voice)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(voice.id)}
                    disabled={deleting === voice.id}
                    className="text-destructive hover:text-destructive"
                  >
                    {deleting === voice.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
