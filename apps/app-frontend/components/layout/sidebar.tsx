"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/stores/app-store";
import { orgApi, vaultApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Shield,
  LayoutDashboard,
  Building2,
  Vault,
  Settings,
  LogOut,
  ChevronLeft,
  Share2,
  ScrollText,
} from "lucide-react";

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { selectedOrgId, setSelectedOrg } = useAppStore();
  const { logout } = useAuth();

  const { data: orgs } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => orgApi.list(),
  });

  const { data: vaults } = useQuery({
    queryKey: ["vaults", selectedOrgId],
    queryFn: () => vaultApi.list(selectedOrgId!),
    enabled: !!selectedOrgId,
  });

  const orgList = Array.isArray(orgs) ? orgs : [];
  const vaultList = Array.isArray(vaults) ? vaults : [];

  function handleWithNavigate() {
    return () => onNavigate?.();
  }

  return (
    <>
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2" onClick={handleWithNavigate()}>
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Arxeo</span>
        </Link>
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          <Button
            variant={pathname === "/dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start"
            nativeButton={false}
            render={<Link href="/dashboard" onClick={handleWithNavigate()} />}
          >
            <LayoutDashboard className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          {orgList.length > 0 && (
            <>
              <Separator className="my-2" />
              <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Organizations
              </p>
              {orgList.map((org: any) => (
                <div key={org._id}>
                  <Button
                    variant={selectedOrgId === org._id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedOrg(org._id);
                      onNavigate?.();
                    }}
                    nativeButton={false}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    <span className="truncate">{org.name}</span>
                  </Button>
                  {selectedOrgId === org._id && vaultList.length > 0 && (
                    <div className="ml-4 space-y-0.5 mt-0.5">
                      {vaultList.map((vault: any) => (
                        <Button
                          key={vault._id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs"
                          nativeButton={false}
                          render={<Link href={`/orgs/${org._id}/vaults/${vault._id}`} onClick={handleWithNavigate()} />}
                        >
                          {vault.isShared ? (
                            <Share2 className="h-3 w-3 mr-2 text-accent" />
                          ) : (
                            <Vault className="h-3 w-3 mr-2" />
                          )}
                          <span className="truncate">{vault.name}</span>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-2 space-y-1">
        <Button
          variant={pathname.startsWith("/audit") ? "secondary" : "ghost"}
          className="w-full justify-start"
          nativeButton={false}
          render={<Link href="/audit" onClick={handleWithNavigate()} />}
        >
          <ScrollText className="h-4 w-4 mr-2" />
          Audit Log
        </Button>
        <Button
          variant={pathname.startsWith("/settings") ? "secondary" : "ghost"}
          className="w-full justify-start"
          nativeButton={false}
          render={<Link href="/settings" onClick={handleWithNavigate()} />}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => { logout(); onNavigate?.(); }}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign out
        </Button>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar, selectedOrgId, setSelectedOrg, mobileSidebarOpen, setMobileSidebarOpen } = useAppStore();

  const { data: orgs } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => orgApi.list(),
  });

  const { data: vaults } = useQuery({
    queryKey: ["vaults", selectedOrgId],
    queryFn: () => vaultApi.list(selectedOrgId!),
    enabled: !!selectedOrgId,
  });

  const orgList = Array.isArray(orgs) ? orgs : [];
  const vaultList = Array.isArray(vaults) ? vaults : [];

  if (!sidebarOpen) {
    return (
      <>
        <div className="hidden md:flex flex-col w-14 border-r border-border bg-card items-center py-4 gap-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Shield className="h-5 w-5 text-primary" />
          </Button>
          <Separator />
          <Button
            variant={pathname === "/dashboard" ? "secondary" : "ghost"}
            size="icon"
            nativeButton={false}
            render={<Link href="/dashboard" />}
          >
            <LayoutDashboard className="h-4 w-4" />
          </Button>
          {orgList.slice(0, 5).map((org: any) => (
            <Button
              key={org._id}
              variant={selectedOrgId === org._id ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setSelectedOrg(org._id)}
              title={org.name}
            >
              <Building2 className="h-4 w-4" />
            </Button>
          ))}
          <div className="mt-auto space-y-1">
            <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/audit" />}>
              <ScrollText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" nativeButton={false} render={<Link href="/settings" />}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="w-60 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex flex-col h-full">
              <SidebarContent onNavigate={() => setMobileSidebarOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <>
      <div className="hidden md:flex flex-col w-60 border-r border-border bg-card">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Arxeo</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <Separator />
        <ScrollArea className="flex-1">
          <nav className="p-2 space-y-1">
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              className="w-full justify-start"
              nativeButton={false}
              render={<Link href="/dashboard" />}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            {orgList.length > 0 && (
              <>
                <Separator className="my-2" />
                <p className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Organizations
                </p>
                {orgList.map((org: any) => (
                  <div key={org._id}>
                    <Button
                      variant={selectedOrgId === org._id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedOrg(org._id)}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      <span className="truncate">{org.name}</span>
                    </Button>
                    {selectedOrgId === org._id && vaultList.length > 0 && (
                      <div className="ml-4 space-y-0.5 mt-0.5">
                        {vaultList.map((vault: any) => (
                          <Button
                            key={vault._id}
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-xs"
                            nativeButton={false}
                            render={<Link href={`/orgs/${org._id}/vaults/${vault._id}`} />}
                          >
                            {vault.isShared ? (
                              <Share2 className="h-3 w-3 mr-2 text-accent" />
                            ) : (
                              <Vault className="h-3 w-3 mr-2" />
                            )}
                            <span className="truncate">{vault.name}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </nav>
        </ScrollArea>
        <Separator />
        <div className="p-2 space-y-1">
          <Button
            variant={pathname.startsWith("/audit") ? "secondary" : "ghost"}
            className="w-full justify-start"
            nativeButton={false}
            render={<Link href="/audit" />}
          >
            <ScrollText className="h-4 w-4 mr-2" />
            Audit Log
          </Button>
          <Button
            variant={pathname.startsWith("/settings") ? "secondary" : "ghost"}
            className="w-full justify-start"
            nativeButton={false}
            render={<Link href="/settings" />}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="w-60 p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex flex-col h-full">
            <SidebarContent onNavigate={() => setMobileSidebarOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
