-- COMPLETE MENU SETUP FOR CEFA DATABASE
-- Paste this entire file into the Supabase SQL Editor and click Run

-- Clear existing items to avoid duplicates
DELETE FROM menu_items;

-- ======= MILK TEA =======
INSERT INTO menu_items (name, category, price, description, image, popular, available, prep_time, sort_order) VALUES
('Deccan Chai', 'Milk Tea', 20, 'Our signature Hyderabadi chai — strong, milky, perfectly brewed.', '/images/menu/deccan-chai.jpg', true, true, 6, 1),
('Elaichi Tea', 'Milk Tea', 20, 'Aromatic cardamom-infused milk tea.', '/images/menu/elaichi-tea.jpg', false, true, 6, 2),
('Kadak Tea', 'Milk Tea', 20, 'Extra-strong, extra-simmered chai for the bold.', '/images/menu/kadak-tea.jpg', false, true, 7, 3),
('Badam Tea', 'Milk Tea', 20, 'Almond-enriched chai with a nutty finish.', '/images/menu/badam-tea.jpg', false, true, 7, 4),
('Masala Tea', 'Milk Tea', 20, 'Seven-spice blend simmered slow.', '/images/menu/masala-tea.jpg', true, true, 7, 5),
('Ginger Tea', 'Milk Tea', 20, 'Fresh ginger crushed into comforting milk tea.', '/images/menu/ginger-tea.jpg', false, true, 6, 6),
('Ginger Lemon Tea', 'Milk Tea', 20, 'Ginger and lemon brewed for immunity.', '/images/menu/ginger-lemon-tea.jpg', false, true, 6, 8);

-- ======= COFFEE =======
INSERT INTO menu_items (name, category, price, description, image, popular, available, prep_time, sort_order) VALUES
('Coffee', 'Coffee', 25, 'South Indian filter coffee with frothy milk.', '/images/menu/coffee.jpg', true, true, 5, 1),
('Black Coffee', 'Coffee', 20, 'Bold, unfiltered decoction for purists.', '/images/menu/black-coffee.jpg', false, true, 4, 2),
('Dark Chocolate', 'Coffee', 25, 'Espresso meets melted dark chocolate.', '/images/menu/dark-chocolate.jpg', false, true, 6, 3),
('Irish Cream', 'Coffee', 25, 'Creamy Irish-flavoured coffee.', '/images/menu/irish-cream.jpg', false, true, 6, 4),
('Allam Bellam', 'Coffee', 25, 'Ginger and jaggery coffee — a Hyderabadi winter ritual.', '/images/menu/allam-bellam.jpg', false, true, 6, 5);

-- ======= BELLAM FLAVOURS =======
INSERT INTO menu_items (name, category, price, description, image, popular, available, prep_time, sort_order) VALUES
('Thati Bellam Tea', 'Bellam Flavours', 20, 'Traditional palm jaggery tea, naturally sweet and aromatic.', '/images/menu/thati-bellam-tea.jpg', true, true, 5, 1),
('Thati Bellam Coffee', 'Bellam Flavours', 20, 'Palm jaggery coffee with rich, earthy sweetness.', '/images/menu/thati-bellam-coffee.jpg', false, true, 5, 2),
('Bellam Tea', 'Bellam Flavours', 20, 'Classic palm jaggery tea, slow-simmered for natural sweetness.', '/images/menu/bellam-tea.jpg', false, true, 7, 3),
('Allam Bellam Coffee', 'Bellam Flavours', 25, 'Ginger and palm jaggery coffee — a warming Hyderabadi classic.', '/images/menu/allam-bellam-coffee.jpg', true, true, 6, 4);

-- ======= MILK SHAKES =======
INSERT INTO menu_items (name, category, price, description, image, popular, available, prep_time, sort_order) VALUES
('Oreo', 'Milk Shakes', 70, 'Crushed Oreo blended with creamy milk.', '/images/menu/oreo.jpg', true, true, 5, 1),
('Strawberry', 'Milk Shakes', 60, 'Fresh strawberry pulp blended thick.', '/images/menu/strawberry.jpg', false, true, 5, 2),
('Mango', 'Milk Shakes', 70, 'Alphonso mango shaken with chilled milk.', '/images/menu/mango.jpg', true, true, 5, 3),
('Pineapple', 'Milk Shakes', 60, 'Tropical pineapple blended creamy.', '/images/menu/pineapple.jpg', false, true, 5, 4),
('Black Current', 'Milk Shakes', 70, 'Rich black currant shake.', '/images/menu/black-current.jpg', false, true, 5, 5);

