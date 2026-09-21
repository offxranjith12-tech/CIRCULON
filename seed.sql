-- ============================================================================
-- CIRCULON Complete Clean Seed Data
-- Fixes "Database error querying schema" by:
-- 1. Wiping broken/incomplete auth rows
-- 2. Populating auth.users with ALL required non-NULL string columns
-- 3. Populating auth.identities with matching UUIDs and JSON metadata
-- 4. Inserting approved profiles, sample waste listings & CRM data
-- ============================================================================
--
-- 🔑 TEST CREDENTIALS:
-- 1. Admin : admin@circulon.com  |  Password: Admin@123456
-- 2. Seller: seller@circulon.com |  Password: Seller@123456
-- 3. Buyer : buyer@circulon.com  |  Password: Buyer@123456
-- 4. Driver: driver@circulon.com |  Password: Driver@123456
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Wipe previous incomplete/corrupted auth records
DELETE FROM auth.identities WHERE user_id IN (
  SELECT id FROM auth.users WHERE email IN ('admin@circulon.com', 'seller@circulon.com', 'buyer@circulon.com', 'driver@circulon.com')
);
DELETE FROM auth.users WHERE email IN ('admin@circulon.com', 'seller@circulon.com', 'buyer@circulon.com', 'driver@circulon.com');

-- 2. Insert clean users into auth.users and auth.identities
DO $$ 
DECLARE 
  v_admin_id UUID := gen_random_uuid();
  v_seller_id UUID := gen_random_uuid();
  v_buyer_id UUID := gen_random_uuid();
  v_driver_id UUID := gen_random_uuid();
  v_waste1_id UUID := gen_random_uuid();
  v_waste2_id UUID := gen_random_uuid();
