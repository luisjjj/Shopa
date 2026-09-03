-- Shopa marketplace payouts (Paystack Split Payments / Subaccounts).
-- Run in Supabase SQL editor BEFORE enabling the Paystack purchase flow.
-- Existing bank_name/account_number/account_name columns are kept for
-- rollback; the subaccount code is the new source of truth for payouts.

ALTER TABLE users ADD COLUMN IF NOT EXISTS paystack_subaccount_code text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_code text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS payout_setup_completed_at timestamptz;

-- Optional: speed up "sellers missing payout setup" lookups
CREATE INDEX IF NOT EXISTS users_subaccount_idx ON users(paystack_subaccount_code);