-- ======= CHILLERS =======
INSERT INTO menu_items (name, category, price, description, image, popular, available, prep_time, sort_order) VALUES
('Rose Milk', 'Chillers', 50, 'Chilled rose-flavoured milk.', '/images/menu/rose-milk.jpg', false, true, 4, 1),
('Chilled Badam', 'Chillers', 60, 'Cold almond-flavoured milk.', '/images/menu/chilled-badam.jpg', false, true, 4, 2),
('Cold Coffee', 'Chillers', 80, 'Frothy iced coffee blended with milk.', '/images/menu/cold-coffee.jpg', true, true, 5, 3);

-- ======= LASSIES =======
INSERT INTO menu_items (name, category, price, description, image, popular, available, prep_time, sort_order) VALUES
('Sweet Lassi', 'Lassies', 40, 'Classic sweet yoghurt lassi.', '/images/menu/sweet-lassi.jpg', false, true, 4, 1),
('Strawberry Lassi', 'Lassies', 60, 'Strawberry-flavoured creamy lassi.', '/images/menu/strawberry-lassi.jpg', false, true, 4, 2),
('Chocolate Lassi', 'Lassies', 60, 'Rich chocolate blended lassi.', '/images/menu/chocolate-lassi.jpg', false, true, 4, 3),
('Banana Lassi', 'Lassies', 50, 'Fresh banana creamy lassi.', '/images/menu/banana-lassi.jpg', false, true, 4, 4),
('Mango Lassi', 'Lassies', 50, 'Thick mango yogurt smoothie, refreshingly creamy.', '/images/menu/mango-lassi.jpg', true, true, 4, 5);

-- ======= IMMUNE TEAS =======
INSERT INTO menu_items (name, category, price, description, image, popular, available, prep_time, sort_order) VALUES
('Black Tea', 'Immune Teas', 20, 'Pure black tea for immunity.', '/images/menu/black-tea.jpg', false, true, 4, 1),
('Lemon Tea', 'Immune Teas', 20, 'Zesty lemon brew for immunity.', '/images/menu/lemon-tea.jpg', false, true, 4, 2),
('Green Tea', 'Immune Teas', 25, 'Antioxidant-rich green leaf tea.', '/images/menu/green-tea.jpg', false, true, 4, 3);

-- ======= MOJITOS =======
INSERT INTO menu_items (name, category, price, description, image, popular, available, prep_time, sort_order) VALUES
('Blue Mojito', 'Mojitos', 70, 'Blue curacao with mint and soda.', '/images/menu/blue-mojito.jpg', true, true, 4, 1),
('Water Melon', 'Mojitos', 60, 'Juicy watermelon muddled with mint.', '/images/menu/water-melon.jpg', false, true, 4, 2),
('Lime Mint', 'Mojitos', 50, 'Classic lime and mint mojito.', '/images/menu/lime-mint.jpg', false, true, 4, 3),
('Strawberry Mojito', 'Mojitos', 60, 'Fresh strawberry mojito.', '/images/menu/strawberry-mojito.jpg', false, true, 4, 4),
('Mango Mojito', 'Mojitos', 59, 'Fresh mango, mint, and lime over crushed ice.', '/images/menu/mango-mojito.jpg', true, true, 5, 5);

-- ======= SNACKS =======
INSERT INTO menu_items (name, category, price, description, image, popular, available, prep_time, sort_order) VALUES
('Osmania Biscuit', 'Snacks', 15, 'Flaky, buttery Hyderabadi biscuits.', '/images/menu/osmania-biscuit.jpg', true, true, 3, 1),
('Samosa', 'Snacks', 20, 'Crispy pastry with spiced potato filling.', '/images/menu/samosa.jpg', true, true, 4, 2),
('Veg Puff', 'Snacks', 15, 'Golden puff with masala vegetables.', '/images/menu/veg-puff.jpg', false, true, 3, 3),
('Egg Puff', 'Snacks', 25, 'Flaky puff with spiced egg filling.', '/images/menu/egg-puff.jpg', false, true, 3, 4);