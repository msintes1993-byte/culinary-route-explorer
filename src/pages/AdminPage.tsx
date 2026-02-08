import { useState } from "react";
import { Shield, Plus, Trash2, Edit, QrCode, Store, UtensilsCrossed, Loader2, ArrowLeft, ChevronRight, Users, Gift } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useEvents, useEventMutations } from "@/hooks/useEvents";
import { useVenues } from "@/hooks/useVenues";
import { useRaffleParticipants } from "@/hooks/useRaffleParticipants";
import { useTapaMutations } from "@/hooks/useTapaMutations";
import { useVenueMutations } from "@/hooks/useVenueMutations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import EventFormDialog from "@/components/admin/EventFormDialog";
import VenueFormDialog from "@/components/admin/VenueFormDialog";
import TapaFormDialog from "@/components/admin/TapaFormDialog";
import VenueQRDialog from "@/components/admin/VenueQRDialog";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;
type Venue = Tables<"venues">;
type Tapa = Tables<"tapas">;

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { data: events, isLoading: eventsLoading } = useEvents();
  const { deleteEvent } = useEventMutations();
  const { deleteVenue } = useVenueMutations();
  const { deleteTapa } = useTapaMutations();
  const { data: raffleParticipants, isLoading: raffleLoading } = useRaffleParticipants(3);

  // Selected states
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("rutas");
  const [selectedVenueForTapa, setSelectedVenueForTapa] = useState<{ id: string; name: string } | null>(null);

  // Dialog states
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [venueDialogOpen, setVenueDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [tapaDialogOpen, setTapaDialogOpen] = useState(false);
  const [editingTapa, setEditingTapa] = useState<Tapa | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [qrVenue, setQrVenue] = useState<{ id: string; name: string } | null>(null);
  const [showRaffleModal, setShowRaffleModal] = useState(false);
  const [expandedVenues, setExpandedVenues] = useState<Set<string>>(new Set());

  // Get venues for selected event
  const { data: venues, isLoading: venuesLoading } = useVenues(selectedEventId ?? undefined);

  // Get selected event details
  const selectedEvent = events?.find(e => e.id === selectedEventId);

  // Loading state
  if (authLoading || roleLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center min-h-screen">
        <Shield className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h2 className="font-display text-xl font-semibold mb-2">Acceso restringido</h2>
        <p className="text-muted-foreground mb-6">
          Solo los administradores pueden acceder a esta sección
        </p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la ruta
        </Button>
      </div>
    );
  }

  const formatDateRange = (activeDates: unknown) => {
    const dates = activeDates as { start?: string; end?: string } | null;
    if (!dates?.start || !dates?.end) return "Sin fechas";
    try {
      const start = format(new Date(dates.start), "d MMM", { locale: es });
      const end = format(new Date(dates.end), "d MMM yyyy", { locale: es });
      return `${start} - ${end}`;
    } catch {
      return "Fechas inválidas";
    }
  };

  const toggleVenueExpanded = (venueId: string) => {
    setExpandedVenues(prev => {
      const next = new Set(prev);
      if (next.has(venueId)) {
        next.delete(venueId);
      } else {
        next.add(venueId);
      }
      return next;
    });
  };

  const openEditEvent = (event: Event) => {
    setEditingEvent(event);
    setEventDialogOpen(true);
  };

  const openNewVenue = () => {
    setEditingVenue(null);
    setVenueDialogOpen(true);
  };

  const openEditVenue = (venue: Venue) => {
    setEditingVenue(venue);
    setVenueDialogOpen(true);
  };

  const openNewTapa = (venue: { id: string; name: string }) => {
    setSelectedVenueForTapa(venue);
    setEditingTapa(null);
    setTapaDialogOpen(true);
  };

  const openEditTapa = (tapa: Tapa, venue: { id: string; name: string }) => {
    setSelectedVenueForTapa(venue);
    setEditingTapa(tapa);
    setTapaDialogOpen(true);
  };

  const openQrDialog = (venue: { id: string; name: string }) => {
    setQrVenue(venue);
    setQrDialogOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl text-foreground">Panel Admin</h1>
                <p className="text-xs text-muted-foreground">Gestión de rutas de tapas</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 pb-8">
        <Tabs defaultValue="rutas" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rutas">Rutas</TabsTrigger>
            <TabsTrigger value="restaurantes" disabled={!selectedEventId}>
              Restaurantes
            </TabsTrigger>
            <TabsTrigger value="sorteo">Sorteo</TabsTrigger>
          </TabsList>

          {/* RUTAS TAB */}
          <TabsContent value="rutas" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Rutas de tapas</h2>
              <Button size="sm" onClick={() => { setEditingEvent(null); setEventDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-1" />
                Nueva ruta
              </Button>
            </div>

            {eventsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : events && events.length > 0 ? (
              <div className="space-y-3">
                {events.map((event) => (
                  <Card
                    key={event.id}
                    className={`cursor-pointer transition-all ${
                      selectedEventId === event.id
                        ? "ring-2 ring-primary border-primary"
                        : "hover:shadow-md"
                    }`}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{event.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatDateRange(event.active_dates)}
                          </p>
                          <Badge variant="outline" className="mt-1 text-xs">
                            /{event.slug}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-hover-dark hover:text-foreground transition-colors"
                            onClick={(e) => { e.stopPropagation(); openEditEvent(event); }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-hover-dark hover:text-foreground transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar ruta?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esto eliminará la ruta "{event.name}" y todos sus restaurantes y tapas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteEvent.mutate(event.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-hover-dark hover:text-foreground transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEventId(event.id);
                              setActiveTab("restaurantes");
                            }}
                          >
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Store className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-4">No hay rutas creadas</p>
                  <Button onClick={() => { setEditingEvent(null); setEventDialogOpen(true); }}>
                    <Plus className="h-4 w-4 mr-1" />
                    Crear primera ruta
                  </Button>
                </CardContent>
              </Card>
            )}

          </TabsContent>

          {/* RESTAURANTES TAB */}
          <TabsContent value="restaurantes" className="space-y-4">
            {selectedEvent && (
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">{selectedEvent.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {venues?.length ?? 0} restaurantes
                  </p>
                </div>
                <Button size="sm" onClick={openNewVenue}>
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir restaurante
                </Button>
              </div>
            )}

            {venuesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : venues && venues.length > 0 ? (
              <div className="space-y-3">
                {venues.map((venue) => (
                  <Collapsible
                    key={venue.id}
                    open={expandedVenues.has(venue.id)}
                    onOpenChange={() => toggleVenueExpanded(venue.id)}
                  >
                    <Card>
                      <CardContent className="p-0">
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              {venue.image_url ? (
                                <img
                                  src={venue.image_url}
                                  alt={venue.name}
                                  className="h-12 w-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                                  <Store className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                              <div className="text-left">
                                <h3 className="font-semibold">{venue.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {venue.tapas.length} tapa(s)
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-hover-dark hover:text-foreground transition-colors"
                                onClick={(e) => { e.stopPropagation(); openQrDialog({ id: venue.id, name: venue.name }); }}
                              >
                                <QrCode className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 hover:bg-hover-dark hover:text-foreground transition-colors"
                                onClick={(e) => { e.stopPropagation(); openEditVenue(venue); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-hover-dark hover:text-foreground transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar restaurante?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esto eliminará "{venue.name}" y todas sus tapas.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteVenue.mutate(venue.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <ChevronRight
                                className={`h-5 w-5 text-muted-foreground transition-transform ${
                                  expandedVenues.has(venue.id) ? "rotate-90" : ""
                                }`}
                              />
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="border-t px-4 py-3 space-y-3 bg-muted/30">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium">Tapas</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openNewTapa({ id: venue.id, name: venue.name })}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Añadir tapa
                              </Button>
                            </div>

                            {venue.tapas.length > 0 ? (
                              <div className="space-y-2">
                                {venue.tapas.map((tapa) => (
                                  <div
                                    key={tapa.id}
                                    className="flex items-center justify-between bg-background rounded-lg p-3"
                                  >
                                    <div className="flex items-center gap-3">
                                      {tapa.image_url ? (
                                        <img
                                          src={tapa.image_url}
                                          alt={tapa.name}
                                          className="h-10 w-10 rounded-lg object-cover"
                                        />
                                      ) : (
                                        <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                                          <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-medium text-sm">{tapa.name}</p>
                                        {tapa.price > 0 && (
                                          <p className="text-xs text-muted-foreground">
                                            {tapa.price.toFixed(2)}€
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 hover:bg-hover-dark hover:text-foreground transition-colors"
                                        onClick={() => openEditTapa(tapa, { id: venue.id, name: venue.name })}
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </Button>
                                      <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-hover-dark hover:text-foreground transition-colors">
                                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                          </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                          <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar tapa?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                              Esto eliminará "{tapa.name}" y todos sus votos.
                                            </AlertDialogDescription>
                                          </AlertDialogHeader>
                                          <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction
                                              onClick={() => deleteTapa.mutate(tapa.id)}
                                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                              Eliminar
                                            </AlertDialogAction>
                                          </AlertDialogFooter>
                                        </AlertDialogContent>
                                      </AlertDialog>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Este restaurante no tiene tapas
                              </p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </CardContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Store className="h-12 w-12 text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground mb-4">No hay restaurantes en esta ruta</p>
                  <Button onClick={openNewVenue}>
                    <Plus className="h-4 w-4 mr-1" />
                    Añadir restaurante
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* SORTEO TAB */}
          <TabsContent value="sorteo" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Participantes del sorteo
                </CardTitle>
              </CardHeader>
              <CardContent>
                {raffleLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : raffleParticipants && raffleParticipants.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground mb-4">
                      Usuarios con 3 o más tapas votadas:
                    </p>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Votos</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {raffleParticipants.map((participant) => (
                          <TableRow key={participant.user_id}>
                            <TableCell className="font-medium">
                              {participant.email ?? "Sin email"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="secondary">{participant.vote_count}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Aún no hay usuarios con 3 o más votos
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <EventFormDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        event={editingEvent}
      />

      {selectedEventId && (
        <VenueFormDialog
          open={venueDialogOpen}
          onOpenChange={setVenueDialogOpen}
          eventId={selectedEventId}
          venue={editingVenue}
          onSuccess={(venueId) => {
            setExpandedVenues(prev => new Set([...prev, venueId]));
          }}
        />
      )}

      {selectedVenueForTapa && (
        <TapaFormDialog
          open={tapaDialogOpen}
          onOpenChange={setTapaDialogOpen}
          venueId={selectedVenueForTapa.id}
          venueName={selectedVenueForTapa.name}
          tapa={editingTapa}
        />
      )}

      {qrVenue && selectedEvent && (
        <VenueQRDialog
          open={qrDialogOpen}
          onOpenChange={setQrDialogOpen}
          venueId={qrVenue.id}
          venueName={qrVenue.name}
          eventName={selectedEvent.name}
        />
      )}
    </div>
  );
};

export default AdminPage;
