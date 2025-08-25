-- SUPABASE COMPLETE SETUP
-- Run this entire script in your Supabase SQL Editor

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads', 
  false,
  20971520,
  ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']::text[]
)
ON CONFLICT (id) DO UPDATE
SET 
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']::text[];

-- 2. Create participant_info table
CREATE TABLE IF NOT EXISTS public.participant_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  reward_email TEXT NOT NULL,
  location TEXT NOT NULL,
  college TEXT NOT NULL,
  college_other TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable Row Level Security on participant_info
ALTER TABLE public.participant_info ENABLE ROW LEVEL SECURITY;

-- 4. Create policies for participant_info
CREATE POLICY "Users can view own participant info" ON public.participant_info
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own participant info" ON public.participant_info
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participant info" ON public.participant_info
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_participant_info_updated_at
  BEFORE UPDATE ON public.participant_info
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Create indexes
CREATE INDEX IF NOT EXISTS participant_info_user_id_idx ON public.participant_info(user_id);
CREATE INDEX IF NOT EXISTS participant_info_email_idx ON public.participant_info(reward_email);

-- 7. Grant permissions
GRANT ALL ON public.participant_info TO authenticated;