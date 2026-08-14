/*
# Deccan Chai Platform Schema

## Overview
Creates the full database schema for the Deccan Chai multi-dashboard platform:
- Customer authentication, profiles, orders, loyalty, addresses, favorites
- Owner store management, menu, inventory, staff, analytics
- Outlet locations and settings

## New Tables
1. `profiles` — extends auth.users with full_name, phone, role, loyalty_points, tier
2. `outlets` — store locations with name, city, address, phone, hours, lat/lng, amenities
3. `menu_items` — all menu items with category, price, description, image, prep_time, availability
4. `orders` — customer orders linked to outlet, table number, status, totals, payment info
5. `order_items` — line items per order with customization details
6. `inventory` — stock tracking per outlet with status levels
7. `staff` — employee records per outlet with role, shift, attendance
8. `loyalty_transactions` — points earned/redeemed log per customer
9. `addresses` — saved customer addresses
10. `favorites` — customer favorite menu items

## Security
- RLS enabled on ALL tables
- profiles: users read/update own; owners read all for customer mgmt
- outlets, menu_items: public read; owner-scoped writes
- orders: customer reads own; owner reads all; both insert
- order_items: scoped through parent order
- inventory, staff: owner-scoped
- loyalty: customer reads own; owner reads all
- addresses, favorites: customer-scoped CRUD

## Important Notes
1. profiles.role defaults to 'customer'; owners set manually
2. orders.user_id defaults to auth.uid() for customer orders
3. Owner access determined by profiles.role = 'owner'
4. Monetary values stored as numeric(10,2)
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner', 'admin')),
  loyalty_points integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'Silver' CHECK (tier IN ('Silver', 'Gold', 'Platinum')),
  outlet_id uuid,
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- OUTLETS
CREATE TABLE IF NOT EXISTS outlets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  area text NOT NULL,
  address text NOT NULL,
  phone text NOT NULL DEFAULT '+91 9852128128',
  hours text NOT NULL DEFAULT 'Mon - Sat: 9am - 7pm',
  lat numeric(10,6) DEFAULT 17.4325,
  lng numeric(10,6) DEFAULT 78.4071,
  amenities text[] DEFAULT '{}',
  dine_in boolean DEFAULT true,
  takeaway boolean DEFAULT true,
  delivery boolean DEFAULT false,
  tax_sgst numeric(5,2) DEFAULT 5.00,
  tax_cgst numeric(5,2) DEFAULT 5.00,
  created_at timestamptz DEFAULT now()
);

-- Add FK from profiles to outlets after outlets exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_outlet_id_fkey' AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_outlet_id_fkey
      FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE SET NULL;
  END IF;
END $$;

-- MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric(10,2) NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  prep_time integer DEFAULT 5,
  popular boolean DEFAULT false,
  available boolean DEFAULT true,
  seasonal boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  outlet_id uuid REFERENCES outlets(id) ON DELETE SET NULL,
  table_number integer DEFAULT 0,
  status text NOT NULL DEFAULT 'Received' CHECK (status IN ('Received', 'Preparing', 'Ready', 'Served', 'Cancelled')),
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  tax numeric(10,2) NOT NULL DEFAULT 0,
  tip numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text DEFAULT 'Cash',
  payment_status text NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Refunded')),
  split_between integer DEFAULT 1,
  notes text DEFAULT '',
  placed_at timestamptz DEFAULT now(),
  ready_at timestamptz
);

-- ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE SET NULL,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  sugar_level text DEFAULT 'Medium',
  milk_type text DEFAULT 'Regular',
  temperature text DEFAULT 'Hot',
  notes text DEFAULT ''
);

-- INVENTORY
CREATE TABLE IF NOT EXISTS inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id uuid NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  unit text NOT NULL DEFAULT 'kg',
  current_stock numeric(10,2) NOT NULL DEFAULT 0,
  min_stock numeric(10,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'OK' CHECK (status IN ('OK', 'LOW', 'CRITICAL')),
  last_restocked date,
  created_at timestamptz DEFAULT now()
);

-- STAFF
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outlet_id uuid NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Server' CHECK (role IN ('Manager', 'Tea Maker', 'Server', 'Cashier', 'Cleaner')),
  shift text NOT NULL DEFAULT 'Morning' CHECK (shift IN ('Morning', 'Afternoon', 'Evening', 'Full')),
  phone text DEFAULT '',
  present boolean DEFAULT true,
  salary numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- LOYALTY TRANSACTIONS
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  points integer NOT NULL,
  type text NOT NULL CHECK (type IN ('earned', 'redeemed')),
  description text DEFAULT '',
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- ADDRESSES
CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  full_address text NOT NULL,
  city text DEFAULT '',
  pincode text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, menu_item_id)
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_outlet ON orders(outlet_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_outlet ON inventory(outlet_id);
CREATE INDEX IF NOT EXISTS idx_staff_outlet ON staff(outlet_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ============ RLS ============

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR is_owner());

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- OUTLETS: public read, owner write
DROP POLICY IF EXISTS "read_outlets" ON outlets;
CREATE POLICY "read_outlets" ON outlets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_write_outlets" ON outlets;
CREATE POLICY "owner_write_outlets" ON outlets FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  );

-- MENU ITEMS: public read, owner write
DROP POLICY IF EXISTS "read_menu_items" ON menu_items;
CREATE POLICY "read_menu_items" ON menu_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "owner_write_menu" ON menu_items;
CREATE POLICY "owner_write_menu" ON menu_items FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  );

-- ORDERS
DROP POLICY IF EXISTS "select_orders" ON orders;
CREATE POLICY "select_orders" ON orders FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

DROP POLICY IF EXISTS "insert_orders" ON orders;
CREATE POLICY "insert_orders" ON orders FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
  ));

DROP POLICY IF EXISTS "update_orders" ON orders;
CREATE POLICY "update_orders" ON orders FOR UPDATE
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  ) WITH CHECK (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

-- ORDER ITEMS
DROP POLICY IF EXISTS "select_order_items" ON order_items;
CREATE POLICY "select_order_items" ON order_items FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner')))
  );

DROP POLICY IF EXISTS "insert_order_items" ON order_items;
CREATE POLICY "insert_order_items" ON order_items FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR
      EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner')))
  );

-- INVENTORY: owner-scoped
DROP POLICY IF EXISTS "owner_all_inventory" ON inventory;
CREATE POLICY "owner_all_inventory" ON inventory FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  );

-- STAFF: owner-scoped
DROP POLICY IF EXISTS "owner_all_staff" ON staff;
CREATE POLICY "owner_all_staff" ON staff FOR ALL
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner')
  );

-- LOYALTY
DROP POLICY IF EXISTS "select_loyalty" ON loyalty_transactions;
CREATE POLICY "select_loyalty" ON loyalty_transactions FOR SELECT
  TO authenticated USING (
    auth.uid() = user_id OR EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
    )
  );

DROP POLICY IF EXISTS "insert_loyalty" ON loyalty_transactions;
CREATE POLICY "insert_loyalty" ON loyalty_transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id OR EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'owner'
  ));

-- ADDRESSES
DROP POLICY IF EXISTS "select_own_addresses" ON addresses;
CREATE POLICY "select_own_addresses" ON addresses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_addresses" ON addresses;
CREATE POLICY "insert_own_addresses" ON addresses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_addresses" ON addresses;
CREATE POLICY "update_own_addresses" ON addresses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_addresses" ON addresses;
CREATE POLICY "delete_own_addresses" ON addresses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- FAVORITES
DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites" ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites" ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites" ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);


/*
# Update Menu Structure

## Summary
Restructures the menu to match the desired Deccan Chai menu layout:
- Removes Herbal Teas section (Nannari, Aswagandha)
- Removes Thick Shakes section (all 7 items)
- Removes Ginger Iced Tea and Mint Margarita from Mojitos
- Removes Black Tea from Milk Tea (duplicate with Immune Teas)
- Moves Bellam Tea from Milk Tea to new Bellam Flavours category
- Adds new Bellam Flavours section: Thati Bellam Tea, Thati Bellam Coffee, Allam Bellam Coffee
- Adds Mango Lassi to Lassies
- Adds Mango Mojito to Mojitos
- Final: 9 categories, 41 items

## Changes
1. DELETE removed items from menu_items
2. UPDATE Bellam Tea category to 'Bellam Flavours'
3. INSERT new items with Pexels image URLs

## Security
No RLS changes — menu_items policies already allow public read and owner write.
*/

