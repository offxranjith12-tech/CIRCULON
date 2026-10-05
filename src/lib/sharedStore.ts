import { type DriverTrip, type DriverTripStatus } from '@/lib/types';
import { type EmailNotification } from '@/lib/email';

export interface CompanyRegistration {
  id: string;
  company_name: string;
  email?: string;
  role: 'seller' | 'buyer' | 'admin' | 'driver';
  company_address?: string;
  id_proof_number?: string;
  id_proof_url?: string;
  material_focus?: string;
  industry?: string;
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  rejection_reason?: string;
  created_at: string;
  approved_at?: string;
}

export interface WasteMaterial {
  id: string;
  seller_id: string;
  material_name: string;
  category?: string;
  quantity: number;
  unit: string;
  condition: string;
  moisture_percentage?: number;
  contamination_level?: string;
  location: string;
  expected_price?: number;
  available_date?: string;
  description?: string;
  image_url?: string | null;
  status: 'active' | 'pending' | 'matched' | 'sold' | 'completed' | 'rejected' | 'archived' | 'suspended';
  seller?: {
    company_name: string;
    company_address?: string;
    phone?: string;
    email?: string;
  };
  created_at: string;
  updated_at?: string;
}

export interface DealMessage {
  id: string;
  deal_id: string;
  sender_id: string;
  sender_name?: string;
  sender_role: 'seller' | 'buyer' | 'admin' | 'driver';
  message: string;
  proposed_quantity?: number;
  proposed_price?: number;
  created_at: string;
}

export type DealStatus = 
  | 'NEGOTIATING' 
  | 'AGREED' 
  | 'PICKUP_SCHEDULED' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED';

import { type DriverInfo } from '@/lib/logistics';

export interface Deal {
  id: string;
  waste_id: string;
  waste_name: string;
  waste_category?: string;
  seller_id: string;
  seller_name: string;
  seller_phone?: string;
  seller_location: string;
  buyer_id: string;
  buyer_name: string;
  buyer_phone?: string;
  buyer_location?: string;
  agreed_quantity: number;
  agreed_price: number;
  total_amount: number;
  status: DealStatus;
  pickup_date?: string;
  delivery_date?: string;
  driver_info?: DriverInfo;
  notes?: string;
  cancellation_reason?: string;
  co2_saved_kg: number;
  landfill_diverted_kg: number;
  created_at: string;
  updated_at: string;
  messages: DealMessage[];
}

