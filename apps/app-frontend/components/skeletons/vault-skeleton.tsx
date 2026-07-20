import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function VaultSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-8" />
        <div className="flex-1">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <Skeleton className="h-9 w-80" />
      <Card>
        <CardContent className="p-0">
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-[40px_1fr_1fr_1fr_100px_40px] gap-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-4" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-[40px_1fr_1fr_1fr_100px_40px] gap-4 items-center">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
