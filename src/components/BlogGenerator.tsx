import { useState, useEffect, useMemo, useCallback } from "react";
import { KeywordInput } from "./blog-generator/KeywordInput";
import { MetaTagsForm } from "./blog-generator/MetaTagsForm";
import { HeadingBuilder } from "./blog-generator/HeadingBuilder";
import { FaqGenerator } from "./blog-generator/FaqGenerator";
import { ContentGenerator } from "./blog-generator/ContentGenerator";
import { ContextUploader } from "./blog-generator/ContextUploader";
import { WorkflowProgress } from "./blog-generator/WorkflowProgress";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAutoSave } from "@/hooks/useAutoSave";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Sparkles, Save, Loader2 } from "lucide-react";

interface BlogGeneratorProps {
  userId: string;
}

interface UserIntent {
  primaryIntent: string;
  intentSignals: string[];
  searcherGoal: string;
  contentAngle: string;
}

export function BlogGenerator({ userId }: BlogGeneratorProps) {
  const [currentTab, setCurrentTab] = useState("keywords");
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [secondsDisplay, setSecondsDisplay] = useState<number | null>(null);
  const [keywords, setKeywords] = useState({
    primary: [] as string[],
    secondary: [] as string[],
    semantic: [] as string[],
    lsi: [] as string[],
    conversational: [] as string[],
    related: [] as string[],
    longTail: [] as string[],
    autoSuggestions: [] as string[],
  });
  const [userIntent, setUserIntent] = useState<UserIntent | null>(null);
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
  const [faqContent, setFaqContent] = useState<Array<{
    intent?: string;
    question: string;
    conversationalVariation?: string;
    longtailVariation?: string;
    answer: string;
    namedEntities?: string[];
    conceptualEntities?: string[];
  }>>([]);
  
  const [fullContent, setFullContent] = useState("");
  const [contextContent, setContextContent] = useState("");

  // Calculate completed steps based on content
  const completedSteps = useMemo(() => {
    const completed: string[] = [];
    
    if (keywords.primary.length > 0 || keywords.secondary.length > 0) {
      completed.push('keywords');
    }
    if (headings.h2s.length > 0) {
      completed.push('headings');
    }
    if (fullContent.length > 500) {
      completed.push('content');
    }
    if (faqContent.length > 0) {
      completed.push('faq');
    }
    if (metaTags.title && metaTags.description) {
      completed.push('meta');
    }
    
    return completed;
  }, [keywords, headings, fullContent, faqContent, metaTags]);

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
  const { isSaving, lastSavedTime, getSecondsSinceLastSave } = useAutoSave(
    {
      userId,
      keywords,
      metaTags,
      headings,
      content: fullContent,
      faqContent,
    },
    autoSaveEnabled
  );

  // Update seconds display every second
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = getSecondsSinceLastSave();
      setSecondsDisplay(seconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [getSecondsSinceLastSave]);

  const wordCount = fullContent.split(/\s+/).filter((word) => word.length > 0).length;

  const formatTimeSince = useCallback((seconds: number | null) => {
    if (seconds === null) return null;
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            SEO Blog Generator
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered content creation with real-time optimization
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-2">
          {/* Auto-save Status */}
          {autoSaveEnabled && (
            <Badge 
              variant="outline" 
              className={`flex items-center gap-1.5 px-3 py-1.5 ${
                isSaving ? 'border-primary/50 bg-primary/5' : ''
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                  <span>Saving...</span>
                </>
              ) : lastSavedTime ? (
                <>
                  <Save className="h-3.5 w-3.5 text-primary" />
                  <span>Saved {formatTimeSince(secondsDisplay)}</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Auto-save on</span>
                </>
              )}
            </Badge>
          )}
          
          <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1.5">
            {completedSteps.length === 5 ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-accent" />
            )}
            {completedSteps.length}/5 Steps
          </Badge>
          {wordCount > 0 && (
            <Badge variant="secondary" className="px-3 py-1.5">
              {wordCount.toLocaleString()} words
            </Badge>
          )}
          {keywords.primary.length > 0 && (
            <Badge variant="secondary" className="px-3 py-1.5">
              {keywords.primary.length + keywords.secondary.length} keywords
            </Badge>
          )}
        </div>
      </div>

      {/* Workflow Progress */}
      <Card className="border-2 border-primary/10 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-6">
          <WorkflowProgress
            currentStep={currentTab}
            completedSteps={completedSteps}
            onStepClick={setCurrentTab}
          />
        </CardContent>
      </Card>

      {/* Tab Content */}
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsContent value="keywords" className="mt-0 animate-in fade-in-50 duration-300">
          <div className="space-y-6">
            <ContextUploader 
              contextContent={contextContent}
              setContextContent={setContextContent}
            />
            <KeywordInput 
              keywords={keywords} 
              setKeywords={setKeywords}
              userIntent={userIntent}
              setUserIntent={setUserIntent}
              contextContent={contextContent}
              onNext={() => setCurrentTab("headings")}
            />
          </div>
        </TabsContent>

        <TabsContent value="headings" className="mt-0 animate-in fade-in-50 duration-300">
          <HeadingBuilder
            keywords={keywords}
            headings={headings}
            setHeadings={setHeadings}
            userIntent={userIntent}
            contextContent={contextContent}
            onNext={() => setCurrentTab("content")}
          />
        </TabsContent>

        <TabsContent value="content" className="mt-0 animate-in fade-in-50 duration-300">
          <ContentGenerator
            userId={userId}
            keywords={keywords}
            metaTags={metaTags}
            headings={headings}
            faqContent={faqContent}
            fullContent={fullContent}
            setFullContent={setFullContent}
            contextContent={contextContent}
            userIntent={userIntent}
            onNext={() => setCurrentTab("faq")}
          />
        </TabsContent>

        <TabsContent value="faq" className="mt-0 animate-in fade-in-50 duration-300">
          <FaqGenerator
            keywords={keywords}
            metaTags={metaTags}
            faqContent={faqContent}
            setFaqContent={setFaqContent}
            fullContent={fullContent}
            userIntent={userIntent}
            onNext={() => setCurrentTab("meta")}
          />
        </TabsContent>

        <TabsContent value="meta" className="mt-0 animate-in fade-in-50 duration-300">
          <MetaTagsForm
            keywords={keywords}
            headings={headings}
            faqContent={faqContent}
            metaTags={metaTags}
            setMetaTags={setMetaTags}
            onNext={() => {}}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
