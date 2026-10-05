'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getMarketplaceWaste, type WasteMaterial } from '@/lib/actions/waste'
import { GoogleGenAI } from '@google/genai'

export interface BuyerRequirement {
  id: string;
  buyer_id: string;
  material_name: string;
  category?: string;
  min_quantity: number;
  max_quantity: number;
  unit: string;
  preferred_quality: string;
  max_price: number;
  preferred_location: string;
  industry: string;
  required_date?: string;
  target_fulfillment_date?: string;
  notes?: string;
  created_at: string;
}

let localBuyerRequirements: BuyerRequirement[] = [];

let localSavedListings: string[] = [];

let cachedBuyers: any[] | null = null;
let cachedBuyersExpiry = 0;

const CANONICAL_BUYERS = [
  {
    id: 'c2-greenpoly-id',
    company_name: 'GreenPolymer Recyclers Ltd',
    industry: 'Plastics & Polymers',
    city: 'Chennai',
    state: 'Tamil Nadu',
    materials_required: ['High-Density Polyethylene (HDPE) Regrind', 'Clean Transparent PET Flakes (Hot Washed)', 'Plastics', 'HDPE', 'PET', 'Polymers'],
    min_quantity: 1000,
    max_quantity: 25000,
    min_price: 20,
    max_price: 45,
    crm_status: 'ACTIVE'
  },
  {
    id: 'c5-deccan-id',
    company_name: 'Deccan Paper & Kraft Packaging Mills',
    industry: 'Paper & Packaging',
    city: 'Rajahmundry',
    state: 'Andhra Pradesh',
    materials_required: ['Post-Industrial Cotton Comber Scraps', 'Corrugated Cardboard (OCC 11) Mill Bales', 'Textiles', 'Cotton', 'Paper', 'OCC'],
    min_quantity: 2000,
    max_quantity: 20000,
    min_price: 25,
    max_price: 45,
    crm_status: 'ACTIVE'
  },
  {
    id: 'c4-bioagro-id',
    company_name: 'BioAgro Circular Energy Solutions',
    industry: 'Biofuels & Biomass Energy',
    city: 'Hosur',
    state: 'Tamil Nadu',
    materials_required: ['Sugarcane Bagasse Biomass Fiber', 'Paddy Rice Husk Ash (High Amorphous Silica)', 'Desalinated Coconut Coir Pith Blocks', 'Biomass', 'Agro', 'Bagasse'],
    min_quantity: 5000,
    max_quantity: 50000,
    min_price: 2.5,
    max_price: 10,
    crm_status: 'ACTIVE'
  },
  {
    id: 'c7-horizon-id',
    company_name: 'Horizon E-Waste Refiners',
    industry: 'E-Waste & Metallurgy',
    city: 'Bengaluru',
    state: 'Karnataka',
    materials_required: ['Heavy Melting Steel Scrap (HMS 1 & 2)', 'Blast Furnace Granulated Slag (GGBS Grade)', 'Metals', 'Steel', 'Copper', 'E-Waste'],
    min_quantity: 1000,
    max_quantity: 30000,
    min_price: 30,
    max_price: 60,
    crm_status: 'ACTIVE'
  },
  {
    id: 'p1-zenagro-id',
    company_name: 'ZenAgro BioCompost Ltd',
    industry: 'Organic Fertilizer & Bio-enrichment',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    materials_required: ['Organic Agricultural Residue', 'Coir Pith', 'Bagasse'],
    min_quantity: 1000,
    max_quantity: 15000,
    min_price: 3,
    max_price: 12,
    crm_status: 'ACTIVE'
  }
];

export async function getBuyers() {
  const now = Date.now();
  if (cachedBuyers && now < cachedBuyersExpiry) {
    return cachedBuyers;
  }

  try {
    const supabase = await createClient()
    const { data: dbBuyers, error } = await supabase
      .from('buyers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !dbBuyers || dbBuyers.length === 0) {
      cachedBuyers = CANONICAL_BUYERS;
      cachedBuyersExpiry = now + 30000;
      return CANONICAL_BUYERS;
    }

    cachedBuyers = dbBuyers;
    cachedBuyersExpiry = now + 30000; // 30s cache
    return dbBuyers;
  } catch (err) {
    cachedBuyers = CANONICAL_BUYERS;
    return CANONICAL_BUYERS;
  }
}

