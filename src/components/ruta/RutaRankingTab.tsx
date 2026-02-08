import { Loader2, Star, Trophy } from "lucide-react";
import { useRanking } from "@/hooks/useRanking";
import { Card, CardContent } from "@/components/ui/card";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import logo from "@/assets/logo.png";

interface RutaRankingTabProps {
  eventId: string;
}

const RutaRankingTab = ({ eventId }: RutaRankingTabProps) => {
  const { data: ranking, isLoading } = useRanking(5, eventId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ranking || ranking.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <img
          src={logo}
          alt=""
          className="h-16 w-16 object-contain opacity-30 mb-4"
        />
        <p className="text-muted-foreground">
          Aún no hay suficientes votos para mostrar el ranking
        </p>
      </div>
    );
  }

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return "text-yellow-500";
      case 1:
        return "text-gray-400";
      case 2:
        return "text-amber-600";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Trophy className="h-5 w-5 text-primary" />
        <h3 className="text-sm font-medium">Top 5 tapas de la ruta</h3>
      </div>

      <div className="space-y-3">
        {ranking.map((tapa, index) => (
          <Card
            key={tapa.id}
            className={`overflow-hidden transition-all ${
              index === 0
                ? "border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-transparent"
                : ""
            }`}
          >
            <CardContent className="p-4 flex items-center gap-4">
              {/* Position */}
              <div
                className={`text-2xl font-bold w-8 text-center ${getMedalColor(index)}`}
              >
                {index + 1}
              </div>

              {/* Image */}
              <div className="h-14 w-14 rounded-lg overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={tapa.image_url}
                  alt={tapa.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{tapa.name}</p>
                <p className="text-sm text-muted-foreground truncate">
                  {tapa.venue_name}
                </p>
              </div>

              {/* Rating */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-primary">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-bold">{tapa.avg_stars}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {tapa.vote_count} voto{tapa.vote_count !== 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RutaRankingTab;
