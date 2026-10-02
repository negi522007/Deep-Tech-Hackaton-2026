-- ============================================================================
-- Seed Data — Realistic Demo Data for Smart Asset Intelligence
-- ============================================================================

-- Organizations
INSERT INTO organizations (id, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'Sinotex Industries - Textile Division'),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'Nairobi Textiles Ltd'),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'Bangalore Precision Machinery');

-- Equipment Categories
INSERT INTO equipment_categories (org_id, name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'Compressors'),
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'Motors'),
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 'Pumps'),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'Spinners'),
  ('550e8400-e29b-41d4-a716-446655440002'::UUID, 'Looms'),
  ('550e8400-e29b-41d4-a716-446655440003'::UUID, 'CNC Machines');

-- Failure Categories
INSERT INTO failure_categories (name) VALUES
  ('Bearing Degradation'),
  ('Seal Failure'),
  ('Electrical Failure'),
  ('Hydraulic Leak'),
  ('Motor Burnout'),
  ('Belt Slip'),
  ('Corrosion'),
  ('Misalignment');

-- Parts
INSERT INTO parts (name, sku, category, typical_lead_time_days) VALUES
  ('Ball Bearing 6205-2RS', 'BBR-6205', 'Bearings', 7),
  ('Shaft Seal', 'SEAL-305', 'Seals', 5),
  ('Timing Belt T-1600', 'BELT-T1600', 'Belts', 3),
  ('Motor Coupling', 'COUP-40', 'Couplings', 14),
  ('Hydraulic Pump', 'HYDR-P350', 'Hydraulics', 21),
  ('Stator Coil', 'STAT-480', 'Electrical', 28),
  ('Drive Pulley', 'PULLY-95', 'Pulleys', 5),
  ('Vibration Damper', 'DAMP-V500', 'Dampers', 10);

-- Equipment (Demo machines)
INSERT INTO equipment (org_id, category_id, name, serial_number, model, manufacturer, purchase_date, status, photo_url) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID, 
   (SELECT id FROM equipment_categories WHERE name = 'Compressors' AND org_id = '550e8400-e29b-41d4-a716-446655440001'::UUID),
   'Compressor AX-200', 'SN-20230415-001', 'Rotair AX-200', 'Rotair', '2023-04-15'::DATE, 'operational', NULL),
  
  ('550e8400-e29b-41d4-a716-446655440001'::UUID,
   (SELECT id FROM equipment_categories WHERE name = 'Motors' AND org_id = '550e8400-e29b-41d4-a716-446655440001'::UUID),
   'Main Drive Motor', 'SN-20230515-002', 'EF-7.5kW', 'ABB', '2023-05-15'::DATE, 'degraded', NULL),
  
  ('550e8400-e29b-41d4-a716-446655440002'::UUID,
   (SELECT id FROM equipment_categories WHERE name = 'Looms' AND org_id = '550e8400-e29b-41d4-a716-446655440002'::UUID),
   'Weaving Loom Unit 3', 'SN-20220920-045', 'Tsudakoma ZAX', 'Tsudakoma', '2022-09-20'::DATE, 'operational', NULL),
  
  ('550e8400-e29b-41d4-a716-446655440003'::UUID,
   (SELECT id FROM equipment_categories WHERE name = 'CNC Machines' AND org_id = '550e8400-e29b-41d4-a716-446655440003'::UUID),
   'CNC Vertical Center', 'SN-20210705-012', 'VMC-550', 'Haas', '2021-07-05'::DATE, 'operational', NULL);

-- Failures (Historical + current)
INSERT INTO failures (org_id, equipment_id, failure_category_id, description, severity, status, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID,
   (SELECT id FROM equipment WHERE serial_number = 'SN-20230415-001'),
   (SELECT id FROM failure_categories WHERE name = 'Bearing Degradation'),
   'High-pitched noise from compressor, unusual vibration detected',
   'high'::severity,
   'open'::failure_status,
   now() - INTERVAL '2 hours'),
  
  ('550e8400-e29b-41d4-a716-446655440001'::UUID,
   (SELECT id FROM equipment WHERE serial_number = 'SN-20230515-002'),
   (SELECT id FROM failure_categories WHERE name = 'Motor Burnout'),
   'Slight electrical burn smell, temperature reading above normal',
   'medium'::severity,
   'diagnosed'::failure_status,
   now() - INTERVAL '24 hours'),
  
  ('550e8400-e29b-41d4-a716-446655440002'::UUID,
   (SELECT id FROM equipment WHERE serial_number = 'SN-20220920-045'),
   (SELECT id FROM failure_categories WHERE name = 'Belt Slip'),
   'Warp thread tension fluctuating, belt slippage suspected',
   'high'::severity,
   'resolved'::failure_status,
   now() - INTERVAL '72 hours');

-- Part Requests (with workflow events)
INSERT INTO part_requests (org_id, equipment_id, failure_id, part_id, description, urgency, current_status, from_ai, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::UUID,
   (SELECT id FROM equipment WHERE serial_number = 'SN-20230415-001'),
   (SELECT id FROM failures WHERE equipment_id = (SELECT id FROM equipment WHERE serial_number = 'SN-20230415-001') LIMIT 1),
   (SELECT id FROM parts WHERE sku = 'BBR-6205'),
   'Replace worn bearing in compressor',
   'urgent'::request_urgency,
   'analysis'::workflow_status,
   true,
   now() - INTERVAL '1.5 hours');

-- Workflow Events
INSERT INTO part_request_events (part_request_id, from_status, to_status, note, created_at) VALUES
  ((SELECT id FROM part_requests WHERE part_id = (SELECT id FROM parts WHERE sku = 'BBR-6205')),
   'submitted'::workflow_status,
   'analysis'::workflow_status,
   'Received and logged',
   now() - INTERVAL '1.5 hours'),
  
  ((SELECT id FROM part_requests WHERE part_id = (SELECT id FROM parts WHERE sku = 'BBR-6205')),
   'analysis'::workflow_status,
   'analysis'::workflow_status,
   'Inventory check complete — stock available',
   now() - INTERVAL '1 hour');

-- ============================================================================
-- This seed provides realistic demo data for:
-- - 3 Organizations
-- - 6 Categories + equipment types
-- - 8 Common industrial parts
-- - 4 Demo machines with realistic names/models
-- - 3 Historical + current failures
-- - 1 Active part request (with events showing progression)
-- ============================================================================
