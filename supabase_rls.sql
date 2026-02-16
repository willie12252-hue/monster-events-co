-- Supabase RLS policies for Monster Events Co.
-- Run AFTER schema.sql.

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.props enable row level security;
alter table public.articles enable row level security;
alter table public.cases enable row level security;
alter table public.site_settings enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.quote_leads enable row level security;
alter table public.analytics_pageviews_daily enable row level security;
alter table public.analytics_quote_submissions enable row level security;

-- Drop existing policies (so script can be re-run)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_upsert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

drop policy if exists "props_select_public" on public.props;
drop policy if exists "props_write_auth" on public.props;

drop policy if exists "articles_select_public" on public.articles;
drop policy if exists "articles_write_auth" on public.articles;

drop policy if exists "cases_select_public" on public.cases;
drop policy if exists "cases_write_auth" on public.cases;

drop policy if exists "site_settings_select_public" on public.site_settings;
drop policy if exists "site_settings_write_auth" on public.site_settings;

drop policy if exists "newsletter_insert_public" on public.newsletter_subscribers;
drop policy if exists "newsletter_manage_auth" on public.newsletter_subscribers;

drop policy if exists "quote_leads_insert_public" on public.quote_leads;
drop policy if exists "quote_leads_manage_auth" on public.quote_leads;

drop policy if exists "analytics_pageviews_upsert_public" on public.analytics_pageviews_daily;
drop policy if exists "analytics_pageviews_update_public" on public.analytics_pageviews_daily;
drop policy if exists "analytics_pageviews_select_auth" on public.analytics_pageviews_daily;

drop policy if exists "analytics_quote_insert_public" on public.analytics_quote_submissions;
drop policy if exists "analytics_quote_select_auth" on public.analytics_quote_submissions;

-- PROFILES
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

create policy "profiles_upsert_own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- PUBLIC CONTENT: allow anyone read; only authenticated write
create policy "props_select_public" on public.props
  for select to anon, authenticated
  using (true);
create policy "props_write_auth" on public.props
  for all to authenticated
  using (true)
  with check (true);

create policy "articles_select_public" on public.articles
  for select to anon, authenticated
  using (true);
create policy "articles_write_auth" on public.articles
  for all to authenticated
  using (true)
  with check (true);

create policy "cases_select_public" on public.cases
  for select to anon, authenticated
  using (true);
create policy "cases_write_auth" on public.cases
  for all to authenticated
  using (true)
  with check (true);

-- SITE SETTINGS: allow public read; only authenticated update
create policy "site_settings_select_public" on public.site_settings
  for select to anon, authenticated
  using (true);
create policy "site_settings_write_auth" on public.site_settings
  for all to authenticated
  using (true)
  with check (true);

-- NEWSLETTER SUBSCRIBERS: public insert only; authenticated read/manage
create policy "newsletter_insert_public" on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (true);
create policy "newsletter_manage_auth" on public.newsletter_subscribers
  for all to authenticated
  using (true)
  with check (true);

-- QUOTE LEADS: public insert only; authenticated read/manage
create policy "quote_leads_insert_public" on public.quote_leads
  for insert to anon, authenticated
  with check (true);
create policy "quote_leads_manage_auth" on public.quote_leads
  for all to authenticated
  using (true)
  with check (true);

-- ANALYTICS: public can upsert counters; authenticated can read
-- (If you don't want public write, remove these and do analytics server-side)
create policy "analytics_pageviews_upsert_public" on public.analytics_pageviews_daily
  for insert to anon, authenticated
  with check (true);
create policy "analytics_pageviews_update_public" on public.analytics_pageviews_daily
  for update to anon, authenticated
  using (true)
  with check (true);
create policy "analytics_pageviews_select_auth" on public.analytics_pageviews_daily
  for select to authenticated
  using (true);

create policy "analytics_quote_insert_public" on public.analytics_quote_submissions
  for insert to anon, authenticated
  with check (true);
create policy "analytics_quote_select_auth" on public.analytics_quote_submissions
  for select to authenticated
  using (true);
