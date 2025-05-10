import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { roadmapService } from "@/services/roadmapService";
import { useToast } from "@/hooks/use-toast";

import {
  Collapsibles,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

interface RoadmapType {
  _id: string;
  title: string;
  description?: string;
  topics: TopicType[];
}

interface TopicType {
  _id: string;
  title: string;
  description?: string;
  resources?: Resource[];
  subtopics?: string[];
  order: number;
}

interface Resource {
  title: string;
  url: string;
  type: string;
}

const NavMain = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [roadmaps, setRoadmaps] = useState<RoadmapType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openRoadmapId, setOpenRoadmapId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setLoading(true);
        const data = await roadmapService.getAllRoadmaps();
        setRoadmaps(data as RoadmapType[]);
        
        // Open the first roadmap by default
        if (data && data.length > 0) {
          setOpenRoadmapId(data[0]._id);
        }
      } catch (error: any) {
        console.error("Failed to fetch roadmaps:", error);
        setError(error.message);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load roadmaps",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRoadmaps();
  }, [toast]);

  // Toggle roadmap open/closed state
  const handleRoadmapToggle = (roadmapId: string) => {
    if (openRoadmapId === roadmapId) {
      // If clicking on already open roadmap, close it
      setOpenRoadmapId(null);
    } else {
      // Otherwise open the clicked roadmap
      setOpenRoadmapId(roadmapId);
    }
  };

  if (loading) {
    return (
      <SidebarGroup className="py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="animate-pulse space-y-2 p-2">
              <div className="h-4 w-32 bg-zinc-700 dark:bg-zinc-700 bg-zinc-300 rounded-md" />
              <div className="h-4 w-24 bg-zinc-700 dark:bg-zinc-700 bg-zinc-300 rounded-md" />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  if (error) {
    return (
      <SidebarGroup className="py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="text-sm text-red-500 dark:text-red-400 p-3 border border-red-300 dark:border-red-800 rounded-md">
              Failed to load roadmaps
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );
  }

  // Create a collapsible item for each roadmap
  return (
    <SidebarGroup className="py-2">
      <SidebarGroupLabel className="text-black dark:text-white text-base font-semibold px-3 mb-2">
        Learning Paths
      </SidebarGroupLabel>
      <SidebarMenu className="px-2">
        {roadmaps.map((roadmap) => (
          <SidebarMenuItem key={roadmap._id}>
            <Collapsibles 
              open={openRoadmapId === roadmap._id}
              onOpenChange={() => handleRoadmapToggle(roadmap._id)}
            >
              <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md p-2 text-left text-sm font-medium hover:bg-sidebar-hover">
                <span className="text-black dark:text-white">{roadmap.title}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-sidebar-foreground transition-transform duration-200 collapsible-open:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {roadmap.topics && Array.isArray(roadmap.topics) ? (
                    roadmap.topics.map((topic, index) => (
                      <SidebarMenuSubItem key={index} className="my-1">
                        <SidebarMenuSubButton
                          onClick={() =>
                            navigate(`/roadmap/${roadmap._id}/topic/${topic._id}`)
                          }
                          className="text-black dark:text-white text-ellipsis rounded-md border border-black/70 dark:border-white/10 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:border-blue-400 py-8 px-4 transition-all w-full font-semibold"
                        >
                          {topic.title}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-zinc-500">No topics available</div>
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsibles>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
};

export default NavMain;
