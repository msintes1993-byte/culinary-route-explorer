import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

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
    onSuccess: async () => {
      // Invalidate queries to get updated vote count
      await queryClient.invalidateQueries({ queryKey: ["user-votes"] });
      
      // Get the updated vote count
      const updatedVotes = queryClient.getQueryData<any[]>(["user-votes", user?.id]) || [];
      const totalVotes = updatedVotes.length;
      const isRaffleEligible = totalVotes >= 3;

      if (isRaffleEligible) {
        // Trigger confetti for raffle entry
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast({
          title: "¡Voto registrado!",
          description: "¡Ya estás participando en el sorteo! 🎉",
        });
      } else {
        toast({
          title: "¡Voto registrado!",
          description: `Te faltan ${3 - totalVotes} voto${3 - totalVotes !== 1 ? 's' : ''} para entrar en el sorteo`,
        });
      }
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
