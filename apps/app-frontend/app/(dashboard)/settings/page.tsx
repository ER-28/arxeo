"use client";

import { useAuth } from "@/hooks/use-auth";
import { authApi, ApiError } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Loader2, Shield, Key, Trash2 } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  async function handleUpdateProfile() {
    setLoading(true);
    try {
      const updated = await authApi.updateProfile({
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        email: email !== user?.email ? email : undefined,
      }) as any;
      updateUser(updated);
      toast.success("Profile updated");
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    setLoading(true);
    try {
      await authApi.deleteAccount(deletePassword);
      toast.success("Account deleted");
      logout();
    } catch (err) {
      if (err instanceof ApiError) toast.error(err.message);
      else toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-1" />
            Security
          </TabsTrigger>
          <TabsTrigger value="danger">
            <Trash2 className="h-4 w-4 mr-1" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First name</Label>
                  <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Last name</Label>
                  <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button onClick={handleUpdateProfile} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current password</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>New password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Confirm new password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <Button onClick={handleChangePassword} disabled={loading || !currentPassword || !newPassword}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change Password"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {user?.twoFactorEnabled ? "2FA is enabled" : "2FA is not enabled"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use an authenticator app for additional security
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  {user?.twoFactorEnabled ? "Manage" : "Enable"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                <Key className="h-4 w-4 mr-1 inline" />
                API Keys
              </CardTitle>
              <CardDescription>Manage API keys for programmatic access</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                API keys allow you to access the Arxeo API programmatically.
              </p>
              <Button variant="outline" size="sm">Manage API Keys</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="danger" className="space-y-4 mt-4">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                Permanently delete your account and all associated data. This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Enter your password to confirm</Label>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={loading || !deletePassword}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete Account"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
