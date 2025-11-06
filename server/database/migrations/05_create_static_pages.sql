-- Create static_pages table for managing static pages like About, Contact, etc.
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.static_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
  visibility_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON public.static_pages(slug);

-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_static_pages_updated_at ON public.static_pages;
CREATE TRIGGER update_static_pages_updated_at 
    BEFORE UPDATE ON public.static_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default About page if it doesn't exist
INSERT INTO public.static_pages (slug, title, content, meta_title, meta_description)
VALUES (
  'about',
  'About AcademOra',
  '<div class="about-content"><h2>Our Mission</h2><p>At AcademOra, we are dedicated to transforming the way students discover and pursue their educational paths.</p></div>',
  'About AcademOra - Academic Orientation & Guidance Platform',
  'Learn about AcademOra''s mission to provide comprehensive academic orientation and guidance to students worldwide.'
)
ON CONFLICT (slug) DO NOTHING;

