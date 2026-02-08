-- Create storage bucket for venue and tapa images
INSERT INTO storage.buckets (id, name, public)
VALUES ('venue-images', 'venue-images', true);

-- Allow anyone to view images (public read)
CREATE POLICY "Public can view venue images"
ON storage.objects FOR SELECT
USING (bucket_id = 'venue-images');

-- Only admins can upload images
CREATE POLICY "Admins can upload venue images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'venue-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Only admins can update images
CREATE POLICY "Admins can update venue images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'venue-images' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Only admins can delete images
CREATE POLICY "Admins can delete venue images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'venue-images' 
  AND public.has_role(auth.uid(), 'admin')
);