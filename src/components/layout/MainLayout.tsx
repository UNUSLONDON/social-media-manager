
import { ReactNode, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileImage, 
  Headphones, 
  Share2, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut
} from "lucide-react";

import { useTheme } from "@/contexts/ThemeContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      label: "Get Posts",
      icon: FileImage,
      path: "/get-posts",
    },
    {
      label: "Podcast Episodes",
      icon: Headphones,
      path: "/podcast-episodes",
    },
    {
      label: "Social Media Posts",
      icon: Share2,
      path: "/social-media-posts",
    },
    {
      label: "Configuration",
      icon: Settings,
      path: "/config",
    },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`bg-secondary text-secondary-foreground relative ${
          collapsed ? "w-16" : "w-64"
        } transition-all duration-300 ease-in-out border-r border-border`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-border">
          {collapsed ? (
            <div className="h-8 w-8 rounded-md bg-primary-foreground flex items-center justify-center">
              <span className="text-primary font-bold text-lg">SM</span>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-md bg-primary-foreground flex items-center justify-center">
                <span className="text-primary font-bold text-lg">SM</span>
              </div>
              <span className="ml-2 text-lg font-semibold">{theme.siteName}</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-2">
          <TooltipProvider>
            {menuItems.map((item) => (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <button
                    className="flex items-center w-full p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => handleNavigate(item.path)}
                  >
                    <item.icon className="h-5 w-5" />
                    {!collapsed && <span className="ml-3">{item.label}</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        {/* Bottom Actions */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center w-full p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={logout}
                >
                  <LogOut className="h-5 w-5" />
                  {!collapsed && <span className="ml-3">Logout</span>}
                </button>
              </TooltipTrigger>
              {collapsed && (
                <TooltipContent side="right">Logout</TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Collapse Toggle */}
        <button
          className="absolute -right-3 top-20 bg-background text-foreground border border-border rounded-full p-1"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
