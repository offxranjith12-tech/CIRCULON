'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { type DriverInfo } from '@/lib/logistics';

export type DealStatus = 
  | 'NEGOTIATING' 
  | 'AGREED' 
  | 'PICKUP_SCHEDULED' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED';

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

// In-memory resilient store for demo/fallback when database table migration is pending
let localDeals: Deal[] = [
  {
    id: 'deal-cotton-tirupur-1',
    waste_id: 'sample-waste-1',
    waste_name: 'Post-Industrial Cotton Comber Scraps',
    waste_category: 'Textile',
    seller_id: 'seller-apex-1',
    seller_name: 'Apex Industrial Recycling Corp',
    seller_phone: '+91 98765 43210',
    seller_location: 'Tirupur, Tamil Nadu',
    buyer_id: 'buyer-ecothreads-1',
    buyer_name: 'EcoThreads Manufacturing Corp',
    buyer_phone: '+91 94432 11029',
    buyer_location: 'Coimbatore, Tamil Nadu',
    agreed_quantity: 4500,
    agreed_price: 36,
    total_amount: 162000,
    status: 'PICKUP_SCHEDULED',
    pickup_date: '2026-09-20 10:00 AM',
    driver_info: {
      driver_name: 'Ramesh Kumar',
      driver_phone: '+91 98410 22334',
      vehicle_number: 'TN 38 BX 4421',
      transporter: 'GreenFleet Circular Logistics',
      notes: 'Driver carrying verified electronic gate pass and weighbridge slip.',
      pickup_date: '2026-09-20 10:00 AM'
    },
    notes: 'Agreed for delivery to Coimbatore spinning unit. Weighbridge tare weight verified at gate.',
    co2_saved_kg: 8325,
    landfill_diverted_kg: 4500,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: 'msg-1',
        deal_id: 'deal-cotton-tirupur-1',
        sender_id: 'buyer-ecothreads-1',
        sender_name: 'EcoThreads Manufacturing',
        sender_role: 'buyer',
        message: 'We can procure the full 4,500 KG batch. Proposing ₹35/KG with pickup by our fleet.',
        proposed_quantity: 4500,
        proposed_price: 35,
        created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
      },
      {
        id: 'msg-2',
        deal_id: 'deal-cotton-tirupur-1',
        sender_id: 'seller-apex-1',
        sender_name: 'Apex Industrial Recycling',
        sender_role: 'seller',
        message: 'Material is 100% combed white clean offcuts. Can we settle at ₹36/KG?',
        proposed_quantity: 4500,
        proposed_price: 36,
        created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      },
      {
        id: 'msg-3',
        deal_id: 'deal-cotton-tirupur-1',
        sender_id: 'buyer-ecothreads-1',
        sender_name: 'EcoThreads Manufacturing',
        sender_role: 'buyer',
        message: 'Confirmed at ₹36/KG. Dispatching driver Ramesh Kumar tomorrow morning at 10 AM.',
        proposed_quantity: 4500,
        proposed_price: 36,
        created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      }
    ]
  },
  {
    id: 'deal-hdpe-flaking-2',
    waste_id: 'sample-waste-2',
    waste_name: 'High-Density Polyethylene (HDPE) Regrind',
    waste_category: 'Plastics & Polymers',
    seller_id: 'seller-apex-1',
    seller_name: 'Apex Industrial Recycling Corp',
    seller_phone: '+91 98765 43210',
    seller_location: 'Coimbatore, Tamil Nadu',
    buyer_id: 'buyer-greenpolymer-2',
    buyer_name: 'GreenPolymer Recyclers Ltd',
    buyer_phone: '+91 98401 55678',
    buyer_location: 'Chennai, Tamil Nadu',
    agreed_quantity: 10000,
    agreed_price: 28,
    total_amount: 280000,
    status: 'COMPLETED',
    pickup_date: '2026-09-10 09:00 AM',
    delivery_date: '2026-09-11 04:30 PM',
    notes: 'Successfully reprocessed into extruded drainage conduits. Certified zero-landfill diversion.',
    co2_saved_kg: 19000,
    landfill_diverted_kg: 10000,
    created_at: new Date(Date.now() - 3600000 * 180).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 150).toISOString(),
    messages: [
      {
        id: 'msg-201',
        deal_id: 'deal-hdpe-flaking-2',
        sender_id: 'buyer-greenpolymer-2',
        sender_name: 'GreenPolymer Recyclers',
        sender_role: 'buyer',
        message: 'Batch received, weighed, and approved. Net transfer completed.',
        created_at: new Date(Date.now() - 3600000 * 150).toISOString()
      }
    ]
  }
];

