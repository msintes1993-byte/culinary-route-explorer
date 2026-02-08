import { useState } from "react";
import { Shield, Trash2, Edit, Users, Gift, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useVenues } from "@/hooks/useVenues";
import { useRaffleParticipants } from "@/hooks/useRaffleParticipants";
import { useAdminMutations } from "@/hooks/useAdminMutations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const AdminPage = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { data: venues, isLoading: venuesLoading } = useVenues();
  const { data: raffleParticipants, isLoading: raffleLoading } = useRaffleParticipants(3);
  const { deleteVenue, deleteTapa } = useAdminMutations();
  const [showRaffleModal, setShowRaffleModal] = useState(false);

  // Loading state
  if (authLoading || roleLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
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

  return (
    <div className="flex flex-col flex-1 pb-20">
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
                <p className="text-xs text-muted-foreground">Gestión de la ruta</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Volver
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-6">
        {/* Raffle Button */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gift className="h-5 w-5 text-primary" />
              Sorteo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setShowRaffleModal(true)} className="w-full gap-2">
              <Users className="h-4 w-4" />
              Ver participantes ({raffleParticipants?.length ?? 0})
            </Button>
          </CardContent>
        </Card>

        {/* Venues & Tapas Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Locales y Tapas</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {venuesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Local</TableHead>
                      <TableHead>Tapa</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {venues?.map((venue) => (
                      <TableRow key={venue.id}>
                        <TableCell className="font-medium">{venue.name}</TableCell>
                        <TableCell>
                          {venue.tapas[0]?.name ?? (
                            <span className="text-muted-foreground">Sin tapa</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Delete Tapa */}
                            {venue.tapas[0] && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar tapa?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esto eliminará la tapa "{venue.tapas[0].name}" y todos sus votos.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteTapa.mutate(venue.tapas[0].id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {/* Delete Venue */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar local?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esto eliminará el local "{venue.name}" y todas sus tapas.
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
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Raffle Modal */}
      <Dialog open={showRaffleModal} onOpenChange={setShowRaffleModal}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Participantes del sorteo
            </DialogTitle>
          </DialogHeader>

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
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
