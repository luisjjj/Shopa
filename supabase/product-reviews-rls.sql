-- Product reviews: readable by everyone (storefronts), writable only via
-- the service role in /api/reviews (buyers are anonymous, the API enforces
-- paid-order + one-review-per-order). No public INSERT/UPDATE/DELETE.
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS product_reviews_public_read ON product_reviews;
CREATE POLICY product_reviews_public_read
  ON product_reviews FOR SELECT
  TO anon, authenticated
  USING (true);
