
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useAirtable } from "@/contexts/AirtableContext";
import { useWebhook } from "@/contexts/WebhookContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, 
  AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import {
  Database, WebhookIcon, Paintbrush, RefreshCw, PlusCircle, 
  Trash2, Check, AlertCircle, Key, UploadCloud
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Configuration() {
  const { 
    isAuthenticated: isAirtableAuthenticated, 
    authenticate: authenticateAirtable,
    disconnect: disconnectAirtable,
    bases,
    tables,
    views,
    fetchBases,
    fetchTables,
    fetchViews,
    config,
    saveConfig
  } = useAirtable();
  
  const { webhooks, saveWebhook, deleteWebhook, testWebhook } = useWebhook();
  
  const { theme, updateTheme, resetTheme } = useTheme();
  
  const { clearData } = useData();
  
  const [selectedBase, setSelectedBase] = useState("");
  const [selectedTables, setSelectedTables] = useState<{[key: string]: string}>({
    posts: "",
    episodes: "",
    media: ""
  });
  const [selectedViews, setSelectedViews] = useState<{[key: string]: string}>({
    posts: "",
    episodes: "",
    media: ""
  });
  
  const [webhookForm, setWebhookForm] = useState({
    id: "",
    url: ""
  });
  
  const [isLoading, setIsLoading] = useState({
    airtable: false,
    webhook: false,
    test: false,
    theme: false
  });
  
  const [themeForm, setThemeForm] = useState({
    siteName: theme.siteName,
    logoUrl: theme.logoUrl,
    primaryColor: theme.colors.primary,
    secondaryColor: theme.colors.secondary,
    accentColor: theme.colors.accent,
    backgroundColor: theme.colors.background,
    textColor: theme.colors.text,
    headingFont: theme.fonts.heading,
    bodyFont: theme.fonts.body,
    headingWeight: theme.fonts.headingWeight,
    bodyWeight: theme.fonts.bodyWeight
  });
  
  // Webhook button definitions
  const webhookButtons = [
    { id: "get-data", name: "Get Data", description: "Fetch media files from storage" },
    { id: "update-db", name: "Update Database", description: "Update Airtable database with new files" },
    { id: "process-episode", name: "Process Episode", description: "Create social post from single episode" },
    { id: "process-all-episodes", name: "Process All Episodes", description: "Process all podcast episodes" },
    { id: "publish-post", name: "Publish Post", description: "Publish a social media post" }
  ];
  
  // Load Airtable config
  useEffect(() => {
    if (isAirtableAuthenticated && !selectedBase && config) {
      setSelectedBase(config.baseId);
      
      // Load tables from config
      setSelectedTables({
        posts: config.tables.posts?.id || "",
        episodes: config.tables.episodes?.id || "",
        media: config.tables.media?.id || ""
      });
      
      // Load views from config
      setSelectedViews({
        posts: config.tables.posts?.viewId || "",
        episodes: config.tables.episodes?.viewId || "",
        media: config.tables.media?.viewId || ""
      });
      
      // Fetch tables for the selected base
      if (config.baseId) {
        fetchTables(config.baseId);
      }
    }
  }, [isAirtableAuthenticated, config]);
  
  // Load theme form
  useEffect(() => {
    setThemeForm({
      siteName: theme.siteName,
      logoUrl: theme.logoUrl,
      primaryColor: theme.colors.primary,
      secondaryColor: theme.colors.secondary,
      accentColor: theme.colors.accent,
      backgroundColor: theme.colors.background,
      textColor: theme.colors.text,
      headingFont: theme.fonts.heading,
      bodyFont: theme.fonts.body,
      headingWeight: theme.fonts.headingWeight,
      bodyWeight: theme.fonts.bodyWeight
    });
  }, [theme]);
  
  const handleAirtableAuthenticate = async () => {
    setIsLoading(prev => ({ ...prev, airtable: true }));
    
    try {
      const success = await authenticateAirtable();
      if (success) {
        fetchBases();
      }
    } finally {
      setIsLoading(prev => ({ ...prev, airtable: false }));
    }
  };
  
  const handleBaseChange = async (baseId: string) => {
    setSelectedBase(baseId);
    await fetchTables(baseId);
  };
  
  const handleTableChange = async (tableId: string, type: "posts" | "episodes" | "media") => {
    setSelectedTables(prev => ({ ...prev, [type]: tableId }));
    await fetchViews(selectedBase, tableId);
  };
  
  const handleViewChange = (viewId: string, type: "posts" | "episodes" | "media") => {
    setSelectedViews(prev => ({ ...prev, [type]: viewId }));
  };
  
  const handleSaveConfig = () => {
    // Create Airtable config object
    const newConfig = {
      base: selectedBase,
      baseId: selectedBase,
      tables: {
        posts: {
          id: selectedTables.posts,
          viewId: selectedViews.posts
        },
        episodes: {
          id: selectedTables.episodes,
          viewId: selectedViews.episodes
        },
        media: {
          id: selectedTables.media,
          viewId: selectedViews.media
        }
      }
    };
    
    saveConfig(newConfig);
  };
  
  const handleSaveWebhook = async () => {
    if (!webhookForm.id || !webhookForm.url) {
      toast({
        title: "Missing Information",
        description: "Please provide both a button ID and webhook URL",
        variant: "destructive"
      });
      return;
    }
    
    saveWebhook(webhookForm.id, webhookForm.url);
    
    // Reset form
    setWebhookForm({
      id: "",
      url: ""
    });
  };
  
  const handleTestWebhook = async (id: string) => {
    setIsLoading(prev => ({ ...prev, test: true }));
    
    try {
      await testWebhook(id);
    } finally {
      setIsLoading(prev => ({ ...prev, test: false }));
    }
  };
  
  const handleDeleteWebhook = (id: string) => {
    deleteWebhook(id);
  };
  
  const handleSaveTheme = () => {
    setIsLoading(prev => ({ ...prev, theme: true }));
    
    try {
      updateTheme({
        siteName: themeForm.siteName,
        logoUrl: themeForm.logoUrl,
        colors: {
          primary: themeForm.primaryColor,
          secondary: themeForm.secondaryColor,
          accent: themeForm.accentColor,
          background: themeForm.backgroundColor,
          text: themeForm.textColor
        },
        fonts: {
          heading: themeForm.headingFont,
          body: themeForm.bodyFont,
          headingWeight: themeForm.headingWeight,
          bodyWeight: themeForm.bodyWeight
        }
      });
    } finally {
      setIsLoading(prev => ({ ...prev, theme: false }));
    }
  };
  
  const handleResetTheme = () => {
    resetTheme();
  };
  
  const handleResetData = () => {
    clearData();
    toast({
      title: "Data Reset",
      description: "All application data has been reset to defaults"
    });
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="border-b border-border bg-background p-4">
        <h1 className="text-2xl font-semibold">Configuration</h1>
        <p className="text-sm text-muted-foreground">
          Configure application settings, integrations, and appearance
        </p>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <Tabs defaultValue="airtable">
          <TabsList className="mb-6">
            <TabsTrigger value="airtable" className="flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Airtable Integration
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center">
              <WebhookIcon className="h-4 w-4 mr-2" />
              Webhook Config
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center">
              <Paintbrush className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
          </TabsList>
          
          {/* Airtable Configuration */}
          <TabsContent value="airtable">
            <Card>
              <CardHeader>
                <CardTitle>Airtable Integration</CardTitle>
                <CardDescription>
                  Connect your Airtable account and configure data sources
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Authentication Status */}
                <div className="p-4 border border-border rounded-md">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Airtable Connection</h3>
                        <p className="text-sm text-muted-foreground">
                          {isAirtableAuthenticated 
                            ? "Your Airtable account is connected"
                            : "Connect your Airtable account to access your bases"}
                        </p>
                        
                        {isAirtableAuthenticated && (
                          <div className="flex items-center gap-1 mt-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-green-500">Connected</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      {isAirtableAuthenticated ? (
                        <Button 
                          variant="outline" 
                          onClick={disconnectAirtable}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button 
                          onClick={handleAirtableAuthenticate}
                          disabled={isLoading.airtable}
                        >
                          {isLoading.airtable ? (
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Key className="mr-2 h-4 w-4" />
                          )}
                          Connect to Airtable
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Base Selection */}
                {isAirtableAuthenticated && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="base">Airtable Base</Label>
                      <Select
                        value={selectedBase}
                        onValueChange={handleBaseChange}
                      >
                        <SelectTrigger id="base">
                          <SelectValue placeholder="Select a base" />
                        </SelectTrigger>
                        <SelectContent>
                          {bases.map(base => (
                            <SelectItem key={base.id} value={base.id}>
                              {base.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedBase && (
                      <>
                        <div className="border-t border-border pt-4">
                          <h3 className="text-lg font-medium mb-4">Data Mapping</h3>
                          
                          {/* Social Media Posts */}
                          <div className="space-y-4 mb-6">
                            <h4 className="text-sm font-medium">Social Media Posts</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="posts-table">Table</Label>
                                <Select
                                  value={selectedTables.posts}
                                  onValueChange={(value) => handleTableChange(value, "posts")}
                                >
                                  <SelectTrigger id="posts-table">
                                    <SelectValue placeholder="Select a table" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tables.map(table => (
                                      <SelectItem key={table.id} value={table.id}>
                                        {table.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="posts-view">View</Label>
                                <Select
                                  value={selectedViews.posts}
                                  onValueChange={(value) => handleViewChange(value, "posts")}
                                  disabled={!selectedTables.posts}
                                >
                                  <SelectTrigger id="posts-view">
                                    <SelectValue placeholder="Select a view" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {views.map(view => (
                                      <SelectItem key={view.id} value={view.id}>
                                        {view.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          
                          {/* Podcast Episodes */}
                          <div className="space-y-4 mb-6">
                            <h4 className="text-sm font-medium">Podcast Episodes</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="episodes-table">Table</Label>
                                <Select
                                  value={selectedTables.episodes}
                                  onValueChange={(value) => handleTableChange(value, "episodes")}
                                >
                                  <SelectTrigger id="episodes-table">
                                    <SelectValue placeholder="Select a table" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tables.map(table => (
                                      <SelectItem key={table.id} value={table.id}>
                                        {table.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="episodes-view">View</Label>
                                <Select
                                  value={selectedViews.episodes}
                                  onValueChange={(value) => handleViewChange(value, "episodes")}
                                  disabled={!selectedTables.episodes}
                                >
                                  <SelectTrigger id="episodes-view">
                                    <SelectValue placeholder="Select a view" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {views.map(view => (
                                      <SelectItem key={view.id} value={view.id}>
                                        {view.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          
                          {/* Media Files */}
                          <div className="space-y-4">
                            <h4 className="text-sm font-medium">Media Files</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="media-table">Table</Label>
                                <Select
                                  value={selectedTables.media}
                                  onValueChange={(value) => handleTableChange(value, "media")}
                                >
                                  <SelectTrigger id="media-table">
                                    <SelectValue placeholder="Select a table" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {tables.map(table => (
                                      <SelectItem key={table.id} value={table.id}>
                                        {table.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="media-view">View</Label>
                                <Select
                                  value={selectedViews.media}
                                  onValueChange={(value) => handleViewChange(value, "media")}
                                  disabled={!selectedTables.media}
                                >
                                  <SelectTrigger id="media-view">
                                    <SelectValue placeholder="Select a view" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {views.map(view => (
                                      <SelectItem key={view.id} value={view.id}>
                                        {view.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
              
              {isAirtableAuthenticated && selectedBase && (
                <CardFooter className="border-t border-border pt-4">
                  <Button onClick={handleSaveConfig}>Save Configuration</Button>
                </CardFooter>
              )}
            </Card>
          </TabsContent>
          
          {/* Webhook Configuration */}
          <TabsContent value="webhooks">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Configuration</CardTitle>
                <CardDescription>
                  Configure n8n webhooks for automated workflows
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* New Webhook Form */}
                <div className="space-y-4 p-4 border border-border rounded-md">
                  <h3 className="text-lg font-medium">Add New Webhook</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="webhook-button">Button</Label>
                      <Select
                        value={webhookForm.id}
                        onValueChange={(value) => 
                          setWebhookForm(prev => ({ ...prev, id: value }))
                        }
                      >
                        <SelectTrigger id="webhook-button">
                          <SelectValue placeholder="Select a button" />
                        </SelectTrigger>
                        <SelectContent>
                          {webhookButtons.map(button => (
                            <SelectItem key={button.id} value={button.id}>
                              {button.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="webhook-url">Webhook URL</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="webhook-url"
                          placeholder="https://n8n.example.com/webhook/..."
                          value={webhookForm.url}
                          onChange={(e) => 
                            setWebhookForm(prev => ({ ...prev, url: e.target.value }))
                          }
                        />
                        <Button onClick={handleSaveWebhook}>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Webhook List */}
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Button</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Webhook URL</TableHead>
                        <TableHead className="text-right w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {webhookButtons
                        .filter(button => webhooks[button.id])
                        .map(button => (
                          <TableRow key={button.id}>
                            <TableCell className="font-medium">{button.name}</TableCell>
                            <TableCell>{button.description}</TableCell>
                            <TableCell className="font-mono text-xs truncate max-w-[300px]">
                              {webhooks[button.id]}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleTestWebhook(button.id)}
                                  disabled={isLoading.test}
                                >
                                  Test
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteWebhook(button.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                      ))}
                      
                      {Object.keys(webhooks).length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center p-4">
                            <p className="text-muted-foreground">
                              No webhooks configured yet. Add a webhook above.
                            </p>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Webhook Help */}
                <div className="flex items-start gap-2 p-4 bg-secondary/30 rounded-md">
                  <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-sm">About n8n Webhooks</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Webhooks enable integration with n8n workflows. Add your n8n webhook URLs 
                      to enable automation when specific actions are performed in the application.
                      You can test webhooks by clicking the "Test" button.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appearance */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of your application
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Branding */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Branding</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="site-name">Site Name</Label>
                      <Input
                        id="site-name"
                        value={themeForm.siteName}
                        onChange={(e) => 
                          setThemeForm(prev => ({ ...prev, siteName: e.target.value }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logo-url">Logo URL</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="logo-url"
                          value={themeForm.logoUrl}
                          onChange={(e) => 
                            setThemeForm(prev => ({ ...prev, logoUrl: e.target.value }))
                          }
                          placeholder="https://example.com/logo.png"
                        />
                        <Button variant="outline" size="icon">
                          <UploadCloud className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Colors */}
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 className="text-lg font-medium">Colors</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color" className="flex items-center">
                        <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: themeForm.primaryColor }} />
                        Primary Color
                      </Label>
                      <Input
                        id="primary-color"
                        type="text"
                        value={themeForm.primaryColor}
                        onChange={(e) => 
                          setThemeForm(prev => ({ ...prev, primaryColor: e.target.value }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="secondary-color" className="flex items-center">
                        <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: themeForm.secondaryColor }} />
                        Secondary Color
                      </Label>
                      <Input
                        id="secondary-color"
                        type="text"
                        value={themeForm.secondaryColor}
                        onChange={(e) => 
                          setThemeForm(prev => ({ ...prev, secondaryColor: e.target.value }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accent-color" className="flex items-center">
                        <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: themeForm.accentColor }} />
                        Accent Color
                      </Label>
                      <Input
                        id="accent-color"
                        type="text"
                        value={themeForm.accentColor}
                        onChange={(e) => 
                          setThemeForm(prev => ({ ...prev, accentColor: e.target.value }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="background-color" className="flex items-center">
                        <div className="h-3 w-3 rounded-full border mr-2" style={{ backgroundColor: themeForm.backgroundColor }} />
                        Background Color
                      </Label>
                      <Input
                        id="background-color"
                        type="text"
                        value={themeForm.backgroundColor}
                        onChange={(e) => 
                          setThemeForm(prev => ({ ...prev, backgroundColor: e.target.value }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="text-color" className="flex items-center">
                        <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: themeForm.textColor }} />
                        Text Color
                      </Label>
                      <Input
                        id="text-color"
                        type="text"
                        value={themeForm.textColor}
                        onChange={(e) => 
                          setThemeForm(prev => ({ ...prev, textColor: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
                
                {/* Typography */}
                <div className="space-y-4 border-t border-border pt-4">
                  <h3 className="text-lg font-medium">Typography</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="heading-font">Heading Font</Label>
                      <Input
                        id="heading-font"
                        value={themeForm.headingFont}
                        onChange={(e) => 
                          setThemeForm(prev => ({ ...prev, headingFont: e.target.value }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="heading-weight">Heading Weight</Label>
                      <Select
                        value={themeForm.headingWeight.toString()}
                        onValueChange={(value) => 
                          setThemeForm(prev => ({ ...prev, headingWeight: parseInt(value) }))
                        }
                      >
                        <SelectTrigger id="heading-weight">
                          <SelectValue placeholder="Select weight" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="400">400 (Normal)</SelectItem>
                          <SelectItem value="500">500 (Medium)</SelectItem>
                          <SelectItem value="600">600 (Semibold)</SelectItem>
                          <SelectItem value="700">700 (Bold)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="body-font">Body Font</Label>
                      <Input
                        id="body-font"
                        value={themeForm.bodyFont}
                        onChange={(e) => 
                          setThemeForm(prev => ({ ...prev, bodyFont: e.target.value }))
                        }
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="body-weight">Body Weight</Label>
                      <Select
                        value={themeForm.bodyWeight.toString()}
                        onValueChange={(value) => 
                          setThemeForm(prev => ({ ...prev, bodyWeight: parseInt(value) }))
                        }
                      >
                        <SelectTrigger id="body-weight">
                          <SelectValue placeholder="Select weight" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="300">300 (Light)</SelectItem>
                          <SelectItem value="400">400 (Normal)</SelectItem>
                          <SelectItem value="500">500 (Medium)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Theme Preview */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-lg font-medium mb-4">Theme Preview</h3>
                  
                  <div
                    className="p-4 rounded-md border"
                    style={{
                      backgroundColor: themeForm.backgroundColor,
                      color: themeForm.textColor,
                      fontFamily: themeForm.bodyFont
                    }}
                  >
                    <h2
                      style={{
                        fontFamily: themeForm.headingFont,
                        fontWeight: themeForm.headingWeight,
                        color: themeForm.textColor
                      }}
                      className="text-xl mb-2"
                    >
                      {themeForm.siteName}
                    </h2>
                    
                    <p className="mb-4">This is a preview of your theme settings.</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <div
                        className="px-3 py-1 rounded-md text-sm"
                        style={{
                          backgroundColor: themeForm.primaryColor,
                          color: "#fff"
                        }}
                      >
                        Primary Button
                      </div>
                      
                      <div
                        className="px-3 py-1 rounded-md text-sm"
                        style={{
                          backgroundColor: themeForm.secondaryColor,
                          color: "#fff"
                        }}
                      >
                        Secondary Button
                      </div>
                      
                      <div
                        className="px-3 py-1 rounded-md text-sm"
                        style={{
                          backgroundColor: themeForm.accentColor,
                          color: "#fff"
                        }}
                      >
                        Accent Button
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t border-border pt-4 flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleResetTheme}
                >
                  Reset to Default
                </Button>
                
                <Button 
                  onClick={handleSaveTheme}
                  disabled={isLoading.theme}
                >
                  {isLoading.theme ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Save Theme
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Reset Data */}
        <div className="mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive">
                Reset Application Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will reset all application data to default values. This action cannot be undone.
                  All your media files, podcast episodes, and social media posts will be reset to the defaults.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetData} className="bg-destructive text-destructive-foreground">
                  Yes, Reset Data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </main>
    </MainLayout>
  );
}
