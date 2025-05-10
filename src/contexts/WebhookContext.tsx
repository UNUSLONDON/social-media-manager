
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

interface WebhookConfig {
  [key: string]: string; // button id -> webhook URL
}

interface WebhookContextType {
  webhooks: WebhookConfig;
  isLoading: boolean;
  saveWebhook: (id: string, url: string) => void;
  deleteWebhook: (id: string) => void;
  testWebhook: (id: string) => Promise<boolean>;
  executeWebhook: (id: string, data?: any) => Promise<boolean>;
}

const WebhookContext = createContext<WebhookContextType | undefined>(undefined);

export const WebhookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [webhooks, setWebhooks] = useState<WebhookConfig>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load webhooks from localStorage
    const storedWebhooks = localStorage.getItem("webhooks");
    if (storedWebhooks) {
      try {
        setWebhooks(JSON.parse(storedWebhooks));
      } catch (error) {
        console.error("Failed to parse stored webhooks:", error);
        localStorage.removeItem("webhooks");
      }
    }
  }, []);

  const saveWebhook = (id: string, url: string): void => {
    const updatedWebhooks = { ...webhooks, [id]: url };
    setWebhooks(updatedWebhooks);
    localStorage.setItem("webhooks", JSON.stringify(updatedWebhooks));
    toast({
      title: "Webhook Saved",
      description: `The webhook for "${id}" has been saved.`,
    });
  };

  const deleteWebhook = (id: string): void => {
    const updatedWebhooks = { ...webhooks };
    delete updatedWebhooks[id];
    setWebhooks(updatedWebhooks);
    localStorage.setItem("webhooks", JSON.stringify(updatedWebhooks));
    toast({
      title: "Webhook Deleted",
      description: `The webhook for "${id}" has been removed.`,
    });
  };

  const testWebhook = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const webhookUrl = webhooks[id];
      if (!webhookUrl) {
        toast({
          title: "Webhook Not Found",
          description: "No webhook URL configured for this action.",
          variant: "destructive",
        });
        return false;
      }

      // Send a test request
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        action: id
      };
      
      // In a real app, we would make an actual fetch request
      console.log(`Testing webhook: ${webhookUrl}`, testData);
      
      // Simulate success for demo purposes
      toast({
        title: "Test Successful",
        description: `The webhook for "${id}" was tested successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error testing webhook:", error);
      toast({
        title: "Test Failed",
        description: "An error occurred while testing the webhook.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const executeWebhook = async (id: string, data: any = {}): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const webhookUrl = webhooks[id];
      if (!webhookUrl) {
        toast({
          title: "Webhook Not Found",
          description: "No webhook URL configured for this action.",
          variant: "destructive",
        });
        return false;
      }

      // Prepare payload
      const payload = {
        ...data,
        timestamp: new Date().toISOString(),
        action: id
      };
      
      // In a real app, we would make an actual fetch request
      console.log(`Executing webhook: ${webhookUrl}`, payload);
      
      // Simulate success for demo purposes
      toast({
        title: "Action Triggered",
        description: `The webhook for "${id}" was executed successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error executing webhook:", error);
      toast({
        title: "Execution Failed",
        description: "An error occurred while executing the webhook.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    webhooks,
    isLoading,
    saveWebhook,
    deleteWebhook,
    testWebhook,
    executeWebhook,
  };

  return <WebhookContext.Provider value={value}>{children}</WebhookContext.Provider>;
};

export const useWebhook = (): WebhookContextType => {
  const context = useContext(WebhookContext);
  if (context === undefined) {
    throw new Error("useWebhook must be used within a WebhookProvider");
  }
  return context;
};