BEGIN

  ------------------------------------------------------------
  -- 1. ADMIN USER (admin@circulon.com / Admin@123456)
  ------------------------------------------------------------
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
    NOW(), NOW(),
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_admin_id,
    v_admin_id,
    jsonb_build_object('sub', v_admin_id::text, 'email', 'admin@circulon.com'),
    'email',
    v_admin_id::text,
    NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (id, company_name, role, approval_status, created_at)
  VALUES (v_admin_id, 'CIRCULON Administration', 'admin', 'approved', NOW())
  ON CONFLICT (id) DO UPDATE 
  SET role = 'admin', approval_status = 'approved', company_name = 'CIRCULON Administration';

  ------------------------------------------------------------
  -- 2. SELLER USER (seller@circulon.com / Seller@123456)
  ------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_seller_id, 'authenticated', 'authenticated',
    'seller@circulon.com', crypt('Seller@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"Apex Industrial Recycling","role":"seller"}',
    NOW(), NOW(),
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_seller_id,
    v_seller_id,
    jsonb_build_object('sub', v_seller_id::text, 'email', 'seller@circulon.com'),
    'email',
    v_seller_id::text,
    NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, industry, phone, role, 
    company_address, id_proof_number, approval_status, created_at
  )
  VALUES (
    v_seller_id, 
    'Apex Industrial Recycling Corp', 
    'Manufacturing & Waste', 
    '+91 98765 43210', 
    'seller', 
    'Plot 42, Textile Industrial Estate, Tirupur, Tamil Nadu - 641604', 
    'GSTIN: 33AAAAA0000A1Z5', 
    'approved', 
    NOW()
  )
  ON CONFLICT (id) DO UPDATE 
  SET role = 'seller', approval_status = 'approved', company_name = 'Apex Industrial Recycling Corp';

  ------------------------------------------------------------
  -- 3. BUYER USER (buyer@circulon.com / Buyer@123456)
  ------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_buyer_id, 'authenticated', 'authenticated',
    'buyer@circulon.com', crypt('Buyer@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"GreenPolymer Recyclers Ltd","role":"buyer"}',
    NOW(), NOW(),
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_buyer_id,
    v_buyer_id,
    jsonb_build_object('sub', v_buyer_id::text, 'email', 'buyer@circulon.com'),
    'email',
    v_buyer_id::text,
    NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, industry, phone, role, 
    company_address, id_proof_number, approval_status, created_at
  )
  VALUES (
    v_buyer_id, 
    'GreenPolymer Recyclers Ltd', 
    'Recycling & Polymers', 
    '+91 98765 87654', 
    'buyer', 
    'Sector 18, Guindy Industrial Estate, Chennai, Tamil Nadu - 600032', 
    'CIN: U25209TN2020PTC123456', 
    'approved', 
    NOW()
  )
  ON CONFLICT (id) DO UPDATE 
  SET role = 'buyer', approval_status = 'approved', company_name = 'GreenPolymer Recyclers Ltd';

  ------------------------------------------------------------
  -- 3.5. DRIVER USER (driver@circulon.com / Driver@123456)
  ------------------------------------------------------------
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) VALUES (
    '00000000-0000-0000-0000-000000000000', v_driver_id, 'authenticated', 'authenticated',
    'driver@circulon.com', crypt('Driver@123456', gen_salt('bf')),
    NOW(), '{"provider":"email","providers":["email"]}',
    '{"company_name":"QuickFreight Logistics","role":"driver"}',
    NOW(), NOW(),
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_driver_id,
    v_driver_id,
    jsonb_build_object('sub', v_driver_id::text, 'email', 'driver@circulon.com'),
    'email',
    v_driver_id::text,
    NOW(), NOW(), NOW()
  );

  INSERT INTO public.profiles (
    id, company_name, industry, phone, role, 
    company_address, id_proof_number, approval_status, driver_status, current_location_lat, current_location_lng, created_at
  )
  VALUES (
    v_driver_id, 
    'QuickFreight Logistics', 
    'Transportation', 
    '+91 90000 12345', 
    'driver', 
    'Transport Hub, Coimbatore', 
    'DL: TN38 20201234567', 
    'approved',
    'free',
    11.0168,
    76.9558,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE 
  SET role = 'driver', approval_status = 'approved', company_name = 'QuickFreight Logistics', driver_status = 'free', current_location_lat = 11.0168, current_location_lng = 76.9558;

  ------------------------------------------------------------
  -- 4. SEED SAMPLE WASTE LISTINGS (Assigned to Seller)
  ------------------------------------------------------------
  DELETE FROM public.waste_materials WHERE public.waste_materials.seller_id = v_seller_id;

  INSERT INTO public.waste_materials 
    (id, seller_id, material_name, category, quantity, unit, condition, moisture_percentage, contamination_level, location, expected_price, status)
  VALUES 
    (v_waste1_id, v_seller_id, 'Post-Industrial Cotton Comber Scraps', 'Textiles', 4500, 'KG', 'Dry, Clean, Baled, 100% Ring Spun', 6, 'Low', 'Tirupur, Tamil Nadu', 38, 'active'),
    (v_waste2_id, v_seller_id, 'High-Density Polyethylene (HDPE) Regrind', 'Plastics & Polymers', 12000, 'KG', 'Shredded Flakes 8-12mm', 1, 'Low', 'Coimbatore, Tamil Nadu', 28, 'active'),
    (gen_random_uuid(), v_seller_id, 'Sugarcane Bagasse Biomass Fiber', 'Agricultural Residue', 25000, 'KG', 'Depithed, Baled, High Cellulose', 12, 'Low', 'Erode, Tamil Nadu', 9, 'active'),
    (gen_random_uuid(), v_seller_id, 'Paddy Rice Husk Ash & Raw Husk', 'Agricultural Residue', 15000, 'KG', 'Clean, Silo Stored, High Silica', 8, 'Low', 'Thanjavur, Tamil Nadu', 7, 'active'),
    (gen_random_uuid(), v_seller_id, 'Desalinated Coconut Coir Pith Blocks', 'Biomass & Agriculture', 18000, 'KG', 'Washed EC < 0.5 mS/cm', 14, 'Low', 'Pollachi, Tamil Nadu', 14, 'active'),
    (gen_random_uuid(), v_seller_id, 'Clean Transparent PET Flakes', 'Plastics & Polymers', 8000, 'KG', 'Hot Caustic Washed <100ppm PVC', 0.5, 'Low', 'Chennai, Tamil Nadu', 42, 'active'),
    (gen_random_uuid(), v_seller_id, 'Corrugated Cardboard (OCC) Bales', 'Paper & Packaging', 10000, 'KG', 'Mill Baled, Dry, No Plastic Tape', 8, 'Low', 'Madurai, Tamil Nadu', 15, 'active');

  ------------------------------------------------------------
  -- 5. SEED BUYERS CRM (Assigned to Seller)
  ------------------------------------------------------------
  DELETE FROM public.buyers WHERE public.buyers.owner_id = v_seller_id;

  INSERT INTO public.buyers 
    (owner_id, company_name, industry, buyer_type, city, state, materials_required, min_quantity, max_quantity, min_price, max_price, crm_status, verification_status, contact_person, email, phone)
  VALUES 
    (v_seller_id, 'EcoThreads Manufacturing', 'Textiles', 'Manufacturer', 'Coimbatore', 'Tamil Nadu', '["Cotton", "Textile Waste", "Fabric Scraps", "Yarn", "Comber"]'::jsonb, 100, 5000, 25, 45, 'NEW', 'verified', 'Karthik Raman', 'contact@ecothreads.in', '+91 94432 11029'),
    (v_seller_id, 'Global Recyclers Ltd', 'Recycling', 'Aggregator', 'Chennai', 'Tamil Nadu', '["Mixed Plastic", "PET", "Cardboard", "Paper", "HDPE"]'::jsonb, 500, 10000, 10, 35, 'CONTACTED', 'verified', 'Suresh Kumar', 'procurement@globalrecyclers.com', '+91 98401 55678'),
    (v_seller_id, 'SteelForge Industries', 'Metallurgy', 'Manufacturer', 'Pune', 'Maharashtra', '["Scrap Iron", "Aluminium", "Copper"]'::jsonb, 1000, 50000, 40, 80, 'INTERESTED', 'verified', 'Amit Shinde', 'trade@steelforge.co.in', '+91 98220 99482'),
    (v_seller_id, 'GreenFill Solutions', 'Construction', 'Manufacturer', 'Bengaluru', 'Karnataka', '["Fly Ash", "Concrete Rubble", "Glass", "Slag"]'::jsonb, 2000, 20000, 5, 18, 'NEGOTIATION', 'unverified', 'Pooja Reddy', 'materials@greenfill.io', '+91 80234 11200');

  ------------------------------------------------------------
  -- 6. SEED ACTIVE CIRCULAR DEALS
  ------------------------------------------------------------
  INSERT INTO public.deals (
    id, waste_id, seller_id, buyer_id, agreed_quantity, agreed_price, total_amount, status, notes
  ) VALUES (
    gen_random_uuid(), v_waste1_id, v_seller_id, v_buyer_id, 4500, 36, 162000, 'PICKUP_SCHEDULED', 'Weighbridge gate pass issued. Scheduled for delivery to Coimbatore spinning unit.'
  ) ON CONFLICT DO NOTHING;

END $$;
