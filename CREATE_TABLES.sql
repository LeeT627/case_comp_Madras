-- RUN THIS IN SUPABASE SQL EDITOR
-- This creates both required tables for school email verification

-- 1. Create user_profiles table for GPAI users to track school email verification
CREATE TABLE IF NOT EXISTS user_profiles (
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
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_school_email ON user_profiles(school_email);

-- Enable RLS for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on user_profiles
CREATE POLICY "Admin can manage user profiles" ON user_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Create table for storing email verification codes
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for email_verification_codes
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON email_verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON email_verification_codes(email);

-- Enable RLS for email_verification_codes
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on email_verification_codes
CREATE POLICY "Admin can manage verification codes" ON email_verification_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);