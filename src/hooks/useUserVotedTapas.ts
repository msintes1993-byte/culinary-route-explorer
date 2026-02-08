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

export const useUserVotedTapas = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-voted-tapas", user?.id],
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

      // Get venues
      const venueIds = [...new Set(tapas.map((t) => t.venue_id))];
      const { data: venues, error: venuesError } = await supabase
        .from("venues")
        .select("id, name")
        .in("id", venueIds);

      if (venuesError) throw venuesError;

      // Combine data
      return votes.map((vote) => {
        const tapa = tapas.find((t) => t.id === vote.tapa_id);
        const venue = venues.find((v) => v.id === tapa?.venue_id);

        return {
          id: vote.id,
          stars: vote.stars,
          created_at: vote.created_at,
          tapa: {
            id: tapa?.id ?? "",
            name: tapa?.name ?? "Tapa desconocida",
            image_url: tapa?.image_url ?? null,
          },
          venue: {
            id: venue?.id ?? "",
            name: venue?.name ?? "Local desconocido",
          },
        };
      });
    },
    enabled: !!user,
  });
};