export interface PlatformReport {
  id: string;
  reporter_name: string;
  reported_type: 'user' | 'listing' | 'transaction' | 'suspicious_activity';
  target_id: string;
  target_name: string;
  reason: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// 1. CANONICAL COMPANIES & USERS DIRECTORY
// ---------------------------------------------------------------------------
const INITIAL_COMPANIES: CompanyRegistration[] = [
  // 5 Approved Sellers
  {
    id: '0a09b131-3e59-4206-8f62-2f4f75092243',
    company_name: 'Apex Industrial Recycling Corp',
    email: 'apex.textiles@circulon.com',
    role: 'seller',
    industry: 'Textiles & Fiber Recovery',
    company_address: 'Tirupur Textile Hub, Tamil Nadu - 641601',
    id_proof_number: 'TN-GST-8842-APEX',
    material_focus: 'Post-Industrial Cotton Comber & Denim Scraps',
    approval_status: 'approved',
    created_at: '2026-01-15T09:00:00Z',
    approved_at: '2026-01-15T11:00:00Z'
  },
  {
    id: '49d3e3f6-aa34-4ab8-ad6a-3cd7eacec477',
    company_name: 'Tata EcoSteel & Foundry Works',
    email: 'ecosteel@circulon.com',
    role: 'seller',
    industry: 'Metallurgy & Heavy Casting',
    company_address: 'Ranipet SIPCOT Industrial Complex, Tamil Nadu - 632403',
    id_proof_number: 'TN-GST-3301-STEEL',
    material_focus: 'Blast Furnace Slag & Heavy Melting Steel',
    approval_status: 'approved',
    created_at: '2026-01-18T10:30:00Z',
    approved_at: '2026-01-18T12:00:00Z'
  },
  {
    id: 'b30827b5-8717-47ce-b5ef-fcfacdedd74e',
    company_name: 'EcoPlast Polymers & Compounds',
    email: 'ecoplast@circulon.com',
    role: 'seller',
    industry: 'Plastics & Petrochemical Recycling',
    company_address: 'Peenya Industrial Estate, Bengaluru, Karnataka - 560058',
    id_proof_number: 'KA-GST-5541-PLAST',
    material_focus: 'HDPE Regrind & Clean PET Hot-Washed Flakes',
    approval_status: 'approved',
    created_at: '2026-01-20T14:15:00Z',
    approved_at: '2026-01-20T15:00:00Z'
  },
  {
    id: '41b5574c-09f9-4c49-ab65-4f8da1f214e0',
    company_name: 'Bharat BioChemicals & Solvents',
    email: 'bharat.bio@circulon.com',
    role: 'seller',
    industry: 'Agro-Processing & Green Biofuels',
    company_address: 'Sugar Mill Belt, Erode, Tamil Nadu - 638002',
    id_proof_number: 'TN-GST-9921-BIO',
    material_focus: 'Sugarcane Bagasse, Rice Husk Ash & Coir Pith',
    approval_status: 'approved',
    created_at: '2026-01-22T08:45:00Z',
    approved_at: '2026-01-22T09:30:00Z'
  },
  {
    id: '4f5bd080-6ee2-4a24-8836-bc2366c89bbd',
    company_name: 'InfraCycle Demolition & Aggregates',
    email: 'infracycle@circulon.com',
    role: 'seller',
    industry: 'Construction & Demolition Recycling',
    company_address: 'Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
    id_proof_number: 'TN-GST-7712-INFRA',
    material_focus: 'Recycled Concrete Aggregates & Fly Ash',
    approval_status: 'approved',
    created_at: '2026-01-25T11:20:00Z',
    approved_at: '2026-01-25T13:00:00Z'
  },

  // 4 Approved Buyers
  {
    id: 'c2-greenpoly-id',
    company_name: 'GreenPolymer Recyclers Ltd',
    email: 'greenpolymer@circulon.com',
    role: 'buyer',
    industry: 'Plastics & Petrochemical Recycling',
    company_address: 'Plot 88, Guindy Industrial Estate, Chennai, Tamil Nadu - 600032',
    id_proof_number: 'TN-GST-1122-POLY',
    material_focus: 'Post-Consumer HDPE, PET Flakes & Polymer Regrinds',
    approval_status: 'approved',
    created_at: '2026-01-16T10:00:00Z',
    approved_at: '2026-01-16T11:30:00Z'
  },
  {
    id: 'c4-bioagro-id',
    company_name: 'BioAgro Circular Energy Solutions',
    email: 'bioagro@circulon.com',
    role: 'buyer',
    industry: 'Biofuels & Green Biomass Energy',
    company_address: 'SIPCOT Phase II, Hosur, Tamil Nadu - 635109',
    id_proof_number: 'TN-GST-4433-AGRO',
    material_focus: 'Sugarcane Bagasse, Rice Husk & Organic Agricultural Residues',
    approval_status: 'approved',
    created_at: '2026-01-19T13:10:00Z',
    approved_at: '2026-01-19T14:40:00Z'
  },
  {
    id: 'c5-deccan-id',
    company_name: 'Deccan Paper & Kraft Packaging Mills',
    email: 'deccanpaper@circulon.com',
    role: 'buyer',
    industry: 'Paper & Corrugated Packaging',
    company_address: 'Plot 45, Industrial Growth Centre, Rajahmundry, Andhra Pradesh - 533105',
    id_proof_number: 'AP-GST-8877-PAPR',
    material_focus: 'Cotton Comber Offcuts, OCC Baled Cardboard & Pulp Slurry',
    approval_status: 'approved',
    created_at: '2026-01-21T09:25:00Z',
    approved_at: '2026-01-21T10:15:00Z'
  },
  {
    id: 'c7-horizon-id',
    company_name: 'Horizon E-Waste Refiners',
    email: 'horizon.refiners@circulon.com',
    role: 'buyer',
    industry: 'E-Waste & Precious Metal Recovery',
    company_address: 'Electronics City Phase I, Bengaluru, Karnataka - 560100',
    id_proof_number: 'KA-GST-6622-EWAST',
    material_focus: 'Printed Circuit Boards, Copper Offcuts & Non-Ferrous Scrap',
    approval_status: 'approved',
    created_at: '2026-01-24T16:00:00Z',
    approved_at: '2026-01-24T17:00:00Z'
  },

  // 1 Approved Driver
  {
    id: 'c10-quickfreight-id',
    company_name: 'QuickFreight Green Logistics Network',
    email: 'quickfreight@circulon.com',
    role: 'driver',
    industry: 'Industrial Freight & Eco-Transport',
    company_address: 'Namakkal Trucking Hub, Tamil Nadu - 637001',
    id_proof_number: 'TN-DL-9988-FREIGHT',
    material_focus: 'Multi-Axle Heavy Haulers, Container Carriers & Flatbeds',
    approval_status: 'approved',
    created_at: '2026-01-17T11:00:00Z',
    approved_at: '2026-01-17T12:00:00Z'
  },

  // 1 Approved Admin
  {
    id: 'admin-circulon-id',
    company_name: 'CIRCULON Platform Governance (HQ)',
    email: 'admin@circulon.com',
    role: 'admin',
    industry: 'Circular Platform Governance',
    company_address: 'T-Hub Innovation Campus, Hyderabad, Telangana - 500081',
    id_proof_number: 'TS-GOV-0001-CIRC',
    material_focus: 'Digital Product Passports & Industrial Symbiosis Governance',
    approval_status: 'approved',
    created_at: '2026-01-01T00:00:00Z',
    approved_at: '2026-01-01T00:00:00Z'
  },

  // 2 Pending Verification Companies
  {
    id: 'p1-zenagro-id',
    company_name: 'ZenAgro BioCompost Ltd',
    email: 'contact@zenagro.in',
    role: 'buyer',
    industry: 'Organic Fertilizer & Bio-enrichment',
    company_address: 'Coimbatore Rural Agro Cluster, Tamil Nadu - 641062',
    id_proof_number: 'TN-COIM-AGRO-7721',
    material_focus: 'Organic Agro-waste, Coir Pith, Bagasse & Ash',
    approval_status: 'pending',
    created_at: '2026-02-01T10:15:00Z'
  },
  {
    id: 'p2-metrometal-id',
    company_name: 'Metro Metal Foundry Works',
    email: 'operations@metrometal.com',
    role: 'seller',
    industry: 'Foundry & Secondary Metal Casting',
    company_address: 'SIDCO Industrial Estate, Kurichi, Coimbatore - 641021',
    id_proof_number: 'TN-GSTIN-33AAACM1928',
    material_focus: 'Foundry Core Sand, Cupola Slag & Ferrous Flakes',
    approval_status: 'pending',
    created_at: '2026-02-02T15:40:00Z'
  }
];

// ---------------------------------------------------------------------------
// 2. CANONICAL WASTE MATERIALS (Mapped with exact Seller profiles)
// ---------------------------------------------------------------------------
const INITIAL_WASTE_MATERIALS: WasteMaterial[] = [
  {
    id: '77257d56-ee2b-47f6-ba03-1ca6e573aed2',
    seller_id: '0a09b131-3e59-4206-8f62-2f4f75092243',
    material_name: 'Post-Industrial Cotton Comber Scraps',
    category: 'Textiles',
    quantity: 4500,
    unit: 'KG',
    condition: 'Dry baled, uniform 28mm staple length',
    moisture_percentage: 4.2,
    contamination_level: 'Low (<0.5%)',
    location: 'Tirupur Textile Hub, Tamil Nadu',
    expected_price: 38,
    status: 'matched', // Linked to Deal 1 (Pickup scheduled)
    seller: {
      company_name: 'Apex Industrial Recycling Corp',
      company_address: 'Tirupur Textile Hub, Tamil Nadu - 641601',
      phone: '+91 98400 11223',
      email: 'apex.textiles@circulon.com'
    },
    created_at: '2026-01-20T08:00:00Z'
  },
  {
    id: '8a240fab-05ee-47c4-9a04-062884d72624',
    seller_id: '0a09b131-3e59-4206-8f62-2f4f75092243',
    material_name: 'Recycled Denim Indigo Fabric Offcuts',
    category: 'Textiles',
    quantity: 6200,
    unit: 'KG',
    condition: 'Uncut garment cutting room selvedge strips',
    moisture_percentage: 3.5,
    contamination_level: 'Low',
    location: 'Tirupur Textile Hub, Tamil Nadu',
    expected_price: 28,
    status: 'active',
    seller: {
      company_name: 'Apex Industrial Recycling Corp',
      company_address: 'Tirupur Textile Hub, Tamil Nadu - 641601',
      phone: '+91 98400 11223',
      email: 'apex.textiles@circulon.com'
    },
    created_at: '2026-01-22T10:00:00Z'
  },
  {
    id: 'ac8f4550-4a41-4dfe-98ef-07706dcceffb',
    seller_id: '49d3e3f6-aa34-4ab8-ad6a-3cd7eacec477',
    material_name: 'Blast Furnace Granulated Slag (GGBS Grade)',
    category: 'Metals & Minerals',
    quantity: 40000,
    unit: 'KG',
    condition: 'Quenched granular vitreous byproduct',
    moisture_percentage: 8.0,
    contamination_level: 'None',
    location: 'Ranipet SIPCOT Complex, Tamil Nadu',
    expected_price: 4.5,
    status: 'active',
    seller: {
      company_name: 'Tata EcoSteel & Foundry Works',
      company_address: 'Ranipet SIPCOT Industrial Complex, Tamil Nadu - 632403',
      phone: '+91 98411 22334',
      email: 'ecosteel@circulon.com'
    },
    created_at: '2026-01-19T09:30:00Z'
  },
  {
    id: 'c711b21d-37c5-48e4-bf49-33b68b83e4a2',
    seller_id: '49d3e3f6-aa34-4ab8-ad6a-3cd7eacec477',
    material_name: 'Heavy Melting Steel Scrap (HMS 1 & 2)',
    category: 'Metals & Minerals',
    quantity: 18000,
    unit: 'KG',
    condition: 'Sorted structural scrap, sheared to size',
    moisture_percentage: 0,
    contamination_level: 'Zero',
    location: 'Ranipet SIPCOT Complex, Tamil Nadu',
    expected_price: 34,
    status: 'sold', // Completed in Deal 3!
    seller: {
      company_name: 'Tata EcoSteel & Foundry Works',
      company_address: 'Ranipet SIPCOT Industrial Complex, Tamil Nadu - 632403',
      phone: '+91 98411 22334',
      email: 'ecosteel@circulon.com'
    },
    created_at: '2026-01-18T14:00:00Z'
  },
  {
    id: 'ce28dcf7-c919-457e-a705-1a883cad8baa',
    seller_id: 'b30827b5-8717-47ce-b5ef-fcfacdedd74e',
    material_name: 'High-Density Polyethylene (HDPE) Regrind',
    category: 'Plastics & Polymers',
    quantity: 12000,
    unit: 'KG',
    condition: 'Washed, shredded 6-8mm flakes',
    moisture_percentage: 1.2,
    contamination_level: 'Low (<0.1%)',
    location: 'Peenya Industrial Estate, Bengaluru, Karnataka',
    expected_price: 27.5,
    status: 'matched', // Linked to Deal 2 (In Transit)
    seller: {
      company_name: 'EcoPlast Polymers & Compounds',
      company_address: 'Peenya Industrial Estate, Bengaluru, Karnataka - 560058',
      phone: '+91 98450 77889',
      email: 'ecoplast@circulon.com'
    },
    created_at: '2026-01-21T11:15:00Z'
  },
  {
    id: 'a606f476-4057-49d1-b614-d06865e62813',
    seller_id: 'b30827b5-8717-47ce-b5ef-fcfacdedd74e',
    material_name: 'Clean Transparent PET Flakes (Hot Washed)',
    category: 'Plastics & Polymers',
    quantity: 8500,
    unit: 'KG',
    condition: 'Hot washed, caustic rinsed, PVC-free',
    moisture_percentage: 0.8,
    contamination_level: 'Zero',
    location: 'Peenya Industrial Estate, Bengaluru, Karnataka',
    expected_price: 42,
    status: 'active',
    seller: {
      company_name: 'EcoPlast Polymers & Compounds',
      company_address: 'Peenya Industrial Estate, Bengaluru, Karnataka - 560058',
      phone: '+91 98450 77889',
      email: 'ecoplast@circulon.com'
    },
    created_at: '2026-01-23T15:20:00Z'
  },
  {
    id: '2bca96fe-09cd-4861-bc63-72ab44785ecd',
    seller_id: '41b5574c-09f9-4c49-ab65-4f8da1f214e0',
    material_name: 'Sugarcane Bagasse Biomass Fiber',
    category: 'Bio-waste & Agro',
    quantity: 25000,
    unit: 'KG',
    condition: 'Milled organic fibrous byproduct',
    moisture_percentage: 12.0,
    contamination_level: 'Low',
    location: 'Sugar Mill Belt, Erode, Tamil Nadu',
    expected_price: 3.2,
    status: 'active',
    seller: {
      company_name: 'Bharat BioChemicals & Solvents',
      company_address: 'Sugar Mill Belt, Erode, Tamil Nadu - 638002',
      phone: '+91 94433 88771',
      email: 'bharat.bio@circulon.com'
    },
    created_at: '2026-01-24T09:00:00Z'
  },
  {
    id: '096bc42f-7437-4b0c-99ee-528bfedb71f3',
    seller_id: '41b5574c-09f9-4c49-ab65-4f8da1f214e0',
    material_name: 'Paddy Rice Husk Ash (High Amorphous Silica)',
    category: 'Bio-waste & Agro',
    quantity: 15000,
    unit: 'KG',
    condition: 'Controlled combustion boiler ash (>85% SiO2)',
    moisture_percentage: 2.1,
    contamination_level: 'Low',
    location: 'Sugar Mill Belt, Erode, Tamil Nadu',
    expected_price: 6.5,
    status: 'active',
    seller: {
      company_name: 'Bharat BioChemicals & Solvents',
      company_address: 'Sugar Mill Belt, Erode, Tamil Nadu - 638002',
      phone: '+91 94433 88771',
      email: 'bharat.bio@circulon.com'
    },
    created_at: '2026-01-25T13:00:00Z'
  },
  {
    id: 'ba16988e-d224-47d3-9fb2-666245a75921',
    seller_id: '41b5574c-09f9-4c49-ab65-4f8da1f214e0',
    material_name: 'Desalinated Coconut Coir Pith Blocks',
    category: 'Bio-waste & Agro',
    quantity: 18000,
    unit: 'KG',
    condition: 'Compressed 5KG blocks, EC <0.5 mS/cm',
    moisture_percentage: 14.5,
    contamination_level: 'None',
    location: 'Sugar Mill Belt, Erode, Tamil Nadu',
    expected_price: 8.0,
    status: 'active',
    seller: {
      company_name: 'Bharat BioChemicals & Solvents',
      company_address: 'Sugar Mill Belt, Erode, Tamil Nadu - 638002',
      phone: '+91 94433 88771',
      email: 'bharat.bio@circulon.com'
    },
    created_at: '2026-01-26T11:45:00Z'
  },
  {
    id: 'b84fd385-a29b-40f0-8bd4-d94344ed7b8c',
    seller_id: '4f5bd080-6ee2-4a24-8836-bc2366c89bbd',
    material_name: 'Class-1 Recycled Concrete Aggregate (10-20mm)',
    category: 'Construction & Demolition',
    quantity: 50000,
    unit: 'KG',
    condition: 'Washed, crushed concrete demolition rubble',
    moisture_percentage: 1.5,
    contamination_level: 'None',
    location: 'Ambattur Industrial Estate, Chennai, Tamil Nadu',
    expected_price: 1.8,
    status: 'active',
    seller: {
      company_name: 'InfraCycle Demolition & Aggregates',
      company_address: 'Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
      phone: '+91 98402 33445',
      email: 'infracycle@circulon.com'
    },
    created_at: '2026-01-27T08:30:00Z'
  },
  {
    id: '04d459cd-e6d6-4c82-8eb3-b2f04d736373',
    seller_id: '4f5bd080-6ee2-4a24-8836-bc2366c89bbd',
    material_name: 'Classified Precipitator Fly Ash (Grade F)',
    category: 'Construction & Demolition',
    quantity: 35000,
    unit: 'KG',
    condition: 'Dry pulverized thermal power ash, IS 3812 certified',
    moisture_percentage: 0.5,
    contamination_level: 'Zero',
    location: 'Ambattur Industrial Estate, Chennai, Tamil Nadu',
    expected_price: 2.2,
    status: 'active',
    seller: {
      company_name: 'InfraCycle Demolition & Aggregates',
      company_address: 'Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
      phone: '+91 98402 33445',
      email: 'infracycle@circulon.com'
    },
    created_at: '2026-01-28T14:10:00Z'
  },
  {
    id: 'd6926710-ab09-4f6f-a7ac-46a53ad6b6fa',
    seller_id: '4f5bd080-6ee2-4a24-8836-bc2366c89bbd',
    material_name: 'Corrugated Cardboard (OCC 11) Mill Bales',
    category: 'Paper & Packaging',
    quantity: 10000,
    unit: 'KG',
    condition: 'Double-wire baled, moisture <10%',
    moisture_percentage: 7.8,
    contamination_level: 'Low',
    location: 'Ambattur Industrial Estate, Chennai, Tamil Nadu',
    expected_price: 14.5,
    status: 'active',
    seller: {
      company_name: 'InfraCycle Demolition & Aggregates',
      company_address: 'Ambattur Industrial Estate, Chennai, Tamil Nadu - 600058',
      phone: '+91 98402 33445',
      email: 'infracycle@circulon.com'
    },
    created_at: '2026-01-29T16:00:00Z'
  }
];

// ---------------------------------------------------------------------------
// 3. CANONICAL DEALS
// ---------------------------------------------------------------------------
const INITIAL_DEALS: Deal[] = [
  {
    id: 'DEAL-2026-APEX-DEC01',
    waste_id: '77257d56-ee2b-47f6-ba03-1ca6e573aed2',
    waste_name: 'Post-Industrial Cotton Comber Scraps',
    waste_category: 'Textiles',
    seller_id: '0a09b131-3e59-4206-8f62-2f4f75092243',
    seller_name: 'Apex Industrial Recycling Corp',
    seller_phone: '+91 98400 11223',
    seller_location: 'Tirupur Textile Hub, Tamil Nadu',
    buyer_id: 'c5-deccan-id',
    buyer_name: 'Deccan Paper & Kraft Packaging Mills',
    buyer_phone: '+91 88300 44556',
    buyer_location: 'Industrial Area, Rajahmundry, Andhra Pradesh',
    agreed_quantity: 4500,
    agreed_price: 37.5,
    total_amount: 168750,
    status: 'PICKUP_SCHEDULED',
    pickup_date: new Date(Date.now() + 86400000).toISOString(),
    delivery_date: new Date(Date.now() + 259200000).toISOString(),
    driver_info: {
      driver_name: 'Rajesh Kannan',
      driver_phone: '+91 90000 12345',
      vehicle_number: 'TN 38 AA 4521',
      vehicle_type: '16-Ton Multi-Axle Freight Carrier',
      fleet: 'QuickFreight Green Logistics Network',
      transporter: 'QuickFreight Green Logistics Network',
      pickup_date: 'Tomorrow, 08:30 AM'
    },
    notes: 'Weighbridge gate pass issued. 100% Cotton comber bales labeled for Deccan Paper Specialty Mill.',
    co2_saved_kg: 8550,
    landfill_diverted_kg: 4500,
    created_at: '2026-02-01T09:00:00Z',
    updated_at: '2026-02-01T14:30:00Z',
    messages: [
      {
        id: 'msg-apex-1',
        deal_id: 'DEAL-2026-APEX-DEC01',
        sender_id: 'c5-deccan-id',
        sender_name: 'Deccan Paper Procurement',
        sender_role: 'buyer',
        message: 'Offer accepted for 4,500 KG cotton comber at ₹37.50/KG. Dispatch vehicle scheduled.',
        proposed_quantity: 4500,
        proposed_price: 37.5,
        created_at: '2026-02-01T09:00:00Z'
      }
    ]
  },
  {
    id: 'DEAL-2026-ECO-GRN02',
    waste_id: 'ce28dcf7-c919-457e-a705-1a883cad8baa',
    waste_name: 'High-Density Polyethylene (HDPE) Regrind',
    waste_category: 'Plastics & Polymers',
    seller_id: 'b30827b5-8717-47ce-b5ef-fcfacdedd74e',
    seller_name: 'EcoPlast Polymers & Compounds',
    seller_phone: '+91 98450 77889',
    seller_location: 'Peenya Industrial Estate, Bengaluru, Karnataka',
    buyer_id: 'c2-greenpoly-id',
    buyer_name: 'GreenPolymer Recyclers Ltd',
    buyer_phone: '+91 98400 99887',
    buyer_location: 'Plot 88, Guindy Industrial Estate, Chennai, Tamil Nadu',
    agreed_quantity: 12000,
    agreed_price: 27.5,
    total_amount: 330000,
    status: 'IN_TRANSIT',
    pickup_date: new Date(Date.now() - 14400000).toISOString(),
    delivery_date: new Date(Date.now() + 21600000).toISOString(),
    driver_info: {
      driver_name: 'Murugan V',
      driver_phone: '+91 94422 66778',
      vehicle_number: 'KA 04 E 8832',
      vehicle_type: '24-Ton Multi-Axle Container Hauler',
      fleet: 'QuickFreight Green Logistics Network',
      transporter: 'QuickFreight Green Logistics Network',
      pickup_date: 'Today, 06:00 AM'
    },
    notes: 'Consignment in transit along NH 48 corridor (Bengaluru to Guindy, Chennai). GPS tracker active.',
    co2_saved_kg: 21600,
    landfill_diverted_kg: 12000,
    created_at: '2026-02-02T08:00:00Z',
    updated_at: '2026-02-02T10:00:00Z',
    messages: [
      {
        id: 'msg-eco-1',
        deal_id: 'DEAL-2026-ECO-GRN02',
        sender_id: 'c2-greenpoly-id',
        sender_name: 'GreenPolymer Recyclers',
        sender_role: 'buyer',
        message: 'Truck loaded and departed Peenya at 06:00 AM. Expected arrival in Guindy by 18:00 PM.',
        proposed_quantity: 12000,
        proposed_price: 27.5,
        created_at: '2026-02-02T08:00:00Z'
      }
    ]
  },
  {
    id: 'DEAL-2026-STEEL-INFRA03',
    waste_id: 'c711b21d-37c5-48e4-bf49-33b68b83e4a2',
    waste_name: 'Heavy Melting Steel Scrap (HMS 1 & 2)',
    waste_category: 'Metals & Minerals',
    seller_id: '49d3e3f6-aa34-4ab8-ad6a-3cd7eacec477',
    seller_name: 'Tata EcoSteel & Foundry Works',
    seller_phone: '+91 98411 22334',
    seller_location: 'Ranipet SIPCOT Complex, Tamil Nadu',
    buyer_id: '4f5bd080-6ee2-4a24-8836-bc2366c89bbd',
    buyer_name: 'InfraCycle Demolition & Aggregates',
    buyer_phone: '+91 98402 33445',
    buyer_location: 'Ambattur Industrial Estate, Chennai, Tamil Nadu',
    agreed_quantity: 18000,
    agreed_price: 34.0,
    total_amount: 612000,
    status: 'COMPLETED',
    pickup_date: '2026-01-29T07:00:00Z',
    delivery_date: '2026-01-29T16:30:00Z',
    driver_info: {
      driver_name: 'Selvam R',
      driver_phone: '+91 98400 55667',
      vehicle_number: 'TN 42 D 1122',
      vehicle_type: '28-Ton Heavy Tipper',
      fleet: 'QuickFreight Green Logistics Network',
      transporter: 'QuickFreight Green Logistics Network',
      pickup_date: 'Delivered'
    },
    notes: '18 MT delivered to Ambattur casting facility. Weighbridge slip WB-CH-8831 verified. Payment settled.',
    co2_saved_kg: 32400,
    landfill_diverted_kg: 18000,
    created_at: '2026-01-28T09:00:00Z',
    updated_at: '2026-01-29T17:00:00Z',
    messages: [
      {
        id: 'msg-steel-1',
        deal_id: 'DEAL-2026-STEEL-INFRA03',
        sender_id: '4f5bd080-6ee2-4a24-8836-bc2366c89bbd',
        sender_name: 'InfraCycle Demolition',
        sender_role: 'buyer',
        message: 'Material received and weighbridge verified at 18,000 KG. Settlement complete.',
        proposed_quantity: 18000,
        proposed_price: 34.0,
        created_at: '2026-01-29T17:00:00Z'
      }
    ]
  }
];

// ---------------------------------------------------------------------------
// 4. CANONICAL DRIVER TRIPS (Linked to Deals)
// ---------------------------------------------------------------------------
const INITIAL_TRIPS: DriverTrip[] = [
  {
    id: 'TRIP-2026-001',
    shipmentId: 'SHP-2026-001',
    dealId: 'DEAL-2026-APEX-DEC01',
    materialName: 'Post-Industrial Cotton Comber Scraps',
    category: 'Textiles',
    quantity: 4500,
    unit: 'KG',
    pickupLocation: 'Tirupur Textile Hub, Tamil Nadu',
    pickupContactName: 'Apex Industrial Recycling Corp',
    pickupPhone: '+91 98400 11223',
    dropoffLocation: 'Industrial Area, Rajahmundry, Andhra Pradesh',
    dropoffContactName: 'Deccan Paper & Kraft Packaging Mills',
    dropoffPhone: '+91 88300 44556',
    distanceKm: 680,
    status: 'ASSIGNED',
    estimatedEarnings: 3800,
    vehicleNumber: 'TN 38 AA 4521'
  },
  {
    id: 'TRIP-2026-002',
    shipmentId: 'SHP-2026-002',
    dealId: 'DEAL-2026-ECO-GRN02',
    materialName: 'High-Density Polyethylene (HDPE) Regrind',
    category: 'Plastics & Polymers',
    quantity: 12000,
    unit: 'KG',
    pickupLocation: 'Peenya Industrial Estate, Bengaluru, Karnataka',
    pickupContactName: 'EcoPlast Polymers & Compounds',
    pickupPhone: '+91 98450 77889',
    dropoffLocation: 'Plot 88, Guindy Industrial Estate, Chennai, Tamil Nadu',
    dropoffContactName: 'GreenPolymer Recyclers Ltd',
    dropoffPhone: '+91 98400 99887',
    distanceKm: 348,
    status: 'IN_TRANSIT',
    estimatedEarnings: 6500,
    vehicleNumber: 'KA 04 E 8832'
  },
  {
    id: 'TRIP-2026-003',
    shipmentId: 'SHP-2026-003',
    dealId: 'DEAL-2026-STEEL-INFRA03',
    materialName: 'Heavy Melting Steel Scrap (HMS 1 & 2)',
    category: 'Metals & Minerals',
    quantity: 18000,
    unit: 'KG',
    pickupLocation: 'Ranipet SIPCOT Complex, Tamil Nadu',
    pickupContactName: 'Tata EcoSteel & Foundry Works',
    pickupPhone: '+91 98411 22334',
    dropoffLocation: 'Ambattur Industrial Estate, Chennai, Tamil Nadu',
    dropoffContactName: 'InfraCycle Demolition & Aggregates',
    dropoffPhone: '+91 98402 33445',
    distanceKm: 98,
    status: 'COMPLETED',
    estimatedEarnings: 4500,
    vehicleNumber: 'TN 42 D 1122',
    deliveryProofUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    weighbridgeSlipNumber: 'WB-CH-8831',
    recipientSignatureName: 'V. Ramanathan (Receiving Manager)',
    deliveryNotes: '18 MT verified and accepted into smelter yard.',
    completedAt: '2026-01-29T16:30:00Z'
  }
];

// ---------------------------------------------------------------------------
// 5. CANONICAL PLATFORM REPORTS
// ---------------------------------------------------------------------------
const INITIAL_REPORTS: PlatformReport[] = [
  {
    id: 'REP-001',
    reporter_name: 'GreenPolymer Recyclers Ltd',
    reported_type: 'listing',
    target_id: 'w-sample-99',
    target_name: 'Mixed Contaminated PVC Offcuts',
    reason: 'Listing advertised as pure HDPE but contains hazardous PVC plasticizer additives.',
    status: 'investigating',
    admin_notes: 'Sample batch requested for spectral laboratory test.',
    created_at: '2026-02-01T11:20:00Z'
  },
  {
    id: 'REP-002',
    reporter_name: 'QuickFreight Green Logistics',
    reported_type: 'transaction',
    target_id: 'TX-9921',
    target_name: 'E-Waste Gate Loading Delay',
    reason: 'Loading dock delayed commercial hauler by over 4 hours beyond scheduled window.',
    status: 'resolved',
    admin_notes: 'Demurrage fee credited to carrier account.',
    created_at: '2026-01-28T16:00:00Z'
  }
];

// ---------------------------------------------------------------------------
// LIVE SINGLETON STORE (Shared across all Next.js Server Actions)
// ---------------------------------------------------------------------------
class LiveStore {
  private companies: CompanyRegistration[] = [...INITIAL_COMPANIES];
  private wastes: WasteMaterial[] = [...INITIAL_WASTE_MATERIALS];
  private deals: Deal[] = [...INITIAL_DEALS];
  private trips: DriverTrip[] = [...INITIAL_TRIPS];
  private reports: PlatformReport[] = [...INITIAL_REPORTS];

