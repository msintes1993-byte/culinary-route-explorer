import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useVenues } from "@/hooks/useVenues";
import VenueCard from "@/components/VenueCard";
import VenueDetailSheet from "@/components/VenueDetailSheet";
import SearchInput from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import type { VenueWithTapa, Event } from "@/types/database";
import logo from "@/assets/logo.png";
import { Skeleton } from "@/components/ui/skeleton";

const RutaDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<VenueWithTapa | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Fetch event by slug
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event-by-slug", slug],
    queryFn: async (): Promise<Event | null> => {
      if (!slug) return null;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as Event;
    },
    enabled: !!slug,
  });

  const { data: venues, isLoading: isLoadingVenues, error } = useVenues(event?.id);

  const isLoading = isLoadingEvent || isLoadingVenues;

  const filteredVenues = useMemo(() => {
    if (!venues) return [];
    if (!searchQuery.trim()) return venues;
    
    const query = searchQuery.toLowerCase();
    return venues.filter(
      (venue) =>
        venue.name.toLowerCase().includes(query) ||
        venue.tapas.some((tapa) => tapa.name.toLowerCase().includes(query))
    );
  }, [venues, searchQuery]);

  const handleVenueClick = (venue: VenueWithTapa) => {
    setSelectedVenue(venue);
    setSheetOpen(true);
  };

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-6 min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-destructive">Error al cargar los datos</p>
          <Button variant="outline" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logo} alt="Tapea" className="h-10 w-10 object-contain" />
            <div className="flex-1">
              {isLoadingEvent ? (
                <>
                  <Skeleton className="h-6 w-40 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </>
              ) : (
                <>
                  <h1 className="font-display font-bold text-xl text-foreground">
                    {event?.name || "Ruta de tapas"}
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    {venues?.length || 0} locales participantes
                  </p>
                </>
              )}
            </div>
          </div>
          
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Buscar local o tapa..."
          />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !event ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <img src={logo} alt="" className="h-16 w-16 object-contain opacity-30 mb-4" />
            <p className="text-muted-foreground mb-4">Ruta no encontrada</p>
            <Button variant="outline" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ver todas las rutas
            </Button>
          </div>
        ) : filteredVenues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <img src={logo} alt="" className="h-16 w-16 object-contain opacity-30 mb-4" />
            <p className="text-muted-foreground">
              {searchQuery ? "No se encontraron resultados" : "No hay locales disponibles"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filteredVenues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onClick={() => handleVenueClick(venue)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <VenueDetailSheet
        venue={selectedVenue}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </div>
  );
};

export default RutaDetailPage;
