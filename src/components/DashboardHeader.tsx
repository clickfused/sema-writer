import { User } from "@supabase/supabase-js";
import { Sparkles } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b bg-card">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Ai Writer by Clik Fused</h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {user.email}
          </div>
        </div>
      </div>
    </header>
  );
}