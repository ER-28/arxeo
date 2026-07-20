"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated } = useAuth();

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 bg-primary/5 items-center justify-center p-12">
          <div className="max-w-md text-center">
            <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Your passwords, secured
            </h2>
            <p className="text-muted-foreground text-lg">
              End-to-end encryption keeps your data safe. Only you can access your vault.
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm">
            <div className="mb-8 text-center">
              <Link href="/" className="inline-flex items-center gap-2 mb-6">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold">Arxeo</span>
              </Link>
              <h1 className="text-2xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground mt-1">Sign in to your account</p>
            </div>
            <LoginForm />
            <p className="text-center text-sm text-muted-foreground mt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
