import { useEffect, useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import NavMenu from "./NavMenu"
import { roadmapService } from "@/services/roadmapService"
import { useToast } from "@/hooks/use-toast"
import { VideoPlayer } from "@/components/VideoPlayer"
import { ReferenceContent } from "@/components/ReferenceContent"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserProgressStats } from "@/components/UserProgressStats"
import { ActiveRoadmaps } from "@/components/ActiveRoadmaps"
import { RecentTopics } from "@/components/RecentTopics"
import { Bookmark } from "lucide-react"
import { Bookmarks } from "@/components/Bookmarks"
import { PopularTopics } from "@/components/PopularTopics"

interface Topic {
  title: string;
  description: string;
  resources: Resource[];
  order: number;
}

interface Resource {
  title: string;
  url: string;
  type: string;
}

interface UserProgress {
  roadmap: {
    _id: string;
    title: string;
  };
  completedTopics: string[];
  percentageComplete: number;
}

interface RecentTopic {
  title: string;
  roadmapTitle: string;
  completedAt: string;
}

const Navigation = ({ showBookmarks = false }) => {
  const { roadmapId, topicIndex } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        if (!roadmapId || !topicIndex) {
          setTopic(null);
          return;
        }
        
        // First try to fetch by ID directly
        try {
          const data = await roadmapService.getTopic(roadmapId, topicIndex);
          setTopic(data);
        } catch (error) {
          // If that fails, try as index (for backward compatibility)
          const data = await roadmapService.getTopic(roadmapId, parseInt(topicIndex));
          setTopic(data);
        }
      } catch (error: any) {
        console.error('Failed to fetch topic:', error);
        setError(error.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load topic content",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [roadmapId, topicIndex, toast]);

  // Function to reset selection and return to home state
  const resetSelection = () => {
    console.log("Reset selection called from Navigation component");
    setTopic(null);
    setError(null);
    navigate("/");
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-8 w-3/4 bg-zinc-700 dark:bg-zinc-700 bg-zinc-300 rounded" />
          <div className="h-4 w-1/2 bg-zinc-700 dark:bg-zinc-700 bg-zinc-300 rounded" />
          <div className="h-96 bg-zinc-700 dark:bg-zinc-700 bg-zinc-300 rounded" />
        </div>
      );
    }

    if (showBookmarks) {
      return (
        <div className="p-6">
          <Bookmarks />
        </div>
      );
    }

    if (error || !topic) {
      return (
        <div className="p-6">
          <div className="space-y-8">
            {/* User Progress Overview */}
            <div className="rounded-lg border p-6 dark:border-zinc-500">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Your Learning Progress</h2>
              <UserProgressStats />
            </div>


            {/* Active Roadmaps */}
            <div className="rounded-lg border p-6 dark:border-zinc-500">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Active Roadmaps</h2>
              <ActiveRoadmaps />
            </div>

            {/* Recent Activity */}
            <div className="rounded-lg border p-6 dark:border-zinc-500">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Recent Activity</h2>
              <RecentTopics />
            </div>
                        {/* Popular Topics */}
                        <div className="rounded-lg border p-6 dark:border-zinc-500">
              <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Most Viewed Topics</h2>
              <PopularTopics />
            </div>

          </div>
        </div>
      );
    }

    return (
      <div className="p-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-black dark:text-white">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/roadmap/${roadmapId}`} className="text-black dark:text-white">Roadmap</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="text-black dark:text-white">{topic.title}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="text-3xl font-bold mb-4 text-black dark:text-white">{topic.title}</h1>
        <p className="text-black dark:text-zinc-300 mb-8">{topic.description}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Player Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Video Content</h2>
            <VideoPlayer topic={topic} />
          </div>

          {/* Reference Content Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Reference Material</h2>
            <ReferenceContent resources={topic.resources} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <NavMenu onResetSelection={resetSelection}>
        <Link 
          to="/bookmarks" 
          className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Bookmark className="h-4 w-4" />
          <span>Your Bookmarks</span>
        </Link>
      </NavMenu>
      <SidebarInset className="dark:bg-zinc-900 bg-white border-black/70 dark:border-white/20 border-2">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 bg-red-500" />
            <Separator orientation="vertical" className="mr-2 h-4" />
          </div>
        </header> 
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-[100vh] flex-1 rounded-xl bg-white dark:bg-muted/50 md:min-h-min repage">
            {renderContent()}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Navigation;