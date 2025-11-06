-- Add missing columns to existing static_pages table
-- Run this in Supabase SQL Editor if the table already exists but is missing these columns

-- Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'static_pages' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.static_pages 
        ADD COLUMN status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft'));
    END IF;
END $$;

-- Add visibility_areas column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'static_pages' 
        AND column_name = 'visibility_areas'
    ) THEN
        ALTER TABLE public.static_pages 
        ADD COLUMN visibility_areas TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- Add sort_order column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'static_pages' 
        AND column_name = 'sort_order'
    ) THEN
        ALTER TABLE public.static_pages 
        ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Update existing rows to have default values
UPDATE public.static_pages 
SET 
    status = COALESCE(status, 'draft'),
    visibility_areas = COALESCE(visibility_areas, ARRAY[]::TEXT[]),
    sort_order = COALESCE(sort_order, 0)
WHERE 
    status IS NULL 
    OR visibility_areas IS NULL 
    OR sort_order IS NULL;

