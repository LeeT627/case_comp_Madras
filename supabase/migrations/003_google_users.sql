-- Create table for Google users (separate from GPAI)
CREATE TABLE IF NOT EXISTS google_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_google_users_email ON google_users(email);

-- Enable RLS
ALTER TABLE google_users ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin can manage google users" ON google_users
  FOR ALL
  USING (true)
  WITH CHECK (true);