export type UserRole = 'admin' | 'seller' | 'buyer' | 'driver';

export interface MaterialQualityAssessment {
  qualityScore: number; // 0 - 100
  purityPercentage: number; // 0 - 100
  contaminationRisk: 'Low' | 'Medium' | 'High';
  moistureRisk: 'Low' | 'Medium' | 'High';
  reusePotential: 'High' | 'Medium' | 'Low';
  processingDifficulty: 'Low' | 'Medium' | 'High';
  aiConfidence: number; // 0 - 1
  isPreliminary: boolean; // Always true for AI-derived estimates
  qualityFactors: string[];
  contaminationFactors: string[];
  moisturePercentage: number;
  conditionDescription: string;
  recommendedProcessing: string[];
  verifiedByLab?: boolean;
  labReportNumber?: string;
}

export interface ProductOpportunity {
  id: string;
  productName: string;
  recoveredMaterialName: string;
  whySuitable: string;
  requiredProcessing: string[];
  approximateFeasibility: number; // 0 - 100%
  requiredQuality: string;
  potentialIndustry: string;
  potentialBuyerCategory: string;
  estimatedMarketValueMin: number;
  estimatedMarketValueMax: number;
  economicRankingScore: number; // Deterministic business score
  carbonAvoidanceFactorKgPerKg: number;
  explainabilityReasons: string[];
}

export interface LogisticsDetails {
  originLocation: string;
  destinationLocation: string;
  originCoords?: { lat: number; lng: number };
  destCoords?: { lat: number; lng: number };
  distanceKm: number;
  transportRatePerKm: number; // e.g. ₹35/km
  vehicleType: string;
  estimatedTransitHours: number;
  estimatedFreightCost: number;
  co2FreightEmissionsKg: number;
  netCarbonAvoidedKg: number;
}

export interface NetCircularValue {
  grossMaterialValue: number;
  logisticsCost: number;
  estimatedProcessingCost: number;
  netValue: number;
  marginPercentage: number;
  currency: string;
}

export interface ExplainableMatchScore {
  overallScore: number; // 0 - 100
  compatibilityBreakdown: {
    material: number; // 0 - 100
    quantity: number; // 0 - 100
    quality: number; // 0 - 100
    price: number; // 0 - 100
    location: number; // 0 - 100
  };
  whyThisBuyer: {
    title: string;
    description: string;
    passed: boolean;
  }[];
  netCircularValue: NetCircularValue;
  logistics: LogisticsDetails;
  recommendation: string;
}

export interface CustodyEvent {
  step: 'created' | 'analyzed' | 'matched' | 'deal_agreed' | 'dispatched' | 'in_transit' | 'delivered' | 'verified';
  title: string;
  timestamp: string;
  actor: string;
  location: string;
  status: 'completed' | 'in_progress' | 'pending';
  notes?: string;
  txHash?: string;
}

export interface MaterialPassport {
  id: string; // e.g. CIRC-DPP-2026-XXXX
  wasteId: string;
  dealId?: string;
  batchNumber: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string;
  originLocation: string;
  originCompany: string;
  sellerId: string;
  buyerCompany?: string;
  buyerId?: string;
  driverName?: string;
  qualityScore: number;
  purityPercentage: number;
  contaminationLevel: string;
  circularityScore: number; // 0 - 100
  co2AvoidedKg: number;
  landfillDivertedKg: number;
  waterSavedLiters: number;
  createdAt: string;
  qrPayloadUrl: string;
  certificateHash: string;
  custodyTimeline: CustodyEvent[];
}

export interface SymbiosisNode {
  id: string;
  name: string;
  companyName: string;
  industry: string;
  role: 'producer' | 'consumer' | 'both';
  location: string;
  coordinates: { x: number; y: number };
  materialsSupplied: string[];
  materialsConsumed: string[];
  annualDivertedTons: number;
  co2AvoidedTons: number;
  activePartnerships: number;
}

export interface SymbiosisLink {
  id: string;
  sourceId: string;
  targetId: string;
  materialName: string;
  annualVolumeKg: number;
  status: 'active' | 'potential' | 'negotiating';
  co2OffsetKg: number;
}

export interface MarketOpportunity {
  id: string;
  materialName: string;
  category: string;
  demandKg: number;
  availableSupplyKg: number;
  potentialBuyersCount: number;
  preferredPriceMin: number;
  preferredPriceMax: number;
  opportunityLevel: 'HIGH' | 'MODERATE' | 'EMERGING';
  urgency: 'Immediate' | 'Within 14 Days' | 'Flexible';
  topDemandClusters: string[];
  dataSource: 'Based on CIRCULON buyer requirements';
  lastUpdated: string;
}

export type DriverTripStatus = 
  | 'ASSIGNED' 
  | 'START_TRIP' 
  | 'AT_PICKUP' 
  | 'PICKED_UP' 
  | 'IN_TRANSIT' 
  | 'AT_DELIVERY' 
  | 'DELIVERED' 
  | 'COMPLETED';

export interface DriverTrip {
  id: string;
  shipmentId: string;
  dealId?: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string;
  pickupLocation: string;
  pickupContactName: string;
  pickupPhone: string;
  dropoffLocation: string;
  dropoffContactName: string;
  dropoffPhone: string;
  distanceKm: number;
  status: DriverTripStatus;
  estimatedEarnings: number;
  vehicleNumber: string;
  startedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  deliveryProofUrl?: string;
  weighbridgeSlipNumber?: string;
  recipientSignatureName?: string;
  deliveryNotes?: string;
}
