-- 1. Create order_items table (Safe: skips if exists)
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

-- 2. Add columns to existing tables (Safe: uses check blocks)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
    ALTER TABLE orders ADD COLUMN total_amount numeric DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'category') THEN
    ALTER TABLE products ADD COLUMN category text DEFAULT 'General';
  END IF;
END $$;

-- 3. Update Realtime (Safe: check if table is already in publication)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'order_items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE order_items;
  END IF;
END $$;

-- 4. Set up Security (Safe: drops old versions first)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public insert on order_items" ON order_items;
CREATE POLICY "Allow public insert on order_items" ON order_items FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select on order_items" ON order_items;
CREATE POLICY "Allow public select on order_items" ON order_items FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated update on order_items" ON order_items;
CREATE POLICY "Allow authenticated update on order_items" ON order_items FOR UPDATE TO authenticated USING (true);

-- 5. Backfill historical data (Safe: only updates zeros)
UPDATE orders SET total_amount = price WHERE (total_amount IS NULL OR total_amount = 0) AND price > 0;

-- 6. Speed up queries
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
