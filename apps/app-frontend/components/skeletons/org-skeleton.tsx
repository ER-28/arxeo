import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function OrgSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
