"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  RefreshCw,
  Sparkles,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { authService } from "@/services/authService"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { User as AuthUser } from "@/services/authService"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Dropdownmenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

interface User {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  name?: string; // Optional since it might come from username
}

const NavUser = () => {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUser = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching user data...')
      
      // Check if we're authenticated first
      if (!authService.isAuthenticated()) {
        setLoading(false)
        navigate('/login')
        return
      }
      
      const response = await authService.getCurrentUser()
      console.log('User data response:', response)
      
      if (response.success && response.user) {
        // Map auth user to our component's user type
        const mappedUser: User = {
          id: response.user.id || response.user._id,
          username: response.user.username,
          email: response.user.email,
          name: response.user.name || response.user.username // Use name if provided, fallback to username
        }
        setUser(mappedUser)
      } else {
        throw new Error(response.message || 'Failed to fetch user data')
      }
    } catch (error: any) {
      console.error('Failed to fetch user:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch user data'
      setError(errorMessage)
      
      // If we get a 401, redirect to login
      if (error.response?.status === 401) {
        navigate('/login')
        return
      }
      
      // Only show error toast if we're actually authenticated
      if (authService.isAuthenticated()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, []) // Remove toast and navigate from dependencies to prevent infinite loop

  
  if (loading) {
    return (
      <SidebarMenu className="px-2 py-2">
        <SidebarMenuItem>
          <div className="flex items-center gap-2 p-2 rounded-lg border border-black/70 dark:border-white/20">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-zinc-700 dark:bg-zinc-700 bg-zinc-300" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 animate-pulse rounded-lg bg-zinc-700 dark:bg-zinc-700 bg-zinc-300" />
              <div className="h-3 w-32 animate-pulse rounded-lg bg-zinc-700 dark:bg-zinc-700 bg-zinc-300" />
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (error || !user) {
    return (
      <SidebarMenu className="px-2 py-2">
        <SidebarMenuItem>
          <div className="flex items-center gap-2 p-3 rounded-lg border border-black/70 dark:border-white/20 bg-white dark:bg-zinc-900">
            <div className="h-8 w-8 rounded-lg bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-black dark:text-white font-bold">?</div>
            <div className="flex-1">
              <div className="text-sm text-black dark:text-zinc-400">Not logged in</div>
              <button 
                onClick={fetchUser}
                className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  if (!user.name || !user.email) {
    return (
      <SidebarMenu className="px-2 py-2">
        <SidebarMenuItem>
          <div className="flex items-center gap-2 p-3 rounded-lg border border-black/70 dark:border-white/20 bg-white dark:bg-zinc-900">
            <div className="h-8 w-8 rounded-lg bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-black dark:text-white font-bold">!</div>
            <div className="flex-1">
              <div className="text-sm text-black dark:text-zinc-400">Invalid user data</div>
              <button 
                onClick={fetchUser}
                className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            </div>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()

  const handleLogout = async () => {
    try {
      await authService.logout()
      setUser(null)
      toast({
        title: "Success",
        description: "Logged out successfully",
      })
      navigate('/login')
    } catch (error: any) {
      console.error('Failed to logout:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to logout'
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    }
  }

  return (
    <SidebarMenu className="px-2 py-2">
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="rounded-lg border border-black/70 dark:border-white/20 bg-white dark:bg-zinc-900 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:border-blue-400 transition-all p-2 w-full"
        >
          <Avatar className="h-8 w-8 rounded-lg border border-black/70 dark:border-white/40">
            <AvatarFallback className="rounded-lg bg-blue-500 text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-black dark:text-white">{user.name}</span>
            <span className="truncate text-xs text-black/70 dark:text-zinc-400">{user.email}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export default NavUser
