-- 7-day Premium free trial (one per account, Premium only, never Pro+).
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_trial boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_claimed_at timestamptz;
