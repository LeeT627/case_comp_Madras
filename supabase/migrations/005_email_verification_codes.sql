-- Create table for storing email verification codes
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_code ON email_verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON email_verification_codes(email);

-- Enable RLS
ALTER TABLE email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admin can manage verification codes" ON email_verification_codes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Clean up expired codes automatically (optional, can be run periodically)
-- DELETE FROM email_verification_codes WHERE expires_at < NOW();