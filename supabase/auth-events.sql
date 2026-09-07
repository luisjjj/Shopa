-- Auth security event log (best-effort; app works without it).
CREATE TABLE IF NOT EXISTS auth_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL,
  identifier text NOT NULL,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS auth_events_type_idx ON auth_events(type);
CREATE INDEX IF NOT EXISTS auth_events_created_idx ON auth_events(created_at);
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
