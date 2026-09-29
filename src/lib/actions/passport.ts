'use server';

import { createClient } from '@/utils/supabase/server';
import { type MaterialPassport, type CustodyEvent } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const DEFAULT_MATERIAL_PASSPORTS: MaterialPassport[] = [];

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
    // Graceful fallback
  }

  return null;
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
    if (error) {
      console.error('Error fetching material passports:', error);
      return [];
    }
    if (data && data.length > 0) {
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
    return [];
  } catch (err) {
    console.error('Exception in getMaterialPassportsForUser:', err);
    return [];
  }
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
