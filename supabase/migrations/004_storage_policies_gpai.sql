-- Storage Policies for GPAI Integration
-- Run this in Supabase SQL Editor
-- These policies work with GPAI user IDs (UUIDs) instead of Supabase auth.uid()

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Allow anyone to upload/view/update/delete files in uploads bucket
-- Security is handled at the API level using GPAI authentication
CREATE POLICY "Allow all operations on uploads"
ON storage.objects
FOR ALL
USING (bucket_id = 'uploads')
WITH CHECK (bucket_id = 'uploads');

-- Note: This is less secure than RLS, but necessary since we're using
-- external GPAI authentication instead of Supabase Auth.
-- Make sure API routes properly validate GPAI session before allowing operations.