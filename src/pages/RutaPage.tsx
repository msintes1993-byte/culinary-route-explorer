import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useVenues } from "@/hooks/useVenues";
import VenueCard from "@/components/VenueCard";
import VenueDetailSheet from "@/components/VenueDetailSheet";
import SearchInput from "@/components/SearchInput";
import type { VenueWithTapa } from "@/types/database";
import logo from "@/assets/logo.png";

const RutaPage = () => {
  const { data: venues, isLoading, error } = useVenues();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<VenueWithTapa | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

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
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="text-center space-y-2">
          <p className="text-destructive">Error al cargar los datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Tapea" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Tapea</h1>
              <p className="text-xs text-muted-foreground">
                {venues?.length || 0} locales participantes
              </p>
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
      <div className="flex-1 px-4 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

export default RutaPage;