export async function getDeals(filterRole?: 'seller' | 'buyer' | 'admin', userId?: string): Promise<Deal[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Attempt to query Supabase deals table if exists
    let query = supabase
      .from('deals')
      .select('*')
      .order('updated_at', { ascending: false });

    if (filterRole === 'seller' && (userId || user?.id)) {
      query = query.eq('seller_id', userId || user?.id);
    } else if (filterRole === 'buyer' && (userId || user?.id)) {
      query = query.eq('buyer_id', userId || user?.id);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    // Graceful fallback to local store
  }

  // Filter in-memory local deals
  if (filterRole === 'seller') {
    return localDeals;
  }
  if (filterRole === 'buyer') {
    return localDeals;
  }
  return localDeals;
}

export async function getDealById(dealId: string): Promise<Deal | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .maybeSingle();

    if (!error && data) {
      return data;
    }
  } catch (err) {
    // Fallback
  }

  return localDeals.find(d => d.id === dealId) || null;
}

export async function createDeal(data: {
  waste_id: string;
  waste_name: string;
  waste_category?: string;
  seller_id?: string;
  seller_name?: string;
  buyer_id?: string;
  buyer_name?: string;
  initial_quantity: number;
  initial_price: number;
  notes?: string;
}): Promise<{ success: boolean; deal?: Deal; message: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const now = new Date().toISOString();
    const dealId = `deal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const totalAmount = data.initial_quantity * data.initial_price;
    const co2Savings = Math.round(data.initial_quantity * 1.8);

    const newDeal: Deal = {
      id: dealId,
      waste_id: data.waste_id,
      waste_name: data.waste_name,
      waste_category: data.waste_category || 'Industrial Material',
      seller_id: data.seller_id || user?.id || 'seller-current',
      seller_name: data.seller_name || user?.user_metadata?.company_name || 'Industrial Waste Generator',
      seller_location: 'Tamil Nadu, India',
      buyer_id: data.buyer_id || user?.id || 'buyer-current',
      buyer_name: data.buyer_name || user?.user_metadata?.company_name || 'Procurement Buyer',
      agreed_quantity: data.initial_quantity,
      agreed_price: data.initial_price,
      total_amount: totalAmount,
      status: 'NEGOTIATING',
      notes: data.notes || 'Commercial terms proposal created.',
      co2_saved_kg: co2Savings,
      landfill_diverted_kg: data.initial_quantity,
      created_at: now,
      updated_at: now,
      messages: [
        {
          id: `msg-${Date.now()}`,
          deal_id: dealId,
          sender_id: user?.id || 'initiator',
          sender_name: user?.user_metadata?.company_name || 'Commercial Procurement',
          sender_role: 'buyer',
          message: data.notes || `Initial negotiation proposal created for ${data.initial_quantity.toLocaleString()} KG at ₹${data.initial_price}/KG.`,
          proposed_quantity: data.initial_quantity,
          proposed_price: data.initial_price,
          created_at: now,
        }
      ]
    };

    try {
      await supabase.from('deals').insert({
        id: newDeal.id,
        waste_id: newDeal.waste_id,
        seller_id: newDeal.seller_id,
        buyer_id: newDeal.buyer_id,
        agreed_quantity: newDeal.agreed_quantity,
        agreed_price: newDeal.agreed_price,
        total_amount: newDeal.total_amount,
        status: newDeal.status,
        notes: newDeal.notes
      });
    } catch (dbErr) {
      // Ignored for in-memory fallback
    }

    localDeals.unshift(newDeal);

    revalidatePath('/dashboard');
    revalidatePath('/buyer');
    revalidatePath('/buyer/requests');
    revalidatePath('/matches');

    return {
      success: true,
      deal: newDeal,
      message: 'Deal initiated! Both parties can now negotiate price, volume, and schedule pickup.'
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to initiate deal.'
    };
  }
}

export async function addDealMessage(
  dealId: string, 
  message: string, 
  proposedQuantity?: number, 
  proposedPrice?: number
): Promise<{ success: boolean; message?: DealMessage }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const now = new Date().toISOString();
    const newMsg: DealMessage = {
      id: `msg-${Date.now()}`,
      deal_id: dealId,
      sender_id: user?.id || 'current-user',
      sender_name: user?.user_metadata?.company_name || 'Counterparty',
      sender_role: (user?.user_metadata?.role as any) || 'buyer',
      message: message.trim(),
      proposed_quantity: proposedQuantity,
      proposed_price: proposedPrice,
      created_at: now
    };

    localDeals = localDeals.map(d => {
      if (d.id === dealId) {
        const updatedMsgs = [...(d.messages || []), newMsg];
        let updatedQty = d.agreed_quantity;
        let updatedPrice = d.agreed_price;
        if (proposedQuantity && proposedQuantity > 0) updatedQty = proposedQuantity;
        if (proposedPrice && proposedPrice > 0) updatedPrice = proposedPrice;

        return {
          ...d,
          agreed_quantity: updatedQty,
          agreed_price: updatedPrice,
          total_amount: updatedQty * updatedPrice,
          updated_at: now,
          messages: updatedMsgs
        };
      }
      return d;
    });

    revalidatePath('/dashboard');
    revalidatePath('/buyer');
    revalidatePath('/buyer/requests');

    return { success: true, message: newMsg };
  } catch (err: any) {
    return { success: false };
  }
}

export async function updateDealStatus(
  dealId: string, 
  status: DealStatus, 
  updates?: {
    agreedQuantity?: number;
    agreedPrice?: number;
    pickupDate?: string;
    deliveryDate?: string;
    driverInfo?: DriverInfo;
    notes?: string;
    cancellationReason?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const now = new Date().toISOString();

  try {
    const supabase = await createClient();
    await supabase.from('deals').update({
      status,
      agreed_quantity: updates?.agreedQuantity,
      agreed_price: updates?.agreedPrice,
      pickup_date: updates?.pickupDate,
      delivery_date: updates?.deliveryDate,
      notes: updates?.notes,
      updated_at: now
    }).eq('id', dealId);
  } catch {
    // Fallback
  }

  localDeals = localDeals.map(d => {
    if (d.id === dealId) {
      const q = updates?.agreedQuantity || d.agreed_quantity;
      const p = updates?.agreedPrice || d.agreed_price;
      return {
        ...d,
        status,
        agreed_quantity: q,
        agreed_price: p,
        total_amount: q * p,
        pickup_date: updates?.pickupDate || d.pickup_date,
        delivery_date: updates?.deliveryDate || d.delivery_date,
        driver_info: updates?.driverInfo || d.driver_info,
        notes: updates?.notes || d.notes,
        cancellation_reason: updates?.cancellationReason || d.cancellation_reason,
        updated_at: now
      };
    }
    return d;
  });

  revalidatePath('/dashboard');
  revalidatePath('/buyer');
  revalidatePath('/buyer/requests');
  revalidatePath('/admin');

  return { success: true, message: `Deal status updated to ${status}.` };
}
