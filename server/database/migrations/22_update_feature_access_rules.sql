BEGIN;

-- 1. Ensure new premium flags exist on content tables
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE orientation_resources
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Clean up deprecated feature key if present
DELETE FROM plan_features WHERE feature_key = 'view-premium-article';
DELETE FROM features WHERE key = 'view-premium-article';

-- 3. Seed new features
INSERT INTO features (name, key, description)
VALUES
  ('View Full Match Results', 'view-match-results', 'Unlock the complete list of matching universities.'),
  ('Save University/Article', 'save-item', 'Save universities, articles, and resources to your workspace.'),
  ('Compare Universities', 'compare-universities', 'Access the side-by-side university comparison workspace.'),
  ('View Premium Content', 'view-premium-content', 'Read premium guidance articles and orientation resources.'),
  ('Access Advanced Tools (Mixer, Predictor)', 'access-advanced-tools', 'Use advanced orientation tools like the Mixer and Predictor.')
ON CONFLICT (key) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 4. Upsert plan feature rules for all tiers
WITH plan_ids AS (
  SELECT id, key
  FROM plans
  WHERE key IN ('anonymous', 'free', 'pro')
)
INSERT INTO plan_features (plan_id, feature_key, access_level, limit_value)
SELECT
  p.id,
  feature.feature_key,
  feature.access_level::limit_type,
  feature.limit_value
FROM plan_ids p
JOIN (
  VALUES
    -- matching-engine
    ('matching-engine', 'anonymous', 'count', 1),
    ('matching-engine', 'free', 'count', 5),
    ('matching-engine', 'pro', 'unlimited', 0),
    -- view-match-results
    ('view-match-results', 'anonymous', 'count', 0),
    ('view-match-results', 'free', 'unlimited', 0),
    ('view-match-results', 'pro', 'unlimited', 0),
    -- save-item
    ('save-item', 'anonymous', 'count', 0),
    ('save-item', 'free', 'count', 10),
    ('save-item', 'pro', 'unlimited', 0),
    -- compare-universities
    ('compare-universities', 'anonymous', 'count', 0),
    ('compare-universities', 'free', 'count', 5),
    ('compare-universities', 'pro', 'unlimited', 0),
    -- view-premium-content
    ('view-premium-content', 'anonymous', 'count', 0),
    ('view-premium-content', 'free', 'count', 3),
    ('view-premium-content', 'pro', 'unlimited', 0),
    -- access-advanced-tools
    ('access-advanced-tools', 'anonymous', 'count', 0),
    ('access-advanced-tools', 'free', 'count', 0),
    ('access-advanced-tools', 'pro', 'unlimited', 0)
) AS feature(feature_key, plan_key, access_level, limit_value)
  ON feature.plan_key = p.key
ON CONFLICT (plan_id, feature_key)
DO UPDATE
SET
  access_level = EXCLUDED.access_level,
  limit_value = EXCLUDED.limit_value;

COMMIT;

