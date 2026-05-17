-- ============================================================
-- Nafzz Studio — Digital Product System Migration
-- SAFE: All statements are idempotent (re-runnable)
-- ZERO IMPACT on existing products/orders tables
-- ============================================================

-- 1. Digital Products table
CREATE TABLE IF NOT EXISTS digital_products (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text        NOT NULL,
  description       text,
  price             numeric     NOT NULL,
  preview_image_url text,
  original_pdf_path text        NOT NULL,
  product_type      text        DEFAULT 'digital',
  is_active         boolean     DEFAULT true,
  created_at        timestamptz DEFAULT now()
);



-- 5. Enable Realtime (idempotent check)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'digital_products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE digital_products;
  END IF;
END $$;



-- 6. Row Level Security — digital_products
ALTER TABLE digital_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read digital_products" ON digital_products;
CREATE POLICY "Public read digital_products"
  ON digital_products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Auth insert digital_products" ON digital_products;
CREATE POLICY "Auth insert digital_products"
  ON digital_products FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Auth update digital_products" ON digital_products;
CREATE POLICY "Auth update digital_products"
  ON digital_products FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete digital_products" ON digital_products;
CREATE POLICY "Auth delete digital_products"
  ON digital_products FOR DELETE TO authenticated USING (true);



-- ============================================================
-- DONE. After running, create these storage buckets manually:
--   1. "digital-previews" → PUBLIC bucket
-- ============================================================
