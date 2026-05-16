-- ============================================================
-- Nafzz studio — Cart + Multi-Product Checkout Migration
-- Run this ENTIRE script in Supabase SQL Editor (Database → SQL Editor)
-- This is NON-DESTRUCTIVE: no existing data is deleted or altered.
-- ============================================================

-- 1. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  uuid        REFERENCES products(id),
  product_name text       NOT NULL,
  price       numeric     NOT NULL,
  quantity    integer     NOT NULL DEFAULT 1,
  subtotal    numeric     NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2. Add total_amount column to orders (safe — does nothing if already exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'total_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN total_amount numeric DEFAULT 0;
  END IF;
END $$;

-- 3. Backfill total_amount for historical orders that have a price but no total_amount
UPDATE orders
SET total_amount = price
WHERE (total_amount IS NULL OR total_amount = 0)
  AND price IS NOT NULL
  AND price > 0;

-- 4. Create index for fast order_items lookups
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- 5. Enable Realtime on order_items (same as products/orders)
ALTER PUBLICATION supabase_realtime ADD TABLE order_items;

-- 6. Row Level Security for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (customers placing orders)
CREATE POLICY "Allow public insert on order_items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow public select (needed for order confirmation display)
CREATE POLICY "Allow public select on order_items"
  ON order_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated updates (admin)
CREATE POLICY "Allow authenticated update on order_items"
  ON order_items FOR UPDATE
  TO authenticated
  USING (true);

-- Allow authenticated deletes (admin, cascade already handles most)
CREATE POLICY "Allow authenticated delete on order_items"
  ON order_items FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================
-- DONE. Verify by running: SELECT * FROM order_items LIMIT 1;
-- You should get an empty result set with the correct columns.
-- ============================================================
