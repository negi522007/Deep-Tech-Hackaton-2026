-- =====================================================================
--  Demo seed data — enough to make every dashboard look alive.
--  Run AFTER schema.sql.
-- =====================================================================

insert into companies (id, name, sector) values
  ('11111111-1111-1111-1111-111111111111', 'SOBEBRA Cotonou',  'Beverage'),
  ('22222222-2222-2222-2222-222222222222', 'CIMBENIN',         'Cement'),
  ('33333333-3333-3333-3333-333333333333', 'Bénin Textile SA', 'Textile')
on conflict do nothing;

insert into spare_parts (reference, name, category, unit_price, stock_qty) values
  ('BRG-6204',  'Roulement 6204-2RS',        'bearing',    4500,  12),
  ('BLT-A45',   'Courroie trapézoïdale A45',  'belt',       8000,  3),
  ('SEN-PT100', 'Sonde température PT100',    'sensor',    15000,  7),
  ('FLT-HY10',  'Filtre hydraulique HY-10',   'filter',     6200,  0),
  ('MTR-3KW',   'Moteur asynchrone 3kW',      'motor',    180000,  1)
on conflict do nothing;

insert into equipments (id, company_id, name, category, serial_number, model, manufacturer, purchase_date, location) values
  ('aaaa1111-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Convoyeur ligne 1','conveyor','CNV-001','C200','SIEMENS','2021-03-10','Hall A'),
  ('aaaa1111-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Compresseur air','compressor','CMP-014','AtlasGA22','ATLAS COPCO','2020-07-01','Salle technique'),
  ('aaaa2222-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','Broyeur à boulets','mill','MIL-007','BM-90','FLSmidth','2019-11-20','Atelier broyage'),
  ('aaaa3333-0000-0000-0000-000000000004','33333333-3333-3333-3333-333333333333','Métier à tisser','loom','LOM-031','Picanol-OmniPlus','PICANOL','2022-01-15','Tissage 2')
on conflict do nothing;

-- Failures across several months for trend charts
insert into failures (equipment_id, company_id, title, category, severity, status, reported_at, resolved_at) values
  ('aaaa1111-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Roulement bruyant','mechanical','high','resolved', now() - interval '95 days', now() - interval '94 days'),
  ('aaaa1111-0000-0000-0000-000000000001','11111111-1111-1111-1111-111111111111','Courroie cassée','mechanical','critical','resolved', now() - interval '60 days', now() - interval '59 days'),
  ('aaaa1111-0000-0000-0000-000000000002','11111111-1111-1111-1111-111111111111','Surchauffe moteur','electrical','high','in_repair', now() - interval '35 days', null),
  ('aaaa2222-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','Fuite hydraulique','hydraulic','critical','reported', now() - interval '20 days', null),
  ('aaaa2222-0000-0000-0000-000000000003','22222222-2222-2222-2222-222222222222','Capteur HS','electrical','medium','resolved', now() - interval '12 days', now() - interval '11 days'),
  ('aaaa3333-0000-0000-0000-000000000004','33333333-3333-3333-3333-333333333333','Vibration anormale','mechanical','medium','diagnosing', now() - interval '5 days', null)
on conflict do nothing;
