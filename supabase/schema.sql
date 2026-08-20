-- Fourth: Supabase schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).
-- All writes go through Next.js API routes using the service role key, so
-- Row Level Security stays locked down and the anon key is not used at all.

create extension if not exists "pgcrypto";

create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  role text not null,
  due_label text,
  created_at timestamptz not null default now()
);

create table if not exists registries (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  edit_token text not null,
  mom_name text not null,
  due_label text,
  current_week int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists registry_slots (
  id uuid primary key default gen_random_uuid(),
  registry_id uuid not null references registries(id) on delete cascade,
  category text not null check (category in ('meal', 'item', 'care')),
  day_label text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'taken')),
  claimed_by_name text,
  claimed_by_contact text,
  claimed_at timestamptz,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists registry_slots_registry_id_idx on registry_slots(registry_id);

-- Lock every table down by default. The app never uses the anon key for
-- reads/writes -- only the service role key, server-side, in API routes.
alter table waitlist_signups enable row level security;
alter table registries enable row level security;
alter table registry_slots enable row level security;

-- Seed a sample registry so the landing page has something real to show
-- and let visitors claim, instead of a fake static mockup.
insert into registries (slug, edit_token, mom_name, due_label, current_week)
values ('maya-demo', 'demo-not-a-real-edit-token', 'Maya', 'Week 3', 3)
on conflict (slug) do nothing;

insert into registry_slots (registry_id, category, day_label, description, status, claimed_by_name, sort_order)
select r.id, v.category, v.day_label, v.description, v.status, v.claimed_by_name, v.sort_order
from registries r
cross join (
  values
    ('meal', 'TUE, DINNER', 'Bring a meal', 'open', null, 0),
    ('meal', 'WED, DINNER', 'Bring a meal', 'taken', 'Sarah', 1),
    ('care', 'THU, 2–4PM', '2hr babysitting so she can nap', 'open', null, 2),
    ('item', 'ANYTIME', 'Diapers, size 2', 'open', null, 3),
    ('care', 'FRI, MORNING', 'Grocery run', 'taken', 'Priya', 4),
    ('item', 'ANYTIME', 'Postpartum recovery kit', 'open', null, 5)
) as v(category, day_label, description, status, claimed_by_name, sort_order)
where r.slug = 'maya-demo'
and not exists (select 1 from registry_slots s where s.registry_id = r.id);