  // --- COMPANIES ---
  getCompanies(statusFilter: string = 'all'): CompanyRegistration[] {
    if (statusFilter === 'all') return [...this.companies];
    return this.companies.filter(c => c.approval_status === statusFilter);
  }

  getCompanyById(id: string): CompanyRegistration | undefined {
    return this.companies.find(c => c.id === id);
  }

  addCompany(company: CompanyRegistration) {
    // Avoid duplicate IDs
    this.companies = this.companies.filter(c => c.id !== company.id && c.email !== company.email);
    this.companies.unshift(company);
  }

  updateCompany(id: string, updates: Partial<CompanyRegistration>) {
    this.companies = this.companies.map(c => c.id === id ? { ...c, ...updates } : c);
  }

  deleteCompany(id: string) {
    this.companies = this.companies.filter(c => c.id !== id);
  }

  // --- WASTE MATERIALS ---
  getWaste(filter: 'all' | 'marketplace' | 'moderation' | 'seller' = 'all', sellerId?: string): WasteMaterial[] {
    if (filter === 'marketplace') {
      // Marketplace only shows active or matched items
      return this.wastes.filter(w => w.status === 'active' || w.status === 'matched');
    }
    if (filter === 'seller' && sellerId) {
      return this.wastes.filter(w => w.seller_id === sellerId);
    }
    return [...this.wastes];
  }

