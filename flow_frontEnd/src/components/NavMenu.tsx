import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Link as LinkIcon,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Bookmark,
} from "lucide-react"
import LogoutButton from "./LogoutButton"
import { ThemeToggle } from "./ui/theme-toggle"
import { Link } from "react-router-dom"
import { BookMark } from "./ui/BookMark"
import NavMain from "@/components/NavMain"
import NavUser from "@/components/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"

interface NavMenuProps extends React.ComponentProps<typeof Sidebar> {
  onResetSelection?: () => void;
}

const NavMenu = ({ onResetSelection, ...props }: NavMenuProps) => {
  const handleReset = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Resetting selection");
    if (onResetSelection) {
      onResetSelection();
    }
  };

  return (
    <Sidebar variant="inset" {...props} className="border-black/70 dark:border-white/20 border-2 rounded-lg">
      <SidebarHeader className="bg-white dark:bg-zinc-900 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="py-2 px-3 rounded-lg hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:border-blue-400 transition-all">
              <div 
                className="flex items-center w-full cursor-pointer"
                onClick={handleReset}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold text-lg text-black p-2 dark:text-white">Flow</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="bg-white dark:bg-zinc-900">
        <NavMain />
      </SidebarContent>
      <SidebarFooter className="bg-white dark:bg-zinc-900">
        <Link to="/bookmarks" className="w-full">
          <Button className="w-full flex items-center gap-2 justify-center">
            <Bookmark className="h-4 w-4" />
            <span>Your Bookmarks</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2 justify-between p-2">
          <LogoutButton className="flex-1" />
          <ThemeToggle />
        </div>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

export default NavMenu