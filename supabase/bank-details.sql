-- Add bank detail fields to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_number text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_name text;

-- Add confirmed_by_buyer to orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_by_buyer boolean DEFAULT false;
