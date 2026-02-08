import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

export const useActiveEvent = () => {
  return useQuery({
    queryKey: ["active-event"],
    queryFn: async (): Promise<Event | null> => {
      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

      // First, try to find an event where today is within active_dates
      const { data: events, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!events || events.length === 0) return null;

      // Check each event for active_dates containing today
      const activeEvent = events.find((event) => {
        const activeDates = event.active_dates as { start?: string; end?: string } | string[] | null;
        
        if (!activeDates) return false;

        // Handle array format: ["2026-02-01", "2026-02-15"]
        if (Array.isArray(activeDates)) {
          if (activeDates.length >= 2) {
            const [start, end] = activeDates;
            return today >= start && today <= end;
          }
          // Single date in array
          return activeDates.includes(today);
        }

        // Handle object format: { start: "2026-02-01", end: "2026-02-15" }
        if (typeof activeDates === "object" && activeDates.start && activeDates.end) {
          return today >= activeDates.start && today <= activeDates.end;
        }

        return false;
      });

      // Return active event or fallback to most recent
      return activeEvent || events[0];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
