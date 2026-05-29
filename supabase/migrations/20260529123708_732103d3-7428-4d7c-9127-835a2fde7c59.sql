-- Convert items column to TEXT to avoid JSON syntax issues
ALTER TABLE orders ALTER COLUMN items TYPE TEXT;

-- Ensure other columns exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
