'use server';

import { createClient } from '@/utils/supabase/server';
import { type MaterialPassport, type CustodyEvent } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Seed demo passports for instant testing
const DEFAULT_MATERIAL_PASSPORTS: MaterialPassport[] = [
  {
    id: 'CIRC-DPP-2026-CT9812',
    wasteId: 'sample-waste-1',
    dealId: 'deal-cotton-tirupur-1',
    batchNumber: 'BATCH-2026-09-TN42',
    materialName: 'Post-Industrial Cotton Comber Scraps',
    category: 'Textiles',
    quantity: 4500,
    unit: 'KG',
    originLocation: 'Tirupur, Tamil Nadu',
    originCompany: 'Apex Industrial Recycling Corp',
    sellerId: 'seller-apex-1',
    buyerCompany: 'EcoThreads Manufacturing Corp',
    buyerId: 'buyer-ecothreads-1',
    driverName: 'Ramesh Kumar (TN 38 BX 4421)',
    qualityScore: 86,
    purityPercentage: 91,
    contaminationLevel: 'Low',
    circularityScore: 94,
    co2AvoidedKg: 8325,
    landfillDivertedKg: 4500,
    waterSavedLiters: 112500,
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    qrPayloadUrl: '/passport/CIRC-DPP-2026-CT9812',
    certificateHash: '0x9f83b2a71e8c049d5a821e93cbf0281b3749a9f24419adcb6179b0c034ae112f',
    custodyTimeline: [
      {
        step: 'created',
        title: 'By-Product Batch Registered & Weighed',
        timestamp: '2026-09-18 09:30 AM',
        actor: 'Apex Industrial Recycling Corp',
        location: 'Tirupur Weighbridge Facility',
        status: 'completed',
        notes: 'Gross batch 4,500 KG recorded on electronic weighbridge #WB-4412.'
      },
      {
        step: 'analyzed',
        title: 'CIRCULON Preliminary AI Material Assessment',
        timestamp: '2026-09-18 10:15 AM',
        actor: 'CIRCULON AI Vision Engine',
        location: 'Cloud Neural Processor',
        status: 'completed',
        notes: 'Quality Score 86/100, Purity 91%, zero synthetic polyester detected.'
      },
      {
        step: 'matched',
        title: 'Procurement Matching & Commercial Accord',
        timestamp: '2026-09-19 02:45 PM',
        actor: 'EcoThreads Manufacturing Corp',
        location: 'Coimbatore Procurement Office',
        status: 'completed',
        notes: 'Agreed at ₹36/KG for open-end rotor yarn manufacturing.'
      },
      {
        step: 'dispatched',
        title: 'Carrier Assigned & Electronic Gate Pass Issued',
        timestamp: '2026-09-20 08:30 AM',
        actor: 'Driver Ramesh Kumar (GreenFleet Logistics)',
        location: 'Tirupur Gate 2',
        status: 'completed',
        notes: 'Vehicle TN 38 BX 4421 loaded with 15 standard compressed bales.'
      },
      {
        step: 'in_transit',
        title: 'Freight In-Transit with Telematics Monitoring',
        timestamp: '2026-09-20 10:45 AM',
        actor: 'GreenFleet Logistics',
        location: 'Avinashi Highway NH-544',
        status: 'in_progress',
        notes: 'Estimated arrival in Coimbatore: 12:30 PM.'
      },
      {
        step: 'delivered',
        title: 'Consignee Quality Verification & Acceptance',
        timestamp: 'Pending Delivery',
        actor: 'EcoThreads QA Inspection Unit',
        location: 'Coimbatore Spinning Mill #4',
        status: 'pending',
        notes: 'Bale moisture test & lab verification pending gate intake.'
      }
    ]
  },
  {
    id: 'CIRC-DPP-2026-HD4401',
    wasteId: 'sample-waste-2',
    batchNumber: 'BATCH-2026-09-CBE-HDPE',
    materialName: 'High-Density Polyethylene (HDPE) Regrind',
    category: 'Plastics & Polymers',
    quantity: 12000,
    unit: 'KG',
    originLocation: 'Coimbatore, Tamil Nadu',
    originCompany: 'Apex Industrial Recycling Corp',
    sellerId: 'seller-apex-1',
    buyerCompany: 'GreenPolymer Recyclers Ltd',
    buyerId: '1d04eb58-fda7-4e34-9fa0-19e96f1d5ff2',
    qualityScore: 88,
    purityPercentage: 93,
    contaminationLevel: 'Low',
    circularityScore: 96,
    co2AvoidedKg: 23400,
    landfillDivertedKg: 12000,
    waterSavedLiters: 48000,
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    qrPayloadUrl: '/passport/CIRC-DPP-2026-HD4401',
    certificateHash: '0x3c71a9e92d8471b058a9844bf782c1b29a8f4c01d98e72ba643801cf99b2e8a7',
    custodyTimeline: [
      {
        step: 'created',
        title: 'Post-Industrial Regrind Flakes Binned',
        timestamp: '2026-09-17 11:00 AM',
        actor: 'Apex Industrial Recycling Corp',
        location: 'Coimbatore Processing Plant',
        status: 'completed',
        notes: 'Washed and granulate-sorted blow molding scrap.'
      },
      {
        step: 'analyzed',
        title: 'Melt Flow & Purity Spectrometry Assessment',
        timestamp: '2026-09-17 11:30 AM',
        actor: 'CIRCULON AI Diagnostics',
        location: 'Cloud Platform',
        status: 'completed',
        notes: 'Purity 93%, High MFI stability, suitable for drainage pipes.'
      },
      {
        step: 'matched',
        title: 'Buyer Requirement Lock',
        timestamp: '2026-09-18 04:20 PM',
        actor: 'GreenPolymer Recyclers Ltd',
        location: 'Chennai Procurement Desk',
        status: 'completed',
        notes: 'Contract locked at ₹28/KG for 12-Ton batch.'
      }
    ]
  }
];

