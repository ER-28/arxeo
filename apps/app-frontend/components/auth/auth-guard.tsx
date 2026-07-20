"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/auth/callback"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login");
    }
  }, [mounted, isAuthenticated, pathname, router]);

  if (!mounted) return null;

  if (!isAuthenticated && !PUBLIC_PATHS.includes(pathname)) return null;

  return <>{children}</>;
}
