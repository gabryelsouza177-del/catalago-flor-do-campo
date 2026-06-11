CREATE POLICY "Public can upload product images"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Public can update product images"
ON storage.objects FOR UPDATE TO anon, authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Public can delete product images"
ON storage.objects FOR DELETE TO anon, authenticated
USING (bucket_id = 'product-images');