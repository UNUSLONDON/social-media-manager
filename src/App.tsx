
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { AirtableProvider } from "@/contexts/AirtableContext";
import { WebhookProvider } from "@/contexts/WebhookContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { DataProvider } from "@/contexts/DataContext";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Pages
import Dashboard from "@/pages/Dashboard";
import GetPosts from "@/pages/GetPosts";
import PodcastEpisodes from "@/pages/PodcastEpisodes";
import SocialMediaPosts from "@/pages/SocialMediaPosts";
import Configuration from "@/pages/Configuration";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import LinkExpired from "@/pages/auth/LinkExpired";
import Permission from "@/pages/auth/Permission";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <AirtableProvider>
            <WebhookProvider>
              <DataProvider>
                <TooltipProvider>
                  <BrowserRouter>
                    <AuthGuard>
                      <Routes>
                        {/* Protected Routes */}
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/get-posts" element={<GetPosts />} />
                        <Route path="/podcast-episodes" element={<PodcastEpisodes />} />
                        <Route path="/social-media-posts" element={<SocialMediaPosts />} />
                        <Route path="/config" element={<Configuration />} />
                        
                        {/* Auth Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/link-expired" element={<LinkExpired />} />
                        <Route path="/permission-denied" element={<Permission />} />
                        
                        {/* Catch All */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AuthGuard>
                  </BrowserRouter>
                  <Toaster />
                  <Sonner />
                </TooltipProvider>
              </DataProvider>
            </WebhookProvider>
          </AirtableProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
