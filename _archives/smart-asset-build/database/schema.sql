-- ============================================================================
-- Smart Asset Intelligence — Schéma Postgres (Supabase)
-- ============================================================================
-- Exécuter ce script dans l'éditeur SQL de Supabase
-- ============================================================================

-- ENUMS
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'technician');
CREATE TYPE equipment_status AS ENUM ('operational', 'degraded', 'down', 'maintenance');
CREATE TYPE severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE failure_status AS ENUM ('open', 'diagnosed', 'resolved', 'closed');
CREATE TYPE request_urgency AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE workflow_status AS ENUM ('submitted', 'analysis', 'inspection', 'validation', 'sourcing', 'delivery', 'closed');
CREATE TYPE media_kind AS ENUM ('photo', 'scan3d');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Organizations (multi-tenant root)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles (users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'technician',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Taxonomies
CREATE TABLE equipment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

CREATE TABLE failure_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  typical_lead_time_days INT
);

-- Equipment
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES equipment_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  serial_number TEXT,
  model TEXT,
  manufacturer TEXT,
  purchase_date DATE,
  status equipment_status NOT NULL DEFAULT 'operational',
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, serial_number)
);

-- Failures
CREATE TABLE failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  failure_category_id UUID REFERENCES failure_categories(id) ON DELETE SET NULL,
  description TEXT,
  severity severity NOT NULL DEFAULT 'medium',
  status failure_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Media Assets (photos, scans)
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  failure_id UUID REFERENCES failures(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  kind media_kind NOT NULL DEFAULT 'photo',
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI Diagnoses
CREATE TABLE ai_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  failure_id UUID NOT NULL REFERENCES failures(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL,
  model TEXT,
  defect_label TEXT,
  failure_category_id UUID REFERENCES failure_categories(id) ON DELETE SET NULL,
  severity_estimate severity,
  confidence NUMERIC(3, 2),
  recommended_part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
  recommended_part_text TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Part Requests
CREATE TABLE part_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  failure_id UUID REFERENCES failures(id) ON DELETE SET NULL,
  part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
  requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  description TEXT,
  urgency request_urgency NOT NULL DEFAULT 'medium',
  current_status workflow_status NOT NULL DEFAULT 'submitted',
  from_ai BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workflow Events (audit log for part requests)
CREATE TABLE part_request_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_request_id UUID NOT NULL REFERENCES part_requests(id) ON DELETE CASCADE,
  from_status workflow_status,
  to_status workflow_status NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  payload JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_org_id ON profiles(org_id);
CREATE INDEX idx_equipment_org_id ON equipment(org_id);
CREATE INDEX idx_equipment_category ON equipment(category_id);
CREATE INDEX idx_failures_org_id ON failures(org_id);
CREATE INDEX idx_failures_equipment ON failures(equipment_id);
CREATE INDEX idx_failures_status ON failures(status);
CREATE INDEX idx_media_failure ON media_assets(failure_id);
CREATE INDEX idx_diagnoses_failure ON ai_diagnoses(failure_id);
CREATE INDEX idx_part_requests_org ON part_requests(org_id);
CREATE INDEX idx_part_requests_equipment ON part_requests(equipment_id);
CREATE INDEX idx_part_requests_status ON part_requests(current_status);
CREATE INDEX idx_events_part_request ON part_request_events(part_request_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- ============================================================================
-- VIEWS (Analytics)
-- ============================================================================

-- Top failing equipment
CREATE OR REPLACE VIEW v_top_failing_equipment AS
SELECT 
  e.id,
  e.org_id,
  e.name,
  COUNT(f.id) AS failure_count
FROM equipment e
LEFT JOIN failures f ON f.equipment_id = e.id
GROUP BY e.id, e.org_id, e.name
ORDER BY failure_count DESC;

-- Top requested parts
CREATE OR REPLACE VIEW v_top_requested_parts AS
SELECT 
  COALESCE(p.name, pr.description) AS part,
  COUNT(*) AS request_count
FROM part_requests pr
LEFT JOIN parts p ON p.id = pr.part_id
GROUP BY COALESCE(p.name, pr.description)
ORDER BY request_count DESC;

-- Average time per workflow stage
CREATE OR REPLACE VIEW v_avg_time_per_stage AS
SELECT 
  to_status AS stage,
  AVG(EXTRACT(EPOCH FROM (next_at - created_at))/3600) AS avg_hours,
  COUNT(*) AS event_count
FROM (
  SELECT 
    to_status,
    created_at,
    LEAD(created_at) OVER (PARTITION BY part_request_id ORDER BY created_at) AS next_at
  FROM part_request_events
) t
WHERE next_at IS NOT NULL
GROUP BY to_status;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE part_request_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (example for equipment — repeat pattern for other tables)
CREATE POLICY "Users can view equipment in their org" ON equipment
  FOR SELECT USING (org_id = (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can insert equipment" ON equipment
  FOR INSERT WITH CHECK (
    org_id = (SELECT org_id FROM profiles WHERE id = auth.uid())
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Similar for failures, part_requests, etc.

-- ============================================================================
-- DONE
-- ============================================================================
