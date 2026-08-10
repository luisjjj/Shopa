-- ============================================
-- PROMO CODES
-- ============================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code text NOT NULL,
  discount_percent integer,
  discount_amount integer,
  max_uses integer DEFAULT 0,
  used_count integer DEFAULT 0,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS promo_codes_seller_code_idx ON promo_codes(seller_id, code);

-- ============================================
-- PRODUCT VARIANTS
-- ============================================
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text NOT NULL,
  stock integer DEFAULT 0,
  price_override integer,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- PRODUCT REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  buyer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ORDERS: add delivery + promo + variant
-- ============================================
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS promo_code_id uuid;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS variant_id uuid;

-- ============================================
-- PRODUCTS: add category + has_variants
-- ============================================
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS has_variants boolean DEFAULT false;

-- ============================================
-- USERS: add pro_plus fields + store_count
-- ============================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro_plus boolean DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_plus_until timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS store_count integer DEFAULT 1;
