/*
  # Add customers management
  
  1. New Tables
    - customers: Store customer information
      - id (text, primary key)
      - name (text)
      - phone (text)
      - created_at (timestamp)
      - updated_at (timestamp)
      - notes (text, optional)
  
  2. Changes
    - Add customer_id to sales table
    - Add indexes for better performance
    
  3. Security
    - Enable RLS on customers table
    - Add policies for authenticated users
*/

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Add customer_id to sales
ALTER TABLE sales ADD COLUMN customer_id TEXT REFERENCES customers(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read access for all users"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
  ON customers FOR DELETE
  TO authenticated
  USING (true);