-- Fix the reward_email column issue in participant_info table
-- Option 1: Make the column nullable (safer, keeps existing data)
ALTER TABLE participant_info 
ALTER COLUMN reward_email DROP NOT NULL;

-- Option 2: Drop the column entirely (use this if you don't need it at all)
-- ALTER TABLE participant_info DROP COLUMN reward_email;