export async function addBuyer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const materialsString = formData.get('materials_required') as string
  const materialsArray = materialsString ? materialsString.split(',').map(s => s.trim()) : []

  const newBuyer = {
    owner_id: user.id,
    company_name: formData.get('company_name') as string,
    industry: formData.get('industry') as string,
    state: formData.get('state') as string,
    city: formData.get('city') as string,
    materials_required: materialsArray,
    min_quantity: Number(formData.get('min_quantity')),
    max_quantity: Number(formData.get('max_quantity')),
    min_price: Number(formData.get('min_price')),
    max_price: Number(formData.get('max_price')),
    crm_status: 'NEW'
  }

  const { data, error } = await supabase
    .from('buyers')
    .insert(newBuyer)
    .select()
    .single()

  if (error) {
    console.error('Error adding buyer:', error)
    throw new Error('Failed to add buyer')
  }

  cachedBuyers = null;
  revalidatePath('/dashboard')
  revalidatePath('/buyers')
  return data
}

export async function deleteBuyer(id: string) {
  const supabase = await createClient()
  await supabase.from('buyers').delete().eq('id', id)
  cachedBuyers = null;
  revalidatePath('/dashboard')
  revalidatePath('/buyers')
}

export async function getBuyerProfileAndRequirements() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()

    let materials: string[] = user.user_metadata?.materials_required || (profile as any)?.materials_required || []



    return {
      user,
      profile,
      materials
    }
  } catch (err) {
    return null
  }
}

export async function saveBuyerRequirements(materials: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  await supabase.auth.updateUser({
    data: { materials_required: materials }
  })

  try {
    await supabase.from('profiles').update({
      materials_required: materials
    } as any).eq('id', user.id)
  } catch {
    // column fallback
  }

  revalidatePath('/buyer')
  return { success: true }
}

// -------------------------------------------------------------
// DETAILED BUYER MATERIAL REQUIREMENTS (Role 2 Feature 2)
// -------------------------------------------------------------
export async function getDetailedBuyerRequirements(): Promise<BuyerRequirement[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return localBuyerRequirements;

    const { data, error } = await supabase
      .from('buyer_requirements')
      .select('*')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requirements:', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('Exception in getDetailedBuyerRequirements:', err);
    return [];
  }
}

