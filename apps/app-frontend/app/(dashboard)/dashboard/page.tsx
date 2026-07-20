"use client";

import { useAuth } from "@/hooks/use-auth";
import { useAppStore } from "@/stores/app-store";
import { orgApi, vaultApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, Vault, ArrowRight, Shield, Loader2 } from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons/dashboard-skeleton";
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { selectedOrgId, setSelectedOrg } = useAppStore();
  const [createOrgOpen, setCreateOrgOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [creating, setCreating] = useState(false);

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => orgApi.list(),
  });

  const orgList = Array.isArray(orgs) ? orgs : [];

  async function handleCreateOrg() {
    if (!orgName.trim()) return;
    setCreating(true);
    try {
      await orgApi.create({ name: orgName.trim() });
      toast.success("Organization created!");
      setCreateOrgOpen(false);
      setOrgName("");
    } catch {
      toast.error("Failed to create organization");
    } finally {
      setCreating(false);
    }
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName || user?.username}
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your passwords and organizations
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Organizations</h2>
          <Button size="sm" onClick={() => setCreateOrgOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            New Organization
          </Button>
        </div>

        {orgList.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No organizations yet</p>
              <Button onClick={() => setCreateOrgOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Create your first organization
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {orgList.map((org: any) => (
              <OrgCard key={org._id} org={org} />
            ))}
          </div>
        )}
      </div>

      <Dialog open={createOrgOpen} onOpenChange={setCreateOrgOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization to collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="orgName">Organization name</Label>
              <Input
                id="orgName"
                placeholder="My Team"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOrgOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOrg} disabled={creating || !orgName.trim()}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OrgCard({ org }: { org: any }) {
  const { setSelectedOrg } = useAppStore();

  const { data: vaults } = useQuery({
    queryKey: ["vaults", org._id],
    queryFn: () => vaultApi.list(org._id),
  });

  const vaultCount = Array.isArray(vaults) ? vaults.length : 0;

  return (
    <Link href={`/orgs/${org._id}`}>
      <Card
        className="cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setSelectedOrg(org._id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{org.name}</CardTitle>
              <CardDescription className="text-xs">{org.plan || "free"} plan</CardDescription>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Vault className="h-4 w-4" />
            <span>{vaultCount} vault{vaultCount !== 1 ? "s" : ""}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
