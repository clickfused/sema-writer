import { 
  FileText, 
  PenTool, 
  LogOut, 
  Settings as SettingsIcon, 
  Plug, 
  FileCode, 
  BarChart3, 
  Shield,
  Home,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import clickFusedLogo from "@/assets/click-fused-logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

const mainMenuItems = [
  { title: "Generate Blog", url: "/dashboard", icon: Sparkles, description: "Create AI content" },
  { title: "My Blogs", url: "/my-blogs", icon: FileText, description: "View saved blogs" },
  { title: "SEO Files", url: "/seo-files", icon: FileCode, description: "Robots & sitemap" },
  { title: "GEO Tracking", url: "/geo-tracking", icon: BarChart3, description: "Location analytics" },
];

const integrationMenuItems = [
  { title: "WordPress", url: "/wordpress-plugin", icon: Plug, description: "Connect WordPress" },
  { title: "Settings", url: "/settings", icon: SettingsIcon, description: "API keys & config" },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium border-l-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/auth");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startTour = () => {
    const userId = supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        localStorage.removeItem(`tour_completed_${data.user.id}`);
        window.location.reload();
      }
    });
  };

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r border-border bg-sidebar`}>
      {/* Logo Header */}
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img 
            src={clickFusedLogo} 
            alt="ClickFused" 
            className="h-8 w-8 rounded-lg"
          />
          {!collapsed && (
            <div>
              <h1 className="font-bold text-lg text-sidebar-foreground">ClickFused</h1>
              <p className="text-xs text-muted-foreground">AI Content Studio</p>
            </div>
          )}
        </div>
        <div className="mt-3">
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
            {!collapsed && "Content"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <div className="flex flex-col">
                          <span className="text-sm">{item.title}</span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-2" />

        {/* Integrations */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
            {!collapsed && "Integrations"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {integrationMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && (
                        <span className="text-sm">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className="h-10">
                    <NavLink to="/admin" end className={getNavCls}>
                      <Shield className="h-4 w-4 shrink-0" />
                      {!collapsed && <span className="text-sm">Admin Panel</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-2 border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={startTour}
              className="h-10 text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <HelpCircle className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-sm">Take a Tour</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-sm">Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
