-- ============================================================
-- AssetIQ — Schéma Supabase (Postgres)
-- À exécuter dans le SQL Editor de Supabase.
-- ============================================================

-- ENUMS
create type user_role        as enum ('admin','manager','technician');
create type equipment_status as enum ('operational','degraded','down','maintenance');
create type severity         as enum ('low','medium','high','critical');
create type failure_status   as enum ('open','diagnosed','resolved','closed');
create type request_urgency  as enum ('low','medium','high','urgent');
create type workflow_status  as enum ('submitted','analysis','inspection','validation','sourcing','delivery','closed');
create type media_kind       as enum ('photo','scan3d');

-- RACINE MULTI-TENANT
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  full_name text,
  role user_role not null default 'technician',
  created_at timestamptz not null default now()
);

-- TAXONOMIES
create table equipment_categories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id) on delete cascade,
  name text not null
);
create table failure_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null
);
create table parts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text,
  category text,
  typical_lead_time_days int
);

-- ÉQUIPEMENTS
create table equipment (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  category_id uuid references equipment_categories(id),
  name text not null,
  serial_number text,
  model text,
  manufacturer text,
  purchase_date date,
  status equipment_status not null default 'operational',
  photo_url text,
  created_at timestamptz not null default now()
);

-- PANNES
create table failures (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  equipment_id uuid not null references equipment(id) on delete cascade,
  reported_by uuid references profiles(id),
  failure_category_id uuid references failure_categories(id),
  description text,
  severity severity not null default 'medium',
  status failure_status not null default 'open',
  created_at timestamptz not null default now()
);

-- PREUVES VISUELLES
create table media_assets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  failure_id uuid references failures(id) on delete cascade,
  equipment_id uuid references equipment(id) on delete cascade,
  storage_path text not null,
  kind media_kind not null default 'photo',
  uploaded_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- DIAGNOSTIC IA (sortie structurée = flywheel)
create table ai_diagnoses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  failure_id uuid not null references failures(id) on delete cascade,
  media_id uuid references media_assets(id),
  model text,
  defect_label text,
  failure_category_id uuid references failure_categories(id),
  severity_estimate severity,
  confidence numeric,
  recommended_part_id uuid references parts(id),
  recommended_part_text text,
  raw_response jsonb,
  created_at timestamptz not null default now()
);

-- DEMANDES DE PIÈCES (porte le workflow 7 étapes)
create table part_requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  equipment_id uuid not null references equipment(id) on delete cascade,
  failure_id uuid references failures(id) on delete set null,
  part_id uuid references parts(id),
  requested_by uuid references profiles(id),
  description text,
  urgency request_urgency not null default 'medium',
  current_status workflow_status not null default 'submitted',
  from_ai boolean not null default false,
  created_at timestamptz not null default now()
);

-- JOURNAL D'ÉVÉNEMENTS DU WORKFLOW (audit log — pièce maîtresse)
create table part_request_events (
  id uuid primary key default gen_random_uuid(),
  part_request_id uuid not null references part_requests(id) on delete cascade,
  from_status workflow_status,
  to_status workflow_status not null,
  actor_id uuid references profiles(id),
  note text,
  created_at timestamptz not null default now()
);

-- NOTIFICATIONS
create table notifications (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS — isolation multi-tenant (motif à répliquer sur chaque table à org_id)
-- ============================================================
alter table equipment enable row level security;
create policy "tenant_read"  on equipment for select using ( org_id = (select org_id from profiles where id = auth.uid()) );
create policy "tenant_write" on equipment for insert with check ( org_id = (select org_id from profiles where id = auth.uid()) );
-- … répliquer (select/insert/update/delete) sur failures, media_assets, ai_diagnoses,
--    part_requests, notifications, equipment_categories.

-- ============================================================
-- VUES ANALYTIQUES
-- ============================================================
create view v_top_failing_equipment as
select e.id, e.name, count(f.id) as failure_count
from equipment e left join failures f on f.equipment_id = e.id
group by e.id, e.name order by failure_count desc;

create view v_top_requested_parts as
select coalesce(p.name, pr.description) as part, count(*) as n
from part_requests pr left join parts p on p.id = pr.part_id
group by 1 order by n desc;

-- Temps moyen passé à chaque étape (insight délais d'approvisionnement)
create view v_avg_time_per_stage as
select stage, avg(extract(epoch from (next_at - created_at))/3600) as avg_hours
from (
  select to_status as stage, created_at,
         lead(created_at) over (partition by part_request_id order by created_at) as next_at
  from part_request_events
) t
where next_at is not null
group by stage;

-- ============================================================
-- SEED minimal (démo)
-- ============================================================
insert into organizations (id, name) values
  ('00000000-0000-0000-0000-000000000001', 'Cimenterie du Littoral'),
  ('00000000-0000-0000-0000-000000000002', 'Textile Sahel SA'),
  ('00000000-0000-0000-0000-000000000003', 'Embouteillage Niger');

insert into parts (name, sku, typical_lead_time_days) values
  ('Roulement SKF 6205-2RS', 'SKF-6205', 12),
  ('Courroie trapézoïdale B-50', 'BLT-B50', 5),
  ('Garniture mécanique D-40', 'GM-D40', 9),
  ('Carte de commande PLC-12', 'PLC-12', 21),
  ('Filtre à air haute capacité', 'FA-HC', 4),
  ('Joint d''étanchéité Viton', 'JT-VIT', 3);
