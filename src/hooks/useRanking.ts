import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TapaWithRanking {
  id: string;
  name: string;
  image_url: string | null;
  venue_name: string;
  avg_stars: number;
  vote_count: number;
}

export const useRanking = (limit: number = 5) => {
  return useQuery({
    queryKey: ["ranking", limit],
    queryFn: async (): Promise<TapaWithRanking[]> => {
      // Get all votes with tapa and venue info
      const { data: votes, error: votesError } = await supabase
        .from("votes")
        .select("tapa_id, stars");

      if (votesError) throw votesError;

      // Get tapas
      const { data: tapas, error: tapasError } = await supabase
        .from("tapas")
        .select("id, name, image_url, venue_id");

      if (tapasError) throw tapasError;

      // Get venues
      const { data: venues, error: venuesError } = await supabase
        .from("venues")
        .select("id, name");

      if (venuesError) throw venuesError;

      // Calculate averages
      const tapaStats = tapas.map((tapa) => {
        const tapaVotes = votes.filter((v) => v.tapa_id === tapa.id);
        const venue = venues.find((v) => v.id === tapa.venue_id);
        
        const avgStars = tapaVotes.length > 0
          ? tapaVotes.reduce((sum, v) => sum + v.stars, 0) / tapaVotes.length
          : 0;

        return {
          id: tapa.id,
          name: tapa.name,
          image_url: tapa.image_url,
          venue_name: venue?.name ?? "Local desconocido",
          avg_stars: Math.round(avgStars * 10) / 10,
          vote_count: tapaVotes.length,
        };
      });

      // Sort by average stars, then by vote count
      return tapaStats
        .filter((t) => t.vote_count > 0)
        .sort((a, b) => {
          if (b.avg_stars !== a.avg_stars) return b.avg_stars - a.avg_stars;
          return b.vote_count - a.vote_count;
        })
        .slice(0, limit);
    },
  });
};
