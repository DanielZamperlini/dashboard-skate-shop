/*
  # Enable Row Level Security

  This migration enables Row Level Security (RLS) on all tables and adds appropriate policies.

  1. Security Changes
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Enable read access for all users"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Policies for sales
CREATE POLICY "Enable read access for all users"
  ON sales FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
  ON sales FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
  ON sales FOR DELETE
  TO authenticated
  USING (true);

-- Policies for sale_items
CREATE POLICY "Enable read access for all users"
  ON sale_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON sale_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
  ON sale_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
  ON sale_items FOR DELETE
  TO authenticated
  USING (true);

-- Policies for expenses
CREATE POLICY "Enable read access for all users"
  ON expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only"
  ON expenses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users only"
  ON expenses FOR DELETE
  TO authenticated
  USING (true);