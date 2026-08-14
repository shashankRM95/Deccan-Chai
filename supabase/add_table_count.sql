-- Run this in your Supabase SQL Editor to add table_count to outlets
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS table_count INTEGER DEFAULT 10;

-- Set default count for your existing Jubilee Hills outlet

UPDATE outlets SET table_count = 10 WHERE name ILIKE '%jubilee%' OR name ILIKE '%deccan%';