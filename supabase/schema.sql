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

-- Anonymous support chat + peer pairing (no accounts -- identified only by
-- a random session id the browser keeps in localStorage).

create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'ai_chat' check (status in ('ai_chat', 'waiting_to_pair', 'paired', 'ended')),
  pair_chat_id uuid,
  last_ping_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists pair_chats (
  id uuid primary key default gen_random_uuid(),
  session_a_id uuid not null references chat_sessions(id) on delete cascade,
  session_b_id uuid not null references chat_sessions(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'ended')),
  ended_reason text,
  created_at timestamptz not null default now(),
  ended_at timestamptz
);

create table if not exists pair_messages (
  id uuid primary key default gen_random_uuid(),
  pair_chat_id uuid not null references pair_chats(id) on delete cascade,
  sender_session_id uuid not null references chat_sessions(id),
  content text not null,
  flagged boolean not null default false,
  flag_reason text,
  created_at timestamptz not null default now()
);

create index if not exists pair_messages_pair_chat_id_idx on pair_messages(pair_chat_id);
create index if not exists chat_sessions_status_idx on chat_sessions(status, last_ping_at);

alter table chat_sessions enable row level security;
alter table pair_chats enable row level security;
alter table pair_messages enable row level security;

-- Atomically claims a waiting partner session (if any) and pairs it with
-- the caller. FOR UPDATE SKIP LOCKED prevents two concurrent requests from
-- claiming the same waiting session.
create or replace function try_pair_session(p_session_id uuid)
returns uuid
language plpgsql
security definer
as $$
declare
  v_partner_id uuid;
  v_pair_id uuid;
  v_current_status text;
  v_current_pair uuid;
begin
  insert into chat_sessions (id, status, last_ping_at)
  values (p_session_id, 'waiting_to_pair', now())
  on conflict (id) do update
    set status = 'waiting_to_pair', last_ping_at = now()
    where chat_sessions.status not in ('paired');

  -- Someone else's call may have already paired us with them between the
  -- upsert above and now -- if so, return that pairing instead of racing
  -- to create a second one.
  select status, pair_chat_id into v_current_status, v_current_pair
  from chat_sessions where id = p_session_id;

  if v_current_status = 'paired' then
    return v_current_pair;
  end if;

  select id into v_partner_id
  from chat_sessions
  where id != p_session_id
    and status = 'waiting_to_pair'
    and last_ping_at > now() - interval '90 seconds'
  order by created_at asc
  for update skip locked
  limit 1;

  if v_partner_id is null then
    return null;
  end if;

  insert into pair_chats (session_a_id, session_b_id)
  values (p_session_id, v_partner_id)
  returning id into v_pair_id;

  update chat_sessions
  set status = 'paired', pair_chat_id = v_pair_id
  where id in (p_session_id, v_partner_id);

  return v_pair_id;
end;
$$;

-- Registry v2: allergies/preferences, gift-card items, and claim approval.

alter table registries add column if not exists allergies text;
alter table registries add column if not exists meal_preferences text;
alter table registries add column if not exists dropoff_notes text;

alter table registry_slots drop constraint if exists registry_slots_category_check;
alter table registry_slots add constraint registry_slots_category_check
  check (category in ('meal', 'item', 'care', 'gift_card'));

alter table registry_slots drop constraint if exists registry_slots_status_check;
alter table registry_slots add constraint registry_slots_status_check
  check (status in ('open', 'pending', 'taken'));

alter table registry_slots add column if not exists external_url text;

-- People a mom/partner has pre-approved -- their claims skip the pending
-- queue and confirm immediately. Matched by name OR contact, either exact
-- (case-insensitive).
create table if not exists registry_approved_contacts (
  id uuid primary key default gen_random_uuid(),
  registry_id uuid not null references registries(id) on delete cascade,
  name text not null,
  contact text,
  created_at timestamptz not null default now()
);

create index if not exists registry_approved_contacts_registry_id_idx
  on registry_approved_contacts(registry_id);

alter table registry_approved_contacts enable row level security;

-- Registry v3: real scheduled times + email reminders.
-- scheduled_at is an absolute UTC instant. scheduled_tz_offset_minutes
-- captures JS's getTimezoneOffset() from whoever set the time, so reminder
-- math ("9am the day before") can approximate their local day boundary
-- without needing full IANA timezone tracking.

alter table registry_slots add column if not exists scheduled_at timestamptz;
alter table registry_slots add column if not exists scheduled_tz_offset_minutes int;
alter table registry_slots add column if not exists reminder_day_before_sent_at timestamptz;
alter table registry_slots add column if not exists reminder_hours_before_sent_at timestamptz;

create index if not exists registry_slots_scheduled_at_idx
  on registry_slots(scheduled_at)
  where scheduled_at is not null and status = 'taken';
