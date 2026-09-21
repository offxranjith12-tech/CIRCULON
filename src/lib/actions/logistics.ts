"use server";

import { createClient } from "@/utils/supabase/server";

export async function getDrivers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, company_name, driver_status, current_location_lat, current_location_lng")
    .eq("role", "driver");

  if (error) {
    console.error("Error fetching drivers:", error);
    return [];
  }

  return data.map(d => ({
    id: d.id,
    name: d.company_name,
    status: d.driver_status,
    location: d.current_location_lat ? { lat: d.current_location_lat, lng: d.current_location_lng } : undefined,
  }));
}

export async function getShipments(role?: string, profileId?: string) {
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
  if (error) {
    console.error("Error fetching shipments:", error);
    return [];
  }

  return data.map(d => ({
    id: d.id,
    driverId: d.driver_id,
    pickup: { lat: d.pickup_lat || 11.0, lng: d.pickup_lng || 77.0 },
    dropoff: { lat: d.dropoff_lat || 13.0, lng: d.dropoff_lng || 80.0 },
    status: d.status
  }));
}
