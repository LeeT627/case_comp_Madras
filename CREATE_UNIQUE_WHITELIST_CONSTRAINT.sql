-- Add UNIQUE constraint to prevent multiple users from claiming the same whitelisted email
-- This ensures each whitelisted email can only be used once

-- First, check if any duplicates exist
SELECT whitelisted_email, COUNT(*) as count
FROM whitelisted_emails
GROUP BY whitelisted_email
HAVING COUNT(*) > 1;

-- If duplicates exist, you'll need to clean them up first
-- DELETE FROM whitelisted_emails WHERE id NOT IN (
--   SELECT MIN(id) FROM whitelisted_emails GROUP BY whitelisted_email
-- );

-- Add the unique constraint
ALTER TABLE whitelisted_emails 
ADD CONSTRAINT unique_whitelisted_email UNIQUE (whitelisted_email);

-- Verify the constraint was added
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'whitelisted_emails'::regclass;