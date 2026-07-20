"use client";

import { useParams, useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { orgApi, vaultApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Vault, Plus, Users, Settings, Loader2, ArrowRight, Building2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ORG_ROLE_LABELS } from "@/lib/constants";
import { OrgSkeleton } from "@/components/skeletons/org-skeleton";

export default function OrgPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const { setSelectedOrg } = useAppStore();
  const [createVaultOpen, setCreateVaultOpen] = useState(false);
  const [vaultName, setVaultName] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: org, isLoading } = useQuery({
    queryKey: ["organization", orgId],
    queryFn: () => orgApi.get(orgId),
  });

  const { data: vaults } = useQuery({
    queryKey: ["vaults", orgId],
    queryFn: () => vaultApi.list(orgId),
  });

  const { data: members } = useQuery({
    queryKey: ["members", orgId],
    queryFn: () => orgApi.members(orgId),
  });

  const vaultList = Array.isArray(vaults) ? vaults : [];
  const memberList = Array.isArray(members) ? members : [];

  async function handleCreateVault() {
    if (!vaultName.trim()) return;
    setCreating(true);
    try {
      await vaultApi.create(orgId, { name: vaultName.trim() });
      toast.success("Vault created!");
      setCreateVaultOpen(false);
      setVaultName("");
    } catch {
      toast.error("Failed to create vault");
    } finally {
      setCreating(false);
    }
  }

  if (isLoading) {
    return <OrgSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{(org as any)?.name || "Organization"}</h1>
          <p className="text-sm text-muted-foreground">{(org as any)?.plan || "free"} plan</p>
        </div>
      </div>

      <Tabs defaultValue="vaults">
        <TabsList>
          <TabsTrigger value="vaults">
            <Vault className="h-4 w-4 mr-1" />
            Vaults ({vaultList.length})
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-1" />
            Members ({memberList.length})
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vaults" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setCreateVaultOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Vault
            </Button>
          </div>

          {vaultList.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Vault className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No vaults yet</p>
                <Button onClick={() => setCreateVaultOpen(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create your first vault
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {vaultList.map((vault: any) => (
                <Link key={vault._id} href={`/orgs/${orgId}/vaults/${vault._id}`}>
                  <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Vault className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base truncate">{vault.name}</CardTitle>
                          <CardDescription className="text-xs">
                            {vault.isShared ? "Shared" : "Private"}
                          </CardDescription>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Members</CardTitle>
            </CardHeader>
            <CardContent>
              {memberList.length === 0 ? (
                <p className="text-muted-foreground text-sm">No members yet</p>
              ) : (
                <div className="space-y-3">
                  {memberList.map((member: any) => {
                    const memberUser = typeof member.userId === "object" ? member.userId : null;
                      return (
                      <div key={member._id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                            {memberUser?.username?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {memberUser?.firstName
                                ? `${memberUser.firstName} ${memberUser.lastName || ""}`
                                : memberUser?.username || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">{memberUser?.email}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {ORG_ROLE_LABELS[member.role] || member.role}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Manage your organization settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Organization settings coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={createVaultOpen} onOpenChange={setCreateVaultOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Vault</DialogTitle>
            <DialogDescription>Create a new vault to store your items.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="vaultName">Vault name</Label>
              <Input
                id="vaultName"
                placeholder="My Vault"
                value={vaultName}
                onChange={(e) => setVaultName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateVaultOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateVault} disabled={creating || !vaultName.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
