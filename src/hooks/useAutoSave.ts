import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AutoSaveData {
  userId: string;
  keywords: any;
  metaTags: any;
  headings: any;
  content: string;
  faqContent: any;
}

export function useAutoSave(data: AutoSaveData, enabled: boolean = true) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>("");
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveDraft = useCallback(async () => {
    if (!enabled) return;

    const dataString = JSON.stringify(data);
    if (dataString === lastSavedRef.current) return;

    setIsSaving(true);
    try {
      const { data: existingDraft } = await supabase
        .from("blog_drafts")
        .select("id")
        .eq("user_id", data.userId)
        .maybeSingle();

      if (existingDraft) {
        const { error } = await supabase
          .from("blog_drafts")
          .update({
            keywords: data.keywords,
            meta_tags: data.metaTags,
            headings: data.headings,
            short_intro: "",
            content: data.content,
            faq_content: data.faqContent,
          })
          .eq("id", existingDraft.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("blog_drafts")
          .insert({
            user_id: data.userId,
            keywords: data.keywords,
            meta_tags: data.metaTags,
            headings: data.headings,
            short_intro: "",
            content: data.content,
            faq_content: data.faqContent,
          });

        if (error) throw error;
      }

      lastSavedRef.current = dataString;
      setLastSavedTime(new Date());
    } catch (error: any) {
      console.error("Auto-save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [data, enabled]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [saveDraft]);

  // Calculate seconds since last save
  const getSecondsSinceLastSave = useCallback(() => {
    if (!lastSavedTime) return null;
    return Math.floor((Date.now() - lastSavedTime.getTime()) / 1000);
  }, [lastSavedTime]);

  return { 
    saveDraft, 
    isSaving, 
    lastSavedTime, 
    getSecondsSinceLastSave 
  };
}
