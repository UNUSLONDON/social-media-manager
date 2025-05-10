
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface AirtableBase {
  id: string;
  name: string;
}

interface AirtableTable {
  id: string;
  name: string;
}

interface AirtableView {
  id: string;
  name: string;
}

interface AirtableConfig {
  baseId: string;
  tables: {
    [key: string]: {
      id: string;
      viewId: string;
    };
  };
}

interface AirtableContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  bases: AirtableBase[];
  tables: AirtableTable[];
  views: AirtableView[];
  config: AirtableConfig | null;
  authenticate: () => Promise<boolean>;
  disconnect: () => void;
  fetchBases: () => Promise<AirtableBase[]>;
  fetchTables: (baseId: string) => Promise<AirtableTable[]>;
  fetchViews: (baseId: string, tableId: string) => Promise<AirtableView[]>;
  saveConfig: (config: AirtableConfig) => void;
}

const AirtableContext = createContext<AirtableContextType | undefined>(undefined);

export const AirtableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bases, setBases] = useState<AirtableBase[]>([]);
  const [tables, setTables] = useState<AirtableTable[]>([]);
  const [views, setViews] = useState<AirtableView[]>([]);
  const [config, setConfig] = useState<AirtableConfig | null>(null);

  useEffect(() => {
    // Check if config exists in localStorage
    const storedConfig = localStorage.getItem("airtableConfig");
    if (storedConfig) {
      try {
        setConfig(JSON.parse(storedConfig));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored Airtable config:", error);
        localStorage.removeItem("airtableConfig");
      }
    }
  }, []);

  const authenticate = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Mock authentication
      // In a real app, this would redirect to Airtable OAuth flow
      setIsAuthenticated(true);
      toast({
        title: "Airtable Connected",
        description: "Your Airtable account has been connected successfully.",
      });
      
      // Mock fetch bases after authentication
      await fetchBases();
      
      return true;
    } catch (error) {
      console.error("Airtable authentication error:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Airtable. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = (): void => {
    setIsAuthenticated(false);
    setBases([]);
    setTables([]);
    setViews([]);
    setConfig(null);
    localStorage.removeItem("airtableConfig");
    toast({
      title: "Airtable Disconnected",
      description: "Your Airtable account has been disconnected.",
    });
  };

  const fetchBases = async (): Promise<AirtableBase[]> => {
    setIsLoading(true);
    
    try {
      // Mock API call
      const mockBases = [
        { id: "base1", name: "Content Database" },
        { id: "base2", name: "Marketing Calendar" },
        { id: "base3", name: "Social Media Tracker" }
      ];
      
      setBases(mockBases);
      return mockBases;
    } catch (error) {
      console.error("Error fetching bases:", error);
      toast({
        title: "Failed to Load Bases",
        description: "Could not retrieve your Airtable bases.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTables = async (baseId: string): Promise<AirtableTable[]> => {
    setIsLoading(true);
    
    try {
      // Mock API call
      const mockTables = [
        { id: "table1", name: "Podcast Episodes" },
        { id: "table2", name: "Social Media Posts" },
        { id: "table3", name: "Media Files" }
      ];
      
      setTables(mockTables);
      return mockTables;
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast({
        title: "Failed to Load Tables",
        description: "Could not retrieve tables from the selected base.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchViews = async (baseId: string, tableId: string): Promise<AirtableView[]> => {
    setIsLoading(true);
    
    try {
      // Mock API call
      const mockViews = [
        { id: "view1", name: "Grid View" },
        { id: "view2", name: "Calendar View" },
        { id: "view3", name: "Kanban View" }
      ];
      
      setViews(mockViews);
      return mockViews;
    } catch (error) {
      console.error("Error fetching views:", error);
      toast({
        title: "Failed to Load Views",
        description: "Could not retrieve views from the selected table.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = (newConfig: AirtableConfig): void => {
    setConfig(newConfig);
    localStorage.setItem("airtableConfig", JSON.stringify(newConfig));
    toast({
      title: "Configuration Saved",
      description: "Your Airtable configuration has been saved successfully.",
    });
  };

  const value = {
    isAuthenticated,
    isLoading,
    bases,
    tables,
    views,
    config,
    authenticate,
    disconnect,
    fetchBases,
    fetchTables,
    fetchViews,
    saveConfig,
  };

  return <AirtableContext.Provider value={value}>{children}</AirtableContext.Provider>;
};

export const useAirtable = (): AirtableContextType => {
  const context = useContext(AirtableContext);
  if (context === undefined) {
    throw new Error("useAirtable must be used within an AirtableProvider");
  }
  return context;
};