-- Remove Herbal Teas section
DELETE FROM menu_items WHERE category = 'Herbal Teas';

-- Remove Thick Shakes section
DELETE FROM menu_items WHERE category = 'Thick Shakes';

-- Remove specific Mojitos items
DELETE FROM menu_items WHERE name IN ('Ginger Iced Tea', 'Mint Margarita') AND category = 'Mojitos';

-- Remove Black Tea from Milk Tea (duplicate with Immune Teas)
DELETE FROM menu_items WHERE name = 'Black Tea' AND category = 'Milk Tea';

-- Move Bellam Tea to Bellam Flavours
UPDATE menu_items SET category = 'Bellam Flavours' WHERE name = 'Bellam Tea' AND category = 'Milk Tea';

-- Insert new Bellam Flavours items
INSERT INTO menu_items (name, category, price, description, image, prep_time, popular, available, sort_order)
VALUES
  ('Thati Bellam Tea', 'Bellam Flavours', 20.00, 'Traditional palm jaggery tea, naturally sweet and aromatic.', 'https://images.pexels.com/photos/1639282394118-6538b4f5a9e3?auto=compress&cs=tinysrgb&w=800', 5, true, true, 1),
  ('Thati Bellam Coffee', 'Bellam Flavours', 20.00, 'Palm jaggery coffee with rich, earthy sweetness.', 'https://images.pexels.com/photos/1559056199-641a0ac4b015?auto=compress&cs=tinysrgb&w=800', 5, false, true, 2),
  ('Allam Bellam Coffee', 'Bellam Flavours', 25.00, 'Ginger and palm jaggery coffee — a warming Hyderabadi classic.', 'https://images.pexels.com/photos/1559056199-641a0ac4b015?auto=compress&cs=tinysrgb&w=800', 6, true, true, 4);

-- Update Bellam Tea sort order and description
UPDATE menu_items SET sort_order = 3, description = 'Classic palm jaggery tea, slow-simmered for natural sweetness.' WHERE name = 'Bellam Tea' AND category = 'Bellam Flavours';

-- Add Mango Lassi to Lassies
INSERT INTO menu_items (name, category, price, description, image, prep_time, popular, available, sort_order)
VALUES ('Mango Lassi', 'Lassies', 50.00, 'Thick mango yogurt smoothie, refreshingly creamy.', 'https://images.pexels.com/photos/1626202378204-80b8a1b95d90?auto=compress&cs=tinysrgb&w=800', 4, true, true, 5);

-- Add Mango Mojito to Mojitos
INSERT INTO menu_items (name, category, price, description, image, prep_time, popular, available, sort_order)
VALUES ('Mango Mojito', 'Mojitos', 59.00, 'Fresh mango, mint, and lime over crushed ice.', 'https://images.pexels.com/photos/1629153262957-78f9b9d1c9e3?auto=compress&cs=tinysrgb&w=800', 5, true, true, 6);
