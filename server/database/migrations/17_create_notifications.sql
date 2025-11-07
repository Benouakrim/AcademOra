-- Migration 17: Create notifications table
-- Run this in Supabase SQL editor

create extension if not exists "uuid-ossp";

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  title text,
  message text,
  action_url text,
  metadata jsonb default '{}'::jsonb,
  is_read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Ensure legacy tables are upgraded with new columns
alter table notifications add column if not exists title text;
alter table notifications add column if not exists message text;
alter table notifications add column if not exists action_url text;
alter table notifications add column if not exists metadata jsonb default '{}'::jsonb;
alter table notifications add column if not exists read_at timestamptz;
alter table notifications add column if not exists updated_at timestamptz default now();
alter table notifications add column if not exists created_at timestamptz default now();

create index if not exists idx_notifications_user on notifications(user_id, is_read);
create index if not exists idx_notifications_created_at on notifications(created_at desc);

create or replace function trg_set_notifications_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_notifications_updated
  before update on notifications
  for each row
  execute procedure trg_set_notifications_updated_at();

