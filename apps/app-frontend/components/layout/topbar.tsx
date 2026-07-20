"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/stores/app-store";
import { useSearch } from "@/components/search/search-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, Search, User, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function Topbar() {
  const { user, logout } = useAuth();
  const { setMobileSidebarOpen } = useAppStore();
  const { setSearchOpen } = useSearch();
  const router = useRouter();

  const initials = user
    ? (user.firstName?.[0] || "") + (user.lastName?.[0] || "") || user.username[0].toUpperCase()
    : "?";

  return (
    <header className="flex items-center h-14 border-b border-border bg-card px-4 gap-4">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileSidebarOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex-1 max-w-md">
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground h-9"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-4 w-4 mr-2" />
          <span className="text-sm">Search... ⌘K</span>
        </Button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full" />}>
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.firstName || user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
