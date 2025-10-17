import { useState, useEffect } from "react";
import { KeywordInput } from "./blog-generator/KeywordInput";
import { MetaTagsForm } from "./blog-generator/MetaTagsForm";
import { HeadingBuilder } from "./blog-generator/HeadingBuilder";
import { FaqGenerator } from "./blog-generator/FaqGenerator";
import { ContentGenerator } from "./blog-generator/ContentGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAutoSave } from "@/hooks/useAutoSave";
import { supabase } from "@/integrations/supabase/client";

interface BlogGeneratorProps {
  userId: string;
}

export function BlogGenerator({ userId }: BlogGeneratorProps) {
  const [currentTab, setCurrentTab] = useState("keywords");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [keywords, setKeywords] = useState({
    primary: [] as string[],
    secondary: [] as string[],
    semantic: [] as string[],
    lsi: [] as string[],
  });
  const [metaTags, setMetaTags] = useState({
    title: "",
    description: "",
    slug: "",
  });
  const [headings, setHeadings] = useState({
    h1: "",
    h2s: [] as string[],
    h3s: [] as Array<{ h2Index: number; text: string }>,
  });
  const [faqContent, setFaqContent] = useState<Array<{ question: string; answer: string }>>([]);
  const [shortIntro, setShortIntro] = useState("");
  const [fullContent, setFullContent] = useState("");

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("auto_save_enabled")
        .eq("id", userId)
        .single();

      if (data) {
        setAutoSaveEnabled(data.auto_save_enabled ?? true);
      }
    };

    loadPreferences();
  }, [userId]);

  // Auto-save hook
  useAutoSave(
    {
      userId,
      keywords,
      metaTags,
      headings,
      shortIntro,
      content: fullContent,
      faqContent,
    },
    autoSaveEnabled
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Generate SEO-Optimized Blog Post</h2>
        <p className="text-muted-foreground">
          Follow the steps to create a fully optimized blog post with AI assistance
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="meta">Meta Tags</TabsTrigger>
          <TabsTrigger value="headings">Headings</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="mt-6">
          <KeywordInput 
            keywords={keywords} 
            setKeywords={setKeywords}
            onNext={() => setCurrentTab("meta")}
          />
        </TabsContent>

        <TabsContent value="meta" className="mt-6">
          <MetaTagsForm
            keywords={keywords}
            metaTags={metaTags}
            setMetaTags={setMetaTags}
            onNext={() => setCurrentTab("headings")}
          />
        </TabsContent>

        <TabsContent value="headings" className="mt-6">
          <HeadingBuilder
            keywords={keywords}
            headings={headings}
            setHeadings={setHeadings}
            onNext={() => setCurrentTab("faq")}
          />
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <FaqGenerator
            keywords={keywords}
            metaTags={metaTags}
            faqContent={faqContent}
            setFaqContent={setFaqContent}
            onNext={() => setCurrentTab("content")}
          />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <ContentGenerator
            userId={userId}
            keywords={keywords}
            metaTags={metaTags}
            headings={headings}
            faqContent={faqContent}
            shortIntro={shortIntro}
            setShortIntro={setShortIntro}
            fullContent={fullContent}
            setFullContent={setFullContent}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}