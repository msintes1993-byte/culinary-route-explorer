import { useNavigate } from "react-router-dom";
import { Loader2, MapPin, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEvents } from "@/hooks/useEvents";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import logo from "@/assets/logo.png";

const HomePage = () => {
  const navigate = useNavigate();
  const { data: events, isLoading } = useEvents();

  const formatDateRange = (activeDates: unknown) => {
    const dates = activeDates as { start?: string; end?: string } | null;
    if (!dates?.start || !dates?.end) return null;
    try {
      const start = format(new Date(dates.start), "d MMM", { locale: es });
      const end = format(new Date(dates.end), "d MMM yyyy", { locale: es });
      return `${start} - ${end}`;
    } catch {
      return null;
    }
  };

  const isEventActive = (activeDates: unknown) => {
    const dates = activeDates as { start?: string; end?: string } | null;
    if (!dates?.start || !dates?.end) return false;
    const today = new Date().toISOString().split("T")[0];
    return today >= dates.start && today <= dates.end;
  };

  // Separate active and past events
  const activeEvents = events?.filter(e => isEventActive(e.active_dates)) ?? [];
  const pastEvents = events?.filter(e => !isEventActive(e.active_dates)) ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Tapea" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Tapea</h1>
              <p className="text-xs text-muted-foreground">Rutas de tapas</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : events && events.length > 0 ? (
          <div className="space-y-6">
            {/* Active events */}
            {activeEvents.length > 0 && (
              <section>
                <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Rutas activas
                </h2>
                <div className="space-y-3">
                  {activeEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                      onClick={() => navigate(`/ruta/${event.slug}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-display font-semibold text-lg">
                                {event.name}
                              </h3>
                              <Badge variant="default" className="text-xs">
                                Activa
                              </Badge>
                            </div>
                            {formatDateRange(event.active_dates) && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDateRange(event.active_dates)}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Past/upcoming events */}
            {pastEvents.length > 0 && (
              <section>
                <h2 className="font-semibold text-lg mb-3 text-muted-foreground">
                  Otras rutas
                </h2>
                <div className="space-y-3">
                  {pastEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="cursor-pointer transition-all hover:shadow-md opacity-80"
                      onClick={() => navigate(`/ruta/${event.slug}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-display font-semibold">
                              {event.name}
                            </h3>
                            {formatDateRange(event.active_dates) && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDateRange(event.active_dates)}
                              </p>
                            )}
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <img src={logo} alt="" className="h-20 w-20 object-contain opacity-30 mb-4" />
            <h2 className="font-display text-xl font-semibold mb-2">Bienvenido a Tapea</h2>
            <p className="text-muted-foreground mb-4">
              No hay rutas de tapas activas en este momento
            </p>
            <p className="text-sm text-muted-foreground">
              Vuelve pronto para descubrir nuevas rutas gastronómicas
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
