import { Trophy, Star, Loader2 } from "lucide-react";
import { useRanking } from "@/hooks/useRanking";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";

const RankingPage = () => {
  const { data: ranking, isLoading } = useRanking(5);

  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-500";
      case 2:
        return "bg-gray-400";
      case 3:
        return "bg-amber-600";
      default:
        return "bg-muted";
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Ranking</h1>
              <p className="text-xs text-muted-foreground">Las tapas mejor valoradas</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : ranking && ranking.length > 0 ? (
          <div className="space-y-3">
            {ranking.map((item, index) => {
              const position = index + 1;
              const isTopThree = position <= 3;

              return (
                <Card
                  key={item.id}
                  className={`border-0 shadow-sm overflow-hidden ${
                    isTopThree ? "ring-2 ring-offset-2" : ""
                  } ${
                    position === 1
                      ? "ring-yellow-500"
                      : position === 2
                      ? "ring-gray-400"
                      : position === 3
                      ? "ring-amber-600"
                      : ""
                  }`}
                >
                  <div className="flex gap-3 p-3">
                    {/* Position badge */}
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold ${getMedalColor(
                        position
                      )}`}
                    >
                      {position}
                    </div>

                    {/* Image */}
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                        <Trophy className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                      <p className="text-sm text-muted-foreground truncate">{item.venue_name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-secondary text-secondary" />
                          <span className="font-semibold text-foreground">{item.avg_stars}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {item.vote_count} {item.vote_count === 1 ? "voto" : "votos"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <img src={logo} alt="" className="h-16 w-16 object-contain opacity-30 mb-4" />
            <p className="text-muted-foreground">Aún no hay votos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingPage;
