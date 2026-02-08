import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useEventMutations } from "@/hooks/useEvents";
import type { Tables } from "@/integrations/supabase/types";

type Event = Tables<"events">;

const eventSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  slug: z.string().min(1, "El slug es obligatorio").max(50).regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  startDate: z.date({ required_error: "Fecha de inicio obligatoria" }),
  endDate: z.date({ required_error: "Fecha de fin obligatoria" }),
}).refine((data) => data.endDate >= data.startDate, {
  message: "La fecha de fin debe ser posterior a la de inicio",
  path: ["endDate"],
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
}

const EventFormDialog = ({ open, onOpenChange, event }: EventFormDialogProps) => {
  const { createEvent, updateEvent } = useEventMutations();
  const isEditing = !!event;

  const getDefaultDates = () => {
    if (event) {
      const activeDates = event.active_dates as { start?: string; end?: string } | null;
      return {
        startDate: activeDates?.start ? new Date(activeDates.start) : new Date(),
        endDate: activeDates?.end ? new Date(activeDates.end) : new Date(),
      };
    }
    return {
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
    };
  };

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: event?.name ?? "",
      slug: event?.slug ?? "",
      ...getDefaultDates(),
    },
  });

  const onSubmit = async (values: EventFormValues) => {
    const eventData = {
      name: values.name,
      slug: values.slug,
      active_dates: {
        start: format(values.startDate, "yyyy-MM-dd"),
        end: format(values.endDate, "yyyy-MM-dd"),
      },
      theme_colors: event?.theme_colors ?? {},
    };

    if (isEditing && event) {
      await updateEvent.mutateAsync({ id: event.id, ...eventData });
    } else {
      await createEvent.mutateAsync(eventData);
    }
    
    onOpenChange(false);
    form.reset();
  };

  const isPending = createEvent.isPending || updateEvent.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar ruta" : "Nueva ruta de tapas"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la ruta</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Ruta de la Tapa Primavera 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="ej: ruta-primavera-2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Inicio</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd MMM yyyy", { locale: es })
                            ) : (
                              <span>Fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fin</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd MMM yyyy", { locale: es })
                            ) : (
                              <span>Fecha</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Guardar cambios" : "Crear ruta"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EventFormDialog;