  getWasteById(id: string): WasteMaterial | undefined {
    return this.wastes.find(w => w.id === id);
  }

  addWaste(waste: WasteMaterial) {
    this.wastes.unshift(waste);
  }

  updateWasteStatus(id: string, status: WasteMaterial['status'], reason?: string) {
    this.wastes = this.wastes.map(w => {
      if (w.id === id) {
        return { ...w, status, updated_at: new Date().toISOString() };
      }
      return w;
    });
  }

  deleteWaste(id: string) {
    this.wastes = this.wastes.filter(w => w.id !== id);
  }

  // --- DEALS ---
  getDeals(role?: string, userId?: string): Deal[] {
    if (role === 'seller' && userId) {
      return this.deals.filter(d => d.seller_id === userId);
    }
    if (role === 'buyer' && userId) {
      return this.deals.filter(d => d.buyer_id === userId);
    }
    return [...this.deals];
  }

  getDealById(id: string): Deal | undefined {
    return this.deals.find(d => d.id === id);
  }

  addDeal(deal: Deal) {
    this.deals.unshift(deal);
  }

  updateDeal(dealId: string, updates: Partial<Deal>) {
    this.deals = this.deals.map(d => {
      if (d.id === dealId) {
        const updated = { ...d, ...updates, updated_at: new Date().toISOString() };
        // If status changed to COMPLETED, mark the waste material sold!
        if (updates.status === 'COMPLETED' || updates.status === 'DELIVERED') {
          this.updateWasteStatus(d.waste_id, 'sold');
        }
        return updated;
      }
      return d;
    });

    // Also sync matching Driver Trip if deal status changed to PICKUP_SCHEDULED or IN_TRANSIT
    const deal = this.deals.find(d => d.id === dealId);
    if (deal && (deal.status === 'PICKUP_SCHEDULED' || deal.status === 'IN_TRANSIT')) {
      const existingTrip = this.trips.find(t => t.dealId === dealId);
      if (!existingTrip) {
        this.trips.unshift({
          id: `TRIP-${Date.now().toString(36).toUpperCase()}`,
          shipmentId: `SHP-${Date.now().toString(36).toUpperCase()}`,
          dealId: deal.id,
          materialName: deal.waste_name,
          category: deal.waste_category || 'Industrial Material',
          quantity: deal.agreed_quantity,
          unit: 'KG',
          pickupLocation: deal.seller_location,
          pickupContactName: deal.seller_name,
          pickupPhone: deal.seller_phone || '+91 98400 11223',
          dropoffLocation: deal.buyer_location || 'Consignee Plant',
          dropoffContactName: deal.buyer_name,
          dropoffPhone: deal.buyer_phone || '+91 94400 00000',
          distanceKm: 240,
          status: deal.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'ASSIGNED',
          estimatedEarnings: Math.round(deal.agreed_quantity * 0.45) + 1500,
          vehicleNumber: deal.driver_info?.vehicle_number || 'TN 38 AA 4521'
        });
      } else {
        existingTrip.status = deal.status === 'IN_TRANSIT' ? 'IN_TRANSIT' : 'ASSIGNED';
      }
    }
  }

