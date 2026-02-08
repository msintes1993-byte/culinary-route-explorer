import { Loader2, Star, Ticket } from "lucide-react";
import { useUserVotedTapas } from "@/hooks/useUserVotedTapas";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import logo from "@/assets/logo.png";

interface RutaPassportTabProps {
  eventId: string;
}

const RutaPassportTab = ({ eventId }: RutaPassportTabProps) => {
  const { user } = useAuth();
  const { data: votedTapas, isLoading } = useUserVotedTapas(eventId);

  const voteCount = votedTapas?.length ?? 0;
  const targetVotes = 3;
  const progress = Math.min((voteCount / targetVotes) * 100, 100);
  const isEligible = voteCount >= targetVotes;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <img
          src={logo}
          alt=""
          className="h-16 w-16 object-contain opacity-30 mb-4"
        />
        <p className="text-muted-foreground">
          Inicia sesión para ver tu pasaporte
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              <span className="font-medium">Tu progreso</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {voteCount}/{targetVotes} votos
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          {isEligible ? (
            <p className="text-sm text-primary font-medium text-center">
              🎉 ¡Ya estás participando en el sorteo!
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Vota {targetVotes - voteCount} tapa
              {targetVotes - voteCount !== 1 ? "s" : ""} más para participar en
              el sorteo
            </p>
          )}
        </CardContent>
      </Card>

      {/* Voted Tapas List */}
      {voteCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <img
            src={logo}
            alt=""
            className="h-12 w-12 object-contain opacity-30 mb-3"
          />
          <p className="text-muted-foreground text-sm">
            Aún no has votado ninguna tapa en esta ruta
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            Tapas votadas ({voteCount})
          </h3>
          <div className="space-y-2">
            {votedTapas?.map((vote) => (
              <Card
                key={vote.id}
                className="overflow-hidden hover:bg-muted/30 transition-colors"
              >
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={vote.tapa.image_url}
                      alt={vote.tapa.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {vote.tapa.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {vote.venue.name}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-primary">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="text-sm font-medium">{vote.stars}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RutaPassportTab;
