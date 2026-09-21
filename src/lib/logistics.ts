export interface DriverInfo {
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
  pickup_date: string;
  transporter?: string;
  notes?: string;
}

export function parseDriverInfo(message: string | null | undefined): DriverInfo | null {
  if (!message) return null;
  const match = message.match(/\[DRIVER_DISPATCH\]:(\{[\s\S]*?\})/);
  if (match && match[1]) {
    try {
      return JSON.parse(match[1]) as DriverInfo;
    } catch {
      return null;
    }
  }
  return null;
}

export function getCleanMessage(message: string | null | undefined): string {
  if (!message) return '';
  return message.replace(/\[DRIVER_DISPATCH\]:\{[\s\S]*?\}/g, '').trim();
}

export const VERIFIED_FLEET_DRIVERS = [
  {
    driver_name: "Ramesh Kumar",
    driver_phone: "+91 98410 22334",
    vehicle_number: "TN 38 BX 4421",
    transporter: "GreenFleet Circular Logistics",
    vehicle_type: "16-Ton Flatbed (Electric/CNG)",
    rating: "4.9 ★",
    trips: "120+ Verified Pickups"
  },
  {
    driver_name: "Murugan S",
    driver_phone: "+91 94431 88921",
    vehicle_number: "TN 43 CD 9912",
    transporter: "Tamil Nadu EcoHaul Express",
    vehicle_type: "10-Ton Enclosed Container",
    rating: "4.8 ★",
    trips: "85+ Industrial Loads"
  },
  {
    driver_name: "David Prakash",
    driver_phone: "+91 98220 77112",
    vehicle_number: "TN 66 EF 5543",
    transporter: "FastTrack Industrial Logistics",
    vehicle_type: "22-Ton Multi-Axle Carrier",
    rating: "5.0 ★",
    trips: "210+ Heavy Deliveries"
  }
];
