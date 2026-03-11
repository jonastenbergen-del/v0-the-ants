-- The Ants Control Center Database Schema
-- All authenticated users can read/write all data (shared workspace)

-- Servers table
CREATE TABLE IF NOT EXISTS servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_number TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clans table
CREATE TABLE IF NOT EXISTS clans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tag TEXT NOT NULL,
  language TEXT DEFAULT 'EN' CHECK (language IN ('EN', 'DE', 'Mixed', 'Other')),
  active_time_window TEXT DEFAULT '18:00-23:00',
  pvp_focus TEXT DEFAULT 'Casual' CHECK (pvp_focus IN ('Casual', 'Competitive', 'Hardcore')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clan_id UUID NOT NULL REFERENCES clans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  main_class TEXT NOT NULL CHECK (main_class IN ('G', 'S', 'C')),
  power INTEGER,
  activity_status TEXT DEFAULT 'unknown' CHECK (activity_status IN ('active', 'inactive', 'unknown')),
  main_unit_image TEXT,
  notes TEXT,
  pvp_role TEXT,
  active_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member secondary classes (many-to-one)
CREATE TABLE IF NOT EXISTS member_secondary_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  troop_type TEXT NOT NULL CHECK (troop_type IN ('G', 'S', 'C')),
  weight INTEGER DEFAULT 1
);

-- Member clan history
CREATE TABLE IF NOT EXISTS member_clan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  server_number TEXT NOT NULL,
  server_name TEXT,
  clan_name TEXT NOT NULL,
  clan_tag TEXT NOT NULL,
  start_date TEXT,
  end_date TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unit images for members
CREATE TABLE IF NOT EXISTS unit_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  troop_type TEXT NOT NULL CHECK (troop_type IN ('G', 'S', 'C')),
  main_unit_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secondary unit images (many-to-one from unit_images)
CREATE TABLE IF NOT EXISTS unit_secondary_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_image_id UUID NOT NULL REFERENCES unit_images(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Groundhog runs for servers
CREATE TABLE IF NOT EXISTS groundhog_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id UUID NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  run_date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Groundhog run images
CREATE TABLE IF NOT EXISTS groundhog_run_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  groundhog_run_id UUID NOT NULL REFERENCES groundhog_runs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_secondary_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_clan_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_secondary_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE groundhog_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE groundhog_run_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can read/write all data
-- Servers
CREATE POLICY "servers_select" ON servers FOR SELECT TO authenticated USING (true);
CREATE POLICY "servers_insert" ON servers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "servers_update" ON servers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "servers_delete" ON servers FOR DELETE TO authenticated USING (true);

-- Clans
CREATE POLICY "clans_select" ON clans FOR SELECT TO authenticated USING (true);
CREATE POLICY "clans_insert" ON clans FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "clans_update" ON clans FOR UPDATE TO authenticated USING (true);
CREATE POLICY "clans_delete" ON clans FOR DELETE TO authenticated USING (true);

-- Members
CREATE POLICY "members_select" ON members FOR SELECT TO authenticated USING (true);
CREATE POLICY "members_insert" ON members FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "members_update" ON members FOR UPDATE TO authenticated USING (true);
CREATE POLICY "members_delete" ON members FOR DELETE TO authenticated USING (true);

-- Member secondary classes
CREATE POLICY "member_secondary_classes_select" ON member_secondary_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "member_secondary_classes_insert" ON member_secondary_classes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "member_secondary_classes_update" ON member_secondary_classes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "member_secondary_classes_delete" ON member_secondary_classes FOR DELETE TO authenticated USING (true);

-- Member clan history
CREATE POLICY "member_clan_history_select" ON member_clan_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "member_clan_history_insert" ON member_clan_history FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "member_clan_history_update" ON member_clan_history FOR UPDATE TO authenticated USING (true);
CREATE POLICY "member_clan_history_delete" ON member_clan_history FOR DELETE TO authenticated USING (true);

-- Unit images
CREATE POLICY "unit_images_select" ON unit_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "unit_images_insert" ON unit_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "unit_images_update" ON unit_images FOR UPDATE TO authenticated USING (true);
CREATE POLICY "unit_images_delete" ON unit_images FOR DELETE TO authenticated USING (true);

-- Unit secondary images
CREATE POLICY "unit_secondary_images_select" ON unit_secondary_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "unit_secondary_images_insert" ON unit_secondary_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "unit_secondary_images_update" ON unit_secondary_images FOR UPDATE TO authenticated USING (true);
CREATE POLICY "unit_secondary_images_delete" ON unit_secondary_images FOR DELETE TO authenticated USING (true);

-- Groundhog runs
CREATE POLICY "groundhog_runs_select" ON groundhog_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "groundhog_runs_insert" ON groundhog_runs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "groundhog_runs_update" ON groundhog_runs FOR UPDATE TO authenticated USING (true);
CREATE POLICY "groundhog_runs_delete" ON groundhog_runs FOR DELETE TO authenticated USING (true);

-- Groundhog run images
CREATE POLICY "groundhog_run_images_select" ON groundhog_run_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "groundhog_run_images_insert" ON groundhog_run_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "groundhog_run_images_update" ON groundhog_run_images FOR UPDATE TO authenticated USING (true);
CREATE POLICY "groundhog_run_images_delete" ON groundhog_run_images FOR DELETE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clans_server_id ON clans(server_id);
CREATE INDEX IF NOT EXISTS idx_members_clan_id ON members(clan_id);
CREATE INDEX IF NOT EXISTS idx_member_secondary_classes_member_id ON member_secondary_classes(member_id);
CREATE INDEX IF NOT EXISTS idx_member_clan_history_member_id ON member_clan_history(member_id);
CREATE INDEX IF NOT EXISTS idx_unit_images_member_id ON unit_images(member_id);
CREATE INDEX IF NOT EXISTS idx_unit_secondary_images_unit_image_id ON unit_secondary_images(unit_image_id);
CREATE INDEX IF NOT EXISTS idx_groundhog_runs_server_id ON groundhog_runs(server_id);
CREATE INDEX IF NOT EXISTS idx_groundhog_run_images_groundhog_run_id ON groundhog_run_images(groundhog_run_id);
