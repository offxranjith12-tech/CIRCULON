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

import { sharedStore } from '@/lib/sharedStore';

export async function getDeals(filterRole?: 'seller' | 'buyer' | 'admin', userId?: string): Promise<Deal[]> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Query Supabase deals table with joined relations if available
    let query = supabase
      .from('deals')
      .select(`
        *,
        waste:waste_materials(material_name, category, location),
        seller:profiles!seller_id(company_name, company_address, phone),
        buyer:profiles!buyer_id(company_name, company_address, phone),
        messages:deal_messages(*)
      `)
      .order('created_at', { ascending: false });

    if (filterRole === 'seller' && (userId || user?.id)) {
      query = query.eq('seller_id', userId || user?.id);
    } else if (filterRole === 'buyer' && (userId || user?.id)) {
      query = query.eq('buyer_id', userId || user?.id);
    }

    const { data } = await query;
    if (data && data.length > 0) {
      data.forEach((d: any) => {
        if (!sharedStore.getDealById(d.id)) {
          sharedStore.addDeal({
            id: d.id,
            waste_id: d.waste_id,
            waste_name: d.waste?.material_name || d.waste_name || 'Industrial Material Batch',
            waste_category: d.waste?.category || d.waste_category || 'Textiles',
            seller_id: d.seller_id,
            seller_name: d.seller?.company_name || d.seller_name || 'Apex Industrial Recycling Corp',
            seller_phone: d.seller?.phone || d.seller_phone || '+91 98400 11223',
            seller_location: d.seller?.company_address || d.seller_location || 'Tirupur, Tamil Nadu',
            buyer_id: d.buyer_id,
            buyer_name: d.buyer?.company_name || d.buyer_name || 'Deccan Paper & Kraft Packaging Mills',
            buyer_phone: d.buyer?.phone || d.buyer_phone || '+91 88300 44556',
            buyer_location: d.buyer?.company_address || d.buyer_location || 'Andhra Pradesh',
            agreed_quantity: d.agreed_quantity || 4500,
            agreed_price: d.agreed_price || 37.5,
            total_amount: d.total_amount || 168750,
            status: d.status || 'PICKUP_SCHEDULED',
            pickup_date: d.pickup_date || new Date().toISOString(),
            delivery_date: d.delivery_date,
            driver_info: d.driver_info,
            notes: d.notes,
            cancellation_reason: d.cancellation_reason,
            co2_saved_kg: Math.round((d.agreed_quantity || 4500) * 1.9),
            landfill_diverted_kg: d.agreed_quantity || 4500,
            created_at: d.created_at,
            updated_at: d.updated_at,
            messages: d.messages || []
          });
        }
      });
    }
  } catch (err) {
    // Non-critical, fallback to sharedStore
  }

  return sharedStore.getDeals(filterRole, userId);
}

export async function getDealById(dealId: string): Promise<Deal | null> {
  const deal = sharedStore.getDealById(dealId);
  return deal || null;
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

    sharedStore.addDeal(newDeal);

    revalidatePath('/dashboard');
    revalidatePath('/buyer');
    revalidatePath('/buyer/requests');
    revalidatePath('/matches');
    revalidatePath('/admin');
    revalidatePath('/driver');

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

    sharedStore.addDealMessage(dealId, newMsg);

    revalidatePath('/dashboard');
    revalidatePath('/buyer');
    revalidatePath('/buyer/requests');
    revalidatePath('/admin');

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

  sharedStore.updateDeal(dealId, {
    status,
    agreed_quantity: updates?.agreedQuantity,
    agreed_price: updates?.agreedPrice,
    pickup_date: updates?.pickupDate,
    delivery_date: updates?.deliveryDate,
    driver_info: updates?.driverInfo,
    notes: updates?.notes,
    cancellation_reason: updates?.cancellationReason
  });

  revalidatePath('/dashboard');
  revalidatePath('/buyer');
  revalidatePath('/buyer/requests');
  revalidatePath('/admin');
  revalidatePath('/driver');
  revalidatePath('/waste');

  return { success: true, message: `Deal status updated to ${status}.` };
}
