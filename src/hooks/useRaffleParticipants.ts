import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface RaffleParticipant {
  user_id: string;
  email: string | null;
  vote_count: number;
}

export const useRaffleParticipants = (minVotes: number = 3) => {
  return useQuery({
    queryKey: ["raffle-participants", minVotes],
    queryFn: async (): Promise<RaffleParticipant[]> => {
      // Get all votes grouped by user
      const { data: votes, error: votesError } = await supabase
        .from("votes")
        .select("user_id");

      if (votesError) throw votesError;

      // Count votes per user
      const voteCounts: Record<string, number> = {};
      votes.forEach((vote) => {
        voteCounts[vote.user_id] = (voteCounts[vote.user_id] || 0) + 1;
      });

      // Filter users with enough votes
      const qualifiedUserIds = Object.entries(voteCounts)
        .filter(([_, count]) => count >= minVotes)
        .map(([userId]) => userId);

      if (qualifiedUserIds.length === 0) return [];

      // Get profiles for qualified users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, email")
        .in("user_id", qualifiedUserIds);

      if (profilesError) throw profilesError;

      return profiles.map((profile) => ({
        user_id: profile.user_id,
        email: profile.email,
        vote_count: voteCounts[profile.user_id],
      }));
    },
  });
};
