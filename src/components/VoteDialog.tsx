import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/StarRating";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useVotes } from "@/hooks/useVotes";
import { usePendingVote } from "@/hooks/usePendingVote";
import { Loader2 } from "lucide-react";
import type { Tapa, Venue } from "@/types/database";

interface VoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tapa: Tapa | null;
  venue: Venue | null;
}

const VoteDialog = ({ open, onOpenChange, tapa, venue }: VoteDialogProps) => {
  const [stars, setStars] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useAuth();
  const { submitVote, getVoteForTapa } = useVotes();
  const { setPendingVote } = usePendingVote();

  const existingVote = tapa ? getVoteForTapa(tapa.id) : null;

  const handleSubmit = async () => {
    if (!tapa || !venue || stars === 0) return;

    if (!user) {
      // Save pending vote and show auth modal
      setPendingVote({
        tapaId: tapa.id,
        tapaName: tapa.name,
        venueId: venue.id,
        venueName: venue.name,
        stars,
      });
      setAuthModalOpen(true);
      return;
    }

    // User is logged in, submit vote
    await submitVote.mutateAsync({ tapaId: tapa.id, stars });
    onOpenChange(false);
    setStars(0);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setStars(0);
    }
    onOpenChange(open);
  };

  if (!tapa) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <DialogTitle className="font-display text-xl">{tapa.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {venue?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {existingVote ? (
              <div className="text-center space-y-3">
                <p className="text-muted-foreground text-sm">Ya has votado esta tapa</p>
                <StarRating value={existingVote.stars} onChange={() => {}} disabled />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  ¿Cuántas estrellas le das?
                </p>
                <StarRating value={stars} onChange={setStars} />
              </div>
            )}
          </div>

          {!existingVote && (
            <Button
              onClick={handleSubmit}
              disabled={stars === 0 || submitVote.isPending}
              className="w-full h-12 font-semibold"
              size="lg"
            >
              {submitVote.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Enviar voto"
              )}
            </Button>
          )}
        </DialogContent>
      </Dialog>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
};

export default VoteDialog;
