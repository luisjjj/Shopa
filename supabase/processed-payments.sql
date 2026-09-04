-- Idempotency for subscription upgrades: each Paystack reference may only
-- grant premium time once. Run in Supabase SQL editor.
CREATE TABLE IF NOT EXISTS processed_payments (
  reference text PRIMARY KEY,
  user_id uuid NOT NULL,
  plan text NOT NULL,
  amount_kobo integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE processed_payments ENABLE ROW LEVEL SECURITY;
