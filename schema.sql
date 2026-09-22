-- Supabase Schema for AI Waste-to-Buyer Intelligence Platform (CIRCULON)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  company_name TEXT NOT NULL,
  industry TEXT,
  phone TEXT,
  role TEXT DEFAULT 'seller' CHECK (role IN ('seller', 'buyer', 'admin', 'driver')),
  company_address TEXT,
  id_proof_number TEXT,
  id_proof_url TEXT,
  material_focus TEXT,
  approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  driver_status TEXT DEFAULT 'free' CHECK (driver_status IN ('free', 'in_work')),
  current_location_lat NUMERIC,
  current_location_lng NUMERIC,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Waste Materials (Listings)
CREATE TABLE IF NOT EXISTS public.waste_materials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'KG',
  condition TEXT,
  moisture_percentage NUMERIC DEFAULT 5,
  contamination_level TEXT DEFAULT 'Low' CHECK (contamination_level IN ('Low', 'Medium', 'High')),
  location TEXT NOT NULL,
  expected_price NUMERIC,
  available_date TEXT,
  description TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'matched', 'sold', 'completed', 'rejected', 'archived', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. AI Analysis Results (Stores history & diagnostics)
CREATE TABLE IF NOT EXISTS public.ai_analyses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  waste_id UUID REFERENCES public.waste_materials(id) ON DELETE CASCADE,
  material_type TEXT NOT NULL,
  category TEXT NOT NULL,
  confidence_score NUMERIC DEFAULT 0.90,
  quality_estimate TEXT DEFAULT 'High',
  contamination_estimate TEXT DEFAULT 'Low',
  possible_industries JSONB NOT NULL DEFAULT '[]'::jsonb,
  possible_applications JSONB NOT NULL DEFAULT '[]'::jsonb,
  possible_recycling_methods JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_processing_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_value_min NUMERIC,
  estimated_value_max NUMERIC,
  co2_savings_kg NUMERIC,
  landfill_diversion_kg NUMERIC,
  model_used TEXT NOT NULL,
  analysis_result JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Buyers (CRM / Enterprise Registry)
