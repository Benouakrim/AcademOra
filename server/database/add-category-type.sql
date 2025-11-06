-- Migration: Add type field to categories table
-- This enables dynamic category system supporting multiple category types
-- Run in Supabase SQL editor

-- Add type column to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'blog';

-- Add description column for better category management
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Add icon column for UI customization
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS icon TEXT;

-- Add color column for UI customization
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS color TEXT;

-- Add sort_order for custom ordering
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Update unique constraint to include type (name and slug should be unique per type)
ALTER TABLE categories 
DROP CONSTRAINT IF EXISTS categories_name_key;

ALTER TABLE categories 
DROP CONSTRAINT IF EXISTS categories_slug_key;

-- Create unique constraint on (type, slug) combination
CREATE UNIQUE INDEX IF NOT EXISTS categories_type_slug_unique 
ON categories(type, slug);

-- Create unique constraint on (type, name) combination  
CREATE UNIQUE INDEX IF NOT EXISTS categories_type_name_unique 
ON categories(type, name);

-- Create index on type for faster filtering
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Create index on sort_order for ordering
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(type, sort_order);

-- Update existing categories to have type 'blog' if they don't have it
UPDATE categories SET type = 'blog' WHERE type IS NULL OR type = '';

-- Seed orientation categories
INSERT INTO categories (name, slug, type, description, icon, color, sort_order)
VALUES 
  ('Fields', 'fields', 'orientation', 'Explore different academic fields and programs', 'GraduationCap', 'bg-blue-500', 1),
  ('Schools', 'schools', 'orientation', 'Compare schools and universities worldwide', 'Building2', 'bg-green-500', 2),
  ('Study Abroad', 'study-abroad', 'orientation', 'International study opportunities and programs', 'Globe', 'bg-purple-500', 3),
  ('Procedures', 'procedures', 'orientation', 'Step-by-step guides for applications and admissions', 'FileText', 'bg-orange-500', 4),
  ('Comparisons', 'comparisons', 'orientation', 'Compare programs, schools, and opportunities', 'Scale', 'bg-red-500', 5)
ON CONFLICT (type, slug) DO NOTHING;

