-- ============================================================================
-- CIRCULON Complete Clean Seed Data
-- ============================================================================
-- 10 SAMPLE COMPANIES WITH FULL AUTH CREDENTIALS, PROFILES & CIRCULAR ECOSYSTEM
-- ============================================================================
--
-- 🔑 ALL 10 COMPANY ACCOUNTS (EMAIL ID & PASSWORD INCLUDED):
--
-- -----------------------------------------------------------------------------------------------------------------------------------------
-- #  | COMPANY NAME                       | ROLE    | EMAIL ID                     | PASSWORD        | INDUSTRY & FOCUS
-- -----------------------------------------------------------------------------------------------------------------------------------------
-- 1  | Apex Industrial Recycling Corp     | Seller  | apex.textiles@circulon.com   | Seller@123456   | Textiles (Cotton & Denim Scraps)
--    | (Legacy Quick Login Alias)         | Seller  | seller@circulon.com          | Seller@123456   | (Points to Apex Industrial)
-- 2  | GreenPolymer Recyclers Ltd         | Buyer   | greenpolymer@circulon.com    | Buyer@123456    | Plastics & Polymers (PET & HDPE Flakes)
--    | (Legacy Quick Login Alias)         | Buyer   | buyer@circulon.com           | Buyer@123456    | (Points to GreenPolymer)
-- 3  | Tata EcoSteel & Foundry Works      | Seller  | ecosteel@circulon.com        | Steel@123456    | Metallurgy & Foundries (Slag & Mill Scale)
-- 4  | BioAgro Circular Energy Solutions  | Buyer   | bioagro@circulon.com         | BioAgro@123456  | Biofuels & Green Biomass (Bagasse & Husks)
-- 5  | Deccan Paper & Kraft Packaging     | Buyer   | deccanpaper@circulon.com     | Paper@123456    | Paper & Packaging (OCC Cardboard & Kraft)
-- 6  | EcoPlast Polymers & Compounds      | Seller  | ecoplast@circulon.com        | Plast@123456    | Plastics & Petrochemicals (HDPE & PET)
-- 7  | Horizon E-Waste & Metal Refiners   | Buyer   | horizon.refiners@circulon.com| Horizon@123456  | Electronics & E-Waste (PCBs & Copper Scrap)
-- 8  | Bharat BioChemicals & Solvents     | Seller  | bharat.bio@circulon.com      | Bharat@123456   | Agro-Processing & Chemicals (Bagasse & Ash)
-- 9  | InfraCycle Demolition & Aggregates | Seller  | infracycle@circulon.com      | Infra@123456    | Construction & Demolition (Aggregates & Ash)
-- 10 | QuickFreight Green Logistics       | Driver  | quickfreight@circulon.com    | Driver@123456   | Logistics, Freight & Dispatch Fleet
--    | (Legacy Quick Login Alias)         | Driver  | driver@circulon.com          | Driver@123456   | (Points to QuickFreight Fleet)
-- -- | ---------------------------------- | ------- | ---------------------------- | --------------- | ----------------------------------------
-- +  | CIRCULON Platform Governance (HQ)  | Admin   | admin@circulon.com           | Admin@123456    | Platform Administration & Governance
-- -----------------------------------------------------------------------------------------------------------------------------------------
--
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure necessary profile columns exist regardless of migration order
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS material_focus TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS driver_status TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_location_lat NUMERIC;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_location_lng NUMERIC;

-- 1. Wipe previous records for all 10 companies + admin + legacy aliases
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN (
    'admin@circulon.com',
    'seller@circulon.com',
    'apex.textiles@circulon.com',
    'buyer@circulon.com',
    'greenpolymer@circulon.com',
    'ecosteel@circulon.com',
    'bioagro@circulon.com',
    'deccanpaper@circulon.com',
    'ecoplast@circulon.com',
    'horizon.refiners@circulon.com',
    'bharat.bio@circulon.com',
    'infracycle@circulon.com',
    'driver@circulon.com',
    'quickfreight@circulon.com'
  )
);

DELETE FROM auth.users WHERE email IN (
  'admin@circulon.com',
  'seller@circulon.com',
  'apex.textiles@circulon.com',
  'buyer@circulon.com',
  'greenpolymer@circulon.com',
  'ecosteel@circulon.com',
  'bioagro@circulon.com',
  'deccanpaper@circulon.com',
  'ecoplast@circulon.com',
  'horizon.refiners@circulon.com',
  'bharat.bio@circulon.com',
  'infracycle@circulon.com',
  'driver@circulon.com',
  'quickfreight@circulon.com'
);

-- 2. Populate Auth, Profiles, Waste Listings, CRM, Deals, Passports & Symbiosis
DO $$ 
DECLARE 
  -- Admin ID
  v_admin_id UUID := gen_random_uuid();

  -- 10 Company IDs (+ alias IDs for backwards compatibility)
  v_c1_id UUID := gen_random_uuid();       -- Apex Textiles (apex.textiles@circulon.com)
  v_c1_alias_id UUID := gen_random_uuid(); -- Apex Legacy Alias (seller@circulon.com)
  v_c2_id UUID := gen_random_uuid();       -- GreenPolymer (greenpolymer@circulon.com)
  v_c2_alias_id UUID := gen_random_uuid(); -- GreenPolymer Legacy Alias (buyer@circulon.com)
  v_c3_id UUID := gen_random_uuid();       -- Tata EcoSteel (ecosteel@circulon.com)
  v_c4_id UUID := gen_random_uuid();       -- BioAgro Energy (bioagro@circulon.com)
  v_c5_id UUID := gen_random_uuid();       -- Deccan Paper (deccanpaper@circulon.com)
  v_c6_id UUID := gen_random_uuid();       -- EcoPlast Polymers (ecoplast@circulon.com)
  v_c7_id UUID := gen_random_uuid();       -- Horizon E-Waste Refiners (horizon.refiners@circulon.com)
  v_c8_id UUID := gen_random_uuid();       -- Bharat BioChemicals (bharat.bio@circulon.com)
  v_c9_id UUID := gen_random_uuid();       -- InfraCycle Demolition (infracycle@circulon.com)
  v_c10_id UUID := gen_random_uuid();      -- QuickFreight Logistics (quickfreight@circulon.com)
  v_c10_alias_id UUID := gen_random_uuid();-- Driver Legacy Alias (driver@circulon.com)

  -- Specific Material Waste IDs
  v_w_cotton_id UUID := gen_random_uuid();
  v_w_denim_id UUID := gen_random_uuid();
  v_w_hdpe_id UUID := gen_random_uuid();
  v_w_pet_id UUID := gen_random_uuid();
  v_w_slag_id UUID := gen_random_uuid();
  v_w_scrap_id UUID := gen_random_uuid();
  v_w_bagasse_id UUID := gen_random_uuid();
  v_w_rice_id UUID := gen_random_uuid();
  v_w_coir_id UUID := gen_random_uuid();
  v_w_concrete_id UUID := gen_random_uuid();
  v_w_flyash_id UUID := gen_random_uuid();
  v_w_cardboard_id UUID := gen_random_uuid();

  -- CRM Buyer Entry IDs
  v_crm1_id UUID := gen_random_uuid();
  v_crm2_id UUID := gen_random_uuid();
  v_crm3_id UUID := gen_random_uuid();
  v_crm4_id UUID := gen_random_uuid();
  v_crm5_id UUID := gen_random_uuid();
  v_crm6_id UUID := gen_random_uuid();

  -- Deal & Connection IDs
  v_deal1_id UUID := gen_random_uuid();
  v_deal2_id UUID := gen_random_uuid();
  v_deal3_id UUID := gen_random_uuid();
  v_deal4_id UUID := gen_random_uuid();
  v_conn1_id UUID := gen_random_uuid();
  v_conn2_id UUID := gen_random_uuid();
  v_conn3_id UUID := gen_random_uuid();

