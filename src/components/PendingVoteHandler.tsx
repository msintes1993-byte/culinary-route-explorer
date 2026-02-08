import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePendingVote } from "@/hooks/usePendingVote";
import { useVotes } from "@/hooks/useVotes";

/**
 * Component that handles submitting pending votes after user authentication
 */
const PendingVoteHandler = () => {
  const { user } = useAuth();
  const { pendingVote, clearPendingVote } = usePendingVote();
  const { submitVote, getVoteForTapa } = useVotes();

  useEffect(() => {
    const handlePendingVote = async () => {
      if (user && pendingVote) {
        // Check if user already voted for this tapa
        const existingVote = getVoteForTapa(pendingVote.tapaId);
        
        if (!existingVote) {
          try {
            await submitVote.mutateAsync({
              tapaId: pendingVote.tapaId,
              stars: pendingVote.stars,
            });
          } catch (error) {
            console.error("Error submitting pending vote:", error);
          }
        }
        
        clearPendingVote();
      }
    };

    handlePendingVote();
  }, [user, pendingVote]);

  return null;
};

export default PendingVoteHandler;