CREATE TABLE IF NOT EXISTS public.buyers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  buyer_type TEXT,
  state TEXT,
  city TEXT,
  country TEXT DEFAULT 'India',
  materials_required JSONB NOT NULL DEFAULT '[]'::jsonb,
  min_quantity NUMERIC,
  max_quantity NUMERIC,
  preferred_quality TEXT,
  min_price NUMERIC,
  max_price NUMERIC,
  website TEXT,
  email TEXT,
  phone TEXT,
  contact_person TEXT,
  notes TEXT,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('verified', 'unverified', 'pending')),
  crm_status TEXT DEFAULT 'NEW' CHECK (crm_status IN ('NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATION', 'CONVERTED', 'REJECTED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Buyer Requirements (Custom Procurement Specifications)
CREATE TABLE IF NOT EXISTS public.buyer_requirements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  min_quantity NUMERIC NOT NULL,
  max_quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'KG',
  preferred_quality TEXT DEFAULT 'Medium+',
  max_price NUMERIC,
  preferred_location TEXT,
  industry TEXT,
  required_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Buyer Saved Listings (Bookmarks)
CREATE TABLE IF NOT EXISTS public.buyer_saved_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  waste_id UUID REFERENCES public.waste_materials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(buyer_id, waste_id)
);

-- 7. Buyer Match Analyses (Scoring engine)
CREATE TABLE IF NOT EXISTS public.buyer_matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  waste_id UUID REFERENCES public.waste_materials(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.buyers(id) ON DELETE CASCADE,
  overall_score NUMERIC NOT NULL,
  material_compatibility NUMERIC,
  industry_compatibility NUMERIC,
  quantity_compatibility NUMERIC,
  quality_compatibility NUMERIC,
  price_compatibility NUMERIC,
  location_compatibility NUMERIC,
  strengths JSONB DEFAULT '[]'::jsonb,
  concerns JSONB DEFAULT '[]'::jsonb,
  recommendation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(waste_id, buyer_id)
);

-- 8. Connection Requests
CREATE TABLE IF NOT EXISTS public.connection_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  waste_id UUID REFERENCES public.waste_materials(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(seller_id, buyer_id, waste_id)
);

-- 9. Deals & Commercial Negotiations
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  waste_id UUID REFERENCES public.waste_materials(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agreed_quantity NUMERIC NOT NULL,
  agreed_price NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'NEGOTIATING' CHECK (status IN ('NEGOTIATING', 'AGREED', 'PICKUP_SCHEDULED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'CANCELLED')),
  pickup_date TIMESTAMP WITH TIME ZONE,
  delivery_date TIMESTAMP WITH TIME ZONE,
  driver_info JSONB,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Deal Messages (Negotiation Timeline)
CREATE TABLE IF NOT EXISTS public.deal_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_role TEXT CHECK (sender_role IN ('seller', 'buyer', 'admin', 'driver')),
  message TEXT NOT NULL,
  proposed_quantity NUMERIC,
  proposed_price NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Shipments & Logistics Tracking
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  connection_id UUID REFERENCES public.connection_requests(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pickup_lat NUMERIC,
  pickup_lng NUMERIC,
  dropoff_lat NUMERIC,
  dropoff_lng NUMERIC,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_transit', 'delivered')),
  status_step TEXT DEFAULT 'ASSIGNED' CHECK (status_step IN ('ASSIGNED', 'START_TRIP', 'AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'AT_DELIVERY', 'DELIVERED', 'COMPLETED')),
  delivery_proof_url TEXT,
  weighbridge_slip TEXT,
  recipient_signature TEXT,
  delivery_notes TEXT,
  distance_km NUMERIC,
  freight_cost NUMERIC,
  co2_freight_emissions_kg NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Safety & Moderation Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  reported_type TEXT CHECK (reported_type IN ('user', 'listing', 'transaction', 'suspicious_activity')),
  target_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Digital Material Passports (DPP)
CREATE TABLE IF NOT EXISTS public.material_passports (
  id TEXT PRIMARY KEY,
  waste_id UUID REFERENCES public.waste_materials(id) ON DELETE CASCADE,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  batch_number TEXT NOT NULL,
  material_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT DEFAULT 'KG',
  origin_location TEXT NOT NULL,
  origin_company TEXT NOT NULL,
  seller_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  buyer_company TEXT,
  buyer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  quality_score NUMERIC DEFAULT 85,
  purity_percentage NUMERIC DEFAULT 90,
  circularity_score NUMERIC DEFAULT 92,
  co2_avoided_kg NUMERIC DEFAULT 0,
  landfill_diverted_kg NUMERIC DEFAULT 0,
  water_saved_liters NUMERIC DEFAULT 0,
  qr_payload_url TEXT,
  certificate_hash TEXT NOT NULL,
  custody_timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. Product Valorization Recommendations
CREATE TABLE IF NOT EXISTS public.product_recommendations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  waste_id UUID REFERENCES public.waste_materials(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  recovered_material TEXT NOT NULL,
  why_suitable TEXT NOT NULL,
  required_processing JSONB DEFAULT '[]'::jsonb,
  approximate_feasibility NUMERIC DEFAULT 85,
  required_quality TEXT,
  potential_industry TEXT,
  potential_buyer_category TEXT,
  estimated_value_min NUMERIC,
  estimated_value_max NUMERIC,
  economic_ranking_score NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Industrial Symbiosis Links
CREATE TABLE IF NOT EXISTS public.industrial_symbiosis_links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  source_company TEXT NOT NULL,
  target_company TEXT NOT NULL,
  material_name TEXT NOT NULL,
  annual_volume_kg NUMERIC NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'potential', 'negotiating')),
  co2_offset_kg NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Market Opportunities
CREATE TABLE IF NOT EXISTS public.market_opportunities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  material_name TEXT NOT NULL,
  category TEXT NOT NULL,
  demand_kg NUMERIC NOT NULL,
  available_supply_kg NUMERIC NOT NULL,
  potential_buyers_count INTEGER DEFAULT 1,
  preferred_price_min NUMERIC,
  preferred_price_max NUMERIC,
  opportunity_level TEXT DEFAULT 'HIGH' CHECK (opportunity_level IN ('HIGH', 'MODERATE', 'EMERGING')),
  urgency TEXT DEFAULT 'Immediate',
  data_source TEXT DEFAULT 'Based on CIRCULON buyer requirements',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_saved_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buyer_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_passports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industrial_symbiosis_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_opportunities ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view active waste" ON public.waste_materials FOR SELECT USING (status IN ('active', 'matched', 'sold', 'completed'));
CREATE POLICY "Users can manage their own waste" ON public.waste_materials FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can manage requirements" ON public.buyer_requirements FOR ALL USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers can manage saved listings" ON public.buyer_saved_listings FOR ALL USING (auth.uid() = buyer_id);

CREATE POLICY "Parties can view their deals" ON public.deals FOR SELECT USING (auth.uid() = seller_id OR auth.uid() = buyer_id);
CREATE POLICY "Parties can update their deals" ON public.deals FOR UPDATE USING (auth.uid() = seller_id OR auth.uid() = buyer_id);
CREATE POLICY "Parties can insert deals" ON public.deals FOR INSERT WITH CHECK (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE POLICY "Parties can view deal messages" ON public.deal_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.deals d WHERE d.id = deal_id AND (d.seller_id = auth.uid() OR d.buyer_id = auth.uid()))
);
CREATE POLICY "Parties can insert deal messages" ON public.deal_messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Public can view verified passports" ON public.material_passports FOR SELECT USING (true);
CREATE POLICY "Sellers can manage passports" ON public.material_passports FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Anyone can view market opportunities" ON public.market_opportunities FOR SELECT USING (true);
CREATE POLICY "Anyone can view symbiosis links" ON public.industrial_symbiosis_links FOR SELECT USING (true);

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('material-images', 'material-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('id-proofs', 'id-proofs', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('delivery-proofs', 'delivery-proofs', true) ON CONFLICT DO NOTHING;
