import { useState, useEffect, useMemo } from "react";
import { MapPin, Euro, Star, Navigation, Loader2, AlertTriangle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import VoteDialog from "@/components/VoteDialog";
import { useVotes } from "@/hooks/useVotes";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useDevMode } from "@/hooks/useDevMode";
import { validateDistance, formatDistance } from "@/lib/geo";
import type { VenueWithTapa } from "@/types/database";

interface VenueDetailSheetProps {
  venue: VenueWithTapa | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VenueDetailSheet = ({ venue, open, onOpenChange }: VenueDetailSheetProps) => {
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const { getVoteForTapa } = useVotes();
  const { latitude, longitude, loading: geoLoading, error: geoError, getPosition, hasLocation } = useGeoLocation();
  const { isDevMode } = useDevMode();

  // Get position when sheet opens
  useEffect(() => {
    if (open && venue) {
      getPosition();
    }
  }, [open, venue, getPosition]);

  const distanceValidation = useMemo(() => {
    if (!venue || !hasLocation || !latitude || !longitude) {
      return null;
    }
    return validateDistance(latitude, longitude, venue.lat, venue.lng);
  }, [venue, hasLocation, latitude, longitude]);

  // Can vote if: dev mode enabled, or within distance
  const canVote = isDevMode || (distanceValidation?.isValid ?? false);
  const isCheckingLocation = geoLoading;

  if (!venue) return null;

  const starTapa = venue.tapas[0];
  const existingVote = starTapa ? getVoteForTapa(starTapa.id) : null;

  const renderVoteButton = () => {
    // Already voted
    if (existingVote) {
      return (
        <Button 
          variant="secondary"
          className="w-full h-14 text-base font-semibold rounded-2xl gap-2"
          size="lg"
          disabled
        >
          <Star className="h-5 w-5 fill-secondary text-secondary" />
          Tu voto: {existingVote.stars} estrellas
        </Button>
      );
    }

    // Checking location
    if (isCheckingLocation) {
      return (
        <Button 
          className="w-full h-14 text-base font-semibold rounded-2xl"
          size="lg"
          disabled
        >
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Verificando ubicación...
        </Button>
      );
    }

    // Dev mode active
    if (isDevMode) {
      return (
        <div className="space-y-2">
          <Badge variant="outline" className="w-full justify-center py-1 text-xs bg-accent/20 border-accent text-accent-foreground">
            🔧 Modo Desarrollador
          </Badge>
          <Button 
            onClick={() => setVoteDialogOpen(true)}
            className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg"
            size="lg"
          >
            VOTAR ESTA TAPA
          </Button>
        </div>
      );
    }

    // Location error
    if (geoError) {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4" />
            {geoError}
          </div>
          <Button 
            onClick={getPosition}
            variant="outline"
            className="w-full h-12 text-base font-semibold rounded-2xl"
            size="lg"
          >
            <Navigation className="h-5 w-5 mr-2" />
            Reintentar ubicación
          </Button>
        </div>
      );
    }

    // Not close enough
    if (distanceValidation && !distanceValidation.isValid) {
      return (
        <div className="space-y-3">
          <div className="bg-muted rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
              <Navigation className="h-4 w-4" />
              Estás a {formatDistance(distanceValidation.distance)}
            </div>
            <p className="text-sm font-medium text-foreground">
              Debes estar en el local para votar
            </p>
          </div>
          <Button 
            variant="secondary"
            className="w-full h-14 text-base font-semibold rounded-2xl"
            size="lg"
            disabled
          >
            <MapPin className="h-5 w-5 mr-2" />
            VOTAR ESTA TAPA
          </Button>
        </div>
      );
    }

    // Can vote!
    if (canVote) {
      return (
        <div className="space-y-2">
          {distanceValidation && (
            <div className="flex items-center justify-center gap-2 text-sm text-accent">
              <Navigation className="h-4 w-4" />
              Estás a {formatDistance(distanceValidation.distance)} del local
            </div>
          )}
          <Button 
            onClick={() => setVoteDialogOpen(true)}
            className="w-full h-14 text-base font-semibold rounded-2xl shadow-lg"
            size="lg"
          >
            VOTAR ESTA TAPA
          </Button>
        </div>
      );
    }

    // Waiting for location
    return (
      <Button 
        onClick={getPosition}
        variant="outline"
        className="w-full h-14 text-base font-semibold rounded-2xl"
        size="lg"
      >
        <Navigation className="h-5 w-5 mr-2" />
        Obtener mi ubicación
      </Button>
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] rounded-t-3xl p-0 border-0"
        >
          <ScrollArea className="h-full">
            {/* Hero image */}
            <div className="relative aspect-[4/3] w-full">
              {starTapa?.image_url ? (
                <img
                  src={starTapa.image_url}
                  alt={starTapa.name}
                  className="w-full h-full object-cover"
                />
              ) : venue.image_url ? (
                <img
                  src={venue.image_url}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <MapPin className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Tapa name overlay */}
              {starTapa && (
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-primary text-primary-foreground border-0 mb-2 text-xs">
                    Tapa estrella
                  </Badge>
                  <h2 className="font-display font-bold text-2xl text-white">
                    {starTapa.name}
                  </h2>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5 pb-36 space-y-5">
              <SheetHeader className="text-left p-0">
                <SheetTitle className="font-display text-xl">{venue.name}</SheetTitle>
                {venue.address && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                    <MapPin className="h-4 w-4" />
                    {venue.address}
                  </p>
                )}
              </SheetHeader>

              {/* Venue description */}
              {venue.description && (
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Sobre el local
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {venue.description}
                  </p>
                </div>
              )}

              {/* Tapa info */}
              {starTapa && (
                <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      La Tapa
                    </h3>
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      <Euro className="h-4 w-4" />
                      {Number(starTapa.price).toFixed(2)}
                    </div>
                  </div>
                  
                  {starTapa.description && (
                    <p className="text-foreground leading-relaxed">
                      {starTapa.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Sticky vote button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
            {renderVoteButton()}
          </div>
        </SheetContent>
      </Sheet>

      {starTapa && (
        <VoteDialog
          open={voteDialogOpen}
          onOpenChange={setVoteDialogOpen}
          tapa={starTapa}
          venue={venue}
        />
      )}
    </>
  );
};

export default VenueDetailSheet;
