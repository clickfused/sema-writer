import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { BlogGenerator } from "@/components/BlogGenerator";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTour, setShowTour] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        checkFirstTimeUser(session.user.id);
        checkApiKeys(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkFirstTimeUser = (userId: string) => {
    const tourCompleted = localStorage.getItem(`tour_completed_${userId}`);
    if (!tourCompleted) {
      setShowTour(true);
    }
  };

  const checkApiKeys = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_api_keys")
        .select("provider, is_valid")
        .eq("user_id", userId);

      if (error) throw error;

      // Check if user has at least one valid API key
      const hasValidKey = data?.some(key => key.is_valid) ?? false;
      setHasApiKeys(hasValidKey);
    } catch (error) {
      console.error("Error checking API keys:", error);
      setHasApiKeys(false);
    }
  };

  const handleTourComplete = () => {
    setShowTour(false);
  };

  const handleTourNavigate = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          <main className="flex-1 p-4 md:p-6">
            <BlogGenerator userId={user.id} />
          </main>
        </div>
      </div>
      
      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour
          userId={user.id}
          onComplete={handleTourComplete}
          onNavigate={handleTourNavigate}
        />
      )}
    </SidebarProvider>
  );
};

export default Dashboard;
