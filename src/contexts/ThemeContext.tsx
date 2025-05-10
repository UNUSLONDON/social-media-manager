
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface ThemeConfig {
  siteName: string;
  logoUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
    headingWeight: number;
    bodyWeight: number;
  };
}

const defaultTheme: ThemeConfig = {
  siteName: "Social Media Manager",
  logoUrl: "",
  colors: {
    primary: "#3B82F6",
    secondary: "#6B7280",
    accent: "#10B981",
    background: "#FFFFFF",
    text: "#1F2937",
  },
  fonts: {
    heading: "Inter",
    body: "Inter",
    headingWeight: 700,
    bodyWeight: 400,
  },
};

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (newTheme: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);

  useEffect(() => {
    // Load theme from localStorage
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      try {
        setTheme({...defaultTheme, ...JSON.parse(storedTheme)});
      } catch (error) {
        console.error("Failed to parse stored theme:", error);
        localStorage.removeItem("theme");
      }
    }
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.style.setProperty('--primary-color', theme.colors.primary);
    document.documentElement.style.setProperty('--secondary-color', theme.colors.secondary);
    document.documentElement.style.setProperty('--accent-color', theme.colors.accent);
    document.documentElement.style.setProperty('--background-color', theme.colors.background);
    document.documentElement.style.setProperty('--text-color', theme.colors.text);
    
    // Update title
    document.title = theme.siteName;
  }, [theme]);

  const updateTheme = (newTheme: Partial<ThemeConfig>): void => {
    const updatedTheme = {...theme, ...newTheme};
    setTheme(updatedTheme);
    localStorage.setItem("theme", JSON.stringify(updatedTheme));
    toast({
      title: "Theme Updated",
      description: "Your theme settings have been saved.",
    });
  };

  const resetTheme = (): void => {
    setTheme(defaultTheme);
    localStorage.removeItem("theme");
    toast({
      title: "Theme Reset",
      description: "Theme has been reset to default.",
    });
  };

  const value = {
    theme,
    updateTheme,
    resetTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
