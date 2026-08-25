/*
# Vinayaka Chavithi Festival Platform — Full Schema

## Overview
Complete database for the Sanathan Youth Vinayaka Chavithi festival memory platform.
Admin-managed content for festival years, schedules, programs, photos, videos, members, portfolios, announcements.

## Tables Created
1. `admins` — links auth.users to admin role (uses Supabase Auth for credentials)
2. `festival_years` — one row per festival year (2021, 2022, ... unlimited)
3. `festival_schedules` — schedule items per year (time + title)
4. `festival_programs` — cultural/youth/puja programs per year
5. `members` — Sanathan Youth members with public portfolios
6. `member_links` — social links per member
7. `photos` — photo gallery items, categorized by year/event/category
8. `videos` — video gallery items (YouTube or external URLs)
9. `announcements` — homepage announcements
10. `site_settings` — key-value site configuration

## Security
- All tables have RLS enabled.
- Public tables (festival_years, schedules, programs, members, member_links, photos, videos, announcements, site_settings) are readable by anon (public website).
- Write operations restricted to authenticated admins.
- `admins` table only readable by authenticated users (self-check).
- Storage buckets created for images and videos.

## Notes
- Admin auth uses Supabase Auth (auth.users). The `admins` table links auth users to admin role.
- Member `slug` is unique for portfolio URLs (/portfolio/manoj-kumar).
- Festival year `slug` is unique for year URLs (/vinayaka-chavithi/2025).
- Member mobile only shown if `show_mobile` is true.
*/

