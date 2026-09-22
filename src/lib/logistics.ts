import { type LogisticsDetails, type NetCircularValue } from '@/lib/types';

export interface DriverInfo {
  driver_name: string;
  driver_phone: string;
  vehicle_number: string;
  pickup_date: string;
  transporter?: string;
  vehicle_type?: string;
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

// Indian Industrial Hub Geographic Registry
export const INDUSTRIAL_HUBS: Record<string, { lat: number; lng: number; clusterName: string }> = {
  tirupur: { lat: 11.1085, lng: 77.3411, clusterName: 'Tirupur Knitwear & Textile Cluster' },
  coimbatore: { lat: 11.0168, lng: 76.9558, clusterName: 'Coimbatore Engineering & Foundries' },
  chennai: { lat: 13.0067, lng: 80.2026, clusterName: 'Chennai Guindy & Ambattur Industrial Estate' },
  erode: { lat: 11.3410, lng: 77.7172, clusterName: 'Erode Processing & Biomass Hub' },
  salem: { lat: 11.6643, lng: 78.1460, clusterName: 'Salem Steel & Sago Cluster' },
  madurai: { lat: 9.9252, lng: 78.1198, clusterName: 'Madurai Industrial Corridor' },
  pollachi: { lat: 10.6609, lng: 77.0048, clusterName: 'Pollachi Coir & Bio-Fibers Hub' },
  thanjavur: { lat: 10.7870, lng: 79.1378, clusterName: 'Thanjavur Agro Processing Center' },
  bengaluru: { lat: 12.9716, lng: 77.5946, clusterName: 'Peenya & Whitefield Technology Clusters' },
  bangalore: { lat: 12.9716, lng: 77.5946, clusterName: 'Peenya Industrial Estate' },
  pune: { lat: 18.6279, lng: 73.8340, clusterName: 'Pimpri-Chinchwad Bhosari MIDC' },
  mumbai: { lat: 19.0760, lng: 72.8777, clusterName: 'Thane-Belapur Industrial Zone' },
  hyderabad: { lat: 17.3850, lng: 78.4867, clusterName: 'Jeedimetla & Cherlapally Industrial Area' },
  ahmedabad: { lat: 23.0225, lng: 72.5714, clusterName: 'Vatva & Naroda Chemical Zone' },
  surat: { lat: 21.1702, lng: 72.8311, clusterName: 'Surat Synthetic Textile & Diamond Park' },
  delhi: { lat: 28.6139, lng: 77.2090, clusterName: 'Delhi NCR Industrial Corridor' }
};

export function resolveCoordinates(locationStr: string): { lat: number; lng: number } {
  const norm = (locationStr || '').toLowerCase();
  for (const [key, hub] of Object.entries(INDUSTRIAL_HUBS)) {
    if (norm.includes(key)) {
      return { lat: hub.lat, lng: hub.lng };
    }
  }
  // Default regional hub: Coimbatore / Tirupur
  return { lat: 11.0168, lng: 76.9558 };
}

// Great-circle Haversine distance formula (in Kilometers)
export function calculateHaversineDistanceKm(
  coord1: { lat: number; lng: number },
  coord2: { lat: number; lng: number }
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLng = ((coord2.lng - coord1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.lat * Math.PI) / 180) *
      Math.cos((coord2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightLine = R * c;
  
  // Real Indian road network routing factor (~1.25x of geodesic distance)
  const roadDistance = Math.round(straightLine * 1.25);
  return Math.max(15, roadDistance); // Minimum 15km local intra-city transport
}

export function calculateRealLogistics(
  originLoc: string,
  destLoc: string,
  weightKg: number,
  category: string = 'General'
): LogisticsDetails {
  const originCoords = resolveCoordinates(originLoc);
  const destCoords = resolveCoordinates(destLoc);
  const distanceKm = calculateHaversineDistanceKm(originCoords, destCoords);

  // Vehicle selection based on load tonnage
  let ratePerKm = 32;
  let vehicleType = "10-Ton Container Truck";
  if (weightKg > 15000) {
    ratePerKm = 48;
    vehicleType = "24-Ton Multi-Axle Carrier";
  } else if (weightKg > 8000) {
    ratePerKm = 38;
    vehicleType = "16-Ton High-Deck Truck";
  } else if (weightKg < 3000) {
    ratePerKm = 24;
    vehicleType = "3.5-Ton Light Commercial Vehicle";
  }

  // Minimum base freight charge to cover loading/unloading
  const baseTollAndLoading = 1800;
  const freightCost = Math.round((distanceKm * ratePerKm) + baseTollAndLoading);
  
  // Commercial freight transit time (average 42 km/h commercial highway speed + 2 hours loading)
  const transitHours = Number((distanceKm / 42 + 2).toFixed(1));

  // Freight carbon footprint: ~0.12 kg CO2 per ton-km for heavy diesel freight
  const tonWeight = weightKg / 1000;
  const co2Freight = Math.round(distanceKm * tonWeight * 0.115);
  
  // Avoided carbon by valorizing instead of virgin extraction
  const grossCo2Avoided = Math.round(weightKg * 1.8);
  const netCarbonAvoided = Math.max(0, grossCo2Avoided - co2Freight);

  return {
    originLocation: originLoc,
    destinationLocation: destLoc,
    originCoords,
    destCoords,
    distanceKm,
    transportRatePerKm: ratePerKm,
    vehicleType,
    estimatedTransitHours: transitHours,
    estimatedFreightCost: freightCost,
    co2FreightEmissionsKg: co2Freight,
    netCarbonAvoidedKg: netCarbonAvoided
  };
}

export function calculateNetCircularValue(
  grossValue: number,
  logisticsCost: number,
  weightKg: number,
  category: string = 'General'
): NetCircularValue {
  // Estimated pre-processing cost per kg (baling, sorting, de-dusting)
  let unitProcessingCost = 1.5;
  const catLower = category.toLowerCase();
  if (catLower.includes('plastic') || catLower.includes('polymer')) {
    unitProcessingCost = 2.5; // Wash & granulation
  } else if (catLower.includes('metal') || catLower.includes('foundry')) {
    unitProcessingCost = 4.0; // De-oiling & briquetting
  } else if (catLower.includes('textile')) {
    unitProcessingCost = 1.8; // Baling & shredding
  }

  const processingCost = Math.round(weightKg * unitProcessingCost);
  const netValue = Math.max(0, grossValue - logisticsCost - processingCost);
  const marginPercentage = grossValue > 0 ? Math.round((netValue / grossValue) * 100) : 0;

  return {
    grossMaterialValue: grossValue,
    logisticsCost,
    estimatedProcessingCost: processingCost,
    netValue,
    marginPercentage,
    currency: 'INR (₹)'
  };
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
