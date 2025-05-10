
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in via localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Mock login for demo purposes
      // In a real app, this would be an API call to your backend
      if (email === "demo@example.com" && password === "password") {
        const user = {
          id: "1",
          name: "Demo User",
          email: "demo@example.com",
        };
        
        setUser(user);
        localStorage.setItem("user", JSON.stringify(user));
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Try demo@example.com / password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Mock registration
      // In a real app, this would be an API call to your backend
      const user = {
        id: "2",
        name,
        email,
      };
      
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      toast({
        title: "Registration Successful",
        description: "Your account has been created.",
      });
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      // Mock forgot password
      toast({
        title: "Password Reset Email Sent",
        description: "If an account exists with that email, you'll receive a password reset link.",
      });
      return true;
    } catch (error) {
      console.error("Forgot password error:", error);
      toast({
        title: "Request Failed",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    try {
      // Mock password reset
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. Please log in with your new password.",
      });
      return true;
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset password. The link may have expired.",
        variant: "destructive",
      });
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
