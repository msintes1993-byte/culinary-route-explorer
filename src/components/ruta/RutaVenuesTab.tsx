import { Loader2 } from "lucide-react";
import VenueCard from "@/components/VenueCard";
import type { VenueWithTapa } from "@/types/database";
import logo from "@/assets/logo.png";

interface RutaVenuesTabProps {
  venues: VenueWithTapa[];
  isLoading: boolean;
  searchQuery: string;
  onVenueClick: (venue: VenueWithTapa) => void;
}

const RutaVenuesTab = ({
  venues,
  isLoading,
  searchQuery,
  onVenueClick,
}: RutaVenuesTabProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (venues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <img
          src={logo}
          alt=""
          className="h-16 w-16 object-contain opacity-30 mb-4"
        />
        <p className="text-muted-foreground">
          {searchQuery
            ? "No se encontraron resultados"
            : "No hay locales disponibles"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {venues.map((venue) => (
        <VenueCard
          key={venue.id}
          venue={venue}
          onClick={() => onVenueClick(venue)}
        />
      ))}
    </div>
  );
};

export default RutaVenuesTab;
