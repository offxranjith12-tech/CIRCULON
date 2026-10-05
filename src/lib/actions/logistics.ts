"use server";

import { createClient } from "@/utils/supabase/server";
import { sharedStore } from "@/lib/sharedStore";

export async function getDrivers() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, company_name, driver_status, current_location_lat, current_location_lng")
      .eq("role", "driver");

    if (!error && data && data.length > 0) {
      return data.map(d => ({
        id: d.id,
        name: d.company_name,
        status: d.driver_status || 'free',
        location: d.current_location_lat ? { lat: d.current_location_lat, lng: d.current_location_lng } : { lat: 11.2189, lng: 78.1674 },
      }));
    }
  } catch {
    // Non-critical, fallback to sharedStore
  }

  const drivers = sharedStore.getCompanies().filter(c => c.role === 'driver');
  return drivers.map(d => ({
    id: d.id,
    name: d.company_name,
    status: 'in_work',
    location: { lat: 11.2189, lng: 78.1674 } // Namakkal Hub
  }));
}

export async function getShipments(role?: string, profileId?: string) {
  try {
    const supabase = await createClient();
    let query = supabase.from("shipments").select(`
      *,
      connection_requests!inner(seller_id, buyer_id)
    `);

    if (role === "seller") {
      query = query.eq("connection_requests.seller_id", profileId);
    } else if (role === "buyer") {
      query = query.eq("connection_requests.buyer_id", profileId);
    } else if (role === "driver") {
      query = query.eq("driver_id", profileId);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map(d => ({
        id: d.id,
        driverId: d.driver_id,
        pickup: { lat: d.pickup_lat || 11.0, lng: d.pickup_lng || 77.0 },
        dropoff: { lat: d.dropoff_lat || 13.0, lng: d.dropoff_lng || 80.0 },
        status: d.status
      }));
    }
  } catch {
    // Non-critical
  }

  // Derive live shipments from sharedStore active trips
  const trips = sharedStore.getTrips();
  return trips.map((t, idx) => {
    // Coordinates based on trip index
    const isTransit = t.status === 'IN_TRANSIT';
    return {
      id: t.id,
      driverId: 'c10-quickfreight-id',
      pickup: idx === 0 ? { lat: 11.1085, lng: 77.3411 } : { lat: 12.9716, lng: 77.5946 }, // Tirupur or Bengaluru
      dropoff: idx === 0 ? { lat: 17.0005, lng: 81.8040 } : { lat: 13.0827, lng: 80.2707 }, // Rajahmundry or Chennai
      status: isTransit ? 'in_transit' : t.status === 'COMPLETED' ? 'delivered' : 'pending'
    };
  });
}
