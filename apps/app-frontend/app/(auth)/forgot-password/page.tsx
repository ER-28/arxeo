"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi, ApiError } from "@/lib/api";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotFormData) {
    setLoading(true);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
      toast.success("If an account exists with that email, you'll receive a reset link.");
    } catch {
      toast.success("If an account exists with that email, you'll receive a reset link.");
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Arxeo</span>
            </Link>
          </div>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Reset your password</CardTitle>
              <CardDescription>
                {sent
                  ? "Check your email for the reset link"
                  : "Enter your email and we'll send you a reset link"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sent ? (
                <div className="text-center space-y-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    If an account exists with that email, we&apos;ve sent a password reset link.
                  </p>
                  <Link href="/login">
                    <Button variant="outline" className="w-full">Back to sign in</Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...form.register("email")}
                      autoFocus
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send reset link"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthGuard>
  );
}
