-- =====================================================================
--  Dashboard Analytics — ready-to-use queries + reusable VIEWS
--  Wire these to the Analytics dashboard (Supabase RPC or direct select).
-- =====================================================================

-- 1) TOP équipements défaillants -------------------------------------
create or replace view v_top_failing_equipment as
select e.id as equipment_id,
       e.name,
       e.category,
       c.name as company,
       count(f.id)                                  as failure_count,
       count(f.id) filter (where f.severity = 'critical') as critical_count
from equipments e
join companies c on c.id = e.company_id
left join failures f on f.equipment_id = e.id
group by e.id, e.name, e.category, c.name
order by failure_count desc;

-- 2) TOP pannes (par catégorie) --------------------------------------
create or replace view v_top_failure_categories as
select category,
       count(*)                                     as total,
       count(*) filter (where severity in ('high','critical')) as severe
from failures
group by category
order by total desc;

-- 3) TOP pièces demandées --------------------------------------------
create or replace view v_top_requested_parts as
select sp.id as part_id,
       sp.reference,
       sp.name,
       sum(r.quantity)        as total_requested,
       count(r.id)            as request_count,
       sp.stock_qty
from spare_parts sp
join spare_part_requests r on r.spare_part_id = sp.id
group by sp.id, sp.reference, sp.name, sp.stock_qty
order by total_requested desc;

-- 4) Tendance mensuelle des pannes -----------------------------------
create or replace view v_monthly_failure_trend as
select date_trunc('month', reported_at)::date as month,
       count(*)                                as failures,
       count(*) filter (where status in ('resolved','closed')) as resolved,
       round(avg(extract(epoch from (resolved_at - reported_at)) / 3600.0)
             filter (where resolved_at is not null), 1) as avg_repair_hours
from failures
group by 1
order by 1;

-- 5) Répartition par entreprise --------------------------------------
create or replace view v_company_breakdown as
select c.id as company_id,
       c.name,
       count(distinct e.id)        as equipment_count,
       count(f.id)                 as failure_count,
       count(r.id)                 as part_request_count
from companies c
left join equipments e on e.company_id = c.id
left join failures   f on f.company_id = c.id
left join spare_part_requests r on r.company_id = c.id
group by c.id, c.name
order by failure_count desc;

-- 6) KPI cards (single-row summary) ----------------------------------
create or replace view v_kpi_summary as
select
  (select count(*) from equipments)                                   as total_equipment,
  (select count(*) from failures where status not in ('resolved','closed')) as open_failures,
  (select count(*) from spare_part_requests where status not in ('delivered','cancelled')) as pending_parts,
  (select round(avg(extract(epoch from (resolved_at - reported_at))/3600.0),1)
     from failures where resolved_at is not null)                     as avg_repair_hours;

-- Example RPC wrapper so the frontend can call supabase.rpc('kpi_summary')
create or replace function kpi_summary()
returns setof v_kpi_summary language sql stable as $$
  select * from v_kpi_summary;
$$;
