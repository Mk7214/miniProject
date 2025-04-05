import { Moon, Sun } from "lucide-react"
import { useTheme } from "./theme-provider"
import { Button } from "./button"
import { Dropdownmenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Dropdownmenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-transparent border border-black/70 dark:border-white/20 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 hover:border-blue-400 rounded-lg h-9 w-9 p-0"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-black dark:text-white" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-black dark:text-white" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white dark:bg-zinc-900 border border-black/70 dark:border-white/20 rounded-lg">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="text-black hover:bg-blue-500/10 dark:text-white dark:hover:bg-blue-500/20 rounded-md my-1 mx-1"
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="text-black hover:bg-blue-500/10 dark:text-white dark:hover:bg-blue-500/20 rounded-md my-1 mx-1"
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </Dropdownmenu>
  )
} 