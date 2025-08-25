-- PARTICIPANT INFO TABLE SETUP FOR GPAI CASE COMPETITION
-- Run this in your Supabase SQL Editor after the bucket setup

-- 1. Create participant_info table
CREATE TABLE IF NOT EXISTS public.participant_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  reward_email TEXT NOT NULL,
  location TEXT NOT NULL,
  college TEXT NOT NULL,
  college_other TEXT, -- For manual entry when "Other" is selected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Enable Row Level Security
ALTER TABLE public.participant_info ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies

-- Users can view their own info
CREATE POLICY "Users can view own participant info" ON public.participant_info
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own info
CREATE POLICY "Users can insert own participant info" ON public.participant_info
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own info
CREATE POLICY "Users can update own participant info" ON public.participant_info
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users cannot delete their info (admin only)
-- No DELETE policy for users

-- 4. Create updated_at trigger
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

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS participant_info_user_id_idx ON public.participant_info(user_id);
CREATE INDEX IF NOT EXISTS participant_info_email_idx ON public.participant_info(reward_email);

-- 6. Grant permissions
GRANT ALL ON public.participant_info TO authenticated;

-- 7. Verify the table was created
SELECT * FROM public.participant_info LIMIT 1;