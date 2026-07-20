"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SearchDialog } from "@/components/search/search-dialog";
import { SearchProvider } from "@/components/search/search-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SearchProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Topbar />
            <main className="flex-1 overflow-auto p-6">
              {children}
            </main>
          </div>
          <SearchDialog />
        </div>
      </SearchProvider>
    </AuthGuard>
  );
}
