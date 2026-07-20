"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Shield, CheckCircle } from "lucide-react";
import Link from "next/link";

const resetSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetSchema>;

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardContent className="text-center pt-6">
            <p className="text-muted-foreground">Invalid or missing reset token.</p>
            <Link href="/forgot-password">
              <Button variant="outline" className="mt-4">Request a new link</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function onSubmit(data: ResetFormData) {
    setLoading(true);
    try {
      await authApi.resetPassword({ token: token!, password: data.password });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to reset password. The link may have expired.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
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
            <CardTitle className="text-xl">Set new password</CardTitle>
            <CardDescription>Choose a strong password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Your password has been reset. You can now sign in.
                </p>
                <Link href="/login">
                  <Button className="w-full">Sign in</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} autoFocus />
                  {form.formState.errors.password && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <Input id="confirmPassword" type="password" placeholder="••••••••" {...form.register("confirmPassword")} />
                  {form.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reset password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}
