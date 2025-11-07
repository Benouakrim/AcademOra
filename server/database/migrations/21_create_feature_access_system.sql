-- 1. Add 'role' and 'plan_id' to users table

ALTER TABLE users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user', -- 'user' or 'admin'
ADD COLUMN IF NOT EXISTS plan_id UUID,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive'; -- e.g., 'active', 'inactive', 'trial'

-- 2. Create 'plans' table

CREATE TABLE IF NOT EXISTS plans (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL, -- e.g., 'Anonymous', 'Free User', 'Pro Monthly'

  key TEXT UNIQUE NOT NULL, -- e.g., 'anonymous', 'free', 'pro'

  price INTEGER DEFAULT 0, -- Price in cents

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);

-- 3. Create 'features' table

CREATE TABLE IF NOT EXISTS features (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name TEXT NOT NULL, -- e.g., 'Matching Engine', 'View Premium Articles'

  key TEXT UNIQUE NOT NULL, -- e.g., 'matching-engine', 'view-premium-article'

  description TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);

-- 4. Create 'plan_features' join table (The Rules Engine)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'limit_type') THEN
    EXECUTE 'CREATE TYPE limit_type AS ENUM (''count'', ''unlimited'')';
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS plan_features (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,

  feature_key TEXT NOT NULL REFERENCES features(key) ON DELETE CASCADE,

  access_level limit_type NOT NULL DEFAULT 'count',

  limit_value INTEGER DEFAULT 0, -- e.g., 5 for 5 uses. 0 if 'unlimited'

  UNIQUE(plan_id, feature_key)

);

-- 5. Create 'user_feature_usage' table

CREATE TABLE IF NOT EXISTS user_feature_usage (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  feature_key TEXT NOT NULL REFERENCES features(key) ON DELETE CASCADE,

  used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);

CREATE INDEX IF NOT EXISTS idx_user_feature_usage_user_id ON user_feature_usage(user_id);

CREATE INDEX IF NOT EXISTS idx_user_feature_usage_feature_key ON user_feature_usage(feature_key);

-- 6. Create 'anonymous_feature_usage' table

CREATE TABLE IF NOT EXISTS anonymous_feature_usage (

  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  identifier TEXT NOT NULL, -- This will store the IP address

  feature_key TEXT NOT NULL REFERENCES features(key) ON DELETE CASCADE,

  used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP

);

CREATE INDEX IF NOT EXISTS idx_anonymous_feature_usage_identifier ON anonymous_feature_usage(identifier);

CREATE INDEX IF NOT EXISTS idx_anonymous_feature_usage_feature_key ON anonymous_feature_usage(feature_key);

-- 7. Add Foreign Key for users.plan_id (after 'plans' is created)

ALTER TABLE users

ADD CONSTRAINT fk_plan_id

FOREIGN KEY (plan_id) REFERENCES plans(id);

-- 8. Seed default plans and features

INSERT INTO plans (name, key, price)
VALUES
  ('Anonymous', 'anonymous', 0),
  ('Free User', 'free', 0),
  ('Pro User', 'pro', 1000) -- $10.00
ON CONFLICT (key) DO NOTHING;

INSERT INTO features (name, key, description)
VALUES
  ('Matching Engine', 'matching-engine', 'Access to the university matching engine.'),
  ('View Premium Articles', 'view-premium-article', 'View articles marked as premium.')
ON CONFLICT (key) DO NOTHING;

-- 9. Seed default limits

-- Note: This assumes the plans and features were inserted successfully.

-- We must join on the 'key' field.

INSERT INTO plan_features (plan_id, feature_key, access_level, limit_value)
SELECT
  p.id,
  'matching-engine',
  'count' AS access_level,
  3 AS limit_value -- 3 free uses for anonymous users
FROM plans p WHERE p.key = 'anonymous'
ON CONFLICT (plan_id, feature_key) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_key, access_level, limit_value)
SELECT
  p.id,
  'matching-engine',
  'count' AS access_level,
  10 AS limit_value -- 10 uses for logged-in free users
FROM plans p WHERE p.key = 'free'
ON CONFLICT (plan_id, feature_key) DO NOTHING;

INSERT INTO plan_features (plan_id, feature_key, access_level, limit_value)
SELECT
  p.id,
  'matching-engine',
  'unlimited' AS access_level,
  0 AS limit_value -- Unlimited uses for pro users
FROM plans p WHERE p.key = 'pro'
ON CONFLICT (plan_id, feature_key) DO NOTHING;

-- 10. Set a default plan for existing users (migrate them to 'free')

UPDATE users

SET plan_id = (SELECT id FROM plans WHERE key = 'free')

WHERE plan_id IS NULL;

-- 11. Make new users default to 'free' plan

DO $$
DECLARE
  free_plan_id UUID;
BEGIN
  SELECT id INTO free_plan_id FROM plans WHERE key = 'free';
  IF free_plan_id IS NOT NULL THEN
    EXECUTE format('ALTER TABLE users ALTER COLUMN plan_id SET DEFAULT %L::uuid', free_plan_id);
  END IF;
END $$;

