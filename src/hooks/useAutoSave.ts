import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AutoSaveData {
  userId: string;
  keywords: any;
  metaTags: any;
  headings: any;
  shortIntro: string;
  content: string;
  faqContent: any;
}

export function useAutoSave(data: AutoSaveData, enabled: boolean = true) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>("");

  const saveDraft = useCallback(async () => {
    if (!enabled) return;

    const dataString = JSON.stringify(data);
    if (dataString === lastSavedRef.current) return;

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
            short_intro: data.shortIntro,
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
            short_intro: data.shortIntro,
            content: data.content,
            faq_content: data.faqContent,
          });

        if (error) throw error;
      }

      lastSavedRef.current = dataString;
    } catch (error: any) {
      console.error("Auto-save error:", error);
    }
  }, [data, enabled]);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [saveDraft]);

  return { saveDraft };
}