export async function getMaterialPassport(id: string): Promise<MaterialPassport | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('material_passports')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        wasteId: data.waste_id,
        dealId: data.deal_id,
        batchNumber: data.batch_number,
        materialName: data.material_name,
        category: data.category,
        quantity: Number(data.quantity),
        unit: data.unit || 'KG',
        originLocation: data.origin_location,
        originCompany: data.origin_company,
        sellerId: data.seller_id,
        buyerCompany: data.buyer_company,
        buyerId: data.buyer_id,
        qualityScore: Number(data.quality_score),
        purityPercentage: Number(data.purity_percentage),
        contaminationLevel: 'Low',
        circularityScore: Number(data.circularity_score),
        co2AvoidedKg: Number(data.co2_avoided_kg),
        landfillDivertedKg: Number(data.landfill_diverted_kg),
        waterSavedLiters: Number(data.water_saved_liters),
        createdAt: data.created_at,
        qrPayloadUrl: data.qr_payload_url || `/passport/${data.id}`,
        certificateHash: data.certificate_hash,
        custodyTimeline: Array.isArray(data.custody_timeline) ? data.custody_timeline : []
      };
    }
  } catch {
    // Graceful fallback to seed passports
  }

  const found = DEFAULT_MATERIAL_PASSPORTS.find(p => p.id === id);
  return found || null;
}

export async function getMaterialPassportsForUser(
  role: string, 
  userId?: string
): Promise<MaterialPassport[]> {
  try {
    const supabase = await createClient();
    let query = supabase.from('material_passports').select('*');

    if (role === 'seller' && userId) {
      query = query.eq('seller_id', userId);
    } else if (role === 'buyer' && userId) {
      query = query.eq('buyer_id', userId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        wasteId: d.waste_id,
        dealId: d.deal_id,
        batchNumber: d.batch_number,
        materialName: d.material_name,
        category: d.category,
        quantity: Number(d.quantity),
        unit: d.unit || 'KG',
        originLocation: d.origin_location,
        originCompany: d.origin_company,
        sellerId: d.seller_id,
        buyerCompany: d.buyer_company,
        buyerId: d.buyer_id,
        qualityScore: Number(d.quality_score),
        purityPercentage: Number(d.purity_percentage),
        contaminationLevel: 'Low',
        circularityScore: Number(d.circularity_score),
        co2AvoidedKg: Number(d.co2_avoided_kg),
        landfillDivertedKg: Number(d.landfill_diverted_kg),
        waterSavedLiters: Number(d.water_saved_liters),
        createdAt: d.created_at,
        qrPayloadUrl: d.qr_payload_url || `/passport/${d.id}`,
        certificateHash: d.certificate_hash,
        custodyTimeline: Array.isArray(d.custody_timeline) ? d.custody_timeline : []
      }));
    }
  } catch {
    // Fallback to demo passports
  }

  return DEFAULT_MATERIAL_PASSPORTS;
}

