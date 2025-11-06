-- Add indexes to improve read performance on common lookup fields
BEGIN;

-- Users by username
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);

-- Articles by slug and published state
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles (slug);
CREATE INDEX IF NOT EXISTS idx_articles_published ON public.articles (published);

-- Universities by slug
CREATE INDEX IF NOT EXISTS idx_universities_slug ON public.universities (slug);

-- University groups by slug
CREATE INDEX IF NOT EXISTS idx_university_groups_slug ON public.university_groups (slug);

-- Orientation resources by category, slug
CREATE INDEX IF NOT EXISTS idx_orientation_resources_category_slug ON public.orientation_resources (category, slug);

-- Static pages by slug/status
CREATE INDEX IF NOT EXISTS idx_static_pages_slug ON public.static_pages (slug);
CREATE INDEX IF NOT EXISTS idx_static_pages_status ON public.static_pages (status);

COMMIT;


