'use server';

import { createClient } from '@/utils/supabase/server';
import { type DriverTrip, type DriverTripStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { sharedStore } from '@/lib/sharedStore';

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
      shipments.forEach((s: any) => {
        if (!sharedStore.getTrips().some(t => t.id === s.id || t.shipmentId === s.id)) {
          // Sync DB shipments if any
        }
      });
    }
  } catch {
    // Non-critical, fallback to sharedStore
  }

  return sharedStore.getTrips(driverId);
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

  // Update in central shared store: this automatically syncs matching Deal and marks Waste as sold when completed!
  const updatedTrip = sharedStore.advanceTrip(tripId, nextStep, proofData);

  revalidatePath('/driver');
  revalidatePath('/dashboard');
  revalidatePath('/buyer');
  revalidatePath('/admin');
  revalidatePath('/waste');

  return { success: true, trip: updatedTrip };
}
