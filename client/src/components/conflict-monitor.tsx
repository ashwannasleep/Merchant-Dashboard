import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Users,
  Box,
  ShieldCheck,
  Play,
  RefreshCw,
} from "lucide-react";
import type { ThunderingHerdEvent } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ConflictMonitorProps {
  events: ThunderingHerdEvent[];
  isLoading: boolean;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

function StrategyBadge({ strategy }: { strategy: string }) {
  return (
    <Badge variant="outline" className="text-[10px]">
      {strategy}
    </Badge>
  );
}

export function ConflictMonitor({ events, isLoading }: ConflictMonitorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const simulateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/simulate-herd");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/herd-events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Thundering Herd Simulated",
        description: `${data.conflictsDetected} conflicts detected, resolved using ${data.strategy}`,
      });
    },
    onError: () => {
      toast({
        title: "Simulation Failed",
        description: "Could not simulate thundering herd event",
        variant: "destructive",
      });
    },
  });

  const totalConflicts = events.reduce((s, e) => s + e.conflictsDetected, 0);
  const resolvedCount = events.filter((e) => e.resolved).length;
  const avgDuration = events.length
    ? Math.round(events.reduce((s, e) => s + e.duration, 0) / events.length)
    : 0;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="p-4">
            <div className="h-16 bg-muted rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Thundering Herd Monitor</h2>
          <p className="text-xs text-muted-foreground">
            Track concurrent vendor stock updates and conflict resolution
          </p>
        </div>
        <Button
          onClick={() => simulateMutation.mutate()}
          disabled={simulateMutation.isPending}
          data-testid="button-simulate-herd"
        >
          {simulateMutation.isPending ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span className="ml-2">Simulate Herd</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-0.5">
            <Zap className="w-3.5 h-3.5 text-chart-1" />
            <span className="text-[11px] text-muted-foreground">Total Events</span>
          </div>
          <p className="text-xl font-bold" data-testid="text-total-events">{events.length}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-[11px] text-muted-foreground">Total Conflicts</span>
          </div>
          <p className="text-xl font-bold" data-testid="text-total-conflicts">{totalConflicts}</p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
            <span className="text-[11px] text-muted-foreground">Resolution Rate</span>
          </div>
          <p className="text-xl font-bold" data-testid="text-resolution-rate">
            {events.length ? Math.round((resolvedCount / events.length) * 100) : 0}%
          </p>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-0.5">
            <Clock className="w-3.5 h-3.5 text-chart-3" />
            <span className="text-[11px] text-muted-foreground">Avg Resolution</span>
          </div>
          <p className="text-xl font-bold" data-testid="text-avg-duration">{avgDuration}ms</p>
        </Card>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Events</h3>
        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No thundering herd events yet</p>
            <p className="text-xs text-muted-foreground mt-1">Click "Simulate Herd" to generate one</p>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="p-3" data-testid={`card-event-${event.id}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="space-y-1.5 flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">Herd Event #{event.id.split("_")[1]}</span>
                    {event.resolved ? (
                      <Badge variant="secondary" className="text-[10px] gap-1">
                        <CheckCircle className="w-3 h-3" /> Resolved
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[10px] gap-1">
                        <AlertTriangle className="w-3 h-3" /> Unresolved
                      </Badge>
                    )}
                    <StrategyBadge strategy={event.strategy} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {event.vendorCount} vendors
                    </span>
                    <span className="flex items-center gap-1">
                      <Box className="w-3 h-3" /> {event.productsAffected} products
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {event.conflictsDetected} conflicts
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {event.duration}ms
                    </span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {formatTime(event.timestamp)}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
