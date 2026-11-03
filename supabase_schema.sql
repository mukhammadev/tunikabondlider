-- ==============================================================
-- TUNIKABOND LIDER - DATABASE INITIAL SCHEMA
-- Run this in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================

-- 1. LEADS (Arizalar)
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  name TEXT,
  phone TEXT,
  service TEXT,
  message TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  calc_data JSONB,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REVIEWS (Mijozlar sharhlari)
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Mijoz',
  project TEXT,
  location TEXT,
  rating INTEGER DEFAULT 5,
  comment TEXT NOT NULL,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS (Katalog mahsulotlari)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name JSONB NOT NULL,
  category TEXT,
  price TEXT,
  thickness TEXT,
  coating TEXT,
  warranty TEXT,
  image TEXT,
  specs JSONB,
  badge TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PORTFOLIO (Bajarilgan ishlar)
CREATE TABLE IF NOT EXISTS public.portfolio (
  id TEXT PRIMARY KEY,
  title JSONB,
  category TEXT,
  image TEXT,
  master_id TEXT,
  duration TEXT,
  location TEXT,
  desc JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TEAM (Ustalar va jamoa)
CREATE TABLE IF NOT EXISTS public.team (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  label TEXT,
  phone TEXT,
  photo TEXT,
  experience TEXT,
  completed_projects TEXT,
  bio TEXT,
  works JSONB,
  is_leader BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SWATCHES (Ranglar & teksturalar)
CREATE TABLE IF NOT EXISTS public.swatches (
  id TEXT PRIMARY KEY,
  name JSONB NOT NULL,
  category TEXT,
  code TEXT,
  color_hex TEXT,
  bg_gradient TEXT,
  image TEXT,
  texture TEXT,
  finish TEXT,
  coating TEXT,
  application TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================
-- ROW LEVEL SECURITY (RLS) - SECURE ACCESS CONTROL
-- ==============================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swatches ENABLE ROW LEVEL SECURITY;

-- 1. LEADS SECURITY:
-- Anon visitors can ONLY INSERT new leads (submit contact forms).
-- Anon CANNOT SELECT (read) leads — this strictly prevents customer phone/data leaks!
DROP POLICY IF EXISTS "Public leads access" ON public.leads;
DROP POLICY IF EXISTS "Anon can insert leads" ON public.leads;
CREATE POLICY "Anon can insert leads" ON public.leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 2. REVIEWS SECURITY:
-- Anyone can view reviews; anyone can submit a new review
DROP POLICY IF EXISTS "Public reviews access" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert reviews" ON public.reviews
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 3. CATALOG & CONTENT SECURITY:
-- Public read access for website visitors
DROP POLICY IF EXISTS "Public products access" ON public.products;
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public portfolio access" ON public.portfolio;
CREATE POLICY "Anyone can read portfolio" ON public.portfolio FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public team access" ON public.team;
CREATE POLICY "Anyone can read team" ON public.team FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public swatches access" ON public.swatches;
CREATE POLICY "Anyone can read swatches" ON public.swatches FOR SELECT TO anon, authenticated USING (true);
