-- Drag-and-drop storefront sections (website-builder layout).
-- Run in Supabase SQL editor. When a seller has NO rows here, the
-- storefront renders the legacy fixed layout, so existing stores are
-- unaffected until they arrange sections in Customize > Sections.
-- Section types: announcement | banner | header | featured | products |
-- text | socials | footer. Only "text" may repeat; the API enforces this.
CREATE TABLE IF NOT EXISTS storefront_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  type text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  visible boolean DEFAULT true,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS storefront_sections_user_idx
  ON storefront_sections(user_id, position);

ALTER TABLE storefront_sections ENABLE ROW LEVEL SECURITY;
