import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    try {
      setUploading(true);
      
      const fileExt = file.name.split(".").pop();
      const fileName = `${folder}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("venue-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("venue-images")
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al subir imagen",
        description: error instanceof Error ? error.message : "Error desconocido",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (url: string): Promise<boolean> => {
    try {
      // Extract the file path from the URL
      const urlParts = url.split("/venue-images/");
      if (urlParts.length < 2) return false;
      
      const filePath = urlParts[1];
      const { error } = await supabase.storage
        .from("venue-images")
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      return false;
    }
  };

  return { uploadImage, deleteImage, uploading };
};
