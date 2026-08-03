-- Add new storefront settings columns
-- Run this in Supabase SQL Editor

ALTER TABLE storefront_settings
ADD COLUMN IF NOT EXISTS product_name_size text DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS price_style text DEFAULT 'bold',
ADD COLUMN IF NOT EXISTS card_padding text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS card_border text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS card_shadow text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS container_width text DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS product_image_ratio text DEFAULT 'square';
