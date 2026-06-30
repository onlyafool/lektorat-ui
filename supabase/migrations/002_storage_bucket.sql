-- ============================================
-- Supabase Storage Bucket
-- ============================================

-- Create storage bucket for manuscripts
INSERT INTO storage.buckets (id, name, public)
VALUES ('manuscripts', 'manuscripts', false);

-- Storage policies
CREATE POLICY "Users can upload own files" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'manuscripts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own files" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'manuscripts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update own files" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'manuscripts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete own files" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'manuscripts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