BEGIN

  ------------------------------------------------------------------------------
  -- [+] CIRCULON PLATFORM ADMINISTRATION (admin@circulon.com / Admin@123456)
  ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_admin_id, 'authenticated', 'authenticated',
    'admin@circulon.com', crypt('Admin@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"CIRCULON HQ","role":"admin"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_admin_id, v_admin_id,
    jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@circulon.com'),
    'email', v_admin_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, role, industry, phone, company_address, 
    id_proof_number, material_focus, approval_status, approved_at, 
    current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_admin_id, 'CIRCULON Platform Administration', 'admin@circulon.com', 'admin', 
    'Platform Governance & Compliance', '+91 44 2254 0000', 
    'Tidel Park, Rajiv Gandhi Salai, Taramani, Chennai, Tamil Nadu - 600113',
    'MCA-CIN: U72900TN2024PTC168890', 'Industrial Circular Intelligence', 'approved', NOW(),
    12.9897, 80.2483, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', approval_status = 'approved', company_name = 'CIRCULON Platform Administration', email = 'admin@circulon.com';


  ------------------------------------------------------------------------------
  -- [1] COMPANY 1: Apex Industrial Recycling Corp (SELLER)
  -- Email: apex.textiles@circulon.com | Password: Seller@123456
  ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c1_id, 'authenticated', 'authenticated',
    'apex.textiles@circulon.com', crypt('Seller@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"Apex Industrial Recycling Corp","role":"seller"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c1_id, v_c1_id,
    jsonb_build_object('sub', v_c1_id::text, 'email', 'apex.textiles@circulon.com'),
    'email', v_c1_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    approved_at, current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_c1_id, 'Apex Industrial Recycling Corp', 'apex.textiles@circulon.com', 
    'Textiles & Garment Manufacturing', '+91 98765 43210', 'seller', 
    'Plot 42, SIDCO Industrial Estate, Tirupur, Tamil Nadu - 641604', 
    'GSTIN: 33AAAAA1234A1Z5', 'Post-Industrial Cotton Comber, Denim Offcuts, Yarn Waste', 
    'approved', NOW(), 11.1085, 77.3411, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'seller', approval_status = 'approved', company_name = 'Apex Industrial Recycling Corp', email = 'apex.textiles@circulon.com';

  -- Quick Login Alias: seller@circulon.com -> Seller@123456
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c1_alias_id, 'authenticated', 'authenticated',
    'seller@circulon.com', crypt('Seller@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"Apex Industrial Recycling Corp (Quick Login)","role":"seller"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c1_alias_id, v_c1_alias_id,
    jsonb_build_object('sub', v_c1_alias_id::text, 'email', 'seller@circulon.com'),
    'email', v_c1_alias_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    approved_at, current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_c1_alias_id, 'Apex Industrial Recycling Corp (Quick Login)', 'seller@circulon.com', 
    'Textiles & Garment Manufacturing', '+91 98765 43210', 'seller', 
    'Plot 42, SIDCO Industrial Estate, Tirupur, Tamil Nadu - 641604', 
    'GSTIN: 33AAAAA1234A1Z5', 'Post-Industrial Cotton Comber, Denim Offcuts', 
    'approved', NOW(), 11.1085, 77.3411, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'seller', approval_status = 'approved', company_name = 'Apex Industrial Recycling Corp (Quick Login)', email = 'seller@circulon.com';


  ------------------------------------------------------------------------------
  -- [2] COMPANY 2: GreenPolymer Recyclers Ltd (BUYER)
  -- Email: greenpolymer@circulon.com | Password: Buyer@123456
  ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c2_id, 'authenticated', 'authenticated',
    'greenpolymer@circulon.com', crypt('Buyer@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"GreenPolymer Recyclers Ltd","role":"buyer"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c2_id, v_c2_id,
    jsonb_build_object('sub', v_c2_id::text, 'email', 'greenpolymer@circulon.com'),
    'email', v_c2_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    approved_at, current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_c2_id, 'GreenPolymer Recyclers Ltd', 'greenpolymer@circulon.com', 
    'Plastics & Polymer Recycling', '+91 98765 87654', 'buyer', 
    'Sector 18, Guindy Industrial Estate, Chennai, Tamil Nadu - 600032', 
    'CIN: U25209TN2020PTC123456', 'PET Flakes, HDPE Regrind, PP Granules, Post-Consumer Polymers', 
    'approved', NOW(), 13.0067, 80.2026, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'buyer', approval_status = 'approved', company_name = 'GreenPolymer Recyclers Ltd', email = 'greenpolymer@circulon.com';

  -- Quick Login Alias: buyer@circulon.com -> Buyer@123456
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c2_alias_id, 'authenticated', 'authenticated',
    'buyer@circulon.com', crypt('Buyer@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"GreenPolymer Recyclers Ltd (Quick Login)","role":"buyer"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c2_alias_id, v_c2_alias_id,
    jsonb_build_object('sub', v_c2_alias_id::text, 'email', 'buyer@circulon.com'),
    'email', v_c2_alias_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    approved_at, current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_c2_alias_id, 'GreenPolymer Recyclers Ltd (Quick Login)', 'buyer@circulon.com', 
    'Plastics & Polymer Recycling', '+91 98765 87654', 'buyer', 
    'Sector 18, Guindy Industrial Estate, Chennai, Tamil Nadu - 600032', 
    'CIN: U25209TN2020PTC123456', 'PET Flakes, HDPE Regrind, Post-Consumer Polymers', 
    'approved', NOW(), 13.0067, 80.2026, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'buyer', approval_status = 'approved', company_name = 'GreenPolymer Recyclers Ltd (Quick Login)', email = 'buyer@circulon.com';


  ------------------------------------------------------------------------------
  -- [3] COMPANY 3: Tata EcoSteel & Foundry Works (SELLER)
  -- Email: ecosteel@circulon.com | Password: Steel@123456
  ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c3_id, 'authenticated', 'authenticated',
    'ecosteel@circulon.com', crypt('Steel@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"Tata EcoSteel & Foundry Works","role":"seller"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c3_id, v_c3_id,
    jsonb_build_object('sub', v_c3_id::text, 'email', 'ecosteel@circulon.com'),
    'email', v_c3_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    approved_at, current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_c3_id, 'Tata EcoSteel & Foundry Works', 'ecosteel@circulon.com', 
    'Metallurgy & Heavy Engineering', '+91 98220 12345', 'seller', 
    'Plot 88, Pimpri-Chinchwad MIDC, Pune, Maharashtra - 411018', 
    'GSTIN: 27AABCT1330L1Z2', 'Blast Furnace Slag, Foundry Mill Scale, Scrap Iron, Steel Turnings', 
    'approved', NOW(), 18.6298, 73.7997, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'seller', approval_status = 'approved', company_name = 'Tata EcoSteel & Foundry Works', email = 'ecosteel@circulon.com';


  ------------------------------------------------------------------------------
  -- [4] COMPANY 4: BioAgro Circular Energy Solutions (BUYER)
  -- Email: bioagro@circulon.com | Password: BioAgro@123456
  ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c4_id, 'authenticated', 'authenticated',
    'bioagro@circulon.com', crypt('BioAgro@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"BioAgro Circular Energy Solutions","role":"buyer"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c4_id, v_c4_id,
    jsonb_build_object('sub', v_c4_id::text, 'email', 'bioagro@circulon.com'),
    'email', v_c4_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    approved_at, current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_c4_id, 'BioAgro Circular Energy Solutions', 'bioagro@circulon.com', 
    'Biofuels & Green Energy', '+91 94432 55670', 'buyer', 
    'State Highway 15, SIPCOT Phase 2, Perundurai, Erode, Tamil Nadu - 638052', 
    'GSTIN: 33AAGCB7788K1ZD', 'Sugarcane Bagasse, Paddy Rice Husk, Coconut Coir Pith, Biomass Pellets', 
    'approved', NOW(), 11.2755, 77.5828, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'buyer', approval_status = 'approved', company_name = 'BioAgro Circular Energy Solutions', email = 'bioagro@circulon.com';


  ------------------------------------------------------------------------------
  -- [5] COMPANY 5: Deccan Paper & Kraft Packaging Mills (BUYER)
  -- Email: deccanpaper@circulon.com | Password: Paper@123456
  ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c5_id, 'authenticated', 'authenticated',
    'deccanpaper@circulon.com', crypt('Paper@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"Deccan Paper & Kraft Packaging Mills","role":"buyer"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c5_id, v_c5_id,
    jsonb_build_object('sub', v_c5_id::text, 'email', 'deccanpaper@circulon.com'),
    'email', v_c5_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    approved_at, current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_c5_id, 'Deccan Paper & Kraft Packaging Mills', 'deccanpaper@circulon.com', 
    'Paper & Sustainable Packaging', '+91 98480 34567', 'buyer', 
    'Kalyani Barrage Road, Industrial Area, Rajahmundry, Andhra Pradesh - 533105', 
    'CIN: L21010AP1995PLC019876', 'Corrugated Cardboard (OCC), Kraft Trimmings, Waste Paper Bales', 
    'approved', NOW(), 17.0005, 81.8040, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'buyer', approval_status = 'approved', company_name = 'Deccan Paper & Kraft Packaging Mills', email = 'deccanpaper@circulon.com';


  ------------------------------------------------------------------------------
  -- [6] COMPANY 6: EcoPlast Polymers & Compounds (SELLER)
  -- Email: ecoplast@circulon.com | Password: Plast@123456
  ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c6_id, 'authenticated', 'authenticated',
    'ecoplast@circulon.com', crypt('Plast@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"EcoPlast Polymers & Compounds","role":"seller"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c6_id, v_c6_id,
    jsonb_build_object('sub', v_c6_id::text, 'email', 'ecoplast@circulon.com'),
    'email', v_c6_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    approved_at, current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_c6_id, 'EcoPlast Polymers & Compounds', 'ecoplast@circulon.com', 
    'Plastics & Petrochemicals', '+91 98450 78901', 'seller', 
    'Industrial Growth Centre, Peenya Stage 3, Bengaluru, Karnataka - 560058', 
    'GSTIN: 29AABCE4567M1Z8', 'HDPE Regrind, Washed PET Flakes, Polypropylene Granules', 
    'approved', NOW(), 13.0285, 77.5197, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'seller', approval_status = 'approved', company_name = 'EcoPlast Polymers & Compounds', email = 'ecoplast@circulon.com';


  ------------------------------------------------------------------------------
  -- [7] COMPANY 7: Horizon E-Waste & Precious Metal Refiners (BUYER)
  -- Email: horizon.refiners@circulon.com | Password: Horizon@123456
  ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c7_id, 'authenticated', 'authenticated',
    'horizon.refiners@circulon.com', crypt('Horizon@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"Horizon E-Waste & Precious Metal Refiners","role":"buyer"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c7_id, v_c7_id,
    jsonb_build_object('sub', v_c7_id::text, 'email', 'horizon.refiners@circulon.com'),
    'email', v_c7_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    approved_at, current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_c7_id, 'Horizon E-Waste & Precious Metal Refiners', 'horizon.refiners@circulon.com', 
    'E-Waste & Precious Metal Recovery', '+91 99001 23890', 'buyer', 
    'Electronics City Phase 1, Hosur Road, Bengaluru, Karnataka - 560100', 
    'CPCB: B-29016(48)/EPR/18/WM-III', 'Printed Circuit Boards (PCBs), Motherboards, Copper Slag, Lithium Cells', 
    'approved', NOW(), 12.8452, 77.6602, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'buyer', approval_status = 'approved', company_name = 'Horizon E-Waste & Precious Metal Refiners', email = 'horizon.refiners@circulon.com';


  ------------------------------------------------------------------------------
  -- [8] COMPANY 8: Bharat BioChemicals & Solvents Corp (SELLER)
  -- Email: bharat.bio@circulon.com | Password: Bharat@123456
  ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c8_id, 'authenticated', 'authenticated',
    'bharat.bio@circulon.com', crypt('Bharat@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"Bharat BioChemicals & Solvents Corp","role":"seller"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c8_id, v_c8_id,
    jsonb_build_object('sub', v_c8_id::text, 'email', 'bharat.bio@circulon.com'),
    'email', v_c8_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    approved_at, current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_c8_id, 'Bharat BioChemicals & Solvents Corp', 'bharat.bio@circulon.com', 
    'Agro-Processing & Bio-Chemicals', '+91 94422 66778', 'seller', 
    'Bhavani Main Road, Sugar Factory Complex, Erode, Tamil Nadu - 638316', 
    'GSTIN: 33AABCB9012J1ZH', 'Sugarcane Bagasse, Rice Husk Ash, Coconut Coir Pith Blocks', 
    'approved', NOW(), 11.3410, 77.7172, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'seller', approval_status = 'approved', company_name = 'Bharat BioChemicals & Solvents Corp', email = 'bharat.bio@circulon.com';


  ------------------------------------------------------------------------------
  -- [9] COMPANY 9: InfraCycle Demolition & Circular Aggregates (SELLER)
  -- Email: infracycle@circulon.com | Password: Infra@123456
  ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c9_id, 'authenticated', 'authenticated',
    'infracycle@circulon.com', crypt('Infra@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"InfraCycle Demolition & Circular Aggregates","role":"seller"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c9_id, v_c9_id,
    jsonb_build_object('sub', v_c9_id::text, 'email', 'infracycle@circulon.com'),
    'email', v_c9_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    approved_at, current_location_lat, current_location_lng, created_at
  ) VALUES (
    v_c9_id, 'InfraCycle Demolition & Circular Aggregates', 'infracycle@circulon.com', 
    'Construction & Sustainable Aggregates', '+91 97010 44556', 'seller', 
    'Outer Ring Road, Gachibowli Industrial Sector, Hyderabad, Telangana - 500032', 
    'GSTIN: 36AABCI5678Q1ZL', 'Recycled Concrete Aggregates, Fly Ash, Corrugated Cardboard Bales', 
    'approved', NOW(), 17.4401, 78.3489, NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'seller', approval_status = 'approved', company_name = 'InfraCycle Demolition & Circular Aggregates', email = 'infracycle@circulon.com';


  ------------------------------------------------------------------------------
  -- [10] COMPANY 10: QuickFreight Green Logistics Network (DRIVER / LOGISTICS)
  -- Email: quickfreight@circulon.com | Password: Driver@123456
  ------------------------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c10_id, 'authenticated', 'authenticated',
    'quickfreight@circulon.com', crypt('Driver@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"QuickFreight Green Logistics Network","role":"driver"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c10_id, v_c10_id,
    jsonb_build_object('sub', v_c10_id::text, 'email', 'quickfreight@circulon.com'),
    'email', v_c10_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    driver_status, current_location_lat, current_location_lng, approved_at, created_at
  ) VALUES (
    v_c10_id, 'QuickFreight Green Logistics Network', 'quickfreight@circulon.com', 
    'Logistics, Dispatch & Freight Fleet', '+91 90000 12345', 'driver', 
    'Transport Nagar, Avinashi Road, Coimbatore, Tamil Nadu - 641014', 
    'DL: TN38 20201234567 | Fleet Permit: TN-01-FL-9921', 
    'Heavy Commercial Bulk Haulage (Waste & Secondary Materials)', 
    'approved', 'free', 11.0168, 76.9558, NOW(), NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'driver', approval_status = 'approved', company_name = 'QuickFreight Green Logistics Network', email = 'quickfreight@circulon.com', driver_status = 'free', current_location_lat = 11.0168, current_location_lng = 76.9558;

  -- Quick Login Alias: driver@circulon.com -> Driver@123456
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_c10_alias_id, 'authenticated', 'authenticated',
    'driver@circulon.com', crypt('Driver@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"QuickFreight Green Logistics (Quick Login)","role":"driver"}',
    NOW(), NOW(), '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_c10_alias_id, v_c10_alias_id,
    jsonb_build_object('sub', v_c10_alias_id::text, 'email', 'driver@circulon.com'),
    'email', v_c10_alias_id::text, NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, email, industry, phone, role, 
    company_address, id_proof_number, material_focus, approval_status, 
    driver_status, current_location_lat, current_location_lng, approved_at, created_at
  ) VALUES (
    v_c10_alias_id, 'QuickFreight Green Logistics (Quick Login)', 'driver@circulon.com', 
    'Logistics, Dispatch & Freight Fleet', '+91 90000 12345', 'driver', 
    'Transport Nagar, Avinashi Road, Coimbatore, Tamil Nadu - 641014', 
    'DL: TN38 20201234567 | Fleet Permit: TN-01-FL-9921', 
    'Commercial Haulage Fleet', 
    'approved', 'free', 11.0168, 76.9558, NOW(), NOW()
  ) ON CONFLICT (id) DO UPDATE 
  SET role = 'driver', approval_status = 'approved', company_name = 'QuickFreight Green Logistics (Quick Login)', email = 'driver@circulon.com', driver_status = 'free';


  ------------------------------------------------------------------------------
  -- 3. SEED WASTE MATERIALS (Assigned across Sellers)
  ------------------------------------------------------------------------------
  DELETE FROM public.waste_materials WHERE seller_id IN (v_c1_id, v_c1_alias_id, v_c3_id, v_c6_id, v_c8_id, v_c9_id);

  INSERT INTO public.waste_materials (
    id, seller_id, material_name, category, quantity, unit, 
    condition, moisture_percentage, contamination_level, location, 
    expected_price, available_date, description, status
  ) VALUES 
    -- Apex Textiles Listings
    (v_w_cotton_id, v_c1_id, 'Post-Industrial Cotton Comber Scraps', 'Textiles', 4500, 'KG', 
     'Dry, Clean, Baled, 100% Ring Spun Comber', 6, 'Low', 'Tirupur, Tamil Nadu', 38, 'Immediate', 
     'Premium white cotton comber noil from ring spinning mills. Ideal for OE spinning, medical gauze, and specialty paper.', 'active'),
     
    (v_w_denim_id, v_c1_id, 'Recycled Denim Indigo Fabric Offcuts', 'Textiles', 6200, 'KG', 
     'Clean cuttings, 100% Cotton, Sorted Blue Indigo', 4, 'Low', 'Tirupur, Tamil Nadu', 24, 'Within 7 Days', 
     'Post-cutting room denim scraps free of zippers and hardware. Perfect for shoddy yarn and acoustic insulation pads.', 'active'),

    -- Tata EcoSteel Listings
    (v_w_slag_id, v_c3_id, 'Blast Furnace Granulated Slag (GGBS Grade)', 'Metals & Minerals', 40000, 'KG', 
     'Water quenched granulated slag, Glass content >95%', 2, 'Low', 'Pune, Maharashtra', 4.5, 'Immediate', 
     'High-amorphous hydraulic slag conforming to IS 12089 for eco-friendly blended Portland slag cement manufacturing.', 'active'),

    (v_w_scrap_id, v_c3_id, 'Heavy Melting Steel Scrap (HMS 1 & 2)', 'Metals & Minerals', 18000, 'KG', 
     'Sheared structural beams, plates >6mm thickness, clean', 1, 'Low', 'Pune, Maharashtra', 36, 'Within 14 Days', 
     'Clean industrial structural offcuts and fabrication scrap, de-oiled, free of radioactive materials.', 'active'),

    -- EcoPlast Polymers Listings
    (v_w_hdpe_id, v_c6_id, 'High-Density Polyethylene (HDPE) Regrind', 'Plastics & Polymers', 12000, 'KG', 
     'Shredded Flakes 8-12mm, Drum & Blow-Mold Grade', 1, 'Low', 'Peenya, Bengaluru', 28, 'Immediate', 
     'Mono-fraction HDPE blue regrind from blow-molded industrial drums. Melt flow index 0.35 g/10min.', 'active'),

    (v_w_pet_id, v_c6_id, 'Clean Transparent PET Flakes (Hot Washed)', 'Plastics & Polymers', 8500, 'KG', 
     'Hot Caustic Washed, PVC <50ppm, Moisture <0.5%', 0.5, 'Low', 'Peenya, Bengaluru', 42, 'Immediate', 
     'Optical sorted bottle-grade clear PET flakes, intrinsic viscosity 0.76 dL/g, ready for rPET bottle preforms and textile fibers.', 'active'),

    -- Bharat BioChemicals Listings
    (v_w_bagasse_id, v_c8_id, 'Sugarcane Bagasse Biomass Fiber', 'Agricultural Residue', 25000, 'KG', 
     'Depithed, Baled, High Cellulose Content (>46%)', 12, 'Low', 'Erode, Tamil Nadu', 9, 'Immediate', 
     'Sun-dried and baled sugar mill bagasse fiber. Suitable for tableware molding, bio-ethanol conversion, and paper pulp.', 'active'),

    (v_w_rice_id, v_c8_id, 'Paddy Rice Husk Ash (High Amorphous Silica)', 'Agricultural Residue', 15000, 'KG', 
     'Controlled Boiler Combustion, Amorphous Silica >90%', 6, 'Low', 'Thanjavur, Tamil Nadu', 7.5, 'Within 7 Days', 
     'Fine white-grey RHA suitable for high-performance refractory ceramics, tyre vulcanization filler, and aerogels.', 'active'),

    (v_w_coir_id, v_c8_id, 'Desalinated Coconut Coir Pith Blocks', 'Agricultural Residue', 18000, 'KG', 
     'Washed EC < 0.5 mS/cm, Compressed 5KG Briquettes', 14, 'Low', 'Pollachi, Tamil Nadu', 14, 'Immediate', 
     'Triple washed coir dust pith blocks with high water retention capacity. Ideal for horticultural hydroponics and soil remediation.', 'active'),

    -- InfraCycle Demolition Listings
    (v_w_concrete_id, v_c9_id, 'Class-1 Recycled Concrete Aggregate (10-20mm)', 'Construction & Demolition', 50000, 'KG', 
     'Screened, Washed, Crushed Heavy Concrete, LA Abrasion <30%', 3, 'Low', 'Gachibowli, Hyderabad', 3.2, 'Immediate', 
     'Engineered coarse aggregate produced from infrastructure concrete debris, ideal for road sub-base and green precast pavers.', 'active'),

    (v_w_flyash_id, v_c9_id, 'Classified Precipitator Fly Ash (Grade F)', 'Construction & Demolition', 35000, 'KG', 
     'Dry Silo Collected, Fineness >340 m²/kg, Reactive Silica >55%', 1, 'Low', 'Ramagundam, Telangana', 2.8, 'Immediate', 
     'High reactive pozzolanic ash conforming to IS 3812 Part 1 for AAC lightweight blocks and high-durability green concrete.', 'active'),

    (v_w_cardboard_id, v_c9_id, 'Corrugated Cardboard (OCC 11) Mill Bales', 'Paper & Packaging', 10000, 'KG', 
     'High Density Baled, Dry, Plastic & Tape Free', 7, 'Low', 'Hyderabad, Telangana', 15, 'Immediate', 
     'Clean post-commercial double-wall corrugated shipping boxes, compressed in 500kg export mill bales.', 'active');

  -- Also link duplicates to seller legacy alias so test account seller@circulon.com sees the listings
  INSERT INTO public.waste_materials (
    seller_id, material_name, category, quantity, unit, 
    condition, moisture_percentage, contamination_level, location, 
    expected_price, available_date, description, status
  ) VALUES 
    (v_c1_alias_id, 'Post-Industrial Cotton Comber Scraps', 'Textiles', 4500, 'KG', 'Dry, Clean, Baled, 100% Ring Spun', 6, 'Low', 'Tirupur, Tamil Nadu', 38, 'Immediate', 'High-grade cotton comber noils.', 'active'),
    (v_c1_alias_id, 'Recycled Denim Indigo Fabric Offcuts', 'Textiles', 6200, 'KG', 'Clean cuttings, 100% Cotton', 4, 'Low', 'Tirupur, Tamil Nadu', 24, 'Within 7 Days', 'Sorted blue indigo denim cuttings.', 'active');


  ------------------------------------------------------------------------------
  -- 4. SEED AI ANALYSIS RESULTS (LCA Diagnostics for Waste Materials)
  ------------------------------------------------------------------------------
  DELETE FROM public.ai_analyses WHERE waste_id IN (v_w_cotton_id, v_w_hdpe_id, v_w_slag_id, v_w_bagasse_id);

  INSERT INTO public.ai_analyses (
    waste_id, material_type, category, confidence_score, quality_estimate, contamination_estimate,
    possible_industries, possible_applications, possible_recycling_methods, required_processing_steps,
    estimated_value_min, estimated_value_max, co2_savings_kg, landfill_diversion_kg, model_used
  ) VALUES 
     (v_w_cotton_id, 'Long Staple Comber Cotton', 'Textiles', 0.96, 'High', 'Low',
     '["Open-End Spinning Mills", "Specialty Currency Paper", "Automotive Acoustic Insulation", "Medical Cellulose"]'::jsonb,
     '["Blended OE Rotor Yarn", "Non-woven Filtration Felt", "Heavyweight Cotton Rag Paper"]'::jsonb,
     '["Mechanical Fiber Opening", "Chemical De-sizing & Bleaching", "Carding & Rotor Spinning"]'::jsonb,
     '["De-dusting and baling", "Metal detection sorting", "Moisture stabilization"]'::jsonb,
     35, 42, 8550, 4500, 'CIRCULON AI Circular LCA Engine'),

    (v_w_hdpe_id, 'High-Density Polyethylene Blow Flake', 'Plastics & Polymers', 0.94, 'High', 'Low',
     '["Drainage Pipe Extrusion", "Blow-Molded Bottle Makers", "Recycled Plastic Lumber", "Chemical Packaging"]'::jsonb,
     '["Corrugated Stormwater Pipes", "Industrial Chemical Jerry Cans", "Rotomolded Compost Bins"]'::jsonb,
     '["Melt Filtration Extrusion", "Pelletizing", "Twin-Screw Masterbatch Blending"]'::jsonb,
     '["Sink-float density separation", "Hot caustic friction wash", "Continuous dry de-dusting"]'::jsonb,
     26, 32, 18000, 12000, 'CIRCULON AI Circular LCA Engine'),

    (v_w_slag_id, 'Granulated Blast Furnace Slag', 'Metals & Minerals', 0.97, 'High', 'Low',
     '["Cement Manufacturing", "Ready-Mix Concrete", "Geopolymer Pozzolan", "Road Foundation"]'::jsonb,
     '["Portland Slag Cement (PSC)", "High-Strength GGBS Concrete", "Marine Anti-Sulfate Structures"]'::jsonb,
     '["Vertical Roller Mill Micronization", "Magnetic Iron Separation", "Alkali Thermal Activation"]'::jsonb,
     '["Magnetic de-ironing", "Thermal rotary drying", "Ultra-fine grinding to 420 m2/kg Blaine"]'::jsonb,
     4.0, 5.2, 32000, 40000, 'CIRCULON AI Circular LCA Engine'),

    (v_w_bagasse_id, 'Depithed Sugar Mill Bagasse', 'Agricultural Residue', 0.93, 'High', 'Low',
     '["Bio-based Tableware Molding", "Kraft Paper Pulping", "Bio-Coal Briquettes", "Lignocellulosic Ethanol"]'::jsonb,
     '["Compostable Clamshell Packaging", "Corrugated Fluting Medium", "Solid Industrial Biomass Fuel"]'::jsonb,
     '["Soda-AQ Chemical Pulping", "High-Pressure Hydraulic Densification", "Enzymatic Hydrolysis"]'::jsonb,
     '["Mechanical dry depithing", "Washing to remove residual sucrose", "Rotary hot-air drying"]'::jsonb,
     8.5, 11.5, 27500, 25000, 'CIRCULON AI Circular LCA Engine');


  ------------------------------------------------------------------------------
  -- 5. SEED BUYER REQUIREMENTS (Assigned to Buyer Companies)
  ------------------------------------------------------------------------------
  DELETE FROM public.buyer_requirements WHERE buyer_id IN (v_c2_id, v_c2_alias_id, v_c4_id, v_c5_id, v_c7_id);

  INSERT INTO public.buyer_requirements (
    buyer_id, material_name, category, min_quantity, max_quantity, unit,
    preferred_quality, max_price, preferred_location, industry, required_date
  ) VALUES 
    -- GreenPolymer (Buyer 2)
    (v_c2_id, 'High-Density Polyethylene (HDPE) Regrind', 'Plastics & Polymers', 5000, 20000, 'KG', 'High (Contamination < 1%)', 32, 'Tamil Nadu & Karnataka', 'Plastics & Polymers', 'Immediate'),
    (v_c2_id, 'Clean Transparent PET Flakes', 'Plastics & Polymers', 3000, 15000, 'KG', 'Hot Caustic Washed (PVC < 50ppm)', 45, 'South India', 'Plastics & Polymers', 'Within 14 Days'),
    
    -- BioAgro Energy (Buyer 4)
    (v_c4_id, 'Sugarcane Bagasse Biomass Fiber', 'Agricultural Residue', 10000, 50000, 'KG', 'Depithed, Moisture < 15%', 11, 'Tamil Nadu', 'Biofuels & Green Energy', 'Immediate'),
    (v_c4_id, 'Paddy Rice Husk Ash & Raw Husk', 'Agricultural Residue', 8000, 30000, 'KG', 'Clean, Amorphous Silica >85%', 8.5, 'Tamil Nadu & Andhra Pradesh', 'Biofuels & Green Energy', 'Within 20 Days'),

    -- Deccan Paper (Buyer 5)
    (v_c5_id, 'Corrugated Cardboard (OCC) Bales', 'Paper & Packaging', 5000, 30000, 'KG', 'Grade 11 Mill Baled OCC', 16, 'Andhra Pradesh & Telangana', 'Paper & Packaging', 'Immediate'),
    (v_c5_id, 'Post-Industrial Cotton Comber Scraps', 'Textiles', 2000, 10000, 'KG', 'Dry, Clean, for Specialty Rag Paper', 40, 'Tamil Nadu', 'Specialty Paper & Packaging', 'Within 30 Days'),

    -- Horizon E-Waste Refiners (Buyer 7)
    (v_c7_id, 'De-soldered FR4 Printed Circuit Boards', 'Electronics & E-Waste', 500, 5000, 'KG', 'Clean Populated/De-soldered Boards', 180, 'Pan-India', 'E-Waste & Precious Metals', 'Immediate'),
    (v_c7_id, 'Heavy Copper Scrap & Turnings', 'Metals & Minerals', 1000, 8000, 'KG', 'Clean Bright Millberry Copper (>99% Cu)', 620, 'Karnataka & Tamil Nadu', 'E-Waste & Metallurgy', 'Immediate');

  -- Also populate for buyer legacy alias
  INSERT INTO public.buyer_requirements (
    buyer_id, material_name, category, min_quantity, max_quantity, unit,
    preferred_quality, max_price, preferred_location, industry, required_date
  ) VALUES 
    (v_c2_alias_id, 'High-Density Polyethylene (HDPE) Regrind', 'Plastics & Polymers', 5000, 20000, 'KG', 'High (Contamination < 1%)', 32, 'Tamil Nadu', 'Plastics & Polymers', 'Immediate');


  ------------------------------------------------------------------------------
  -- 6. SEED BUYERS CRM DIRECTORY (Enterprise Registry for Sellers)
  ------------------------------------------------------------------------------
  DELETE FROM public.buyers WHERE owner_id IN (v_c1_id, v_c1_alias_id, v_c6_id);

  INSERT INTO public.buyers (
    id, owner_id, company_name, industry, buyer_type, state, city, country,
    materials_required, min_quantity, max_quantity, preferred_quality, min_price, max_price,
    website, email, phone, contact_person, notes, verification_status, crm_status
  ) VALUES 
    (v_crm1_id, v_c1_id, 'GreenPolymer Recyclers Ltd', 'Plastics & Polymers', 'Manufacturer', 'Tamil Nadu', 'Chennai', 'India',
     '["HDPE Regrind", "PET Flakes", "PP Granules", "Polymer Films"]'::jsonb, 5000, 20000, 'High', 25, 45,
     'https://greenpolymer.in', 'greenpolymer@circulon.com', '+91 98765 87654', 'Mr. Arvind Swamy',
     'ISO 9001 certified polymer recycling plant with annual capacity of 24,000 MT. Highly reliable buyer.', 'verified', 'NEGOTIATION'),

    (v_crm2_id, v_c1_id, 'BioAgro Circular Energy Solutions', 'Biofuels & Green Energy', 'Processor', 'Tamil Nadu', 'Perundurai', 'India',
     '["Sugarcane Bagasse", "Rice Husk", "Coir Pith", "Cotton Trash"]'::jsonb, 10000, 50000, 'Medium+', 8, 12,
     'https://bioagroenergy.co.in', 'bioagro@circulon.com', '+91 94432 55670', 'Dr. Sundar Rajan',
     'Pioneer in industrial biomass briquetting and captive thermal boiler fuel supply.', 'verified', 'INTERESTED'),

    (v_crm3_id, v_c1_id, 'Deccan Paper & Kraft Packaging', 'Paper & Packaging', 'Manufacturer', 'Andhra Pradesh', 'Rajahmundry', 'India',
     '["Cardboard OCC", "Cotton Comber", "Kraft Mill Offcuts"]'::jsonb, 5000, 30000, 'High', 14, 40,
     'https://deccanpaper.com', 'deccanpaper@circulon.com', '+91 98480 34567', 'Ms. Vani Rao',
     'Premier manufacturer of heavy-duty Kraft fluting paper and specialty rag bond document paper.', 'verified', 'CONVERTED'),

    (v_crm4_id, v_c1_id, 'Horizon E-Waste & Metal Refiners', 'E-Waste & Precious Metals', 'Smelter / Refiner', 'Karnataka', 'Bengaluru', 'India',
     '["PCB Scrap", "Copper Wire Harness", "Aluminium Heat Sinks"]'::jsonb, 500, 10000, 'Grade A', 150, 650,
     'https://horizonrefiners.io', 'horizon.refiners@circulon.com', '+91 99001 23890', 'Mr. Pranav Mehta',
     'State-of-the-art CPCB authorized hydrometallurgical e-waste extraction facility in Electronic City.', 'verified', 'CONTACTED'),

    (v_crm5_id, v_c6_id, 'GreenPolymer Recyclers Ltd', 'Plastics & Polymers', 'Manufacturer', 'Tamil Nadu', 'Chennai', 'India',
     '["HDPE Regrind", "PET Flakes"]'::jsonb, 5000, 20000, 'High', 25, 45,
     'https://greenpolymer.in', 'greenpolymer@circulon.com', '+91 98765 87654', 'Mr. Arvind Swamy',
     'Direct contract buyer for EcoPlast HDPE flakes.', 'verified', 'CONVERTED'),

    (v_crm6_id, v_c1_alias_id, 'GreenPolymer Recyclers Ltd', 'Plastics & Polymers', 'Manufacturer', 'Tamil Nadu', 'Chennai', 'India',
     '["HDPE Regrind", "PET Flakes"]'::jsonb, 5000, 20000, 'High', 25, 45,
     'https://greenpolymer.in', 'greenpolymer@circulon.com', '+91 98765 87654', 'Mr. Arvind Swamy',
     'Linked to seller quick-login profile.', 'verified', 'NEGOTIATION');


  ------------------------------------------------------------------------------
  -- 7. SEED BUYER MATCH ANALYSES (AI Compatibility Engine)
  ------------------------------------------------------------------------------
  DELETE FROM public.buyer_matches WHERE waste_id IN (v_w_cotton_id, v_w_hdpe_id);

  INSERT INTO public.buyer_matches (
    waste_id, buyer_id, overall_score, material_compatibility, industry_compatibility,
    quantity_compatibility, quality_compatibility, price_compatibility, location_compatibility,
    strengths, concerns, recommendation
  ) VALUES 
    (v_w_cotton_id, v_crm3_id, 94.5, 96, 95, 92, 98, 92, 94,
     '["Exact match for high-alpha cellulose rag bond paper formulation", "Optimal baled moisture level under 7%", "Regular monthly batch volume satisfies buyer capacity"]'::jsonb,
     '["Interstate freight between Tirupur (TN) and Rajahmundry (AP) requires 14h transit"]'::jsonb,
     'Highly Recommended: Deccan Paper pays premium ₹38-₹40/KG for uncontaminated comber noils.'),

    (v_w_hdpe_id, v_crm1_id, 96.2, 98, 98, 95, 96, 94, 98,
     '["Perfect blow-molding grade match with MFI 0.35 g/10min", "Both entities located within South Industrial Corridor (Bengaluru-Chennai)", "Contamination level verified low"]'::jsonb,
     '["Ensure color-separation consistency for blue drum regrind lots"]'::jsonb,
     'Prime Match: GreenPolymer operates high-tonnage twin-screw compounding lines in Chennai ready for immediate off-take.');


  ------------------------------------------------------------------------------
  -- 8. SEED CONNECTION REQUESTS (Buyers & Sellers Interacting)
  ------------------------------------------------------------------------------
  DELETE FROM public.connection_requests WHERE seller_id IN (v_c1_id, v_c6_id) OR buyer_id IN (v_c2_id, v_c5_id);

  INSERT INTO public.connection_requests (
    id, seller_id, buyer_id, waste_id, message, status
  ) VALUES 
    (v_conn1_id, v_c1_id, v_c5_id, v_w_cotton_id, 
     'Hello Deccan Paper team, we have 4,500 KG of clean ring-spun cotton comber ready in Tirupur. Lab test report attached showing 6% moisture and zero synthetic blend.', 'accepted'),
     
    (v_conn2_id, v_c6_id, v_c2_id, v_w_hdpe_id, 
     'Dear GreenPolymer procurement team, we have prepared 12,000 KG of washed HDPE 8-12mm drum flakes in Peenya, ready for palletized freight dispatch.', 'accepted'),

    (v_conn3_id, v_c8_id, v_c4_id, v_w_bagasse_id, 
     'Greetings BioAgro, 25,000 KG depithed sugar mill bagasse available for dispatch from our Erode complex at ₹9/KG.', 'pending');


  ------------------------------------------------------------------------------
  -- 9. SEED ACTIVE CIRCULAR DEALS & COMMERCIAL CONTRACTS
  ------------------------------------------------------------------------------
  DELETE FROM public.deals WHERE seller_id IN (v_c1_id, v_c1_alias_id, v_c3_id, v_c6_id) OR buyer_id IN (v_c2_id, v_c2_alias_id, v_c5_id);

  -- Deal 1: Apex Textiles -> Deccan Paper (PICKUP_SCHEDULED)
  INSERT INTO public.deals (
    id, waste_id, seller_id, buyer_id, agreed_quantity, agreed_price, total_amount, 
    status, pickup_date, delivery_date, driver_info, notes
  ) VALUES (
    v_deal1_id, v_w_cotton_id, v_c1_id, v_c5_id, 4500, 37.5, 168750,
    'PICKUP_SCHEDULED', NOW() + INTERVAL '1 day', NOW() + INTERVAL '3 days',
    '{"driver_name":"Rajesh Kannan","phone":"+91 90000 12345","vehicle_number":"TN 38 AA 4521","fleet":"QuickFreight Green Logistics"}'::jsonb,
    'Weighbridge gate pass issued. 100% Cotton comber bales labeled for Deccan Paper Specialty Mill.'
  );

  -- Deal 2: EcoPlast Polymers -> GreenPolymer (IN_TRANSIT)
  INSERT INTO public.deals (
    id, waste_id, seller_id, buyer_id, agreed_quantity, agreed_price, total_amount, 
    status, pickup_date, delivery_date, driver_info, notes
  ) VALUES (
    v_deal2_id, v_w_hdpe_id, v_c6_id, v_c2_id, 12000, 27.5, 330000,
    'IN_TRANSIT', NOW() - INTERVAL '4 hours', NOW() + INTERVAL '6 hours',
    '{"driver_name":"Murugan V","phone":"+91 90000 12345","vehicle_number":"KA 04 E 8832","fleet":"QuickFreight Green Logistics"}'::jsonb,
    'Consignment in transit along NH 48 corridor (Bengaluru to Guindy, Chennai). GPS tracker active.'
  );

  -- Deal 3: Tata EcoSteel -> InfraCycle Aggregates (COMPLETED)
  INSERT INTO public.deals (
    id, waste_id, seller_id, buyer_id, agreed_quantity, agreed_price, total_amount, 
    status, pickup_date, delivery_date, notes
  ) VALUES (
    v_deal3_id, v_w_slag_id, v_c3_id, v_c9_id, 40000, 4.2, 168000,
    'COMPLETED', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days',
    'Full delivery verified. Slag processed into geo-polymer eco concrete paver blocks. Digital Material Passport issued.'
  );

  -- Deal 4: Legacy seller-buyer deal for backward compatibility
  INSERT INTO public.deals (
    id, waste_id, seller_id, buyer_id, agreed_quantity, agreed_price, total_amount, 
    status, notes
  ) VALUES (
    v_deal4_id, v_w_cotton_id, v_c1_alias_id, v_c2_alias_id, 4500, 36, 162000,
    'PICKUP_SCHEDULED', 'Weighbridge gate pass issued. Backward compatibility active deal.'
  );


  ------------------------------------------------------------------------------
  -- 10. SEED DEAL MESSAGES (Negotiation Audit Timeline)
  ------------------------------------------------------------------------------
  DELETE FROM public.deal_messages WHERE deal_id IN (v_deal1_id, v_deal2_id);

  INSERT INTO public.deal_messages (
    deal_id, sender_id, sender_role, message, proposed_quantity, proposed_price, created_at
  ) VALUES 
    (v_deal1_id, v_c5_id, 'buyer', 'We reviewed your lab moisture report. We propose acquiring the entire 4,500 KG lot at ₹37/KG with FOB pickup at your Tirupur warehouse.', 4500, 37.0, NOW() - INTERVAL '2 days'),
    (v_deal1_id, v_c1_id, 'seller', 'We accept ₹37.50/KG which covers export strapping and moisture-barrier palletizing. Delivery dispatch can be completed within 24 hours.', 4500, 37.5, NOW() - INTERVAL '1 day'),
    (v_deal1_id, v_c5_id, 'buyer', 'Agreed at ₹37.50/KG. Payment milestone escrow initiated. Please coordinate gate pass with QuickFreight Logistics.', 4500, 37.5, NOW() - INTERVAL '18 hours'),

    (v_deal2_id, v_c2_id, 'buyer', 'Confirming order for 12,000 KG washed HDPE flake lot. Truck dispatched from Peenya.', 12000, 27.5, NOW() - INTERVAL '6 hours');


  ------------------------------------------------------------------------------
  -- 11. SEED LOGISTICS SHIPMENTS (Dispatched via QuickFreight Fleet)
  ------------------------------------------------------------------------------
  DELETE FROM public.shipments WHERE deal_id IN (v_deal1_id, v_deal2_id);

  INSERT INTO public.shipments (
    deal_id, connection_id, driver_id, pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
    status, status_step, delivery_notes, distance_km, freight_cost, co2_freight_emissions_kg
  ) VALUES 
    -- Shipment 1 for Deal 1
    (v_deal1_id, v_conn1_id, v_c10_id, 11.1085, 77.3411, 17.0005, 81.8040,
     'assigned', 'ASSIGNED', 'Transporting 4,500 KG baled cotton comber from Tirupur to Rajahmundry mill.', 850, 29750, 680),
     
    -- Shipment 2 for Deal 2
    (v_deal2_id, v_conn2_id, v_c10_id, 13.0285, 77.5197, 13.0067, 80.2026,
     'in_transit', 'IN_TRANSIT', 'Hauling 12,000 KG palletized HDPE flake on NH 48 highway. ETA 4 hours.', 340, 11900, 272);


  ------------------------------------------------------------------------------
  -- 12. SEED DIGITAL MATERIAL PASSPORTS (DPP Verification)
  ------------------------------------------------------------------------------
  DELETE FROM public.material_passports WHERE id IN ('CIRC-DPP-2026-COTTON-001', 'CIRC-DPP-2026-HDPE-002');

  INSERT INTO public.material_passports (
    id, waste_id, deal_id, batch_number, material_name, category, quantity, unit,
    origin_location, origin_company, seller_id, buyer_company, buyer_id,
    quality_score, purity_percentage, circularity_score, co2_avoided_kg, landfill_diverted_kg, water_saved_liters,
    qr_payload_url, certificate_hash, custody_timeline
  ) VALUES 
    ('CIRC-DPP-2026-COTTON-001', v_w_cotton_id, v_deal1_id, 'BATCH-2026-APEX-TX01',
     'Post-Industrial Cotton Comber Scraps', 'Textiles', 4500, 'KG',
     'Tirupur, Tamil Nadu', 'Apex Industrial Recycling Corp', v_c1_id,
     'Deccan Paper & Kraft Packaging Mills', v_c5_id,
     96, 99.2, 94.8, 8550, 4500, 900000,
     'https://circulon.ai/passport/CIRC-DPP-2026-COTTON-001',
     '0x7f9a2b8e3c1d4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',
     '[{"step":"created","title":"Batch Registered","timestamp":"2026-09-20T08:00:00Z","actor":"Apex Industrial","location":"Tirupur","status":"completed"},
       {"step":"analyzed","title":"AI Circularity Diagnostic Verified","timestamp":"2026-09-21T10:30:00Z","actor":"CIRCULON AI Engine","location":"Cloud Node","status":"completed"},
       {"step":"deal_agreed","title":"Purchase Contract Executed","timestamp":"2026-09-24T14:00:00Z","actor":"Deccan Paper Mills","location":"Rajahmundry","status":"completed"},
       {"step":"dispatched","title":"Assigned for Logistics Haulage","timestamp":"2026-09-27T09:00:00Z","actor":"QuickFreight Green Logistics","location":"Tirupur Depot","status":"in_progress"}]'::jsonb),

    ('CIRC-DPP-2026-HDPE-002', v_w_hdpe_id, v_deal2_id, 'BATCH-2026-PLAST-HD02',
     'High-Density Polyethylene (HDPE) Regrind', 'Plastics & Polymers', 12000, 'KG',
     'Peenya, Bengaluru', 'EcoPlast Polymers & Compounds', v_c6_id,
     'GreenPolymer Recyclers Ltd', v_c2_id,
     94, 98.6, 92.4, 18000, 12000, 240000,
     'https://circulon.ai/passport/CIRC-DPP-2026-HDPE-002',
     '0x3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b',
     '[{"step":"created","title":"Lot Shredded & Baled","timestamp":"2026-09-22T09:00:00Z","actor":"EcoPlast Polymers","location":"Peenya, Bengaluru","status":"completed"},
       {"step":"analyzed","title":"MFI & Contamination Scan Passed","timestamp":"2026-09-23T11:00:00Z","actor":"CIRCULON AI Engine","location":"Cloud Node","status":"completed"},
       {"step":"deal_agreed","title":"Commercial Contract Approved","timestamp":"2026-09-26T16:00:00Z","actor":"GreenPolymer Recyclers","location":"Chennai","status":"completed"},
       {"step":"in_transit","title":"Commercial Transit on NH 48","timestamp":"2026-09-28T08:00:00Z","actor":"QuickFreight Green Logistics","location":"En-route to Chennai","status":"in_progress"}]'::jsonb);


  ------------------------------------------------------------------------------
  -- 13. SEED PRODUCT VALORIZATION RECOMMENDATIONS
  ------------------------------------------------------------------------------
  DELETE FROM public.product_recommendations WHERE waste_id IN (v_w_cotton_id, v_w_slag_id, v_w_hdpe_id);

  INSERT INTO public.product_recommendations (
    waste_id, product_name, recovered_material, why_suitable, required_processing,
    approximate_feasibility, required_quality, potential_industry, potential_buyer_category,
    estimated_value_min, estimated_value_max, economic_ranking_score
  ) VALUES 
    (v_w_cotton_id, 'High-End 100% Rag Currency & Security Bond Paper', 'Cellulose Fiber', 
     'Natural comber fiber retains long unbroken cotton staple length with minimal lignin, imparting immense tear resistance and archival longevity.',
     '["Mild alkaline wet de-sizing", "Beater mechanical pulping", "Hydraulic sheet forming & calender rolling"]'::jsonb,
     92, 'High (Comber Noil)', 'Specialty Paper & Security Printing', 'Paper Mills', 55, 75, 95.5),

    (v_w_slag_id, 'Low-Carbon Geopolymer Marine Armor Concrete', 'Aluminosilicate Slag Binder',
     'Vitrified granulated blast furnace slag provides superior sulfate and chloride salt resistance, completely eliminating clinker CO2 emissions.',
     '["Micronization to 450 m2/kg Blaine", "Alkali silicate activator blending", "Ambient curing"]'::jsonb,
     95, 'Grade GGBS 100', 'Green Infrastructure & Coastal Defense', 'Precast Concrete Fabricators', 8, 14, 98.0),

    (v_w_hdpe_id, 'Extruded Wood-Plastic Composite (WPC) Decking Planks', 'rHDPE Flake Polymer Matrix',
     'High molecular weight blow-mold grade HDPE yields structural flexural rigidity and outdoor UV weather resistance when compounded with sawdust.',
     '["Dry blending with 50% wood flour", "Silane coupling agent injection", "Twin-screw counter-rotating profile extrusion"]'::jsonb,
     88, 'Clean Regrind (MFI < 0.5)', 'Sustainable Building Materials', 'Composite Extruders', 65, 95, 91.2);


  ------------------------------------------------------------------------------
  -- 14. SEED INDUSTRIAL SYMBIOSIS CLUSTERS
  ------------------------------------------------------------------------------
  DELETE FROM public.industrial_symbiosis_links WHERE source_company IN (
    'Apex Industrial Recycling Corp', 'Tata EcoSteel & Foundry Works', 
    'EcoPlast Polymers & Compounds', 'Bharat BioChemicals & Solvents Corp'
  );

  INSERT INTO public.industrial_symbiosis_links (
    source_company, target_company, material_name, annual_volume_kg, status, co2_offset_kg
  ) VALUES 
    ('Apex Industrial Recycling Corp', 'Deccan Paper & Kraft Packaging Mills', 'Post-Industrial Cotton Comber', 54000, 'active', 102600),
    ('EcoPlast Polymers & Compounds', 'GreenPolymer Recyclers Ltd', 'High-Density Polyethylene Flakes', 144000, 'active', 216000),
    ('Tata EcoSteel & Foundry Works', 'InfraCycle Demolition & Circular Aggregates', 'Blast Furnace Slag (GGBS)', 480000, 'active', 384000),
    ('Bharat BioChemicals & Solvents Corp', 'BioAgro Circular Energy Solutions', 'Sugarcane Bagasse Biomass', 300000, 'potential', 330000);


  ------------------------------------------------------------------------------
  -- 15. SEED MARKET DEMAND OPPORTUNITIES
  ------------------------------------------------------------------------------
  DELETE FROM public.market_opportunities WHERE material_name IN (
    'Post-Industrial Cotton Comber', 'High-Density Polyethylene (HDPE)', 
    'Blast Furnace Slag (GGBS)', 'Sugarcane Bagasse Biomass'
  );

  INSERT INTO public.market_opportunities (
    material_name, category, demand_kg, available_supply_kg, potential_buyers_count,
    preferred_price_min, preferred_price_max, opportunity_level, urgency, data_source
  ) VALUES 
    ('Post-Industrial Cotton Comber', 'Textiles', 28000, 10700, 8, 35, 42, 'HIGH', 'Immediate', 'CIRCULON Active Buyer Requirements Network'),
    ('High-Density Polyethylene (HDPE)', 'Plastics & Polymers', 45000, 20500, 12, 26, 34, 'HIGH', 'Immediate', 'CIRCULON Regional Polymer Aggregators'),
    ('Blast Furnace Slag (GGBS)', 'Metals & Minerals', 120000, 75000, 6, 4.0, 5.5, 'MODERATE', 'Flexible', 'Infrastructure ESG Mandates'),
    ('Sugarcane Bagasse Biomass', 'Agricultural Residue', 90000, 43000, 9, 8.5, 12.0, 'HIGH', 'Within 14 Days', 'Bio-energy & Thermal Boilers Pipeline');


  ------------------------------------------------------------------------------
  -- 16. SEED NOTIFICATIONS (Platform Inbox for Companies)
  ------------------------------------------------------------------------------
  INSERT INTO public.notifications (user_id, type, title, content, link, read)
  VALUES 
    (v_c1_id, 'match', 'New Buyer Match Identified', 'Deccan Paper Mills submitted a procurement requirement matching your Cotton Comber inventory (94.5% score).', '/matches', false),
    (v_c2_id, 'deal', 'Shipment In-Transit Notification', 'Driver Murugan V is en-route from Bengaluru with your 12,000 KG HDPE regrind consignment.', '/buyer', false),
    (v_c6_id, 'logistics', 'Freight Dispatch Confirmed', 'QuickFreight Green Logistics vehicle KA 04 E 8832 has departed Peenya depot.', '/dashboard', false),
    (v_c10_id, 'dispatch', 'New Trip Dispatched', 'Trip assigned for Tirupur to Rajahmundry freight haulage (4,500 KG baled cotton).', '/driver', false);

END $$;
