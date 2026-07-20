"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/stores/app-store";
import { useSearch } from "@/components/search/search-provider";
import { searchApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Building2, Vault, KeyRound } from "lucide-react";

export function SearchDialog() {
  const { searchOpen, setSearchOpen } = useSearch();
  const { setSelectedOrg } = useAppStore();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const { data: results } = useQuery({
    queryKey: ["search", query],
    queryFn: () => searchApi.global(query),
    enabled: query.length >= 2,
  });

  const search = results as any;

  const handleSelect = useCallback(
    (type: string, item: any) => {
      setSearchOpen(false);
      setQuery("");
      if (type === "organization") {
        setSelectedOrg(item._id);
        router.push(`/orgs/${item._id}`);
      } else if (type === "vault") {
        setSelectedOrg(item.organizationId);
        router.push(`/orgs/${item.organizationId}/vaults/${item._id}`);
      } else if (type === "item") {
        router.push(`/orgs/${item.organizationId}/vaults/${item.vaultId}/items/${item._id}`);
      }
    },
    [setSearchOpen, router, setSelectedOrg]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  return (
    <CommandDialog
      open={searchOpen}
      onOpenChange={(open) => {
        setSearchOpen(!!open);
        if (!open) setQuery("");
      }}
    >
      <CommandInput
        placeholder="Search vaults, items, organizations..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>{query.length < 2 ? "Type at least 2 characters..." : "No results found."}</CommandEmpty>

        {search?.organizations?.length > 0 && (
          <CommandGroup heading="Organizations">
            {search.organizations.map((org: any) => (
              <CommandItem
                key={org._id}
                onSelect={() => handleSelect("organization", org)}
              >
                <Building2 className="h-4 w-4 mr-2" />
                <span>{org.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {search?.vaults?.length > 0 && (
          <CommandGroup heading="Vaults">
            {search.vaults.map((vault: any) => (
              <CommandItem
                key={vault._id}
                onSelect={() => handleSelect("vault", vault)}
              >
                <Vault className="h-4 w-4 mr-2" />
                <span>{vault.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {(search?.vaultItems || search?.items || []).length > 0 && (
          <CommandGroup heading="Items">
            {(search?.vaultItems || search?.items || []).map((item: any) => (
              <CommandItem
                key={item._id}
                onSelect={() => handleSelect("item", item)}
              >
                <KeyRound className="h-4 w-4 mr-2" />
                <span>{item.title}</span>
                {item.username && (
                  <span className="ml-2 text-muted-foreground text-xs">{item.username}</span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
