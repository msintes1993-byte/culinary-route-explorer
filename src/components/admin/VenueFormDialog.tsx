import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X, MapPin } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useVenueMutations } from "@/hooks/useVenueMutations";
import { useImageUpload } from "@/hooks/useImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Venue = Tables<"venues">;

const venueSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  address: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

type VenueFormValues = z.infer<typeof venueSchema>;

interface VenueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  venue?: Venue | null;
  onSuccess?: (venueId: string) => void;
}

const VenueFormDialog = ({ open, onOpenChange, eventId, venue, onSuccess }: VenueFormDialogProps) => {
  const { createVenue, updateVenue } = useVenueMutations();
  const { uploadImage, uploading } = useImageUpload();
  const [imageUrl, setImageUrl] = useState<string | null>(venue?.image_url ?? null);
  const [imagePreview, setImagePreview] = useState<string | null>(venue?.image_url ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!venue;

  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: venue?.name ?? "",
      address: venue?.address ?? "",
      description: venue?.description ?? "",
      lat: venue?.lat ?? 40.4168,
      lng: venue?.lng ?? -3.7038,
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload
    const url = await uploadImage(file, "venues");
    if (url) setImageUrl(url);
  };

  const clearImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: VenueFormValues) => {
    const venueData = {
      name: values.name,
      address: values.address ?? null,
      description: values.description ?? null,
      lat: values.lat,
      lng: values.lng,
      event_id: eventId,
      image_url: imageUrl,
    };

    if (isEditing && venue) {
      await updateVenue.mutateAsync({ id: venue.id, ...venueData });
      onOpenChange(false);
    } else {
      const result = await createVenue.mutateAsync(venueData);
      onOpenChange(false);
      onSuccess?.(result.id);
    }
    
    form.reset();
    setImageUrl(null);
    setImagePreview(null);
  };

  const isPending = createVenue.isPending || updateVenue.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar restaurante" : "Nuevo restaurante"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Image upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Foto del restaurante</label>
              <div className="relative">
                {imagePreview ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={clearImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground"
                  >
                    <Upload className="h-8 w-8" />
                    <span className="text-sm">Subir imagen</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del restaurante</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Bar El Rincón" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Calle Mayor, 15" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del local</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe brevemente el restaurante..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Latitud
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Longitud
                    </FormLabel>
                    <FormControl>
                      <Input type="number" step="any" {...field} />
                    </FormControl>
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
                {isEditing ? "Guardar" : "Crear restaurante"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default VenueFormDialog;
