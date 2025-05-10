
import { ReactNode, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
}

const publicPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      const isPublicPath = publicPaths.includes(location.pathname);
      
      if (isAuthenticated && isPublicPath) {
        // Redirect to home page if user is authenticated and trying to access a public page
        navigate("/");
      } else if (!isAuthenticated && !isPublicPath) {
        // Redirect to login if user is not authenticated and trying to access a protected page
        navigate("/login", { state: { from: location.pathname } });
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