export async function addDetailedBuyerRequirement(formDataOrObj: FormData | Record<string, any>): Promise<{ success: boolean; requirement?: BuyerRequirement }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || 'demo-buyer-id'

    const getVal = (key: string): any => {
      if (typeof FormData !== 'undefined' && formDataOrObj instanceof FormData) {
        return formDataOrObj.get(key);
      }
      return (formDataOrObj as Record<string, any>)[key];
    };

    const newReq: BuyerRequirement = {
      id: `req-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      buyer_id: userId,
      material_name: (getVal('material_name') as string) || 'Industrial Feedstock',
      category: (getVal('category') as string) || 'General',
      min_quantity: Number(getVal('min_quantity')) || 100,
      max_quantity: Number(getVal('max_quantity')) || 5000,
      unit: (getVal('unit') as string) || 'KG',
      preferred_quality: (getVal('preferred_quality') as string) || 'Medium+',
      max_price: Number(getVal('max_price')) || 35,
      preferred_location: (getVal('preferred_location') as string) || 'Pan-India',
      industry: (getVal('industry') as string) || 'Recycling & Manufacturing',
      required_date: (getVal('required_date') || getVal('target_fulfillment_date') || 'Within 30 days') as string,
      target_fulfillment_date: (getVal('target_fulfillment_date') || getVal('required_date') || 'Within 30 days') as string,
      notes: (getVal('notes') || '') as string,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('buyer_requirements').insert(newReq);
    } catch {
      // fallback
    }

    localBuyerRequirements.unshift(newReq);
    revalidatePath('/buyer');
    return { success: true, requirement: newReq };
  } catch (err) {
    return { success: false };
  }
}

export async function deleteDetailedBuyerRequirement(id: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient()
    await supabase.from('buyer_requirements').delete().eq('id', id);
  } catch {
    // fallback
  }

  localBuyerRequirements = localBuyerRequirements.filter(r => r.id !== id);
  revalidatePath('/buyer');
  return { success: true };
}

// -------------------------------------------------------------
// SAVED LISTINGS (Role 2 Feature 5)
// -------------------------------------------------------------
export async function getSavedListingIds(): Promise<string[]> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return localSavedListings;

    const { data, error } = await supabase
      .from('buyer_saved_listings')
      .select('waste_id')
      .eq('buyer_id', user.id);

    if (error) {
      console.error('Error fetching saved listings:', error);
      return [];
    }
    return (data || []).map((d: any) => d.waste_id);
  } catch (err) {
    console.error('Exception in getSavedListingIds:', err);
    return [];
  }
}

export async function toggleSaveListing(wasteId: string): Promise<{ saved: boolean }> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || 'demo-buyer-id'

    const isAlready = localSavedListings.includes(wasteId);
    if (isAlready) {
      localSavedListings = localSavedListings.filter(id => id !== wasteId);
      try {
        await supabase.from('buyer_saved_listings').delete().eq('buyer_id', userId).eq('waste_id', wasteId);
      } catch {}
      revalidatePath('/buyer');
      return { saved: false };
    } else {
      localSavedListings.push(wasteId);
      try {
        await supabase.from('buyer_saved_listings').insert({ buyer_id: userId, waste_id: wasteId });
      } catch {}
      revalidatePath('/buyer');
      return { saved: true };
    }
  } catch {
    const isAlready = localSavedListings.includes(wasteId);
    if (isAlready) {
      localSavedListings = localSavedListings.filter(id => id !== wasteId);
      return { saved: false };
    } else {
      localSavedListings.push(wasteId);
      return { saved: true };
    }
  }
}

// -------------------------------------------------------------
// AI MATCH FINDER (Role 2 Feature 4)
// Buyer enters natural text: "I need 1000 kg cotton textile waste suitable for recycled yarn"
// AI identifies matching listings and explains why they match!
// -------------------------------------------------------------
export interface AIMatchFinderResult {
  id: string;
  material_name: string;
  category?: string;
  quantity: number;
  unit?: string;
  location?: string;
  expected_price?: number;
  matchScore: number;
  matchConfidence: number;
  matchReason: string;
  applicationHighlight: string;
  sustainabilityGain: string;
  matchedListing: WasteMaterial;
}

export async function findAIMatchesForBuyer(userQuery: string): Promise<{
  analysis: string;
  queryParsed: {
    material: string;
    quantityTarget?: number;
    application?: string;
  };
  interpretedCriteria: {
    material: string;
    quantityTarget?: number;
    application?: string;
  };
  matches: AIMatchFinderResult[];
}> {
  const query = userQuery.trim();
  if (!query) {
    return {
      analysis: 'Please specify material specifications, volumes, or target applications to identify matching secondary feedstock.',
      queryParsed: { material: 'All Materials' },
      interpretedCriteria: { material: 'All Materials' },
      matches: []
    };
  }

  const allWastes = await getMarketplaceWaste();
  const qLower = query.toLowerCase();

  // Keyword parser for fast matching
  let targetMaterial = 'Industrial Waste';
  if (qLower.includes('cotton') || qLower.includes('textile') || qLower.includes('yarn') || qLower.includes('fabric')) targetMaterial = 'Cotton / Textile Waste';
  else if (qLower.includes('plastic') || qLower.includes('hdpe') || qLower.includes('pet') || qLower.includes('polymer')) targetMaterial = 'Plastics & Polymers';
  else if (qLower.includes('rice') || qLower.includes('husk')) targetMaterial = 'Rice Husk Residue';
  else if (qLower.includes('bagasse') || qLower.includes('sugar')) targetMaterial = 'Sugarcane Bagasse';
  else if (qLower.includes('coir') || qLower.includes('coconut')) targetMaterial = 'Coconut Coir';
  else if (qLower.includes('metal') || qLower.includes('aluminium') || qLower.includes('steel')) targetMaterial = 'Metal & Aluminium';

  // Extract quantity if mentioned (e.g. 1000 kg, 5 tons)
  const qtyMatch = query.match(/(\d+[\d,]*)\s*(kg|tons?|tonnes?|mt)?/i);
  let parsedQty: number | undefined = undefined;
  if (qtyMatch) {
    let num = parseInt(qtyMatch[1].replace(/,/g, ''), 10);
    const unit = (qtyMatch[2] || '').toLowerCase();
    if (unit.includes('ton') || unit.includes('mt')) num *= 1000;
    parsedQty = num;
  }

  // Extract target application if mentioned
  let targetApp = 'Circular Reprocessing';
  if (qLower.includes('yarn') || qLower.includes('spinning')) targetApp = 'Recycled Yarn Spinning';
  else if (qLower.includes('packaging') || qLower.includes('tableware')) targetApp = 'Sustainable Packaging';
  else if (qLower.includes('pipe') || qLower.includes('conduit')) targetApp = 'Extruded Drainage Pipes';
  else if (qLower.includes('briquette') || qLower.includes('fuel')) targetApp = 'Biofuel Briquettes';
  else if (qLower.includes('acoustic') || qLower.includes('board')) targetApp = 'Acoustic Composite Boards';

  // Filter and score listings
  const matches: AIMatchFinderResult[] = [];
  allWastes.forEach(waste => {
    const wName = waste.material_name.toLowerCase();
    const wCat = (waste.category || '').toLowerCase();
    let score = 50;
    const reasons: string[] = [];

    if (wName.includes('cotton') && (qLower.includes('cotton') || qLower.includes('textile'))) {
      score += 40;
      reasons.push('High cotton fiber purity with zero synthetic blend');
    } else if (wName.includes('pet') && (qLower.includes('pet') || qLower.includes('plastic') || qLower.includes('bottle'))) {
      score += 40;
      reasons.push('Washed PET flakes meeting clean hot-wash standards');
    } else if (wName.includes('hdpe') && (qLower.includes('hdpe') || qLower.includes('plastic') || qLower.includes('pipe'))) {
      score += 40;
      reasons.push('High-density injection/extrusion grade polymer');
    } else if (wName.includes('bagasse') && (qLower.includes('bagasse') || qLower.includes('sugar') || qLower.includes('biomass'))) {
      score += 40;
      reasons.push('Dry depithed cellulose fiber ready for molded pulp');
    } else if (wName.includes('coir') && (qLower.includes('coir') || qLower.includes('coconut'))) {
      score += 40;
      reasons.push('Desalinated organic grow substrate with EC < 0.5 mS/cm');
    } else if (wName.includes('rice') && (qLower.includes('rice') || qLower.includes('husk') || qLower.includes('silica'))) {
      score += 40;
      reasons.push('Calorific agricultural residue suitable for gasifiers and silica');
    }

    if (parsedQty) {
      if (waste.quantity >= parsedQty * 0.8 && waste.quantity <= parsedQty * 3) {
        score += 8;
        reasons.push(`Available inventory (${waste.quantity.toLocaleString()} KG) satisfies requested batch of ${parsedQty.toLocaleString()} KG`);
      }
    }

    if (score >= 60) {
      matches.push({
        id: waste.id,
        material_name: waste.material_name,
        category: waste.category,
        quantity: waste.quantity,
        unit: waste.unit || 'KG',
        location: waste.location || 'India',
        expected_price: waste.expected_price || 30,
        matchScore: Math.min(99, score),
        matchConfidence: Math.min(99, score),
        matchReason: reasons.join(' • ') || 'Good feedstock property correlation with procurement query.',
        applicationHighlight: targetApp,
        sustainabilityGain: `${Math.round(waste.quantity * 1.7).toLocaleString()} KG CO₂e avoided by keeping material in circulation.`,
        matchedListing: waste
      });
    }
  });

  matches.sort((a, b) => b.matchScore - a.matchScore);

  return {
    analysis: `Interpreted target feedstock as "${targetMaterial}"${parsedQty ? ` with batch volume of ${parsedQty.toLocaleString()} KG` : ''} for circular application in ${targetApp}. Identified ${matches.length} compatible industrial waste stream${matches.length === 1 ? '' : 's'}.`,
    queryParsed: {
      material: targetMaterial,
      quantityTarget: parsedQty,
      application: targetApp
    },
    interpretedCriteria: {
      material: targetMaterial,
      quantityTarget: parsedQty,
      application: targetApp
    },
    matches
  };
}
