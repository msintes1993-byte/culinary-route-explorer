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
        console.log("🐛 [LAZY-AUTH]: Voto pendiente detectado en localStorage", {
          tapaId: pendingVote.tapaId,
          tapaName: pendingVote.tapaName,
          stars: pendingVote.stars,
          userId: user.id,
        });

        // Check if user already voted for this tapa
        const existingVote = getVoteForTapa(pendingVote.tapaId);
        
        if (existingVote) {
          console.log("🐛 [LAZY-AUTH]: Usuario ya ha votado esta tapa, ignorando voto pendiente");
          clearPendingVote();
          return;
        }

        try {
          console.log("🐛 [LAZY-AUTH]: Enviando voto pendiente al servidor...");
          await submitVote.mutateAsync({
            tapaId: pendingVote.tapaId,
            stars: pendingVote.stars,
          });
          console.log("🐛 [LAZY-AUTH]: ✅ Voto pendiente enviado exitosamente");
        } catch (error) {
          console.error("🐛 [LAZY-AUTH]: ❌ Error al enviar voto pendiente:", error);
        }
        
        clearPendingVote();
      }
    };

    handlePendingVote();
  }, [user, pendingVote]);

  return null;
};

export default PendingVoteHandler;
