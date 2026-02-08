import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Venue, Tapa } from "@/types/database";

export const useAdminMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Delete venue
  const deleteVenue = useMutation({
    mutationFn: async (venueId: string) => {
      const { error } = await supabase
        .from("venues")
        .delete()
        .eq("id", venueId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues-with-tapas"] });
      toast({ title: "Local eliminado" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Update venue
  const updateVenue = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Venue> & { id: string }) => {
      const { error } = await supabase
        .from("venues")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues-with-tapas"] });
      toast({ title: "Local actualizado" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Delete tapa
  const deleteTapa = useMutation({
    mutationFn: async (tapaId: string) => {
      const { error } = await supabase
        .from("tapas")
        .delete()
        .eq("id", tapaId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues-with-tapas"] });
      toast({ title: "Tapa eliminada" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Update tapa
  const updateTapa = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Tapa> & { id: string }) => {
      const { error } = await supabase
        .from("tapas")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues-with-tapas"] });
      toast({ title: "Tapa actualizada" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  return {
    deleteVenue,
    updateVenue,
    deleteTapa,
    updateTapa,
  };
};
