-- =====================================================================
--  Smart Industrial Asset Intelligence  —  PostgreSQL / Supabase schema
--  Run in Supabase SQL Editor (or psql). Designed for dashboard queries.
-- =====================================================================

-- Extensions ----------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- Enums ---------------------------------------------------------------
do $$ begin
  create type failure_severity as enum ('low','medium','high','critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type failure_status as enum ('reported','diagnosing','in_repair','resolved','closed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type part_urgency as enum ('normal','urgent','blocking');
exception when duplicate_object then null; end $$;

do $$ begin
  create type request_status as enum ('requested','approved','sourcing','shipped','delivered','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type workflow_step_status as enum ('pending','active','done','skipped');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('admin','technician','viewer');
exception when duplicate_object then null; end $$;

-- =====================================================================
--  CORE TABLES
-- =====================================================================

create table if not exists companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  sector      text,
  created_at  timestamptz not null default now()
);

create table if not exists users (
  id          uuid primary key default gen_random_uuid(),  -- mirrors auth.users.id
  company_id  uuid references companies(id) on delete set null,
  email       text unique not null,
  full_name   text,
  role        user_role not null default 'technician',
  created_at  timestamptz not null default now()
);

create table if not exists equipments (
  id            uuid primary key default gen_random_uuid(),
  company_id    uuid not null references companies(id) on delete cascade,
  name          text not null,
  category      text not null,
  serial_number text not null,
  model         text,
  manufacturer  text,
  purchase_date date,
  location      text,
  created_at    timestamptz not null default now(),
  unique (company_id, serial_number)
);

create table if not exists equipment_images (
  id            uuid primary key default gen_random_uuid(),
  equipment_id  uuid not null references equipments(id) on delete cascade,
  storage_path  text not null,           -- path in Supabase Storage bucket
  angle         text,                    -- front / back / serial-plate ...
  created_at    timestamptz not null default now()
);

create table if not exists failures (
  id            uuid primary key default gen_random_uuid(),
  equipment_id  uuid not null references equipments(id) on delete cascade,
  company_id    uuid not null references companies(id) on delete cascade,
  reported_by   uuid references users(id) on delete set null,
  title         text not null,
  description   text,
  category      text not null,           -- mechanical / electrical / hydraulic ...
  severity      failure_severity not null default 'medium',
  status        failure_status not null default 'reported',
  ai_diagnosis  jsonb,                   -- structured output from /api/ai/diagnose
  reported_at   timestamptz not null default now(),
  resolved_at   timestamptz
);

create table if not exists failure_images (
  id            uuid primary key default gen_random_uuid(),
  failure_id    uuid not null references failures(id) on delete cascade,
  storage_path  text not null,
  angle         text,
  created_at    timestamptz not null default now()
);

create table if not exists spare_parts (
  id            uuid primary key default gen_random_uuid(),
  reference     text unique not null,
  name          text not null,
  category      text,
  unit_price    numeric(12,2),
  stock_qty     integer not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists spare_part_requests (
  id             uuid primary key default gen_random_uuid(),
  failure_id     uuid not null references failures(id) on delete cascade,
  spare_part_id  uuid references spare_parts(id) on delete set null,
  company_id     uuid not null references companies(id) on delete cascade,
  requested_by   uuid references users(id) on delete set null,
  quantity       integer not null default 1,
  urgency        part_urgency not null default 'normal',
  status         request_status not null default 'requested',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Repair workflow: one row per step instance per failure
create table if not exists workflow_steps (
  id           uuid primary key default gen_random_uuid(),
  failure_id   uuid not null references failures(id) on delete cascade,
  step_order   integer not null,        -- 1..7
  step_name    text not null,           -- Soumis / Analyse / Inspection ...
  status       workflow_step_status not null default 'pending',
  assignee_id  uuid references users(id) on delete set null,
  note         text,
  started_at   timestamptz,
  completed_at timestamptz,
  unique (failure_id, step_order)
);

create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  failure_id  uuid references failures(id) on delete cascade,
  type        text not null,
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- =====================================================================
--  INDEXES  (tuned for dashboards / hot filters)
-- =====================================================================
create index if not exists idx_equipments_company   on equipments(company_id);
create index if not exists idx_failures_equipment    on failures(equipment_id);
create index if not exists idx_failures_company       on failures(company_id);
create index if not exists idx_failures_status        on failures(status);
create index if not exists idx_failures_reported_at   on failures(reported_at desc);
create index if not exists idx_failures_category      on failures(category);
create index if not exists idx_part_requests_failure  on spare_part_requests(failure_id);
create index if not exists idx_part_requests_part     on spare_part_requests(spare_part_id);
create index if not exists idx_part_requests_company  on spare_part_requests(company_id);
create index if not exists idx_workflow_failure       on workflow_steps(failure_id);
create index if not exists idx_failure_images_failure on failure_images(failure_id);
create index if not exists idx_notifications_user     on notifications(user_id, is_read);

-- updated_at trigger for spare_part_requests --------------------------
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end $$ language plpgsql;

drop trigger if exists trg_part_requests_updated on spare_part_requests;
create trigger trg_part_requests_updated
  before update on spare_part_requests
  for each row execute function set_updated_at();

-- =====================================================================
--  ROW LEVEL SECURITY (enable + simple company-scoped policy stubs)
--  NOTE: for a 48h demo you can keep RLS OFF and use the anon key.
--        Enable these for the "security-aware" bonus points.
-- =====================================================================
-- alter table equipments enable row level security;
-- create policy "company members read equipments"
--   on equipments for select
--   using (company_id in (select company_id from users where id = auth.uid()));
