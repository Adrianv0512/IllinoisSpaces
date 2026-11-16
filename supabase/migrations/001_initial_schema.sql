-- Run in the Supabase SQL editor. Authentication users live in auth.users.
create extension if not exists pgcrypto;

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  address text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  noise_level smallint check (noise_level between 1 and 5),
  outlet_availability smallint check (outlet_availability between 1 and 5),
  wifi_quality smallint check (wifi_quality between 1 and 5),
  seating_availability smallint check (seating_availability between 1 and 5),
  busyness_level smallint check (busyness_level between 1 and 5),
  scenery text,
  seating_notes text,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(trim(body)) between 1 and 2000),
  noise_level smallint check (noise_level between 1 and 5),
  outlet_availability smallint check (outlet_availability between 1 and 5),
  wifi_quality smallint check (wifi_quality between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, user_id)
);

create index reviews_location_id_idx on public.reviews (location_id);

create function public.set_review_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger reviews_updated_at
before update on public.reviews
for each row execute function public.set_review_updated_at();

alter table public.locations enable row level security;
alter table public.reviews enable row level security;

grant select on public.locations, public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;

create policy "Locations are readable" on public.locations
for select to anon, authenticated using (true);

create policy "Reviews are readable" on public.reviews
for select to anon, authenticated using (true);

create policy "Users can add their own reviews" on public.reviews
for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users can edit their own reviews" on public.reviews
for update to authenticated using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own reviews" on public.reviews
for delete to authenticated using ((select auth.uid()) = user_id);
