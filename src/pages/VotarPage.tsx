import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, Star, MapPin, ArrowLeft, LogIn, Navigation } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { useVotes } from "@/hooks/useVotes";
import { useGeoLocation } from "@/hooks/useGeoLocation";
import { useDevMode } from "@/hooks/useDevMode";
import { validateDistance, formatDistance } from "@/lib/geo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import StarRating from "@/components/StarRating";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import { useToast } from "@/hooks/use-toast";
import type { VenueWithTapa } from "@/types/database";

const VotarPage = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { submitVote } = useVotes();
  const { toast } = useToast();
  const { isDevMode } = useDevMode();
  const { 
    latitude, 
    longitude, 
    loading: geoLoading, 
    error: geoError, 
    getPosition,
    hasLocation 
  } = useGeoLocation();
  
  const [selectedTapaId, setSelectedTapaId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [pendingVote, setPendingVote] = useState<{ tapaId: string; stars: number } | null>(null);
  const [locationValidation, setLocationValidation] = useState<{ isValid: boolean; distance: number } | null>(null);

  // Fetch venue with tapas
  const { data: venue, isLoading, error } = useQuery({
    queryKey: ["venue-for-vote", venueId],
    queryFn: async (): Promise<VenueWithTapa | null> => {
      if (!venueId) return null;

      const { data: venueData, error: venueError } = await supabase
        .from("venues")
        .select("*")
        .eq("id", venueId)
        .single();

      if (venueError) throw venueError;
      if (!venueData) return null;

      const { data: tapasData, error: tapasError } = await supabase
        .from("tapas")
        .select("*")
        .eq("venue_id", venueId);

      if (tapasError) throw tapasError;

      return {
        ...venueData,
        tapas: tapasData ?? [],
      };
    },
    enabled: !!venueId,
  });

  // Request geolocation on mount
  useEffect(() => {
    getPosition();
  }, []);

  // Validate distance when we have location and venue
  useEffect(() => {
    if (hasLocation && venue && latitude !== null && longitude !== null) {
      const validation = validateDistance(latitude, longitude, venue.lat, venue.lng, 100);
      setLocationValidation(validation);
    }
  }, [hasLocation, venue, latitude, longitude]);

  // Auto-select first tapa
  useEffect(() => {
    if (venue?.tapas.length === 1 && !selectedTapaId) {
      setSelectedTapaId(venue.tapas[0].id);
    }
  }, [venue, selectedTapaId]);

  // Handle pending vote after login
  useEffect(() => {
    if (user && pendingVote) {
      handleSubmitVote(pendingVote.tapaId, pendingVote.stars);
      setPendingVote(null);
    }
  }, [user, pendingVote]);

  const handleSignInWithGoogle = async () => {
    // Save pending vote before redirect
    if (selectedTapaId && rating > 0) {
      localStorage.setItem("pendingVote", JSON.stringify({
        tapaId: selectedTapaId,
        stars: rating,
        venueId,
      }));
    }

    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.href,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error de autenticación",
        description: error.message,
      });
    }
  };

  const handleSubmitVote = async (tapaId: string, stars: number) => {
    try {
      await submitVote.mutateAsync({
        tapaId,
        stars,
      });
      
      toast({
        title: "¡Voto registrado!",
        description: "Gracias por participar en la ruta de tapas.",
      });
      
      // Clear pending vote from storage
      localStorage.removeItem("pendingVote");
      
      // Navigate to home after short delay
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al votar",
        description: error instanceof Error ? error.message : "Inténtalo de nuevo",
      });
    }
  };

  const handleVote = () => {
    if (!selectedTapaId || rating === 0) {
      toast({
        variant: "destructive",
        title: "Selecciona una puntuación",
        description: "Debes dar entre 1 y 5 estrellas",
      });
      return;
    }

    // Check geolocation validation (skip in dev mode)
    if (!isDevMode) {
      if (!hasLocation) {
        toast({
          variant: "destructive",
          title: "Ubicación requerida",
          description: "Necesitamos verificar que estás en el restaurante para votar",
        });
        getPosition();
        return;
      }

      if (locationValidation && !locationValidation.isValid) {
        toast({
          variant: "destructive",
          title: "Estás demasiado lejos",
          description: `Debes estar en el restaurante para votar. Distancia actual: ${formatDistance(locationValidation.distance)}`,
        });
        return;
      }
    }

    if (!user) {
      // Store vote and trigger login
      setPendingVote({ tapaId: selectedTapaId, stars: rating });
      handleSignInWithGoogle();
      return;
    }

    handleSubmitVote(selectedTapaId, rating);
  };

  // Check if voting is allowed
  const canVote = isDevMode || (locationValidation?.isValid ?? false);

  // Check for pending vote from previous session
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem("pendingVote");
      if (stored) {
        try {
          const { tapaId, stars, venueId: storedVenueId } = JSON.parse(stored);
          if (storedVenueId === venueId) {
            handleSubmitVote(tapaId, stars);
          }
        } catch {
          localStorage.removeItem("pendingVote");
        }
      }
    }
  }, [user, venueId]);

  if (isLoading || authLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center min-h-screen p-6 text-center">
        <MapPin className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Restaurante no encontrado</h2>
        <p className="text-muted-foreground mb-6">
          El código QR no es válido o el restaurante ya no participa.
        </p>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Ir a la ruta
        </Button>
      </div>
    );
  }

  const selectedTapa = venue.tapas.find(t => t.id === selectedTapaId);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header image */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        {venue.image_url ? (
          <ImageWithFallback
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <MapPin className="h-16 w-16 text-muted-foreground/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 -mt-8 relative z-10 pb-8">
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h1 className="font-display text-2xl font-bold mb-1">{venue.name}</h1>
            {venue.address && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {venue.address}
              </p>
            )}
            {venue.description && (
              <p className="text-sm text-muted-foreground mt-3">{venue.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Location status */}
        {!isDevMode && (
          <div className="mb-4">
            {geoLoading ? (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  Verificando tu ubicación...
                </AlertDescription>
              </Alert>
            ) : geoError ? (
              <Alert variant="destructive">
                <Navigation className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{geoError}</span>
                  <Button variant="outline" size="sm" onClick={getPosition}>
                    Reintentar
                  </Button>
                </AlertDescription>
              </Alert>
            ) : locationValidation && !locationValidation.isValid ? (
              <Alert variant="destructive">
                <MapPin className="h-4 w-4" />
                <AlertDescription>
                  Estás a {formatDistance(locationValidation.distance)} del restaurante. 
                  Debes estar a menos de 100m para votar.
                </AlertDescription>
              </Alert>
            ) : locationValidation?.isValid ? (
              <Alert className="border-primary/50 bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  ¡Ubicación verificada! Puedes votar.
                </AlertDescription>
              </Alert>
            ) : null}
          </div>
        )}

        {/* Tapa selection */}
        <h2 className="font-semibold mb-3">
          {venue.tapas.length > 1 ? "Selecciona la tapa a votar" : "Tapa participante"}
        </h2>

        <div className="space-y-3 mb-6">
          {venue.tapas.map((tapa) => (
            <Card
              key={tapa.id}
              className={`cursor-pointer transition-all ${
                selectedTapaId === tapa.id
                  ? "ring-2 ring-primary border-primary"
                  : "hover:shadow-md"
              }`}
              onClick={() => setSelectedTapaId(tapa.id)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                {tapa.image_url ? (
                  <img
                    src={tapa.image_url}
                    alt={tapa.name}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
                    <Star className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">{tapa.name}</h3>
                  {tapa.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tapa.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rating */}
        {selectedTapa && (
          <Card className="mb-6">
            <CardContent className="pt-6 text-center">
              <h3 className="font-semibold mb-4">¿Qué puntuación le das?</h3>
              <div className="flex justify-center mb-4">
                <StarRating
                  value={rating}
                  onChange={setRating}
                  size="lg"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {rating === 0
                  ? "Toca las estrellas para puntuar"
                  : `Has seleccionado ${rating} estrella${rating > 1 ? "s" : ""}`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Submit button */}
        <Button
          className="w-full h-12 text-lg"
          disabled={!selectedTapaId || rating === 0 || submitVote.isPending}
          onClick={handleVote}
        >
          {submitVote.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          ) : !user ? (
            <LogIn className="h-5 w-5 mr-2" />
          ) : null}
          {!user ? "Iniciar sesión y votar" : "Enviar voto"}
        </Button>

        {!user && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Necesitas iniciar sesión con Google para registrar tu voto
          </p>
        )}
      </div>
    </div>
  );
};

export default VotarPage;
