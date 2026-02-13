import { useQuery } from "@tanstack/react-query";
import { ConflictMonitor } from "@/components/conflict-monitor";
import type { ThunderingHerdEvent } from "@shared/schema";

export default function ConflictsPage() {
  const { data: events, isLoading } = useQuery<ThunderingHerdEvent[]>({
    queryKey: ["/api/herd-events"],
  });

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <ConflictMonitor events={events || []} isLoading={isLoading} />
    </div>
  );
}
