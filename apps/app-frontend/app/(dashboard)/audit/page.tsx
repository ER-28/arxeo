"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollText, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { useState } from "react";

const ACTION_COLORS: Record<string, string> = {
  login: "bg-green-500/10 text-green-700 dark:text-green-400",
  logout: "bg-muted text-muted-foreground",
  create: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  update: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  delete: "bg-red-500/10 text-red-700 dark:text-red-400",
  share: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  failed_login: "bg-red-500/10 text-red-700 dark:text-red-400",
};

function getActionColor(action: string): string {
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (action.toLowerCase().includes(key)) return color;
  }
  return "bg-muted text-muted-foreground";
}

export default function AuditPage() {
  const [page, setPage] = useState(1);
  const limit = 30;

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", page],
    queryFn: () => auditApi.myLogs(page, limit),
  });

  const logs = Array.isArray((data as any)?.data)
    ? (data as any).data
    : Array.isArray(data)
      ? (data as any[])
      : [];
  const total = (data as any)?.total || logs.length;
  const totalPages = Math.ceil(total / limit);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="p-4 space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ScrollText className="h-6 w-6" />
          Audit Log
        </h1>
        <p className="text-muted-foreground mt-1">
          Track all activity across your account
        </p>
      </div>

      {logs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No audit logs yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Activity will appear here as you use Arxeo
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Metadata</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any) => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getActionColor(log.action)}`}
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {log.targetType}
                          {log.targetId ? (
                            <span className="text-muted-foreground ml-1">
                              ({log.targetId.slice(-6)})
                            </span>
                          ) : null}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground truncate max-w-[200px] block">
                          {typeof log.metadata === "object"
                            ? Object.entries(log.metadata || {}).map(([k, v]) => `${k}: ${v}`).join(", ")
                            : log.metadata || "-"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-mono text-muted-foreground">
                          {log.ip || "-"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({total} total)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
