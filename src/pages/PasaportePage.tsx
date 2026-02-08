import { Stamp, Star, PartyPopper, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserVotedTapas } from "@/hooks/useUserVotedTapas";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import logo from "@/assets/logo.png";

const REQUIRED_VOTES_FOR_RAFFLE = 3;

const PasaportePage = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: votedTapas, isLoading } = useUserVotedTapas();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const votesCount = votedTapas?.length ?? 0;
  const progress = Math.min((votesCount / REQUIRED_VOTES_FOR_RAFFLE) * 100, 100);
  const qualifiesForRaffle = votesCount >= REQUIRED_VOTES_FOR_RAFFLE;

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="flex flex-col flex-1">
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Stamp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">Mi Pasaporte</h1>
                <p className="text-xs text-muted-foreground">Tu historial de tapas</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <img src={logo} alt="" className="h-20 w-20 object-contain opacity-30 mb-6" />
          <h2 className="font-display text-xl font-semibold mb-2">Inicia sesión</h2>
          <p className="text-muted-foreground mb-6 max-w-xs">
            Accede a tu cuenta para ver tu pasaporte de tapas y participar en el sorteo
          </p>
          <Button onClick={() => setAuthModalOpen(true)} size="lg" className="gap-2">
            <LogIn className="h-5 w-5" />
            Iniciar sesión
          </Button>
        </div>

        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Stamp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Mi Pasaporte</h1>
              <p className="text-xs text-muted-foreground">Tu historial de tapas</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 space-y-5">
        {/* Progress Card */}
        <Card className="border-0 shadow-sm overflow-hidden">
          {qualifiesForRaffle ? (
            <div className="bg-gradient-to-r from-primary to-secondary p-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <PartyPopper className="h-8 w-8" />
                <div>
                  <h2 className="font-display font-bold text-lg">¡Entras en el sorteo!</h2>
                  <p className="text-sm opacity-90">Has probado {votesCount} tapas. ¡Mucha suerte!</p>
                </div>
              </div>
            </div>
          ) : (
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Progreso del sorteo</h2>
                <Badge variant="secondary" className="font-mono">
                  {votesCount}/{REQUIRED_VOTES_FOR_RAFFLE}
                </Badge>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {votesCount === 0
                  ? "Vota tu primera tapa para empezar"
                  : `Te faltan ${REQUIRED_VOTES_FOR_RAFFLE - votesCount} tapas para entrar en el sorteo`}
              </p>
            </CardContent>
          )}
        </Card>

        {/* Voted Tapas List */}
        <div>
          <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
            Tapas votadas ({votesCount})
          </h2>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : votedTapas && votedTapas.length > 0 ? (
            <div className="space-y-3">
              {votedTapas.map((item) => (
                <Card key={item.id} className="border-0 shadow-sm overflow-hidden">
                  <div className="flex gap-3 p-3">
                    {item.tapa.image_url ? (
                      <img
                        src={item.tapa.image_url}
                        alt={item.tapa.name}
                        className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <Stamp className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{item.tapa.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{item.venue.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${
                                star <= item.stars
                                  ? "fill-secondary text-secondary"
                                  : "fill-transparent text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(item.created_at), "d MMM", { locale: es })}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Stamp className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">Aún no has votado ninguna tapa</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasaportePage;
