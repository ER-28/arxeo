"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Loader2, AlertCircle } from "lucide-react";

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const errorParam = searchParams.get("error");

    if (errorParam) {
      setError(errorParam);
      return;
    }

    if (accessToken && refreshToken) {
      fetch("/v1/auth/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch profile");
          return res.json();
        })
        .then((user) => {
          login(user, accessToken, refreshToken);
          router.replace("/dashboard");
        })
        .catch(() => {
          setError("Failed to complete authentication");
        });
    } else {
      setError("Missing authentication tokens");
    }
  }, [searchParams, login, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold">Authentication failed</h2>
            <p className="text-muted-foreground">{error}</p>
            <a href="/login">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                Back to sign in
              </button>
            </a>
          </>
        ) : (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <AuthGuard>
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <CallbackHandler />
      </Suspense>
    </AuthGuard>
  );
}
