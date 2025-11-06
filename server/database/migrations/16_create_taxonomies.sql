-- Migration 16: Create flexible taxonomies and multi-select terms for articles
-- Run in Supabase SQL editor

create extension if not exists "uuid-ossp";

-- Taxonomies (e.g., Scope, ContentType, Topic, Field)
create table if not exists taxonomies (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null, -- stable machine key: scope, content_type, topic, field
  name text not null, -- human friendly name
  description text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- Taxonomy terms for each taxonomy
create table if not exists taxonomy_terms (
  id uuid primary key default uuid_generate_v4(),
  taxonomy_id uuid not null references taxonomies(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  color text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  unique (taxonomy_id, slug)
);

-- Join table: many-to-many between articles and taxonomy terms
create table if not exists article_terms (
  article_id uuid not null references articles(id) on delete cascade,
  term_id uuid not null references taxonomy_terms(id) on delete cascade,
  primary key (article_id, term_id)
);

-- Indexes
create index if not exists idx_taxonomies_key on taxonomies(key);
create index if not exists idx_taxonomy_terms_taxonomy on taxonomy_terms(taxonomy_id);
create index if not exists idx_article_terms_article on article_terms(article_id);
create index if not exists idx_article_terms_term on article_terms(term_id);

-- Seed default taxonomies if missing
insert into taxonomies (key, name, description, sort_order) values
  ('scope', 'Scope', 'Audience or scope of the piece (Professional, Academic, Personal, …)', 10),
  ('content_type', 'Content Type', 'Format or intent (Informational, Tip, Guide, Case Study, Analysis, News, …)', 20),
  ('topic', 'Topic', 'High-level topic buckets (Productivity, Studies, …)', 30),
  ('field', 'Field', 'Academic/professional fields (Psychology, Economics, …)', 40)
  on conflict (key) do nothing;

-- OPTIONAL backfill: map existing single category (string) into a Topic term
-- Only executes if there are articles and a non-empty category string
with topic_tax as (
  select id from taxonomies where key = 'topic' limit 1
), new_terms as (
  insert into taxonomy_terms (taxonomy_id, name, slug)
  select t.id, a.category, lower(regexp_replace(a.category, '[^a-z0-9]+', '-', 'g'))
  from articles a
  cross join topic_tax t
  where coalesce(a.category, '') <> ''
  on conflict (taxonomy_id, slug) do nothing
  returning id, taxonomy_id, name
)
insert into article_terms (article_id, term_id)
select a.id, tt.id
from articles a
join topic_tax tx on true
join taxonomy_terms tt on tt.taxonomy_id = tx.id and lower(regexp_replace(a.category, '[^a-z0-9]+', '-', 'g')) = tt.slug
on conflict do nothing;

-- Note: You may later remove the legacy articles.category column if desired.
