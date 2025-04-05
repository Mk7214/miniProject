import { ChevronRight, type LucideIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { roadmapService } from "@/services/roadmapService"
import { useToast } from "@/hooks/use-toast"

import {
  Collapsibles,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
} from "@/components/ui/sidebar"

interface Roadmap {
  _id: string;
  title: string;
  description: string;
  topics: Topic[];
}

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

const NavMain = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setLoading(true)
        const data = await roadmapService.getAllRoadmaps()
        setRoadmaps(data)
      } catch (error: any) {
        console.error('Failed to fetch roadmaps:', error)
        setError(error.message)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load roadmaps",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRoadmaps()
  }, [toast])

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
    )
  }

  if (error) {
    return (
      <SidebarGroup className="py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="text-sm text-red-500 dark:text-red-400 p-3 border border-red-300 dark:border-red-800 rounded-md">Failed to load roadmaps</div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className="py-2">
      <SidebarGroupLabel className="text-black dark:text-white text-base font-semibold px-3 mb-2">Learning Paths</SidebarGroupLabel>
      <SidebarMenu className="px-2">
        {roadmaps.map((roadmap) => (
          <Collapsibles key={roadmap._id} className="mb-2">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton className="font-bold rounded-lg border border-black/70 dark:border-white/20 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:border-blue-400 text-black dark:text-white text-lg py-7 transition-all w-full">
                <span>{roadmap.title}</span>
                <ChevronRight className="ml-auto h-4 w-4" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub className="pt-1 pb-1">    
                {roadmap.topics.map((topic, index) => (
                  <SidebarMenuSubItem key={index} className="my-1">
                    <SidebarMenuSubButton
                      onClick={() => navigate(`/roadmap/${roadmap._id}/topic/${index}`)}
                      className="text-black dark:text-white rounded-md border border-black/70 dark:border-white/10 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:border-blue-400 py-6 px-3 transition-all w-full font-semibold"
                    >
                      {topic.title}
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsibles>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export default NavMain
