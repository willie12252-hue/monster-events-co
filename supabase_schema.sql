-- Supabase schema for Monster Events Co.
-- Project: Monsters props inc
-- Run in Supabase SQL Editor.

-- 1) Profiles (optional, for roles)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'staff',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Public content tables
create table if not exists public.props (
  id text primary key,
  data jsonb not null,
  status text not null default 'public',
  "order" int not null default 0,
  views int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.cases (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 3) Site settings (editable in admin, readable by public)
create table if not exists public.site_settings (
  id int primary key default 1,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- 4) Newsletter subscribers (public insert, admin read)
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  source text not null default 'knowledge'
);
create index if not exists newsletter_subscribers_email_idx on public.newsletter_subscribers (email);

-- 5) Quote leads (public insert, admin manage)
create table if not exists public.quote_leads (
  id text primary key,
  created_at_iso text not null,
  updated_at_iso text not null,
  status text not null default 'new',
  company text not null default '',
  name text not null default '',
  phone text,
  email text,
  city text,
  district text,
  items_count int not null default 0,
  thank_you_sent_at_iso text
);
create index if not exists quote_leads_created_at_idx on public.quote_leads (created_at_iso);
create index if not exists quote_leads_status_idx on public.quote_leads (status);

-- 6) Analytics (simple)
create table if not exists public.analytics_pageviews_daily (
  day text not null, -- YYYY-MM-DD
  path text not null,
  count int not null default 0,
  primary key (day, path)
);

create table if not exists public.analytics_quote_submissions (
  id text primary key,
  created_at_iso text not null,
  city text,
  district text,
  items_count int not null default 0
);

