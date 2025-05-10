import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useData, SocialMediaPost } from "@/contexts/DataContext";
import { useWebhook } from "@/contexts/WebhookContext";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Search, RefreshCw, Calendar as CalendarIcon, Edit, Check,
  Send, Clock, Eye, XCircle, Share2, Twitter, Facebook, Linkedin, Instagram, Filter
} from "lucide-react";

export default function SocialMediaPosts() {
  const { socialMediaPosts, updateSocialMediaPost, fetchSocialMediaPosts } = useData();
  const { webhooks, executeWebhook } = useWebhook();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    content: "",
    status: "",
    scheduledDate: null as Date | null,
    platforms: [] as string[]
  });
  const [isLoading, setIsLoading] = useState({
    refresh: false,
    publish: false,
    update: false
  });
  
  // Filter posts based on search term and filters
  const filteredPosts = socialMediaPosts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || post.status === statusFilter;
    
    const matchesPlatform = !platformFilter || 
      post.platforms.includes(platformFilter);
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });
  
  const handleRefresh = async () => {
    setIsLoading(prev => ({ ...prev, refresh: true }));
    try {
      await fetchSocialMediaPosts();
    } finally {
      setIsLoading(prev => ({ ...prev, refresh: false }));
    }
  };
  
  const handleOpenEditDialog = (post: SocialMediaPost) => {
    setSelectedPost(post);
    setEditFormData({
      content: post.content,
      status: post.status,
      scheduledDate: post.scheduledDate ? new Date(post.scheduledDate) : null,
      platforms: [...post.platforms]
    });
    setEditDialogOpen(true);
  };
  
  const handleConfirmStatusChange = (post: SocialMediaPost, newStatus: string) => {
    setSelectedPost(post);
    setEditFormData(prev => ({
      ...prev,
      status: newStatus as any
    }));
    setConfirmDialogOpen(true);
  };
  
  const handleSaveEdit = async () => {
    if (!selectedPost) return;
    
    setIsLoading(prev => ({ ...prev, update: true }));
    
    try {
      await updateSocialMediaPost(selectedPost.id, {
        content: editFormData.content,
        status: editFormData.status as any,
        scheduledDate: editFormData.scheduledDate?.toISOString() || null,
        platforms: editFormData.platforms
      });
      
      setEditDialogOpen(false);
    } finally {
      setIsLoading(prev => ({ ...prev, update: false }));
    }
  };
  
  const handleConfirmStatus = async () => {
    if (!selectedPost) return;
    
    setIsLoading(prev => ({ ...prev, update: true }));
    
    try {
      await updateSocialMediaPost(selectedPost.id, {
        status: editFormData.status as any
      });
      
      if (editFormData.status === "Posted" && webhooks["publish-post"]) {
        await executeWebhook("publish-post", { post: selectedPost });
      }
      
      setConfirmDialogOpen(false);
    } finally {
      setIsLoading(prev => ({ ...prev, update: false }));
    }
  };
  
  const handlePublishNow = async (post: SocialMediaPost) => {
    setIsLoading(prev => ({ ...prev, publish: true }));
    
    try {
      if (webhooks["publish-post"]) {
        await executeWebhook("publish-post", { post });
      }
      
      await updateSocialMediaPost(post.id, {
        status: "Posted"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, publish: false }));
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy h:mm a");
  };
  
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "linkedin":
        return <Linkedin className="h-4 w-4" />;
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      default:
        return <Share2 className="h-4 w-4" />;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved For Publishing":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <Check className="h-3.5 w-3.5 mr-1" />
            Approved
          </Badge>
        );
      case "Posted":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Send className="h-3.5 w-3.5 mr-1" />
            Posted
          </Badge>
        );
      case "Rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Rejected
          </Badge>
        );
      case "Review":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Eye className="h-3.5 w-3.5 mr-1" />
            Review
          </Badge>
        );
      case "Scheduled For Publishing":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            <Clock className="h-3.5 w-3.5 mr-1" />
            Scheduled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="border-b border-border bg-background p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Social Media Posts</h1>
          <p className="text-sm text-muted-foreground">
            Manage and schedule your posts across platforms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading.refresh}
          >
            {isLoading.refresh ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between flex-col sm:flex-row gap-4">
              <div>
                <CardTitle>Social Posts</CardTitle>
                <CardDescription>
                  {filteredPosts.length} posts found
                </CardDescription>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    className="pl-9 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Select value={statusFilter || "all"} onValueChange={value => setStatusFilter(value === "all" ? null : value)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Approved For Publishing">Approved</SelectItem>
                    <SelectItem value="Posted">Posted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Review">Review</SelectItem>
                    <SelectItem value="Scheduled For Publishing">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={platformFilter || "all"} onValueChange={value => setPlatformFilter(value === "all" ? null : value)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="Twitter">Twitter</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredPosts.length === 0 ? (
              <div className="text-center p-8">
                <Share2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No posts found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchTerm || statusFilter || platformFilter
                    ? "Try adjusting your filters"
                    : "Create social media posts from podcast episodes"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPosts.map(post => (
                  <Card key={post.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      {post.imageUrl && (
                        <div className="w-full md:w-48 h-48 flex-shrink-0">
                          <img 
                            src={post.imageUrl} 
                            alt="Post thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4 flex-grow">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            {getStatusBadge(post.status)}
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {post.platforms.map(platform => (
                              <Badge key={platform} variant="secondary" className="flex items-center gap-1">
                                {getPlatformIcon(platform)}
                                {platform}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="whitespace-pre-wrap">{post.content}</p>
                        </div>
                        
                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="text-sm text-muted-foreground">
                            {post.status === "Scheduled For Publishing" ? (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Scheduled for: {formatDate(post.scheduledDate)}</span>
                              </div>
                            ) : post.status === "Posted" ? (
                              <div className="flex items-center">
                                <Send className="h-4 w-4 mr-1" />
                                <span>Posted on: {formatDate(post.createdDate)}</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                <span>Created: {formatDate(post.createdDate)}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2">
                            <Select 
                              defaultValue={post.status}
                              onValueChange={(value) => handleConfirmStatusChange(post, value)}
                              disabled={post.status === "Posted"}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Change Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Approved For Publishing">Approve</SelectItem>
                                <SelectItem value="Rejected">Reject</SelectItem>
                                <SelectItem value="Review">Mark for Review</SelectItem>
                                <SelectItem value="Scheduled For Publishing">Schedule</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEditDialog(post)}
                              disabled={post.status === "Posted"}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            
                            {post.status === "Approved For Publishing" && (
                              <Button 
                                size="sm"
                                onClick={() => handlePublishNow(post)}
                                disabled={isLoading.publish}
                              >
                                {isLoading.publish ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4 mr-2" />
                                )}
                                Post Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t border-border pt-4">
            <div className="text-sm text-muted-foreground">
              Total Posts: {socialMediaPosts.length} • 
              Posted: {socialMediaPosts.filter(p => p.status === "Posted").length} •
              Scheduled: {socialMediaPosts.filter(p => p.status === "Scheduled For Publishing").length}
            </div>
          </CardFooter>
        </Card>
      </main>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Social Media Post</DialogTitle>
            <DialogDescription>
              Make changes to your social media post content and settings
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="content">Post Content</Label>
              <Textarea
                id="content"
                rows={5}
                value={editFormData.content}
                onChange={(e) => 
                  setEditFormData(prev => ({ ...prev, content: e.target.value }))
                }
              />
              <p className="text-xs text-muted-foreground text-right">
                {editFormData.content.length} characters
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {["Twitter", "Facebook", "Instagram", "LinkedIn"].map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`platform-${platform}`} 
                      checked={editFormData.platforms.includes(platform)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditFormData(prev => ({
                            ...prev, 
                            platforms: [...prev.platforms, platform]
                          }));
                        } else {
                          setEditFormData(prev => ({
                            ...prev,
                            platforms: prev.platforms.filter(p => p !== platform)
                          }));
                        }
                      }}
                    />
                    <Label htmlFor={`platform-${platform}`} className="flex items-center">
                      {getPlatformIcon(platform)}
                      <span className="ml-1">{platform}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={editFormData.status} 
                onValueChange={(value) => 
                  setEditFormData(prev => ({ ...prev, status: value as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Approved For Publishing">Approved For Publishing</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Scheduled For Publishing">Scheduled For Publishing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {editFormData.status === "Scheduled For Publishing" && (
              <div className="space-y-2">
                <Label>Scheduled Date & Time</Label>
                <div className="grid gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editFormData.scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editFormData.scheduledDate ? (
                          format(editFormData.scheduledDate, "PPP p")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editFormData.scheduledDate || undefined}
                        onSelect={(date) =>
                          setEditFormData(prev => ({ ...prev, scheduledDate: date }))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={isLoading.update || editFormData.content.trim() === ""}
            >
              {isLoading.update ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the status to "{editFormData.status}"?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmStatus}
              disabled={isLoading.update}
            >
              {isLoading.update ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
