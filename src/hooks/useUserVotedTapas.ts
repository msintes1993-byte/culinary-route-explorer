import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface VotedTapa {
  id: string;
  stars: number;
  created_at: string;
  tapa: {
    id: string;
    name: string;
    image_url: string | null;
  };
  venue: {
    id: string;
    name: string;
  };
}

export const useUserVotedTapas = (eventId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-voted-tapas", user?.id, eventId],
    queryFn: async (): Promise<VotedTapa[]> => {
      if (!user) return [];

      // Get user's votes
      const { data: votes, error: votesError } = await supabase
        .from("votes")
        .select("id, stars, created_at, tapa_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (votesError) throw votesError;
      if (!votes.length) return [];

      // Get tapas for these votes
      const tapaIds = votes.map((v) => v.tapa_id);
      const { data: tapas, error: tapasError } = await supabase
        .from("tapas")
        .select("id, name, image_url, venue_id")
        .in("id", tapaIds);

      if (tapasError) throw tapasError;

      // Get venues (optionally filtered by event)
      let venueIds = [...new Set(tapas.map((t) => t.venue_id))];
      let venuesQuery = supabase
        .from("venues")
        .select("id, name, event_id")
        .in("id", venueIds);

      if (eventId) {
        venuesQuery = venuesQuery.eq("event_id", eventId);
      }

      const { data: venues, error: venuesError } = await venuesQuery;
      if (venuesError) throw venuesError;

      // Filter venues to only those in this event
      const filteredVenueIds = new Set(venues.map((v) => v.id));

      // Combine data, filtering by venues in this event
      return votes
        .map((vote) => {
          const tapa = tapas.find((t) => t.id === vote.tapa_id);
          if (!tapa) return null;

          // If filtering by event, exclude tapas not in matching venues
          if (eventId && !filteredVenueIds.has(tapa.venue_id)) return null;

          const venue = venues.find((v) => v.id === tapa.venue_id);

          return {
            id: vote.id,
            stars: vote.stars,
            created_at: vote.created_at,
            tapa: {
              id: tapa.id,
              name: tapa.name,
              image_url: tapa.image_url,
            },
            venue: {
              id: venue?.id ?? "",
              name: venue?.name ?? "Local desconocido",
            },
          };
        })
        .filter((v): v is VotedTapa => v !== null);
    },
    enabled: !!user,
  });
};
