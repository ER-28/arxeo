"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { vaultApi, toolsApi } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, RefreshCw, Eye, EyeOff } from "lucide-react";

const itemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  type: z.enum(["login", "secure_note", "card", "identity"]),
  username: z.string().optional(),
  password: z.string().optional(),
  url: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  isFavorite: z.boolean(),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: any | null;
  vaultId: string;
  orgId: string;
}

export function ItemDialog({ open, onOpenChange, item, vaultId, orgId }: ItemDialogProps) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generating, setGenerating] = useState(false);

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      title: "",
      type: "login",
      username: "",
      password: "",
      url: "",
      notes: "",
      tags: "",
      isFavorite: false,
    },
  });

  useEffect(() => {
    if (item) {
      form.reset({
        title: item.title || "",
        type: item.type || "login",
        username: item.username || "",
        password: item.password || "",
        url: item.url || "",
        notes: item.notes || "",
        tags: item.tags?.join(", ") || "",
        isFavorite: item.isFavorite || false,
      });
    } else {
      form.reset({
        title: "",
        type: "login",
        username: "",
        password: "",
        url: "",
        notes: "",
        tags: "",
        isFavorite: false,
      });
    }
    setShowPassword(false);
  }, [item, form, open]);

  async function onSubmit(data: ItemFormData) {
    setLoading(true);
    try {
      const payload = {
        ...data,
        tags: data.tags
          ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
      };

      if (item) {
        await vaultApi.items.update(item._id, payload);
        toast.success("Item updated");
      } else {
        await vaultApi.items.create(vaultId, payload);
        toast.success("Item created");
      }

      queryClient.invalidateQueries({ queryKey: ["vaultItems", vaultId] });
      onOpenChange(false);
    } catch {
      toast.error(item ? "Failed to update item" : "Failed to create item");
    } finally {
      setLoading(false);
    }
  }

  async function generatePassword() {
    setGenerating(true);
    try {
      const res = await toolsApi.generatePassword({
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
      }) as any;
      form.setValue("password", res.password);
      toast.success(`Generated ${res.entropy}-bit password`);
    } catch {
      toast.error("Failed to generate password");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "New Item"}</DialogTitle>
          <DialogDescription>
            {item ? "Update your vault item" : "Add a new item to your vault"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...form.register("title")} placeholder="e.g. GitHub Account" autoFocus />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={form.watch("type")} onValueChange={(v) => form.setValue("type", v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="secure_note">Secure Note</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="identity">Identity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...form.register("username")} placeholder="e.g. john@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...form.register("password")}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="button" variant="outline" onClick={generatePassword} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" {...form.register("url")} placeholder="https://github.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input id="tags" {...form.register("tags")} placeholder="work, development" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...form.register("notes")} placeholder="Additional notes..." rows={3} />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={form.watch("isFavorite")}
              onCheckedChange={(v) => form.setValue("isFavorite", v)}
            />
            <Label>Mark as favorite</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : item ? "Save Changes" : "Create Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
