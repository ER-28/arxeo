import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function SidebarSkeleton({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="hidden md:flex flex-col w-14 border-r border-border bg-card items-center py-4 gap-4">
        <Skeleton className="h-5 w-5 rounded" />
        <Separator />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded" />
        ))}
      </div>
    );
  }

  return (
    <div className="hidden md:flex flex-col w-60 border-r border-border bg-card">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <Separator />
      <div className="p-2 space-y-1 mt-2">
        <Skeleton className="h-9 w-full rounded-md" />
        <Separator className="my-2" />
        <Skeleton className="h-3 w-24 ml-3 mb-1" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-full rounded-md" />
        ))}
      </div>
    </div>
  );
}