export async function createMaterialPassport(
  payload: Partial<MaterialPassport>
): Promise<MaterialPassport> {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const passportId = `CIRC-DPP-2026-${randomSuffix}`;
  const batchNum = `BATCH-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const certHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  const newPassport: MaterialPassport = {
    id: passportId,
    wasteId: payload.wasteId || 'waste-new',
    dealId: payload.dealId,
    batchNumber: batchNum,
    materialName: payload.materialName || 'Standardized Industrial Material',
    category: payload.category || 'General',
    quantity: payload.quantity || 1000,
    unit: payload.unit || 'KG',
    originLocation: payload.originLocation || 'Tamil Nadu',
    originCompany: payload.originCompany || 'Circulon Verified Seller',
    sellerId: payload.sellerId || 'seller-current',
    buyerCompany: payload.buyerCompany,
    buyerId: payload.buyerId,
    qualityScore: payload.qualityScore || 86,
    purityPercentage: payload.purityPercentage || 90,
    contaminationLevel: payload.contaminationLevel || 'Low',
    circularityScore: payload.circularityScore || 92,
    co2AvoidedKg: Math.round((payload.quantity || 1000) * 1.85),
    landfillDivertedKg: payload.quantity || 1000,
    waterSavedLiters: Math.round((payload.quantity || 1000) * 25),
    createdAt: new Date().toISOString(),
    qrPayloadUrl: `/passport/${passportId}`,
    certificateHash: certHash,
    custodyTimeline: [
      {
        step: 'created',
        title: 'By-Product Batch Registered',
        timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: payload.originCompany || 'Seller',
        location: payload.originLocation || 'Origin Facility',
        status: 'completed',
        notes: `Registered batch ${payload.quantity || 1000} ${payload.unit || 'KG'}.`
      },
      {
        step: 'analyzed',
        title: 'CIRCULON Preliminary AI Material Assessment',
        timestamp: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actor: 'CIRCULON AI Diagnostics Engine',
        location: 'Cloud Verification Engine',
        status: 'completed',
        notes: `Quality Score ${payload.qualityScore || 86}/100, Purity ${payload.purityPercentage || 90}%.`
      }
    ]
  };

  try {
    const supabase = await createClient();
    await supabase.from('material_passports').insert({
      id: newPassport.id,
      waste_id: newPassport.wasteId,
      deal_id: newPassport.dealId,
      batch_number: newPassport.batchNumber,
      material_name: newPassport.materialName,
      category: newPassport.category,
      quantity: newPassport.quantity,
      unit: newPassport.unit,
      origin_location: newPassport.originLocation,
      origin_company: newPassport.originCompany,
      seller_id: newPassport.sellerId,
      buyer_company: newPassport.buyerCompany,
      buyer_id: newPassport.buyerId,
      quality_score: newPassport.qualityScore,
      purity_percentage: newPassport.purityPercentage,
      circularity_score: newPassport.circularityScore,
      co2_avoided_kg: newPassport.co2AvoidedKg,
      landfill_diverted_kg: newPassport.landfillDivertedKg,
      water_saved_liters: newPassport.waterSavedLiters,
      qr_payload_url: newPassport.qrPayloadUrl,
      certificate_hash: newPassport.certificateHash,
      custody_timeline: newPassport.custodyTimeline as any
    });
  } catch {
    // In-memory fallback
    DEFAULT_MATERIAL_PASSPORTS.unshift(newPassport);
  }

  revalidatePath('/dashboard');
  revalidatePath('/buyer');
  return newPassport;
}
