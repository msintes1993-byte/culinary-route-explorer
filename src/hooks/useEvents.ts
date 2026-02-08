import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

type Event = Tables<"events">;
type EventInsert = TablesInsert<"events">;
type EventUpdate = TablesUpdate<"events">;

export const useEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: async (): Promise<Event[]> => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useEventMutations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createEvent = useMutation({
    mutationFn: async (event: EventInsert) => {
      const { data, error } = await supabase
        .from("events")
        .insert(event)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["active-event"] });
      toast({ title: "Ruta creada correctamente" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...data }: EventUpdate & { id: string }) => {
      const { error } = await supabase
        .from("events")
        .update(data)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["active-event"] });
      toast({ title: "Ruta actualizada" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["active-event"] });
      toast({ title: "Ruta eliminada" });
    },
    onError: (error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  return { createEvent, updateEvent, deleteEvent };
};
