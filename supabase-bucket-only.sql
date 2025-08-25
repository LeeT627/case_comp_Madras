-- SUPABASE STORAGE BUCKET SETUP (Simplified Version)
-- Run this in your Supabase SQL Editor

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

-- 2. Check if bucket was created
SELECT * FROM storage.buckets WHERE id = 'uploads';