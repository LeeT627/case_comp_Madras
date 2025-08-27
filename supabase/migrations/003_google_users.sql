-- Create table for Google Sign-In users
-- These are REAL Google authenticated users stored in OUR database
-- NOT connected to GPAI, but UI makes it appear so
CREATE TABLE IF NOT EXISTS google_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id TEXT UNIQUE NOT NULL, -- Google's 'sub' field (stable user ID)
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_google_users_email ON google_users(email);
CREATE INDEX IF NOT EXISTS idx_google_users_google_id ON google_users(google_id);

-- Enable RLS
ALTER TABLE google_users ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin can manage google users" ON google_users
  FOR ALL
  USING (true)
  WITH CHECK (true);