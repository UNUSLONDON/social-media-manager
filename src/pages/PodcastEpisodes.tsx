
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useData, PodcastEpisode } from "@/contexts/DataContext";
import { useWebhook } from "@/contexts/WebhookContext";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow
} from "@/components/ui/table";
import {
  Headphones, Search, RefreshCw, Share2, Play, 
  MoreVertical, Check, Clock, Filter
} from "lucide-react";

export default function PodcastEpisodes() {
  const { podcastEpisodes, updatePodcastEpisode, fetchPodcastEpisodes } = useData();
  const { webhooks, executeWebhook } = useWebhook();
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState({
    refresh: false,
    processSingle: new Array(podcastEpisodes.length).fill(false),
    processAll: false
  });
  
  // Filter episodes based on search term
  const filteredEpisodes = podcastEpisodes.filter(episode =>
    episode.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    episode.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    setIsLoading(prev => ({ ...prev, refresh: true }));
    try {
      await fetchPodcastEpisodes();
    } finally {
      setIsLoading(prev => ({ ...prev, refresh: false }));
    }
  };
  
  const handleProcessSingle = async (episodeId: string, index: number) => {
    setIsLoading(prev => ({
      ...prev,
      processSingle: prev.processSingle.map((item, i) => i === index ? true : item)
    }));
    
    try {
      if (webhooks["process-episode"]) {
        const episode = podcastEpisodes.find(ep => ep.id === episodeId);
        if (episode) {
          await executeWebhook("process-episode", { episode });
          await updatePodcastEpisode(episodeId, { processed: true });
        }
      }
    } finally {
      setIsLoading(prev => ({
        ...prev,
        processSingle: prev.processSingle.map((item, i) => i === index ? false : item)
      }));
    }
  };
  
  const handleProcessAll = async () => {
    setIsLoading(prev => ({ ...prev, processAll: true }));
    
    try {
      if (webhooks["process-all-episodes"]) {
        await executeWebhook("process-all-episodes", { episodes: podcastEpisodes });
        
        // Mark all as processed
        await Promise.all(
          podcastEpisodes.map(episode => 
            updatePodcastEpisode(episode.id, { processed: true })
          )
        );
      }
    } finally {
      setIsLoading(prev => ({ ...prev, processAll: false }));
    }
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="border-b border-border bg-background p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Podcast Episodes</h1>
          <p className="text-sm text-muted-foreground">
            Manage your podcast episodes and create social posts
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
          
          <Button
            onClick={handleProcessAll}
            disabled={isLoading.processAll}
          >
            {isLoading.processAll ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4 mr-2" />
            )}
            Process All Records
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Episode Library</CardTitle>
                <CardDescription>
                  {filteredEpisodes.length} episodes
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search episodes..."
                    className="pl-9 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {filteredEpisodes.length === 0 ? (
              <div className="text-center p-8">
                <Headphones className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No episodes found</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : "Your podcast episodes will appear here"}
                </p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Publish Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEpisodes.map((episode, index) => (
                      <TableRow key={episode.id}>
                        <TableCell>
                          <div className="h-10 w-10 rounded-md overflow-hidden">
                            <img 
                              src={episode.imageUrl} 
                              alt={episode.title} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{episode.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {episode.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground mr-1" />
                            <span>{formatDuration(episode.duration)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(episode.publishDate)}</TableCell>
                        <TableCell>
                          {episode.processed ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                              <Check className="h-3.5 w-3.5 mr-1" />
                              Processed
                            </Badge>
                          ) : (
                            <Badge variant="outline">
                              Unprocessed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={isLoading.processSingle[index] || episode.processed}
                            onClick={() => handleProcessSingle(episode.id, index)}
                          >
                            {isLoading.processSingle[index] ? (
                              <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                            ) : (
                              <Share2 className="h-3.5 w-3.5 mr-1" />
                            )}
                            Create Social Post
                          </Button>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Play className="h-4 w-4 mr-2" />
                                Play Episode
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share Episode
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit Details</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t border-border pt-4">
            <div className="text-sm text-muted-foreground">
              Total Episodes: {podcastEpisodes.length} • Processed: {podcastEpisodes.filter(e => e.processed).length}
            </div>
          </CardFooter>
        </Card>
      </main>
    </MainLayout>
  );
}
