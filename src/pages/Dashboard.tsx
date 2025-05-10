
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useData, Statistics } from "@/contexts/DataContext";
import { useNavigate } from "react-router-dom";
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, 
  YAxis, CartesianGrid, Tooltip, Legend
} from "recharts";
import {
  LayoutGrid, ListFilter, Calendar as CalendarIcon,
  ArrowRight, FileCheck, FileX, Clock, Send, Eye
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

// Status colors
const STATUS_COLORS = {
  approved: "#10B981", // Green
  posted: "#3B82F6", // Blue
  rejected: "#EF4444", // Red
  review: "#F59E0B", // Amber
  scheduled: "#8B5CF6" // Purple
};

// Platform colors
const PLATFORM_COLORS = {
  Twitter: "#1DA1F2",
  LinkedIn: "#0A66C2",
  Facebook: "#1877F2",
  Instagram: "#E4405F"
};

export default function Dashboard() {
  const [view, setView] = useState<"stats" | "calendar">("stats");
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  
  const { socialMediaPosts, getStatistics } = useData();
  const navigate = useNavigate();
  
  // Get statistics for the selected date range
  const stats: Statistics = getStatistics(
    date?.from ? date.from : undefined,
    date?.to ? date.to : undefined
  );

  // Prepare data for pie chart
  const pieData = [
    { name: "Approved", value: stats.approved, color: STATUS_COLORS.approved },
    { name: "Posted", value: stats.posted, color: STATUS_COLORS.posted },
    { name: "Rejected", value: stats.rejected, color: STATUS_COLORS.rejected },
    { name: "Review", value: stats.review, color: STATUS_COLORS.review },
    { name: "Scheduled", value: stats.scheduled, color: STATUS_COLORS.scheduled }
  ];

  // Prepare data for bar chart
  const barData = Object.entries(stats.platforms).map(([name, value]) => ({
    name,
    value,
    color: (PLATFORM_COLORS as any)[name] || "#9CA3AF" // Default to gray if color not found
  }));

  // Prepare calendar events
  const calendarEvents = socialMediaPosts.filter(post => 
    post.scheduledDate || post.status === "Posted"
  ).map(post => ({
    id: post.id,
    date: post.scheduledDate ? new Date(post.scheduledDate) : new Date(post.createdDate),
    title: post.content.slice(0, 50) + (post.content.length > 50 ? "..." : ""),
    status: post.status,
    platforms: post.platforms
  }));

  // Group events by date
  const eventsByDate: { [date: string]: typeof calendarEvents } = {};
  calendarEvents.forEach(event => {
    const dateString = format(event.date, "yyyy-MM-dd");
    if (!eventsByDate[dateString]) {
      eventsByDate[dateString] = [];
    }
    eventsByDate[dateString].push(event);
  });

  const handlePostClick = (postId: string) => {
    navigate(`/social-media-posts?id=${postId}`);
  };

  return (
    <MainLayout>
      {/* Header */}
      <header className="border-b border-border bg-background p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Overview of your social media performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                className="p-3"
              />
            </PopoverContent>
          </Popover>
          
          {/* View Toggle */}
          <div className="border border-border rounded-md flex">
            <Button 
              variant={view === "stats" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setView("stats")}
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Stats
            </Button>
            <Button 
              variant={view === "calendar" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setView("calendar")}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Calendar
            </Button>
          </div>
          
          <Button 
            variant="outline"
            size="icon"
          >
            <ListFilter className="h-4 w-4" />
          </Button>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        {/* Stats View */}
        {view === "stats" && (
          <div className="space-y-6">
            {/* Status cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FileCheck className="h-4 w-4 mr-2 text-status-approved" />
                    Approved
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.approved}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready to be published</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Send className="h-4 w-4 mr-2 text-status-posted" />
                    Posted
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.posted}</div>
                  <p className="text-xs text-muted-foreground mt-1">Published content</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <FileX className="h-4 w-4 mr-2 text-status-rejected" />
                    Rejected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.rejected}</div>
                  <p className="text-xs text-muted-foreground mt-1">Need revision</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-status-review" />
                    Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.review}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-status-scheduled" />
                    Scheduled
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.scheduled}</div>
                  <p className="text-xs text-muted-foreground mt-1">Set for future publishing</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Post Status Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of posts by current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => 
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Platform Distribution */}
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                  <CardDescription>
                    Number of posts on each social media platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barData}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 5
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Posts">
                          {barData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to manage your social media content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                    onClick={() => navigate('/get-posts')}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <FileCheck className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">Get Media Files</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Fetch media files from storage
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                    onClick={() => navigate('/podcast-episodes')}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Send className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">Process Episodes</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Create social posts from episodes
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center justify-center"
                    onClick={() => navigate('/social-media-posts')}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">Review Posts</span>
                    <span className="text-xs text-muted-foreground mt-1">
                      Approve or reject pending posts
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Calendar View */}
        {view === "calendar" && (
          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>
                View scheduled and published content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {/* Calendar Header */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-medium p-2 border-b border-border">
                    {day}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {Array.from({ length: 35 }).map((_, index) => {
                  const currentDate = new Date();
                  currentDate.setDate(currentDate.getDate() - currentDate.getDay() + index);
                  
                  const dateString = format(currentDate, "yyyy-MM-dd");
                  const today = format(new Date(), "yyyy-MM-dd") === dateString;
                  const events = eventsByDate[dateString] || [];
                  
                  return (
                    <div 
                      key={index}
                      className={cn(
                        "border border-border rounded-md p-2 min-h-[120px] overflow-y-auto",
                        today && "bg-secondary/30"
                      )}
                    >
                      <div className="text-right text-sm mb-2">
                        {format(currentDate, "d")}
                      </div>
                      <div className="space-y-2">
                        {events.map(event => (
                          <div 
                            key={event.id}
                            className={cn(
                              "rounded-md p-2 text-xs cursor-pointer",
                              event.status === "Posted" && "bg-blue-100 text-blue-800",
                              event.status === "Scheduled For Publishing" && "bg-purple-100 text-purple-800"
                            )}
                            onClick={() => handlePostClick(event.id)}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {event.platforms.map(platform => (
                                <Badge key={platform} variant="outline" className="text-[10px] h-4">
                                  {platform}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </MainLayout>
  );
}
