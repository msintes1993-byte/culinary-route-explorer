import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type VenueInsert = TablesInsert<"venues">;
type VenueUpdate = TablesUpdate<"venues">;

export const useVenueMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createVenue = useMutation({
    mutationFn: async (venue: VenueInsert) => {
      const { data, error } = await supabase
        .from("venues")
        .insert(venue)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues-with-tapas"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      toast({ title: "Restaurante creado" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateVenue = useMutation({
    mutationFn: async ({ id, ...data }: VenueUpdate & { id: string }) => {
      const { error } = await supabase
        .from("venues")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues-with-tapas"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      toast({ title: "Restaurante actualizado" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteVenue = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("venues")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues-with-tapas"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      toast({ title: "Restaurante eliminado" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  return { createVenue, updateVenue, deleteVenue };
};
