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

-- 2. Digital Orders table
CREATE TABLE IF NOT EXISTS digital_orders (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_product_id  uuid        NOT NULL REFERENCES digital_products(id),
  customer_name       text        NOT NULL,
  phone               text        NOT NULL,
  transaction_id      text        UNIQUE NOT NULL,
  amount              numeric     NOT NULL,
  payment_status      text        DEFAULT 'self_confirmed',
  download_enabled    boolean     DEFAULT false,
  download_count      integer     DEFAULT 0,
  download_limit      integer     DEFAULT 3,
  created_at          timestamptz DEFAULT now()
);

-- 3. Download Logs table
CREATE TABLE IF NOT EXISTS digital_download_logs (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  digital_order_id  uuid        NOT NULL REFERENCES digital_orders(id) ON DELETE CASCADE,
  downloaded_at     timestamptz DEFAULT now(),
  ip_address        text,
  user_agent        text
);

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_digital_orders_product ON digital_orders(digital_product_id);
CREATE INDEX IF NOT EXISTS idx_digital_orders_txn ON digital_orders(transaction_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_order ON digital_download_logs(digital_order_id);

-- 5. Enable Realtime (idempotent check)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'digital_products'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE digital_products;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'digital_orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE digital_orders;
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

-- 7. Row Level Security — digital_orders
ALTER TABLE digital_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert digital_orders" ON digital_orders;
CREATE POLICY "Public insert digital_orders"
  ON digital_orders FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public select digital_orders" ON digital_orders;
CREATE POLICY "Public select digital_orders"
  ON digital_orders FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public update digital_orders" ON digital_orders;
CREATE POLICY "Public update digital_orders"
  ON digital_orders FOR UPDATE TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Auth delete digital_orders" ON digital_orders;
CREATE POLICY "Auth delete digital_orders"
  ON digital_orders FOR DELETE TO authenticated USING (true);

-- 8. Row Level Security — digital_download_logs
ALTER TABLE digital_download_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert download_logs" ON digital_download_logs;
CREATE POLICY "Public insert download_logs"
  ON digital_download_logs FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public select download_logs" ON digital_download_logs;
CREATE POLICY "Public select download_logs"
  ON digital_download_logs FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- DONE. After running, create these storage buckets manually:
--   1. "digital-previews" → PUBLIC bucket
--   2. "digital-originals" → PRIVATE bucket (critical!)
-- ============================================================
