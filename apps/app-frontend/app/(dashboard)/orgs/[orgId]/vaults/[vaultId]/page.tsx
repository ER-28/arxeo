"use client";

import { useParams, useRouter } from "next/navigation";
import { vaultApi } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Vault,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Copy,
  Star,
  Trash2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { useState, useCallback } from "react";
import { ItemDialog } from "@/components/vaults/item-dialog";
import { toast } from "sonner";
import { VAULT_ITEM_TYPE_LABELS } from "@/lib/constants";
import { VaultSkeleton } from "@/components/skeletons/vault-skeleton";

export default function VaultPage() {
  const params = useParams();
  const orgId = params.orgId as string;
  const vaultId = params.vaultId as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const { data: vault } = useQuery({
    queryKey: ["vault", vaultId],
    queryFn: () => vaultApi.get(vaultId),
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ["vaultItems", vaultId, search],
    queryFn: () => vaultApi.items.list(vaultId, search || undefined),
  });

  const itemList = Array.isArray(items) ? items : [];

  const togglePassword = useCallback((itemId: string) => {
    setShowPasswords((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  }, []);

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  }, []);

  async function handleDeleteItem(itemId: string) {
    if (!confirm("Delete this item?")) return;
    try {
      await vaultApi.items.delete(itemId);
      toast.success("Item deleted");
      queryClient.invalidateQueries({ queryKey: ["vaultItems", vaultId] });
    } catch {
      toast.error("Failed to delete item");
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/orgs/${orgId}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Vault className="h-8 w-8 text-primary" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{(vault as any)?.name || "Vault"}</h1>
          <p className="text-sm text-muted-foreground">
            {(vault as any)?.isShared ? "Shared vault" : "Private vault"}
          </p>
        </div>
        <Button onClick={() => { setEditingItem(null); setItemDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />
          Add Item
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <VaultSkeleton />
      ) : itemList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Vault className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {search ? "No items match your search" : "No items yet"}
            </p>
            {!search && (
              <Button onClick={() => { setEditingItem(null); setItemDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Add your first item
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Password</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemList.map((item: any) => (
                <TableRow key={item._id}>
                  <TableCell>
                    {item.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.title}</span>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    {item.tags?.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {item.tags.map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.username ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">{item.username}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(item.username, "Username")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.password ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono">
                          {showPasswords[item._id] ? item.password : "••••••••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => togglePassword(item._id)}
                        >
                          {showPasswords[item._id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(item.password, "Password")}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {VAULT_ITEM_TYPE_LABELS[item.type] || item.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8" />}>
                          <MoreHorizontal className="h-4 w-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingItem(item);
                            setItemDialogOpen(true);
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyToClipboard(item.password || "", "Password")}
                          disabled={!item.password}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy password
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteItem(item._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <ItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        item={editingItem}
        vaultId={vaultId}
        orgId={orgId}
      />
    </div>
  );
}
