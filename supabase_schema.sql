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
-- ROW LEVEL SECURITY (RLS) - ENABLE FULL ACCESS FOR APP & ADMIN
-- ==============================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swatches ENABLE ROW LEVEL SECURITY;

-- Clean legacy policies
DROP POLICY IF EXISTS "Public leads access" ON public.leads;
DROP POLICY IF EXISTS "Anon can insert leads" ON public.leads;
DROP POLICY IF EXISTS "Allow all for leads" ON public.leads;

DROP POLICY IF EXISTS "Public reviews access" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can read reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow all for reviews" ON public.reviews;

DROP POLICY IF EXISTS "Public products access" ON public.products;
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
DROP POLICY IF EXISTS "Allow all for products" ON public.products;

DROP POLICY IF EXISTS "Public portfolio access" ON public.portfolio;
DROP POLICY IF EXISTS "Anyone can read portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Allow all for portfolio" ON public.portfolio;

DROP POLICY IF EXISTS "Public team access" ON public.team;
DROP POLICY IF EXISTS "Anyone can read team" ON public.team;
DROP POLICY IF EXISTS "Allow all for team" ON public.team;

DROP POLICY IF EXISTS "Public swatches access" ON public.swatches;
DROP POLICY IF EXISTS "Anyone can read swatches" ON public.swatches;
DROP POLICY IF EXISTS "Allow all for swatches" ON public.swatches;

-- Grant full operational policies so Admin Panel can manage leads, reviews, and catalog:
CREATE POLICY "Allow all for leads" ON public.leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for portfolio" ON public.portfolio FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for team" ON public.team FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all for swatches" ON public.swatches FOR ALL USING (true) WITH CHECK (true);
