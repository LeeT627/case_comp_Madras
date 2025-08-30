-- Create a separate table to track whitelisted email verifications
CREATE TABLE IF NOT EXISTS whitelisted_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  whitelisted_email TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  gpai_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whitelisted_emails_user_id ON whitelisted_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_whitelisted_emails_email ON whitelisted_emails(whitelisted_email);

-- Enable RLS for whitelisted_emails
ALTER TABLE whitelisted_emails ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on whitelisted_emails
CREATE POLICY "Admin can manage whitelisted emails" ON whitelisted_emails
  FOR ALL
  USING (true)
  WITH CHECK (true);