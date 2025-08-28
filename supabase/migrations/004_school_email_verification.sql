-- Create user_profiles table for GPAI users to track school email verification
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- GPAI user ID
  auth_method TEXT NOT NULL CHECK (auth_method IN ('gpai')),
  school_email TEXT,
  school_email_verified BOOLEAN DEFAULT FALSE,
  school_email_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, auth_method)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_school_email ON user_profiles(school_email);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin can manage user profiles" ON user_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);