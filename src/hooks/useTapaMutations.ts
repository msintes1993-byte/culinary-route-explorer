import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type TapaInsert = TablesInsert<"tapas">;
type TapaUpdate = TablesUpdate<"tapas">;

export const useTapaMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createTapa = useMutation({
    mutationFn: async (tapa: TapaInsert) => {
      const { data, error } = await supabase
        .from("tapas")
        .insert(tapa)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues-with-tapas"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      toast({ title: "Tapa creada" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateTapa = useMutation({
    mutationFn: async ({ id, ...data }: TapaUpdate & { id: string }) => {
      const { error } = await supabase
        .from("tapas")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues-with-tapas"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      toast({ title: "Tapa actualizada" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteTapa = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tapas")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["venues-with-tapas"] });
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      toast({ title: "Tapa eliminada" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  return { createTapa, updateTapa, deleteTapa };
};
