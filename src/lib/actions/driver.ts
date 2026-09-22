'use server';

import { createClient } from '@/utils/supabase/server';
import { type DriverTrip, type DriverTripStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// Seed trips for demonstration
let MEMORY_TRIPS: DriverTrip[] = [
  {
    id: 'trip-1',
    shipmentId: 'shipment-101',
    dealId: 'deal-cotton-tirupur-1',
    materialName: 'Post-Industrial Cotton Comber Scraps',
    category: 'Textiles',
    quantity: 4500,
    unit: 'KG',
    pickupLocation: 'Apex Recycling Corp, Plot 42 Textile Industrial Estate, Tirupur, Tamil Nadu',
    pickupContactName: 'Mr. Sundar (Dispatch Manager)',
    pickupPhone: '+91 98765 43210',
    dropoffLocation: 'EcoThreads Manufacturing Corp, Palladam Road, Coimbatore, Tamil Nadu',
    dropoffContactName: 'Mr. Karthik Raman',
    dropoffPhone: '+91 94432 11029',
    distanceKm: 48,
    status: 'ASSIGNED',
    estimatedEarnings: 3200,
    vehicleNumber: 'TN 38 BX 4421',
    deliveryNotes: 'Weighbridge gate pass #WB-4412 issued. 15 compressed bales.'
  },
  {
    id: 'trip-2',
    shipmentId: 'shipment-102',
    materialName: 'High-Density Polyethylene (HDPE) Regrind',
    category: 'Plastics & Polymers',
    quantity: 12000,
    unit: 'KG',
    pickupLocation: 'Peenya Extension, Coimbatore, Tamil Nadu',
    pickupContactName: 'Mr. Rajesh',
    pickupPhone: '+91 98400 11223',
    dropoffLocation: 'GreenPolymer Recyclers, Guindy, Chennai, Tamil Nadu',
    dropoffContactName: 'Mrs. Priya Sundaram',
    dropoffPhone: '+91 98401 55678',
    distanceKm: 510,
    status: 'COMPLETED',
    estimatedEarnings: 18500,
    vehicleNumber: 'TN 38 BX 4421',
    weighbridgeSlipNumber: 'WB-CHENNAI-8812',
    recipientSignatureName: 'Priya Sundaram',
    deliveryProofUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    completedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  }
];

export async function getDriverTrips(driverId?: string): Promise<DriverTrip[]> {
  try {
    const supabase = await createClient();
    const { data: shipments, error } = await supabase
      .from('shipments')
      .select(`
        *,
        deals (
          id,
          agreed_quantity,
          waste_id,
          waste_materials (
            material_name,
            category,
            unit,
            location
          ),
          seller:profiles!deals_seller_id_fkey(company_name, phone, company_address),
          buyer:profiles!deals_buyer_id_fkey(company_name, phone, company_address)
        )
      `)
      .order('created_at', { ascending: false });

    if (!error && shipments && shipments.length > 0) {
      return shipments.map((s: any) => ({
        id: s.id,
        shipmentId: s.id,
        dealId: s.deal_id,
        materialName: s.deals?.waste_materials?.material_name || 'Industrial Material Batch',
        category: s.deals?.waste_materials?.category || 'General',
        quantity: Number(s.deals?.agreed_quantity || 1000),
        unit: s.deals?.waste_materials?.unit || 'KG',
        pickupLocation: s.deals?.seller?.company_address || 'Seller Warehouse',
        pickupContactName: s.deals?.seller?.company_name || 'Seller Representative',
        pickupPhone: s.deals?.seller?.phone || '+91 98765 00000',
        dropoffLocation: s.deals?.buyer?.company_address || 'Buyer Plant',
        dropoffContactName: s.deals?.buyer?.company_name || 'Buyer Representative',
        dropoffPhone: s.deals?.buyer?.phone || '+91 94400 00000',
        distanceKm: Number(s.distance_km || 48),
        status: (s.status_step as DriverTripStatus) || 'ASSIGNED',
        estimatedEarnings: Number(s.freight_cost || 3200),
        vehicleNumber: 'TN 38 BX 4421',
        deliveryProofUrl: s.delivery_proof_url,
        weighbridgeSlipNumber: s.weighbridge_slip,
        recipientSignatureName: s.recipient_signature,
        deliveryNotes: s.delivery_notes
      }));
    }
  } catch {
    // Fallback to memory
  }

  return MEMORY_TRIPS;
}

export async function advanceTripStep(
  tripId: string,
  nextStep: DriverTripStatus,
  proofData?: {
    deliveryProofUrl?: string;
    weighbridgeSlipNumber?: string;
    recipientSignatureName?: string;
    deliveryNotes?: string;
  }
): Promise<{ success: boolean; trip?: DriverTrip }> {
  try {
    const supabase = await createClient();
    const updatePayload: any = {
      status_step: nextStep
    };

    if (nextStep === 'DELIVERED' || nextStep === 'COMPLETED') {
      updatePayload.status = 'delivered';
      if (proofData?.deliveryProofUrl) updatePayload.delivery_proof_url = proofData.deliveryProofUrl;
      if (proofData?.weighbridgeSlipNumber) updatePayload.weighbridge_slip = proofData.weighbridgeSlipNumber;
      if (proofData?.recipientSignatureName) updatePayload.recipient_signature = proofData.recipientSignatureName;
      if (proofData?.deliveryNotes) updatePayload.delivery_notes = proofData.deliveryNotes;
    } else if (nextStep === 'IN_TRANSIT' || nextStep === 'PICKED_UP') {
      updatePayload.status = 'in_transit';
    }

    await supabase.from('shipments').update(updatePayload).eq('id', tripId);
  } catch {
    // Non-critical Supabase error
  }

  // Update memory store
  const trip = MEMORY_TRIPS.find(t => t.id === tripId || t.shipmentId === tripId);
  if (trip) {
    trip.status = nextStep;
    if (proofData?.deliveryProofUrl) trip.deliveryProofUrl = proofData.deliveryProofUrl;
    if (proofData?.weighbridgeSlipNumber) trip.weighbridgeSlipNumber = proofData.weighbridgeSlipNumber;
    if (proofData?.recipientSignatureName) trip.recipientSignatureName = proofData.recipientSignatureName;
    if (proofData?.deliveryNotes) trip.deliveryNotes = proofData.deliveryNotes;
    if (nextStep === 'COMPLETED') trip.completedAt = new Date().toISOString();
  }

  revalidatePath('/driver');
  return { success: true, trip };
}
