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
  token: string;
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
  authenticate: (token: string) => Promise<boolean>;
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
        const parsedConfig = JSON.parse(storedConfig);
        setConfig(parsedConfig);
        setIsAuthenticated(true);
        // Fetch bases when config is loaded
        fetchBasesWithToken(parsedConfig.token);
      } catch (error) {
        console.error("Failed to parse stored Airtable config:", error);
        localStorage.removeItem("airtableConfig");
      }
    }
  }, []);

  const fetchBasesWithToken = async (token: string): Promise<AirtableBase[]> => {
    try {
      const response = await fetch('https://api.airtable.com/v0/meta/bases', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch bases: ${response.statusText}`);
      }

      const data = await response.json();
      const bases = data.bases.map((base: any) => ({
        id: base.id,
        name: base.name
      }));

      setBases(bases);
      return bases;
    } catch (error) {
      console.error("Error fetching bases:", error);
      toast({
        title: "Error",
        description: "Failed to fetch Airtable bases. Please check your token.",
        variant: "destructive"
      });
      return [];
    }
  };

  const authenticate = async (token: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const bases = await fetchBasesWithToken(token);
      
      if (bases.length > 0) {
        setIsAuthenticated(true);
        // Save token in config
        const newConfig = {
          token,
          baseId: "",
          tables: {}
        };
        setConfig(newConfig);
        localStorage.setItem("airtableConfig", JSON.stringify(newConfig));
        
        toast({
          title: "Connected to Airtable",
          description: "Successfully authenticated with your Airtable account.",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Airtable authentication error:", error);
      toast({
        title: "Authentication Failed",
        description: "Failed to connect to Airtable. Please check your token.",
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
      title: "Disconnected",
      description: "Your Airtable account has been disconnected.",
    });
  };

  const fetchBases = async (): Promise<AirtableBase[]> => {
    if (!config?.token) return [];
    return fetchBasesWithToken(config.token);
  };

  const fetchTables = async (baseId: string): Promise<AirtableTable[]> => {
    if (!config?.token) {
      toast({
        title: "Error",
        description: "No authentication token found. Please reconnect to Airtable.",
        variant: "destructive"
      });
      return [];
    }
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
        headers: {
          'Authorization': `Bearer ${config.token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.statusText}`);
      }

      const data = await response.json();
      const tables = data.tables.map((table: any) => ({
        id: table.id,
        name: table.name
      }));

      setTables(tables);
      return tables;
    } catch (error) {
      console.error("Error fetching tables:", error);
      toast({
        title: "Failed to Load Tables",
        description: "Could not retrieve tables from the selected base. Please check your permissions.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchViews = async (baseId: string, tableId: string): Promise<AirtableView[]> => {
    if (!config?.token) {
      toast({
        title: "Error",
        description: "No authentication token found. Please reconnect to Airtable.",
        variant: "destructive"
      });
      return [];
    }

    if (!baseId || !tableId) {
      toast({
        title: "Error",
        description: "Base ID and Table ID are required to fetch views.",
        variant: "destructive"
      });
      return [];
    }
    
    setIsLoading(true);
    try {
      console.log(`Fetching views for base: ${baseId}, table: ${tableId}`);
      const response = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables/${tableId}/views`, {
        headers: {
          'Authorization': `Bearer ${config.token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch views: ${response.statusText}`);
      }

      const data = await response.json();
      const views = data.views.map((view: any) => ({
        id: view.id,
        name: view.name
      }));

      setViews(views);
      return views;
    } catch (error) {
      console.error("Error fetching views:", error);
      toast({
        title: "Failed to Load Views",
        description: "Could not retrieve views from the selected table. Please check your permissions.",
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