import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Venue, Tapa, VenueWithTapa } from "@/types/database";

export const useVenues = (eventId?: string) => {
  return useQuery({
    queryKey: ["venues-with-tapas", eventId],
    queryFn: async (): Promise<VenueWithTapa[]> => {
      // Return empty array if no eventId to avoid mixing data
      if (!eventId) return [];

      const { data: venues, error: venuesError } = await supabase
        .from("venues")
        .select("*")
        .eq("event_id", eventId)
        .order("name");

      if (venuesError) throw venuesError;

      // Get tapas only for these venues
      const venueIds = (venues || []).map((v) => v.id);
      
      if (venueIds.length === 0) return [];

      const { data: tapas, error: tapasError } = await supabase
        .from("tapas")
        .select("*")
        .in("venue_id", venueIds);

      if (tapasError) throw tapasError;

      // Combine venues with their tapas
      return (venues as Venue[]).map((venue) => ({
        ...venue,
        tapas: (tapas as Tapa[]).filter((tapa) => tapa.venue_id === venue.id),
      }));
    },
    enabled: !!eventId,
  });
};
