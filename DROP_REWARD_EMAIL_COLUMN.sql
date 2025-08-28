-- Drop the reward_email column from participant_info table
ALTER TABLE participant_info DROP COLUMN IF EXISTS reward_email;