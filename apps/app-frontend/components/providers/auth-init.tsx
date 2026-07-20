"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function AuthInit({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return <>{children}</>;
}
