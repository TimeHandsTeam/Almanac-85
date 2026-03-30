-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Credits
create table public.credits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  balance integer default 0 not null check (balance >= 0),
  updated_at timestamptz default now() not null
);

alter table public.credits enable row level security;
create policy "Users can view own credits" on public.credits
  for select using (auth.uid() = user_id);

-- Credit transactions
create table public.credit_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount integer not null,
  type text not null check (type in ('purchase', 'spend', 'signup_bonus')),
  created_at timestamptz default now() not null
);

alter table public.credit_transactions enable row level security;
create policy "Users can view own transactions" on public.credit_transactions
  for select using (auth.uid() = user_id);

-- Sports
create table public.sports (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  icon_url text,
  display_order integer default 0 not null
);

alter table public.sports enable row level security;
create policy "Sports are publicly readable" on public.sports
  for select using (true);

-- Leagues
create table public.leagues (
  id uuid default uuid_generate_v4() primary key,
  sport_id uuid references public.sports(id) on delete cascade not null,
  name text not null,
  slug text unique not null,
  country text
);

alter table public.leagues enable row level security;
create policy "Leagues are publicly readable" on public.leagues
  for select using (true);

-- Teams
create table public.teams (
  id uuid default uuid_generate_v4() primary key,
  league_id uuid references public.leagues(id) on delete cascade not null,
  name text not null,
  short_name text not null,
  logo_url text
);

alter table public.teams enable row level security;
create policy "Teams are publicly readable" on public.teams
  for select using (true);

-- Matches
create table public.matches (
  id uuid default uuid_generate_v4() primary key,
  league_id uuid references public.leagues(id) on delete cascade not null,
  home_team_id uuid references public.teams(id) not null,
  away_team_id uuid references public.teams(id) not null,
  start_time timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  home_score integer,
  away_score integer,
  raw_data jsonb,
  cached_at timestamptz default now() not null
);

alter table public.matches enable row level security;
create policy "Matches are publicly readable" on public.matches
  for select using (true);

create index idx_matches_status on public.matches(status);
create index idx_matches_start_time on public.matches(start_time);
create index idx_matches_league_id on public.matches(league_id);

-- Standings
create table public.standings (
  id uuid default uuid_generate_v4() primary key,
  league_id uuid references public.leagues(id) on delete cascade not null,
  team_id uuid references public.teams(id) not null,
  position integer not null,
  played integer default 0 not null,
  won integer default 0 not null,
  drawn integer default 0 not null,
  lost integer default 0 not null,
  points integer default 0 not null,
  cached_at timestamptz default now() not null,
  unique(league_id, team_id)
);

alter table public.standings enable row level security;
create policy "Standings are publicly readable" on public.standings
  for select using (true);

-- Articles
create table public.articles (
  id uuid default uuid_generate_v4() primary key,
  sport_id uuid references public.sports(id) on delete cascade not null,
  title text not null,
  summary text,
  image_url text,
  source_url text not null,
  published_at timestamptz not null,
  cached_at timestamptz default now() not null
);

alter table public.articles enable row level security;
create policy "Articles are publicly readable" on public.articles
  for select using (true);

create index idx_articles_sport_id on public.articles(sport_id);
create index idx_articles_published_at on public.articles(published_at desc);

-- Predictions
create table public.predictions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  match_id uuid references public.matches(id),
  type text not null check (type in ('outcome', 'prop')),
  prompt jsonb not null,
  result jsonb not null,
  credits_used integer default 1 not null,
  created_at timestamptz default now() not null
);

alter table public.predictions enable row level security;
create policy "Users can view own predictions" on public.predictions
  for select using (auth.uid() = user_id);

create index idx_predictions_user_id on public.predictions(user_id);

-- Cache log
create table public.cache_log (
  id uuid default uuid_generate_v4() primary key,
  cache_key text unique not null,
  expires_at timestamptz not null
);

-- Seed sports data
insert into public.sports (name, slug, display_order) values
  ('Soccer', 'soccer', 1),
  ('Basketball', 'basketball', 2),
  ('NFL', 'football', 3),
  ('MLB', 'baseball', 4),
  ('Tennis', 'tennis', 5),
  ('Cricket', 'cricket', 6),
  ('NHL', 'hockey', 7),
  ('Golf', 'golf', 8),
  ('MMA', 'mma', 9),
  ('Boxing', 'boxing', 10),
  ('Rugby', 'rugby', 11),
  ('Volleyball', 'volleyball', 12);

-- Auto-create profile + credits on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);

  insert into public.credits (user_id, balance)
  values (new.id, 2);

  insert into public.credit_transactions (user_id, amount, type)
  values (new.id, 2, 'signup_bonus');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
