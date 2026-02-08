import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const useVotes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user's votes
  const { data: userVotes, isLoading } = useQuery({
    queryKey: ["user-votes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("votes")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get vote for a specific tapa
  const getVoteForTapa = (tapaId: string) => {
    return userVotes?.find((vote) => vote.tapa_id === tapaId);
  };

  // Submit vote mutation
  const submitVote = useMutation({
    mutationFn: async ({ tapaId, stars }: { tapaId: string; stars: number }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("votes")
        .insert({
          user_id: user.id,
          tapa_id: tapaId,
          stars,
          validated_location: false,
        })
        .select()
        .single();

      if (error) {
        // Check if it's a duplicate vote error
        if (error.code === "23505") {
          throw new Error("Ya has votado esta tapa");
        }
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-votes"] });
      toast({
        title: "¡Voto registrado!",
        description: "Gracias por tu valoración",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return {
    userVotes,
    isLoading,
    getVoteForTapa,
    submitVote,
  };
};
