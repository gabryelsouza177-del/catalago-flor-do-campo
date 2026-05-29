-- Ensure necessary columns exist in orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS recipient_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;

-- If items was somehow not jsonb, we keep it as is or ensure it can handle text, 
-- but normally jsonb is better. However, to follow user's 'definitiva' fix 
-- if they want to send text, we can keep it as jsonb but ensures the app sends valid JSON.
-- If the user really wants it to be TEXT to avoid any issues, we'd have to cast it.
-- But let's stick to fixing the frontend sending.
