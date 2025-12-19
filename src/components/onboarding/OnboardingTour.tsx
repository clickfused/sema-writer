import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Key, 
  FileText, 
  Settings, 
  Sparkles,
  CheckCircle2,
  Rocket,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  highlight?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "Welcome to ClickFused! 🎉",
    description: "Let's get you set up to create amazing AI-powered blog content. This quick tour will show you how to get started in just a few steps.",
    icon: <Rocket className="h-8 w-8 text-primary" />,
  },
  {
    id: "api-keys",
    title: "Step 1: Set Up Your API Keys",
    description: "To generate content, you'll need to add your API keys. Go to Settings → API Keys and add your OpenRouter or Gemini API key. This enables AI content generation.",
    icon: <Key className="h-8 w-8 text-primary" />,
    action: "Go to Settings",
    highlight: "settings-link",
  },
  {
    id: "keywords",
    title: "Step 2: Enter Keywords",
    description: "Start by entering your primary keywords in the Keywords tab. Add secondary, semantic, and LSI keywords to optimize your content for SEO.",
    icon: <Sparkles className="h-8 w-8 text-accent" />,
    highlight: "keywords-tab",
  },
  {
    id: "meta",
    title: "Step 3: Meta Tags & Headings",
    description: "Fill in your meta title, description, and URL slug. Then create your heading structure (H1, H2s, H3s) to outline your article.",
    icon: <FileText className="h-8 w-8 text-accent" />,
    highlight: "meta-tab",
  },
  {
    id: "generate",
    title: "Step 4: Generate Content",
    description: "Choose your AI model, content framework, and settings. Click 'Generate Full Article' to create your SEO-optimized blog post!",
    icon: <Zap className="h-8 w-8 text-primary" />,
    highlight: "content-tab",
  },
  {
    id: "complete",
    title: "You're All Set! 🚀",
    description: "You can now create unlimited AI-powered blog content. Remember to save your posts and export them when ready. Happy writing!",
    icon: <CheckCircle2 className="h-8 w-8 text-primary" />,
  },
];

interface OnboardingTourProps {
  userId: string;
  onComplete: () => void;
  onNavigate?: (path: string) => void;
}

export function OnboardingTour({ userId, onComplete, onNavigate }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Mark tour as completed in localStorage
    localStorage.setItem(`tour_completed_${userId}`, "true");
    setIsVisible(false);
    onComplete();
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleAction = () => {
    if (step.action === "Go to Settings" && onNavigate) {
      onNavigate("/settings");
    }
    handleNext();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 border-primary/20 shadow-2xl">
        <CardHeader className="relative pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={handleSkip}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              Step {currentStep + 1} of {tourSteps.length}
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              {step.icon}
            </div>
            <div>
              <CardTitle className="text-xl">{step.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <CardDescription className="text-base leading-relaxed">
            {step.description}
          </CardDescription>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex gap-1 justify-center">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-colors ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between gap-4 pt-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            {currentStep < tourSteps.length - 1 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tour
              </Button>
            )}
            
            {step.action ? (
              <Button onClick={handleAction} className="gap-2 bg-primary hover:bg-primary/90">
                {step.action}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2 bg-primary hover:bg-primary/90">
                {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
