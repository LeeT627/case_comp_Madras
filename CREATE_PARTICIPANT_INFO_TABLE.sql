-- Create participant_info table for storing participant details
CREATE TABLE IF NOT EXISTS participant_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  location TEXT NOT NULL,
  college TEXT NOT NULL,
  college_other TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_participant_info_user_id ON participant_info(user_id);

-- Enable RLS for participant_info
ALTER TABLE participant_info ENABLE ROW LEVEL SECURITY;

-- Admin can do everything on participant_info
CREATE POLICY "Admin can manage participant info" ON participant_info
  FOR ALL
  USING (true)
  WITH CHECK (true);