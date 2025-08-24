-- SUPABASE STORAGE BUCKET SETUP FOR GPAI CASE COMPETITION
-- Run these commands in your Supabase SQL Editor
-- Dashboard URL: https://supabase.com/dashboard/project/gmjwhevctzlojxqrfhtc/sql/new

-- 1. Create the storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads', 
  false,  -- Set to false for private bucket
  20971520,  -- 20MB in bytes (20 * 1024 * 1024)
  ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']::text[]  -- PDF, PPT, PPTX only
)
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']::text[];

-- 2. Enable RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- 4. Policy for INSERT (upload) - Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND 
  auth.uid() IS NOT NULL
);

-- 5. Policy for SELECT (view/download) - Users can only see their own files
CREATE POLICY "Users can view own files" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Policy for DELETE - Users can only delete their own files
CREATE POLICY "Users can delete own files" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 7. Policy for UPDATE - Users can only update their own files
CREATE POLICY "Users can update own files" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 8. Grant necessary permissions
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- 9. Verify bucket was created successfully
SELECT * FROM storage.buckets WHERE id = 'uploads';

-- 10. Check if policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- IMPORTANT NOTES:
-- 1. Files are stored in format: {user_id}/{filename}
-- 2. Max file size: 20MB
-- 3. Allowed types: PDF, PPT, PPTX
-- 4. Each user can only upload/delete their own files
-- 5. New uploads automatically replace previous submissions
-- 6. Users cannot view/download files (admin only)
-- 7. Make sure to disable email confirmations if SMTP is not configured