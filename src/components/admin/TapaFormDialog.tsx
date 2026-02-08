import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Upload, X } from "lucide-react";
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
import { useTapaMutations } from "@/hooks/useTapaMutations";
import { useImageUpload } from "@/hooks/useImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Tapa = Tables<"tapas">;

const tapaSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  description: z.string().max(500).optional(),
  price: z.coerce.number().min(0, "El precio debe ser positivo").optional(),
});

type TapaFormValues = z.infer<typeof tapaSchema>;

interface TapaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  venueId: string;
  venueName: string;
  tapa?: Tapa | null;
}

const TapaFormDialog = ({ open, onOpenChange, venueId, venueName, tapa }: TapaFormDialogProps) => {
  const { createTapa, updateTapa } = useTapaMutations();
  const { uploadImage, uploading } = useImageUpload();
  const [imageUrl, setImageUrl] = useState<string | null>(tapa?.image_url ?? null);
  const [imagePreview, setImagePreview] = useState<string | null>(tapa?.image_url ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = !!tapa;

  const form = useForm<TapaFormValues>({
    resolver: zodResolver(tapaSchema),
    defaultValues: {
      name: tapa?.name ?? "",
      description: tapa?.description ?? "",
      price: tapa?.price ?? 0,
    },
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    const url = await uploadImage(file, "tapas");
    if (url) setImageUrl(url);
  };

  const clearImage = () => {
    setImageUrl(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = async (values: TapaFormValues) => {
    const tapaData = {
      name: values.name,
      description: values.description ?? null,
      venue_id: venueId,
      image_url: imageUrl,
      price: values.price ?? 0,
    };

    if (isEditing && tapa) {
      await updateTapa.mutateAsync({ id: tapa.id, ...tapaData });
    } else {
      await createTapa.mutateAsync(tapaData);
    }
    
    onOpenChange(false);
    form.reset();
    setImageUrl(null);
    setImagePreview(null);
  };

  const isPending = createTapa.isPending || updateTapa.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar tapa" : "Nueva tapa"}
            <span className="block text-sm font-normal text-muted-foreground mt-1">
              {venueName}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Image upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Foto de la tapa</label>
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
                  <FormLabel>Nombre de la tapa</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Tortilla de patatas" {...field} />
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe la tapa..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Guardar" : "Crear tapa"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TapaFormDialog;
