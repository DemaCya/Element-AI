-- Migration: Add Creem payment fields
-- This migration updates the payments table to support Creem integration

-- Add new columns to payments table
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS checkout_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS order_id TEXT,
ADD COLUMN IF NOT EXISTS customer_id TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update status enum to include 'refunded'
-- Note: PostgreSQL doesn't allow ALTER TYPE directly, so we need to work around it
DO $$ 
BEGIN
  -- Check if 'refunded' is already in the enum
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'refunded' 
    AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'payment_status')
  ) THEN
    -- If enum type exists, add new value
    BEGIN
      ALTER TYPE payment_status ADD VALUE 'refunded';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- If payment_status enum doesn't exist, the column might be TEXT
-- Let's make sure it can handle all statuses
DO $$
BEGIN
  -- Check if status column is TEXT type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' 
    AND column_name = 'status' 
    AND data_type = 'text'
  ) THEN
    -- Add constraint to ensure valid statuses
    ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
    ALTER TABLE payments ADD CONSTRAINT payments_status_check 
      CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));
  END IF;
END $$;

-- Create index on checkout_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_checkout_id ON payments(checkout_id);

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE payments IS 'Stores payment transactions from Creem and other payment providers';
COMMENT ON COLUMN payments.checkout_id IS 'Creem checkout session ID';
COMMENT ON COLUMN payments.order_id IS 'Creem order ID after successful payment';
COMMENT ON COLUMN payments.customer_id IS 'Creem customer ID';
COMMENT ON COLUMN payments.metadata IS 'Additional payment metadata from Creem';

