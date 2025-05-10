
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

// Types for our data
export interface MediaFile {
  id: string;
  title: string;
  url: string;
  type: string;
  uploaded: string;
  fileSize: number;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  imageUrl: string;
  duration: number;
  publishDate: string;
  processed: boolean;
}

export interface SocialMediaPost {
  id: string;
  content: string;
  imageUrl: string;
  platforms: string[];
  status: "Approved For Publishing" | "Posted" | "Rejected" | "Review" | "Scheduled For Publishing";
  scheduledDate: string | null;
  createdDate: string;
  podcastEpisodeId: string | null;
}

export interface Statistics {
  approved: number;
  posted: number;
  rejected: number;
  review: number;
  scheduled: number;
  platforms: {
    [platform: string]: number;
  };
}

interface DataContextType {
  mediaFiles: MediaFile[];
  podcastEpisodes: PodcastEpisode[];
  socialMediaPosts: SocialMediaPost[];
  isLoading: boolean;
  fetchMediaFiles: () => Promise<void>;
  fetchPodcastEpisodes: () => Promise<void>;
  fetchSocialMediaPosts: () => Promise<void>;
  updateMediaFile: (id: string, updates: Partial<MediaFile>) => Promise<boolean>;
  updatePodcastEpisode: (id: string, updates: Partial<PodcastEpisode>) => Promise<boolean>;
  updateSocialMediaPost: (id: string, updates: Partial<SocialMediaPost>) => Promise<boolean>;
  createSocialMediaPost: (post: Omit<SocialMediaPost, "id" | "createdDate">) => Promise<boolean>;
  getStatistics: (startDate?: Date, endDate?: Date) => Statistics;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Mock data
const mockMediaFiles: MediaFile[] = [
  {
    id: "file1",
    title: "Podcast Cover Image",
    url: "https://source.unsplash.com/random/300x300?podcast",
    type: "image/jpeg",
    uploaded: "2023-05-10T12:00:00Z",
    fileSize: 1024000,
  },
  {
    id: "file2",
    title: "Interview Audio",
    url: "https://example.com/audio1.mp3",
    type: "audio/mpeg",
    uploaded: "2023-05-15T14:30:00Z",
    fileSize: 35840000,
  },
  {
    id: "file3",
    title: "Social Media Banner",
    url: "https://source.unsplash.com/random/1200x630?social",
    type: "image/png",
    uploaded: "2023-05-20T09:45:00Z",
    fileSize: 2048000,
  },
  {
    id: "file4",
    title: "Product Demo Video",
    url: "https://example.com/video1.mp4",
    type: "video/mp4",
    uploaded: "2023-05-25T16:20:00Z",
    fileSize: 102400000,
  },
  {
    id: "file5",
    title: "Webinar Slides",
    url: "https://example.com/slides.pdf",
    type: "application/pdf",
    uploaded: "2023-05-30T11:10:00Z",
    fileSize: 5120000,
  },
];

const mockPodcastEpisodes: PodcastEpisode[] = [
  {
    id: "episode1",
    title: "Getting Started with Social Media Management",
    description: "Learn the basics of effective social media management for your business.",
    audioUrl: "https://example.com/podcast1.mp3",
    imageUrl: "https://source.unsplash.com/random/300x300?podcast,microphone,1",
    duration: 1860, // 31 minutes in seconds
    publishDate: "2023-06-01T10:00:00Z",
    processed: true,
  },
  {
    id: "episode2",
    title: "Advanced Content Strategy Techniques",
    description: "Dive deep into content strategies that drive engagement and conversions.",
    audioUrl: "https://example.com/podcast2.mp3",
    imageUrl: "https://source.unsplash.com/random/300x300?podcast,microphone,2",
    duration: 2400, // 40 minutes in seconds
    publishDate: "2023-06-08T10:00:00Z",
    processed: true,
  },
  {
    id: "episode3",
    title: "Measuring Social Media ROI",
    description: "How to measure and optimize your return on investment from social media campaigns.",
    audioUrl: "https://example.com/podcast3.mp3",
    imageUrl: "https://source.unsplash.com/random/300x300?podcast,microphone,3",
    duration: 2100, // 35 minutes in seconds
    publishDate: "2023-06-15T10:00:00Z",
    processed: false,
  },
  {
    id: "episode4",
    title: "Building Your Personal Brand Online",
    description: "Strategies for developing a strong personal brand across social media platforms.",
    audioUrl: "https://example.com/podcast4.mp3",
    imageUrl: "https://source.unsplash.com/random/300x300?podcast,microphone,4",
    duration: 1980, // 33 minutes in seconds
    publishDate: "2023-06-22T10:00:00Z",
    processed: false,
  },
  {
    id: "episode5",
    title: "The Future of Social Media",
    description: "Emerging trends and platforms that will shape the future of social media marketing.",
    audioUrl: "https://example.com/podcast5.mp3",
    imageUrl: "https://source.unsplash.com/random/300x300?podcast,microphone,5",
    duration: 2700, // 45 minutes in seconds
    publishDate: "2023-06-29T10:00:00Z",
    processed: false,
  },
];

const mockSocialMediaPosts: SocialMediaPost[] = [
  {
    id: "post1",
    content: "🎙️ NEW EPISODE: Getting Started with Social Media Management - Learn the basics of effective social media management for your business. #SocialMedia #Marketing",
    imageUrl: "https://source.unsplash.com/random/300x300?podcast,microphone,1",
    platforms: ["Twitter", "LinkedIn", "Instagram"],
    status: "Posted",
    scheduledDate: null,
    createdDate: "2023-06-01T12:00:00Z",
    podcastEpisodeId: "episode1",
  },
  {
    id: "post2",
    content: "Just dropped a new podcast episode! 🎧 Advanced Content Strategy Techniques - Dive deep into content strategies that drive engagement and conversions. Link in bio! #ContentStrategy #DigitalMarketing",
    imageUrl: "https://source.unsplash.com/random/300x300?podcast,microphone,2",
    platforms: ["Instagram", "Facebook"],
    status: "Posted",
    scheduledDate: null,
    createdDate: "2023-06-08T12:00:00Z",
    podcastEpisodeId: "episode2",
  },
  {
    id: "post3",
    content: "How do you measure your social media success? 📊 In our latest episode, we discuss how to effectively measure and optimize your social media ROI. Listen now! #SocialMediaROI #MarketingAnalytics",
    imageUrl: "https://source.unsplash.com/random/300x300?podcast,microphone,3",
    platforms: ["Twitter", "LinkedIn", "Facebook"],
    status: "Scheduled For Publishing",
    scheduledDate: "2023-07-15T09:00:00Z",
    createdDate: "2023-06-15T14:30:00Z",
    podcastEpisodeId: "episode3",
  },
  {
    id: "post4",
    content: "Your personal brand matters more than ever online. 💼 Listen to our new episode on building a strong personal brand across social platforms. #PersonalBranding #CareerGrowth",
    imageUrl: "https://source.unsplash.com/random/300x300?podcast,microphone,4",
    platforms: ["LinkedIn"],
    status: "Review",
    scheduledDate: null,
    createdDate: "2023-06-22T15:45:00Z",
    podcastEpisodeId: "episode4",
  },
  {
    id: "post5",
    content: "What's next for social media? 🚀 Our latest episode explores emerging platforms and trends that will shape the future of social media marketing. #FutureOfSocialMedia #DigitalTrends",
    imageUrl: "https://source.unsplash.com/random/300x300?podcast,microphone,5",
    platforms: ["Twitter", "LinkedIn", "Facebook", "Instagram"],
    status: "Approved For Publishing",
    scheduledDate: "2023-07-29T10:00:00Z",
    createdDate: "2023-06-29T16:20:00Z",
    podcastEpisodeId: "episode5",
  },
  {
    id: "post6",
    content: "ICYMI: Our episode on Content Strategy Techniques is now available on all major podcast platforms! #ContentMarketing #PodcastAlert",
    imageUrl: "https://source.unsplash.com/random/300x300?podcast,microphone,2",
    platforms: ["Twitter", "Facebook"],
    status: "Rejected",
    scheduledDate: null,
    createdDate: "2023-06-10T08:15:00Z",
    podcastEpisodeId: "episode2",
  },
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [podcastEpisodes, setPodcastEpisodes] = useState<PodcastEpisode[]>([]);
  const [socialMediaPosts, setSocialMediaPosts] = useState<SocialMediaPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load data from localStorage if available
    const storedMediaFiles = localStorage.getItem("mediaFiles");
    const storedPodcastEpisodes = localStorage.getItem("podcastEpisodes");
    const storedSocialMediaPosts = localStorage.getItem("socialMediaPosts");

    if (storedMediaFiles) {
      try {
        setMediaFiles(JSON.parse(storedMediaFiles));
      } catch (error) {
        console.error("Failed to parse stored media files:", error);
      }
    } else {
      setMediaFiles(mockMediaFiles);
      localStorage.setItem("mediaFiles", JSON.stringify(mockMediaFiles));
    }

    if (storedPodcastEpisodes) {
      try {
        setPodcastEpisodes(JSON.parse(storedPodcastEpisodes));
      } catch (error) {
        console.error("Failed to parse stored podcast episodes:", error);
      }
    } else {
      setPodcastEpisodes(mockPodcastEpisodes);
      localStorage.setItem("podcastEpisodes", JSON.stringify(mockPodcastEpisodes));
    }

    if (storedSocialMediaPosts) {
      try {
        setSocialMediaPosts(JSON.parse(storedSocialMediaPosts));
      } catch (error) {
        console.error("Failed to parse stored social media posts:", error);
      }
    } else {
      setSocialMediaPosts(mockSocialMediaPosts);
      localStorage.setItem("socialMediaPosts", JSON.stringify(mockSocialMediaPosts));
    }
  }, []);

  const fetchMediaFiles = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For demo, just use mock data or existing data
      toast({
        title: "Media Files Updated",
        description: "Your media files have been refreshed.",
      });
    } catch (error) {
      console.error("Error fetching media files:", error);
      toast({
        title: "Failed to Fetch Media Files",
        description: "An error occurred while fetching media files.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPodcastEpisodes = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For demo, just use mock data or existing data
      toast({
        title: "Podcast Episodes Updated",
        description: "Your podcast episodes have been refreshed.",
      });
    } catch (error) {
      console.error("Error fetching podcast episodes:", error);
      toast({
        title: "Failed to Fetch Podcast Episodes",
        description: "An error occurred while fetching podcast episodes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSocialMediaPosts = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For demo, just use mock data or existing data
      toast({
        title: "Social Media Posts Updated",
        description: "Your social media posts have been refreshed.",
      });
    } catch (error) {
      console.error("Error fetching social media posts:", error);
      toast({
        title: "Failed to Fetch Social Media Posts",
        description: "An error occurred while fetching social media posts.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateMediaFile = async (id: string, updates: Partial<MediaFile>): Promise<boolean> => {
    try {
      const updatedFiles = mediaFiles.map(file => 
        file.id === id ? { ...file, ...updates } : file
      );
      setMediaFiles(updatedFiles);
      localStorage.setItem("mediaFiles", JSON.stringify(updatedFiles));
      
      toast({
        title: "Media File Updated",
        description: "The media file has been updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating media file:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update the media file.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updatePodcastEpisode = async (id: string, updates: Partial<PodcastEpisode>): Promise<boolean> => {
    try {
      const updatedEpisodes = podcastEpisodes.map(episode => 
        episode.id === id ? { ...episode, ...updates } : episode
      );
      setPodcastEpisodes(updatedEpisodes);
      localStorage.setItem("podcastEpisodes", JSON.stringify(updatedEpisodes));
      
      toast({
        title: "Podcast Episode Updated",
        description: "The podcast episode has been updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating podcast episode:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update the podcast episode.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateSocialMediaPost = async (id: string, updates: Partial<SocialMediaPost>): Promise<boolean> => {
    try {
      const updatedPosts = socialMediaPosts.map(post => 
        post.id === id ? { ...post, ...updates } : post
      );
      setSocialMediaPosts(updatedPosts);
      localStorage.setItem("socialMediaPosts", JSON.stringify(updatedPosts));
      
      toast({
        title: "Social Media Post Updated",
        description: "The social media post has been updated successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating social media post:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update the social media post.",
        variant: "destructive",
      });
      return false;
    }
  };

  const createSocialMediaPost = async (post: Omit<SocialMediaPost, "id" | "createdDate">): Promise<boolean> => {
    try {
      const newPost: SocialMediaPost = {
        ...post,
        id: `post${Date.now()}`, // Generate a simple ID
        createdDate: new Date().toISOString(),
      };
      
      const updatedPosts = [...socialMediaPosts, newPost];
      setSocialMediaPosts(updatedPosts);
      localStorage.setItem("socialMediaPosts", JSON.stringify(updatedPosts));
      
      toast({
        title: "Social Media Post Created",
        description: "A new social media post has been created successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error creating social media post:", error);
      toast({
        title: "Creation Failed",
        description: "Failed to create the social media post.",
        variant: "destructive",
      });
      return false;
    }
  };

  const getStatistics = (startDate?: Date, endDate?: Date): Statistics => {
    // Filter posts by date range if provided
    let filteredPosts = [...socialMediaPosts];
    
    if (startDate) {
      filteredPosts = filteredPosts.filter(post => {
        const postDate = new Date(post.createdDate);
        return postDate >= startDate;
      });
    }
    
    if (endDate) {
      filteredPosts = filteredPosts.filter(post => {
        const postDate = new Date(post.createdDate);
        return postDate <= endDate;
      });
    }
    
    // Count by status
    const approved = filteredPosts.filter(post => post.status === "Approved For Publishing").length;
    const posted = filteredPosts.filter(post => post.status === "Posted").length;
    const rejected = filteredPosts.filter(post => post.status === "Rejected").length;
    const review = filteredPosts.filter(post => post.status === "Review").length;
    const scheduled = filteredPosts.filter(post => post.status === "Scheduled For Publishing").length;
    
    // Count by platform
    const platforms: { [platform: string]: number } = {};
    filteredPosts.forEach(post => {
      post.platforms.forEach(platform => {
        platforms[platform] = (platforms[platform] || 0) + 1;
      });
    });
    
    return {
      approved,
      posted,
      rejected,
      review,
      scheduled,
      platforms,
    };
  };

  const clearData = (): void => {
    localStorage.removeItem("mediaFiles");
    localStorage.removeItem("podcastEpisodes");
    localStorage.removeItem("socialMediaPosts");
    
    setMediaFiles(mockMediaFiles);
    setPodcastEpisodes(mockPodcastEpisodes);
    setSocialMediaPosts(mockSocialMediaPosts);
    
    localStorage.setItem("mediaFiles", JSON.stringify(mockMediaFiles));
    localStorage.setItem("podcastEpisodes", JSON.stringify(mockPodcastEpisodes));
    localStorage.setItem("socialMediaPosts", JSON.stringify(mockSocialMediaPosts));
    
    toast({
      title: "Data Reset",
      description: "All data has been reset to default values.",
    });
  };

  const value = {
    mediaFiles,
    podcastEpisodes,
    socialMediaPosts,
    isLoading,
    fetchMediaFiles,
    fetchPodcastEpisodes,
    fetchSocialMediaPosts,
    updateMediaFile,
    updatePodcastEpisode,
    updateSocialMediaPost,
    createSocialMediaPost,
    getStatistics,
    clearData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
