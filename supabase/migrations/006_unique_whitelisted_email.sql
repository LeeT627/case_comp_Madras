-- Add a unique constraint to the whitelisted_email column to ensure it can only be used once.
-- This prevents multiple users from claiming the same whitelisted email.

ALTER TABLE public.whitelisted_emails
ADD CONSTRAINT whitelisted_emails_whitelisted_email_key UNIQUE (whitelisted_email);
