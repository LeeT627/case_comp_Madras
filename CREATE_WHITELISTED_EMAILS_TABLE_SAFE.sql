-- Safe version that checks if objects already exist

-- Create table only if it doesn't exist
CREATE TABLE IF NOT EXISTS whitelisted_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  whitelisted_email TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  gpai_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes only if they don't exist
CREATE INDEX IF NOT EXISTS idx_whitelisted_emails_user_id ON whitelisted_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_whitelisted_emails_email ON whitelisted_emails(whitelisted_email);

-- Enable RLS (safe to run multiple times)
ALTER TABLE whitelisted_emails ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then recreate
DROP POLICY IF EXISTS "Admin can manage whitelisted emails" ON whitelisted_emails;
CREATE POLICY "Admin can manage whitelisted emails" ON whitelisted_emails
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Check if table was created successfully
SELECT 'Table created successfully!' as message;

-- View current data
SELECT * FROM whitelisted_emails;