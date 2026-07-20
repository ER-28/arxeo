"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authApi, ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30).regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, hyphens, underscores"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const authLogin = useAuthStore((s) => s.login);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", username: "", password: "", confirmPassword: "", firstName: "", lastName: "" },
  });

  async function onSubmit(data: RegisterFormData) {
    setLoading(true);
    try {
      const res = await authApi.register({
        email: data.email,
        username: data.username,
        password: data.password,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
      }) as any;
      authLogin(res.user, res.accessToken, res.refreshToken);
      toast.success("Account created! Welcome to Arxeo.");
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 bg-primary/5 items-center justify-center p-12">
          <div className="max-w-md text-center">
            <Shield className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Join Arxeo
            </h2>
            <p className="text-muted-foreground text-lg">
              Create your account and start securing your passwords today.
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
              <h1 className="text-2xl font-bold">Create your account</h1>
              <p className="text-muted-foreground mt-1">Get started with Arxeo for free</p>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" placeholder="John" {...form.register("firstName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" placeholder="Doe" {...form.register("lastName")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} autoFocus />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="johndoe" {...form.register("username")} />
                {form.formState.errors.username && (
                  <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...form.register("password")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
