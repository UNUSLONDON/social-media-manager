
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useData } from "@/contexts/DataContext";
import { useWebhook } from "@/contexts/WebhookContext";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileImage, Music, Video, File, Download, MoreVertical, 
  RefreshCw, PlusCircle, Search
} from "lucide-react";

export default function GetPosts() {
  const { mediaFiles, updateMediaFile, fetchMediaFiles } = useData();
  const { webhooks, executeWebhook } = useWebhook();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState({
    getData: false,
    updateDb: false
  });
  
  // Filter media files based on selected tab and search term
  const filteredFiles = mediaFiles.filter(file => {
    const matchesType = selectedTab === "all" || 
      (selectedTab === "images" && file.type.startsWith("image/")) ||
      (selectedTab === "audio" && file.type.startsWith("audio/")) ||
      (selectedTab === "video" && file.type.startsWith("video/")) ||
      (selectedTab === "other" && !file.type.startsWith("image/") && !file.type.startsWith("audio/") && !file.type.startsWith("video/"));
    
    const matchesSearch = !searchTerm || 
      file.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSearch;
  });
  
  const handleGetData = async () => {
    setIsLoading(prev => ({ ...prev, getData: true }));
    try {
      if (webhooks["get-data"]) {
        await executeWebhook("get-data");
      }
      await fetchMediaFiles();
    } finally {
      setIsLoading(prev => ({ ...prev, getData: false }));
    }
  };
  
  const handleUpdateDb = async () => {
    setIsLoading(prev => ({ ...prev, updateDb: true }));
    try {
      if (webhooks["update-db"]) {
        await executeWebhook("update-db");
      }
    } finally {
      setIsLoading(prev => ({ ...prev, updateDb: false }));
    }
  };
  
  const handleTitleChange = async (id: string, newTitle: string) => {
    await updateMediaFile(id, { title: newTitle });
  };
  
  const getThumbnailContent = (file: typeof mediaFiles[0]) => {
    if (file.type.startsWith("image/")) {
      return (
        <img 
          src={file.url} 
          alt={file.title}
          className="w-full h-full object-cover rounded-md"
        />
      );
    }
    
    if (file.type.startsWith("audio/")) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-secondary rounded-md">
          <Music className="w-12 h-12 text-muted-foreground" />
        </div>
      );
    }
    
    if (file.type.startsWith("video/")) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-secondary rounded-md">
          <Video className="w-12 h-12 text-muted-foreground" />
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-secondary rounded-md">
        <File className="w-12 h-12 text-muted-foreground" />
      </div>
    );
  };
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
    else return (bytes / 1073741824).toFixed(1) + " GB";
  };
  
  const getFileType = (type: string) => {
    if (type.startsWith("image/")) return "Image";
    if (type.startsWith("audio/")) return "Audio";
    if (type.startsWith("video/")) return "Video";
    return "Document";
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="border-b border-border bg-background p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Media Files</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage your media content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleGetData}
            disabled={isLoading.getData}
          >
            {isLoading.getData ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Get Data
          </Button>
          
          <Button
            onClick={handleUpdateDb}
            disabled={isLoading.updateDb}
          >
            {isLoading.updateDb ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4 mr-2" />
            )}
            Update Database
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Media Library</CardTitle>
                <CardDescription>
                  {filteredFiles.length} files in your library
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2 w-full max-w-xs">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <Tabs
              defaultValue="all"
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="mt-4"
            >
              <TabsList>
                <TabsTrigger value="all">All Files</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            {filteredFiles.length === 0 ? (
              <div className="text-center p-8">
                <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No files found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Click 'Get Data' to fetch files from storage"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map(file => (
                  <div key={file.id} className="border border-border rounded-md overflow-hidden">
                    <div className="h-40">
                      {getThumbnailContent(file)}
                    </div>
                    
                    <div className="p-3">
                      <Label htmlFor={`title-${file.id}`} className="text-xs text-muted-foreground">
                        Title
                      </Label>
                      <Input
                        id={`title-${file.id}`}
                        value={file.title}
                        onChange={(e) => handleTitleChange(file.id, e.target.value)}
                        className="mt-1"
                      />
                      
                      <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                        <div>
                          {getFileType(file.type)} • {formatFileSize(file.fileSize)}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Preview</DropdownMenuItem>
                            <DropdownMenuItem>Download</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="justify-between border-t border-border pt-4">
            <div className="text-sm text-muted-foreground">
              Total storage used: {formatFileSize(mediaFiles.reduce((acc, file) => acc + file.fileSize, 0))}
            </div>
          </CardFooter>
        </Card>
      </main>
    </MainLayout>
  );
}
