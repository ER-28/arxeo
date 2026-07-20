"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, init } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-1 items-center justify-center min-h-screen">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}
