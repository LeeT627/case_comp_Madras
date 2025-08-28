-- RUN THIS IN SUPABASE SQL EDITOR TO DELETE TABLES
-- WARNING: This will permanently delete all data in these tables!

-- Drop policies first (required before dropping tables with RLS)
DROP POLICY IF EXISTS "Admin can manage user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admin can manage verification codes" ON email_verification_codes;

-- Drop indexes
DROP INDEX IF EXISTS idx_user_profiles_user_id;
DROP INDEX IF EXISTS idx_user_profiles_school_email;
DROP INDEX IF EXISTS idx_verification_codes_user_id;
DROP INDEX IF EXISTS idx_verification_codes_code;
DROP INDEX IF EXISTS idx_verification_codes_email;

-- Drop tables
DROP TABLE IF EXISTS email_verification_codes CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- If you also want to drop the google_users table (if it exists):
-- DROP TABLE IF EXISTS google_users CASCADE;