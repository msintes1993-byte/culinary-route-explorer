import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Venue, Tapa, VenueWithTapa } from "@/types/database";

export const useVenues = () => {
  return useQuery({
    queryKey: ["venues-with-tapas"],
    queryFn: async (): Promise<VenueWithTapa[]> => {
      const { data: venues, error: venuesError } = await supabase
        .from("venues")
        .select("*")
        .order("name");

      if (venuesError) throw venuesError;

      const { data: tapas, error: tapasError } = await supabase
        .from("tapas")
        .select("*");

      if (tapasError) throw tapasError;

      // Combine venues with their tapas
      return (venues as Venue[]).map((venue) => ({
        ...venue,
        tapas: (tapas as Tapa[]).filter((tapa) => tapa.venue_id === venue.id),
      }));
    },
  });
};