  addDealMessage(dealId: string, message: DealMessage) {
    this.deals = this.deals.map(d => {
      if (d.id === dealId) {
        const msgs = [...(d.messages || []), message];
        let q = d.agreed_quantity;
        let p = d.agreed_price;
        if (message.proposed_quantity && message.proposed_quantity > 0) q = message.proposed_quantity;
        if (message.proposed_price && message.proposed_price > 0) p = message.proposed_price;
        return {
          ...d,
          agreed_quantity: q,
          agreed_price: p,
          total_amount: q * p,
          messages: msgs,
          updated_at: new Date().toISOString()
        };
      }
      return d;
    });
  }

  // --- TRIPS ---
  getTrips(driverId?: string): DriverTrip[] {
    return [...this.trips];
  }

  advanceTrip(
    tripId: string, 
    nextStep: DriverTripStatus, 
    proofData?: {
      deliveryProofUrl?: string;
      weighbridgeSlipNumber?: string;
      recipientSignatureName?: string;
      deliveryNotes?: string;
    }
  ): DriverTrip | undefined {
    let targetTrip: DriverTrip | undefined;
    this.trips = this.trips.map(t => {
      if (t.id === tripId || t.shipmentId === tripId) {
        targetTrip = {
          ...t,
          status: nextStep,
          deliveryProofUrl: proofData?.deliveryProofUrl || t.deliveryProofUrl,
          weighbridgeSlipNumber: proofData?.weighbridgeSlipNumber || t.weighbridgeSlipNumber,
          recipientSignatureName: proofData?.recipientSignatureName || t.recipientSignatureName,
          deliveryNotes: proofData?.deliveryNotes || t.deliveryNotes,
          completedAt: nextStep === 'COMPLETED' ? new Date().toISOString() : t.completedAt
        };
        return targetTrip;
      }
      return t;
    });

    if (targetTrip && targetTrip.dealId) {
      if (nextStep === 'PICKED_UP' || nextStep === 'IN_TRANSIT') {
        this.updateDeal(targetTrip.dealId, { status: 'IN_TRANSIT' });
      } else if (nextStep === 'DELIVERED') {
        this.updateDeal(targetTrip.dealId, { status: 'DELIVERED' });
      } else if (nextStep === 'COMPLETED') {
        this.updateDeal(targetTrip.dealId, { status: 'COMPLETED' });
        // Waste material is now sold!
        const matchingDeal = this.deals.find(d => d.id === targetTrip?.dealId);
        if (matchingDeal) {
          this.updateWasteStatus(matchingDeal.waste_id, 'sold');
        }
      }
    }

    return targetTrip;
  }

