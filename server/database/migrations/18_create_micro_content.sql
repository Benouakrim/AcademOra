-- Migration 18: Create university micro-content tables
-- Run in Supabase SQL editor

create extension if not exists "uuid-ossp";

create table if not exists micro_content (
  id uuid primary key default uuid_generate_v4(),
  university_id uuid not null references universities(id) on delete cascade,
  content_type text not null,
  title text not null,
  content text not null,
  media_url text,
  link_url text,
  priority integer default 1,
  status text not null default 'draft' check (status in ('draft','scheduled','published')),
  publish_date timestamptz,
  expiry_date timestamptz,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_micro_content_university on micro_content(university_id);
create index if not exists idx_micro_content_status on micro_content(status);
create index if not exists idx_micro_content_publish_date on micro_content(publish_date);

create or replace function trg_set_micro_content_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_micro_content_updated
  before update on micro_content
  for each row
  execute procedure trg_set_micro_content_updated_at();

-- Helpful view for published micro-content
drop view if exists micro_content_published;
create view micro_content_published as
  select *
  from micro_content
  where status = 'published'
    and (publish_date is null or publish_date <= now())
    and (expiry_date is null or expiry_date > now());

