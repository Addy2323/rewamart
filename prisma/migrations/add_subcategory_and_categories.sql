-- Add subcategory field to products table
ALTER TABLE products ADD COLUMN subcategory VARCHAR(255);

-- Insert new categories
INSERT INTO categories (name, slug, description, image, created_at)
VALUES 
  ('Men''s Clothing', 'mens-clothing', 'Men''s fashion and accessories including shoes, suits, and more', '/images/categories/mens-clothing.jpg', NOW()),
  ('Women''s Clothing', 'womens-clothing', 'Women''s fashion and accessories including dresses, tops, and more', '/images/categories/womens-clothing.jpg', NOW()),
  ('Electronics', 'electronics', 'Electronic devices including computers, phones, and smartwatches', '/images/categories/electronics.jpg', NOW())
ON CONFLICT (name) DO NOTHING;

-- Optional: Update existing products with sample subcategories (if you have test data)
-- UPDATE products SET subcategory = 'Shoes' WHERE name ILIKE '%shoe%';
-- UPDATE products SET subcategory = 'Phones' WHERE name ILIKE '%phone%';
-- UPDATE products SET subcategory = 'Computers' WHERE name ILIKE '%laptop%' OR name ILIKE '%computer%';