  // --- PLATFORM REPORTS ---
  getReports(): PlatformReport[] {
    return [...this.reports];
  }

  resolveReport(reportId: string, status: 'resolved' | 'dismissed', adminNotes?: string) {
    this.reports = this.reports.map(r => r.id === reportId ? { ...r, status, admin_notes: adminNotes || r.admin_notes } : r);
  }

  // --- COMPUTED PLATFORM METRICS ---
  getMetrics() {
    const totalUsers = this.companies.length;
    const sellers = this.companies.filter(c => c.role === 'seller');
    const buyers = this.companies.filter(c => c.role === 'buyer');
    const drivers = this.companies.filter(c => c.role === 'driver');
    const pending = this.companies.filter(c => c.approval_status === 'pending');
    const approved = this.companies.filter(c => c.approval_status === 'approved');

    const totalListedKg = this.wastes.reduce((acc, w) => acc + (Number(w.quantity) || 0), 0);
    const completedDeals = this.deals.filter(d => d.status === 'COMPLETED');
    const totalSoldKg = completedDeals.reduce((acc, d) => acc + (Number(d.agreed_quantity) || 0), 0);
    const co2SavedKg = completedDeals.reduce((acc, d) => acc + (Number(d.co2_saved_kg) || 0), 0);
    const divertedKg = completedDeals.reduce((acc, d) => acc + (Number(d.landfill_diverted_kg) || 0), 0);
    const totalDealValue = completedDeals.reduce((acc, d) => acc + (Number(d.total_amount) || 0), 0);

    const catMap: Record<string, number> = {};
    this.wastes.forEach(w => {
      const c = w.category || 'General';
      catMap[c] = (catMap[c] || 0) + 1;
    });
    const categoryDistribution = Object.entries(catMap).map(([name, value]) => ({ name, value }));

    return {
      users: {
        total: totalUsers,
        sellers: sellers.length,
        buyers: buyers.length,
        drivers: drivers.length,
        pending: pending.length,
        approved: approved.length
      },
      marketplace: {
        total_listed_kg: totalListedKg,
        total_listed_tons: Math.round((totalListedKg / 1000) * 10) / 10,
        total_sold_kg: totalSoldKg,
        total_sold_tons: Math.round((totalSoldKg / 1000) * 10) / 10,
        total_deals: this.deals.length,
        completed_deals: completedDeals.length,
        total_transaction_value: totalDealValue
      },
      environmental: {
        co2e_avoided_kg: co2SavedKg,
        co2e_avoided_tons: Math.round((co2SavedKg / 1000) * 10) / 10,
        total_diverted_kg: divertedKg,
        total_diverted_tons: Math.round((divertedKg / 1000) * 10) / 10,
        water_saved_liters: Math.round(divertedKg * 25),
        virgin_feedstock_displaced_kg: divertedKg,
        circular_applications_active: categoryDistribution.length,
        category_distribution: categoryDistribution
      }
    };
  }
}

// Global singleton across server invocations
declare global {
  // eslint-disable-next-line no-var
  var __circulon_live_store__: LiveStore | undefined;
}

if (!global.__circulon_live_store__) {
  global.__circulon_live_store__ = new LiveStore();
}

export const sharedStore = global.__circulon_live_store__;
