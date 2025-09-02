-- COMPLETE DATABASE SETUP FOR CASE_COMP_MADRAS
-- Run this entire script in Supabase SQL Editor for the Madras instance
-- This includes all necessary tables and the unique email tracking system

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
-- Tracks GPAI users and their school email verification status
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  auth_method TEXT NOT NULL CHECK (auth_method IN ('gpai')),
  school_email TEXT,
  school_email_verified BOOLEAN DEFAULT FALSE,
  school_email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, auth_method)
);

-- Create indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_school_email ON public.user_profiles(school_email);

-- Enable RLS for user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on user_profiles
CREATE POLICY "Admin can manage user profiles" ON public.user_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 2. EMAIL VERIFICATION CODES TABLE
-- ============================================
-- Stores temporary verification codes for email verification
CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for email_verification_codes
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON public.email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON public.email_verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON public.email_verification_codes(email);

-- Enable RLS for email_verification_codes
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on email_verification_codes
CREATE POLICY "Admin can manage verification codes" ON public.email_verification_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 3. PARTICIPANT INFO TABLE
-- ============================================
-- Stores detailed participant information
CREATE TABLE IF NOT EXISTS public.participant_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  location TEXT NOT NULL,
  college TEXT NOT NULL,
  college_other TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create index for participant_info
CREATE INDEX IF NOT EXISTS idx_participant_info_user_id ON public.participant_info(user_id);

-- Enable RLS for participant_info
ALTER TABLE public.participant_info ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on participant_info
CREATE POLICY "Admin can manage participant info" ON public.participant_info
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 4. WHITELISTED EMAILS TABLE
-- ============================================
-- Stores pre-approved email addresses
CREATE TABLE IF NOT EXISTS public.whitelisted_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  whitelisted_email TEXT NOT NULL UNIQUE,
  gpai_email TEXT,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for whitelisted_emails
CREATE INDEX IF NOT EXISTS idx_whitelisted_emails_user_id ON public.whitelisted_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_whitelisted_emails_email ON public.whitelisted_emails(whitelisted_email);

-- Enable RLS for whitelisted_emails
ALTER TABLE public.whitelisted_emails ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on whitelisted_emails
CREATE POLICY "Admin can manage whitelisted emails" ON public.whitelisted_emails
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 5. SIGNIN CLICKS TRACKING TABLE
-- ============================================
-- Tracks sign-in attempts and clicks
CREATE TABLE IF NOT EXISTS public.signin_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT,
  user_id TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for signin_clicks
CREATE INDEX IF NOT EXISTS idx_signin_clicks_user_id ON public.signin_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_signin_clicks_session_id ON public.signin_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_signin_clicks_clicked_at ON public.signin_clicks(clicked_at DESC);

-- Enable RLS for signin_clicks
ALTER TABLE public.signin_clicks ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on signin_clicks
CREATE POLICY "Admin can manage signin clicks" ON public.signin_clicks
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- 6. UNIQUE EMAIL VERIFICATIONS TABLE (NEW!)
-- ============================================
-- Tracks emails verified in Madras that don't exist in Delhi database
CREATE TABLE IF NOT EXISTS public.unique_email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID NOT NULL,
  user_id TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  school_email TEXT,
  is_unique_to_madras BOOLEAN DEFAULT TRUE,
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_user_profile FOREIGN KEY (user_profile_id) 
    REFERENCES public.user_profiles(id) 
    ON DELETE CASCADE
);

-- Add indexes for unique_email_verifications
CREATE INDEX IF NOT EXISTS idx_unique_email_verifications_user_profile_id 
  ON public.unique_email_verifications(user_profile_id);
CREATE INDEX IF NOT EXISTS idx_unique_email_verifications_user_id 
  ON public.unique_email_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_unique_email_verifications_email 
  ON public.unique_email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_unique_email_verifications_school_email 
  ON public.unique_email_verifications(school_email);
CREATE INDEX IF NOT EXISTS idx_unique_email_verifications_is_unique 
  ON public.unique_email_verifications(is_unique_to_madras) 
  WHERE is_unique_to_madras = TRUE;

-- Enable RLS for unique_email_verifications
ALTER TABLE public.unique_email_verifications ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on unique_email_verifications
CREATE POLICY "Admin can manage unique email verifications" 
  ON public.unique_email_verifications
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add a comment to describe the table's purpose
COMMENT ON TABLE public.unique_email_verifications IS 
  'Tracks emails verified in the Madras database that are not present in the Delhi database. Used for cross-database uniqueness tracking.';

-- ============================================
-- 7. CREATE UPDATE TRIGGER FUNCTION
-- ============================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. ADD UPDATE TRIGGERS
-- ============================================
-- Add triggers to automatically update updated_at columns
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_participant_info_updated_at 
  BEFORE UPDATE ON public.participant_info
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_unique_email_verifications_updated_at 
  BEFORE UPDATE ON public.unique_email_verifications
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- 9. STORAGE BUCKET SETUP (Run separately in Storage section)
-- ============================================
-- Note: These commands should be run in the Supabase Storage section, not SQL Editor
-- 1. Create a bucket named 'case-documents' if it doesn't exist
-- 2. Make it public or configure appropriate policies

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify tables were created successfully:
/*
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check row counts (should be 0 initially):
SELECT 
  'user_profiles' as table_name, COUNT(*) as row_count FROM public.user_profiles
UNION ALL
SELECT 
  'email_verification_codes', COUNT(*) FROM public.email_verification_codes
UNION ALL
SELECT 
  'participant_info', COUNT(*) FROM public.participant_info
UNION ALL
SELECT 
  'whitelisted_emails', COUNT(*) FROM public.whitelisted_emails
UNION ALL
SELECT 
  'signin_clicks', COUNT(*) FROM public.signin_clicks
UNION ALL
SELECT 
  'unique_email_verifications', COUNT(*) FROM public.unique_email_verifications;
*/