import { Check, Circle, Sparkles, Type, FileText, HelpCircle, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface WorkflowProgressProps {
  currentStep: string;
  completedSteps: string[];
  onStepClick: (step: string) => void;
}

const steps: WorkflowStep[] = [
  { id: 'keywords', title: 'Keywords', description: 'SEO + LLMO research', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'headings', title: 'Headings', description: 'Query ladder structure', icon: <Type className="h-4 w-4" /> },
  { id: 'content', title: 'Content', description: '2000+ words SEO/LLMO', icon: <FileText className="h-4 w-4" /> },
  { id: 'faq', title: 'FAQ', description: 'Semantic Q&A', icon: <HelpCircle className="h-4 w-4" /> },
  { id: 'meta', title: 'Meta Tags', description: 'Schema + meta', icon: <Tag className="h-4 w-4" /> },
];

export function WorkflowProgress({ currentStep, completedSteps, onStepClick }: WorkflowProgressProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id);
              const isCurrent = currentStep === step.id;
              const isPast = index < currentIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => onStepClick(step.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 group transition-all",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-2",
                    isCurrent ? "opacity-100" : "opacity-70 hover:opacity-100"
                  )}
                >
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                      "shadow-sm",
                      isCompleted || isPast
                        ? "bg-primary border-primary text-primary-foreground"
                        : isCurrent
                        ? "bg-background border-primary text-primary ring-4 ring-primary/20"
                        : "bg-muted border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : step.icon}
                  </div>

                  {/* Step Info */}
                  <div className="text-center">
                    <p className={cn(
                      "text-sm font-medium",
                      isCurrent ? "text-primary" : "text-muted-foreground"
                    )}>
                      {step.title}
                    </p>
                    <p className="text-xs text-muted-foreground hidden lg:block">
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isPast = index < currentIndex;

            return (
              <button
                key={step.id}
                onClick={() => onStepClick(step.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-full border transition-all whitespace-nowrap",
                  isCompleted || isPast
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : isCurrent
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted border-border text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <span className="w-4 h-4 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                )}
                <span className="text-xs font-medium">{step.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
