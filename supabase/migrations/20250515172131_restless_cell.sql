/*
  # Initial schema for skate shop management system
  
  1. New Tables
    - products: Store product information including inventory
    - sales: Track sales transactions
    - sale_items: Store individual items in each sale
    - expenses: Track business expenses
  
  2. Indexes
    - Products: category index for faster category filtering
    - Sales: indexes on paid status and creation date
    - Expenses: index on date for date range queries
*/

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  cost_price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  min_stock INTEGER DEFAULT 5,
  image_url TEXT,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  total REAL NOT NULL,
  paid BOOLEAN NOT NULL DEFAULT false,
  payment_method TEXT,
  notes TEXT,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
  payment_date timestamptz
);

-- Tabela de itens da venda
CREATE TABLE IF NOT EXISTS sale_items (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Tabela de despesas
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date timestamptz NOT NULL,
  notes TEXT,
  created_at timestamptz DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_sales_paid ON sales(paid);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);