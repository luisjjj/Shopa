-- Buyer email verification codes (checkout OTP).
-- Run this in Supabase SQL editor, then checkout enforces verified emails.
CREATE TABLE IF NOT EXISTS buyer_otps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS buyer_otps_email_idx ON buyer_otps(email);

ALTER TABLE buyer_otps ENABLE ROW LEVEL SECURITY;
