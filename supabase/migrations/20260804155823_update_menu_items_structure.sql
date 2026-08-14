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