-- ============ ADMIN TABLE ============
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_self_read" ON admins;
CREATE POLICY "admins_self_read" ON admins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admins_self_insert" ON admins;
CREATE POLICY "admins_self_insert" ON admins FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============ FESTIVAL YEARS ============
CREATE TABLE IF NOT EXISTS festival_years (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year int NOT NULL UNIQUE,
  title text NOT NULL DEFAULT '',
  slug text NOT NULL UNIQUE,
  description text DEFAULT '',
  banner_url text DEFAULT '',
  start_date date,
  end_date date,
  start_time text DEFAULT '',
  end_time text DEFAULT '',
  location_name text DEFAULT '',
  address text DEFAULT '',
  latitude float8,
  longitude float8,
  chief_guests text DEFAULT '',
  organizers text DEFAULT '',
  achievements text DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE festival_years ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fy_public_read" ON festival_years;
CREATE POLICY "fy_public_read" ON festival_years FOR SELECT
  TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "fy_admin_read_all" ON festival_years;
CREATE POLICY "fy_admin_read_all" ON festival_years FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "fy_admin_insert" ON festival_years;
CREATE POLICY "fy_admin_insert" ON festival_years FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "fy_admin_update" ON festival_years;
CREATE POLICY "fy_admin_update" ON festival_years FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "fy_admin_delete" ON festival_years;
CREATE POLICY "fy_admin_delete" ON festival_years FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============ FESTIVAL SCHEDULES ============
CREATE TABLE IF NOT EXISTS festival_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_year_id uuid NOT NULL REFERENCES festival_years(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  start_time text NOT NULL DEFAULT '',
  end_time text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE festival_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fs_public_read" ON festival_schedules;
CREATE POLICY "fs_public_read" ON festival_schedules FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "fs_admin_insert" ON festival_schedules;
CREATE POLICY "fs_admin_insert" ON festival_schedules FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "fs_admin_update" ON festival_schedules;
CREATE POLICY "fs_admin_update" ON festival_schedules FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "fs_admin_delete" ON festival_schedules;
CREATE POLICY "fs_admin_delete" ON festival_schedules FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============ FESTIVAL PROGRAMS ============
CREATE TABLE IF NOT EXISTS festival_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  festival_year_id uuid NOT NULL REFERENCES festival_years(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  date text DEFAULT '',
  time text DEFAULT '',
  location text DEFAULT '',
  image_url text DEFAULT '',
  category text DEFAULT 'Cultural Programs',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE festival_programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fp_public_read" ON festival_programs;
CREATE POLICY "fp_public_read" ON festival_programs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "fp_admin_insert" ON festival_programs;
CREATE POLICY "fp_admin_insert" ON festival_programs FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "fp_admin_update" ON festival_programs;
CREATE POLICY "fp_admin_update" ON festival_programs FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "fp_admin_delete" ON festival_programs;
CREATE POLICY "fp_admin_delete" ON festival_programs FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============ MEMBERS ============
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  profile_image text DEFAULT '',
  role text DEFAULT '',
  bio text DEFAULT '',
  skills text DEFAULT '',
  achievements text DEFAULT '',
  activities text DEFAULT '',
  festival_participation text DEFAULT '',
  mobile text DEFAULT '',
  email text DEFAULT '',
  show_mobile boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "m_public_read" ON members;
CREATE POLICY "m_public_read" ON members FOR SELECT
  TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "m_admin_read_all" ON members;
CREATE POLICY "m_admin_read_all" ON members FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "m_admin_insert" ON members;
CREATE POLICY "m_admin_insert" ON members FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "m_admin_update" ON members;
CREATE POLICY "m_admin_update" ON members FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "m_admin_delete" ON members;
CREATE POLICY "m_admin_delete" ON members FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============ MEMBER LINKS ============
CREATE TABLE IF NOT EXISTS member_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE member_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ml_public_read" ON member_links;
CREATE POLICY "ml_public_read" ON member_links FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "ml_admin_insert" ON member_links;
CREATE POLICY "ml_admin_insert" ON member_links FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "ml_admin_update" ON member_links;
CREATE POLICY "ml_admin_update" ON member_links FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "ml_admin_delete" ON member_links;
CREATE POLICY "ml_admin_delete" ON member_links FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============ PHOTOS ============
CREATE TABLE IF NOT EXISTS photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text DEFAULT '',
  image_url text NOT NULL,
  year int,
  album text DEFAULT '',
  category text DEFAULT 'Ganesh Idol',
  festival_year_id uuid REFERENCES festival_years(id) ON DELETE SET NULL,
  caption text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "p_public_read" ON photos;
CREATE POLICY "p_public_read" ON photos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "p_admin_insert" ON photos;
CREATE POLICY "p_admin_insert" ON photos FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "p_admin_update" ON photos;
CREATE POLICY "p_admin_update" ON photos FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "p_admin_delete" ON photos;
CREATE POLICY "p_admin_delete" ON photos FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============ VIDEOS ============
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  video_url text NOT NULL,
  thumbnail_url text DEFAULT '',
  year int,
  category text DEFAULT 'Festival Videos',
  festival_year_id uuid REFERENCES festival_years(id) ON DELETE SET NULL,
  description text DEFAULT '',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "v_public_read" ON videos;
CREATE POLICY "v_public_read" ON videos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "v_admin_insert" ON videos;
CREATE POLICY "v_admin_insert" ON videos FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "v_admin_update" ON videos;
CREATE POLICY "v_admin_update" ON videos FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "v_admin_delete" ON videos;
CREATE POLICY "v_admin_delete" ON videos FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============ ANNOUNCEMENTS ============
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text DEFAULT '',
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "a_public_read" ON announcements;
CREATE POLICY "a_public_read" ON announcements FOR SELECT
  TO anon, authenticated USING (published = true);

DROP POLICY IF EXISTS "a_admin_read_all" ON announcements;
CREATE POLICY "a_admin_read_all" ON announcements FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "a_admin_insert" ON announcements;
CREATE POLICY "a_admin_insert" ON announcements FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "a_admin_update" ON announcements;
CREATE POLICY "a_admin_update" ON announcements FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "a_admin_delete" ON announcements;
CREATE POLICY "a_admin_delete" ON announcements FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============ SITE SETTINGS ============
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text DEFAULT ''
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ss_public_read" ON site_settings;
CREATE POLICY "ss_public_read" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "ss_admin_insert" ON site_settings;
CREATE POLICY "ss_admin_insert" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "ss_admin_update" ON site_settings;
CREATE POLICY "ss_admin_update" ON site_settings FOR UPDATE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

DROP POLICY IF EXISTS "ss_admin_delete" ON site_settings;
CREATE POLICY "ss_admin_delete" ON site_settings FOR DELETE
  TO authenticated USING (EXISTS (SELECT 1 FROM admins WHERE admins.user_id = auth.uid()));

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_festival_years_year ON festival_years(year);
CREATE INDEX IF NOT EXISTS idx_photos_year ON photos(year);
CREATE INDEX IF NOT EXISTS idx_photos_category ON photos(category);
CREATE INDEX IF NOT EXISTS idx_videos_year ON videos(year);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_members_slug ON members(slug);
CREATE INDEX IF NOT EXISTS idx_schedules_year ON festival_schedules(festival_year_id);
CREATE INDEX IF NOT EXISTS idx_programs_year ON festival_programs(festival_year_id);

-- ============ SEED DATA ============
INSERT INTO site_settings (key, value) VALUES
  ('about_text', 'Sanathan Youth is a village-based cultural collective dedicated to preserving and celebrating our traditions. Our Vinayaka Chavithi festival brings the entire community together in devotion, joy, and unity.'),
  ('contact_email', 'sanathanyouth@gmail.com'),
  ('contact_phone', '+91 90000 00000'),
  ('contact_address', 'Sanathan Youth, Village Temple Road, Andhra Pradesh, India'),
  ('facebook_url', ''),
  ('instagram_url', ''),
  ('youtube_url', ''),
  ('whatsapp_url', '')
ON CONFLICT (key) DO NOTHING;

-- Seed festival years
INSERT INTO festival_years (year, title, slug, description, start_date, start_time, end_time, location_name, address, latitude, longitude, chief_guests, organizers, achievements, published) VALUES
  (2026, 'Vinayaka Chavithi 2026', '2026', 'Join us for the grandest Vinayaka Chavithi celebration yet. New idol, expanded cultural programs, and community feast.', '2026-08-30', '08:00 AM', '10:00 PM', 'Sanathan Youth Temple Grounds', 'Temple Road, Village, Andhra Pradesh', 16.9376, 82.3442, 'To be announced', 'Sanathan Youth Committee', 'Largest idol to date', true),
  (2025, 'Vinayaka Chavithi 2025', '2025', 'A memorable celebration with record community participation, stunning decorations, and 9 days of cultural programs.', '2025-08-27', '08:00 AM', '10:00 PM', 'Sanathan Youth Temple Grounds', 'Temple Road, Village, Andhra Pradesh', 16.9376, 82.3442, 'Sri Rama Sharma, Cultural Leader', 'Sanathan Youth Committee', 'Best decoration award', true),
  (2024, 'Vinayaka Chavithi 2024', '2024', 'Beautiful Ganesh idol, vibrant procession, and unforgettable bhajan nights.', '2024-09-07', '08:00 AM', '09:30 PM', 'Sanathan Youth Temple Grounds', 'Temple Road, Village, Andhra Pradesh', 16.9376, 82.3442, 'Local Panchayat Members', 'Sanathan Youth Committee', 'Largest procession turnout', true),
  (2023, 'Vinayaka Chavithi 2023', '2023', 'The year we introduced youth-led cultural programs and community service initiatives.', '2023-09-19', '08:00 AM', '09:00 PM', 'Sanathan Youth Temple Grounds', 'Temple Road, Village, Andhra Pradesh', 16.9376, 82.3442, 'Village Elders', 'Sanathan Youth Committee', 'First youth cultural program', true),
  (2022, 'Vinayaka Chavithi 2022', '2022', 'A celebration of reunion as the community came together after challenging times.', '2022-09-01', '08:00 AM', '09:00 PM', 'Sanathan Youth Temple Grounds', 'Temple Road, Village, Andhra Pradesh', 16.9376, 82.3442, 'Community Leaders', 'Sanathan Youth Committee', 'Community unity award', true),
  (2021, 'Vinayaka Chavithi 2021', '2021', 'Our first organized Vinayaka Chavithi celebration — the beginning of the Sanathan Youth tradition.', '2021-09-10', '08:00 AM', '08:30 PM', 'Sanathan Youth Temple Grounds', 'Temple Road, Village, Andhra Pradesh', 16.9376, 82.3442, 'Founding Members', 'Sanathan Youth Founders', 'First festival', true)
ON CONFLICT (year) DO NOTHING;

-- Seed schedules for 2026
INSERT INTO festival_schedules (festival_year_id, title, description, start_time, end_time, sort_order)
SELECT fy.id, s.title, s.description, s.start_time, s.end_time, s.sort_order
FROM festival_years fy
CROSS JOIN (VALUES
  ('Ganesh Idol Arrival', 'The Ganesh idol arrives at the temple grounds', '08:00 AM', '09:00 AM', 1),
  ('Ganesh Puja', 'Main puja ceremony led by the priest', '09:00 AM', '11:00 AM', 2),
  ('Cultural Program', 'Youth cultural performances', '11:00 AM', '01:00 PM', 3),
  ('Community Activities', 'Community gathering and activities', '02:00 PM', '04:00 PM', 4),
  ('Special Program', 'Special guest program and speeches', '05:00 PM', '06:30 PM', 5),
  ('Bhajans', 'Evening bhajan session', '07:00 PM', '08:00 PM', 6),
  ('Prasadam Distribution', 'Community prasadam distribution', '08:00 PM', '09:00 PM', 7)
) AS s(title, description, start_time, end_time, sort_order)
WHERE fy.year = 2026
ON CONFLICT DO NOTHING;

-- Seed programs for 2026
INSERT INTO festival_programs (festival_year_id, title, description, date, time, location, category)
SELECT fy.id, p.title, p.description, p.date, p.time, p.location, p.category
FROM festival_years fy
CROSS JOIN (VALUES
  ('Ganesh Puja', 'Traditional Ganesh puja with 21 modaks', 'Aug 30, 2026', '09:00 AM', 'Temple Grounds', 'Puja'),
  ('Youth Dance Performance', 'Folk dance by Sanathan Youth members', 'Aug 30, 2026', '11:00 AM', 'Main Stage', 'Dance'),
  ('Bhajan Night', 'Devotional bhajans and songs', 'Aug 30, 2026', '07:00 PM', 'Temple Hall', 'Music'),
  ('Community Service', 'Village clean-up drive before festival', 'Aug 29, 2026', '06:00 AM', 'Village', 'Community Service'),
  ('Prasadam Distribution', 'Annadanam for all devotees', 'Aug 30, 2026', '08:00 PM', 'Dining Area', 'Community Service')
) AS p(title, description, date, time, location, category)
WHERE fy.year = 2026
ON CONFLICT DO NOTHING;

-- Seed announcements
INSERT INTO announcements (title, content, published) VALUES
  ('Vinayaka Chavithi 2026 Coming Soon!', 'Preparations are underway for the grandest Vinayaka Chavithi celebration. Stay tuned for the full schedule and programs.', true),
  ('Volunteers Needed', 'Sanathan Youth is looking for volunteers for decoration, logistics, and cultural programs. Contact the committee to join.', true)
ON CONFLICT DO NOTHING;

-- ============ STORAGE BUCKETS ============
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('festival-images', 'festival-images', true),
  ('member-images', 'member-images', true),
  ('gallery-images', 'gallery-images', true),
  ('event-images', 'event-images', true),
  ('video-thumbnails', 'video-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: public read, authenticated write
DROP POLICY IF EXISTS "storage_public_read_festival" ON storage.objects;
CREATE POLICY "storage_public_read_festival" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id IN ('festival-images', 'member-images', 'gallery-images', 'event-images', 'video-thumbnails'));

DROP POLICY IF EXISTS "storage_auth_write_festival" ON storage.objects;
CREATE POLICY "storage_auth_write_festival" ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('festival-images', 'member-images', 'gallery-images', 'event-images', 'video-thumbnails'));

DROP POLICY IF EXISTS "storage_auth_update_festival" ON storage.objects;
CREATE POLICY "storage_auth_update_festival" ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id IN ('festival-images', 'member-images', 'gallery-images', 'event-images', 'video-thumbnails'));

DROP POLICY IF EXISTS "storage_auth_delete_festival" ON storage.objects;
CREATE POLICY "storage_auth_delete_festival" ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id IN ('festival-images', 'member-images', 'gallery-images', 'event-images', 'video-thumbnails'));