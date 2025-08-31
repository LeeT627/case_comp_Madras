-- Create table to track sign-in button clicks
CREATE TABLE IF NOT EXISTS signin_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  session_id TEXT,
  user_id TEXT -- Will be null for non-authenticated users
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_signin_clicks_clicked_at ON signin_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_signin_clicks_user_id ON signin_clicks(user_id);

-- Enable RLS
ALTER TABLE signin_clicks ENABLE ROW LEVEL SECURITY;

-- Admin policy for reading data
CREATE POLICY "Admin can view signin clicks" ON signin_clicks
  FOR SELECT
  USING (true);

-- Public policy for inserting (tracking)
CREATE POLICY "Public can insert signin clicks" ON signin_clicks
  FOR INSERT
  WITH CHECK (true);

-- Get total count
SELECT COUNT(*) as total_signin_clicks FROM signin_clicks;

-- Get clicks by day
SELECT 
  DATE(clicked_at) as date,
  COUNT(*) as clicks
FROM signin_clicks
GROUP BY DATE(clicked_at)
ORDER BY date DESC
LIMIT 30;