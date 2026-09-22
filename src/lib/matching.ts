import { 
  calculateRealLogistics, 
  calculateNetCircularValue 
} from '@/lib/logistics';
import { type LogisticsDetails, type NetCircularValue } from '@/lib/types';

export interface CompatibilityBreakdown {
  material: number;
  quantity: number;
  quality: number;
  price: number;
  location: number;
  industry: number;
}

export interface MatchResult {
  buyer: any;
  opportunityScore: number;
  compatibilityScore: number;
  breakdown: CompatibilityBreakdown;
  grossValue: number;
  transportCost: number;
  processingCost: number;
  netValue: number;
  netCircularValue: NetCircularValue;
  logistics: LogisticsDetails;
  whyThisBuyer: Array<{
    factor: string;
    score: number;
    description: string;
    passed: boolean;
  }>;
  reason: string[];
  disclaimer: string;
}

export const calculateMatches = (
  materialType: string,
  quantity: number,
  buyers: any[] = [],
  wasteDetails?: {
    quality?: string;
    expectedPrice?: number;
    location?: string;
    category?: string;
  }
): MatchResult[] => {
  const matches: MatchResult[] = [];
  const matLower = (materialType || '').toLowerCase();
  const qualityGiven = (wasteDetails?.quality || 'High').toLowerCase();
  const sellerExpectedPrice = wasteDetails?.expectedPrice || 0;
  const sellerLocation = wasteDetails?.location || 'Tirupur, Tamil Nadu';
  const category = wasteDetails?.category || 'General Industrial Waste';

  for (const buyer of buyers) {
    const requiredMaterials: string[] = buyer.materials_required || [];
    
    // Check material compatibility (0-100)
    let materialScore = 0;
    const isDirectMatch = requiredMaterials.some((req: string) => {
      const r = req.toLowerCase();
      return matLower.includes(r) || r.includes(matLower);
    });

    const isRelatedMatch = 
      (matLower.includes('cotton') && requiredMaterials.some(r => r.toLowerCase().includes('textile') || r.toLowerCase().includes('cotton') || r.toLowerCase().includes('yarn'))) ||
      (matLower.includes('textile') && requiredMaterials.some(r => r.toLowerCase().includes('fabric') || r.toLowerCase().includes('cotton') || r.toLowerCase().includes('yarn'))) ||
      (matLower.includes('hdpe') && requiredMaterials.some(r => r.toLowerCase().includes('plastic') || r.toLowerCase().includes('polymer') || r.toLowerCase().includes('hdpe'))) ||
      (matLower.includes('pet') && requiredMaterials.some(r => r.toLowerCase().includes('plastic') || r.toLowerCase().includes('polymer') || r.toLowerCase().includes('pet'))) ||
      (matLower.includes('plastic') && requiredMaterials.some(r => r.toLowerCase().includes('polymer') || r.toLowerCase().includes('hdpe') || r.toLowerCase().includes('pet'))) ||
      (matLower.includes('metal') && requiredMaterials.some(r => r.toLowerCase().includes('aluminium') || r.toLowerCase().includes('iron') || r.toLowerCase().includes('steel'))) ||
      (matLower.includes('aluminium') && requiredMaterials.some(r => r.toLowerCase().includes('metal') || r.toLowerCase().includes('scrap'))) ||
      (matLower.includes('paper') && requiredMaterials.some(r => r.toLowerCase().includes('cardboard') || r.toLowerCase().includes('kraft') || r.toLowerCase().includes('occ'))) ||
      (matLower.includes('cardboard') && requiredMaterials.some(r => r.toLowerCase().includes('paper') || r.toLowerCase().includes('packaging'))) ||
      ((matLower.includes('rice') || matLower.includes('bagasse') || matLower.includes('coir')) && requiredMaterials.some(r => r.toLowerCase().includes('biomass') || r.toLowerCase().includes('agricultural')));

    if (isDirectMatch) {
      materialScore = 95;
    } else if (isRelatedMatch) {
      materialScore = 88;
    } else {
      if (buyer.industry?.toLowerCase().includes('recycl') || buyer.buyer_type?.toLowerCase().includes('aggregator')) {
        materialScore = 70;
      } else {
        continue; // No compatibility
      }
    }

    // 1. Quantity compatibility (0-100)
    let quantityScore = 75;
    const minQ = Number(buyer.min_quantity) || 100;
    const maxQ = Number(buyer.max_quantity) || 10000;
    if (quantity >= minQ && quantity <= maxQ) {
      quantityScore = 100;
    } else if (quantity > maxQ) {
      quantityScore = 85;
    } else {
      quantityScore = Math.max(50, Math.round((quantity / minQ) * 80));
    }

    // 2. Price compatibility (0-100)
    const buyerMaxPrice = Number(buyer.max_price) || 35;
    let priceScore = 85;
    if (sellerExpectedPrice > 0) {
      if (sellerExpectedPrice <= buyerMaxPrice) {
        priceScore = 92;
      } else {
        const ratio = buyerMaxPrice / sellerExpectedPrice;
        priceScore = Math.max(45, Math.min(90, Math.round(ratio * 90)));
      }
    } else {
      priceScore = 88;
    }

    // 3. Quality compatibility (0-100)
    let qualityScore = 90;
    const prefQuality = (buyer.preferred_quality || 'High').toLowerCase();
    if (qualityGiven.includes('high') || qualityGiven.includes('clean')) {
      qualityScore = 94;
    } else if (qualityGiven.includes('medium')) {
      qualityScore = prefQuality.includes('high') ? 82 : 91;
    } else {
      qualityScore = 72;
    }

    // 4. Industry compatibility (0-100)
    let industryScore = 90;
    const buyerIndustry = (buyer.industry || '').toLowerCase();
    if (matLower.includes('cotton') && buyerIndustry.includes('textile')) industryScore = 98;
    else if ((matLower.includes('plastic') || matLower.includes('hdpe')) && (buyerIndustry.includes('plastic') || buyerIndustry.includes('polymer'))) industryScore = 98;
    else if (matLower.includes('metal') && (buyerIndustry.includes('metal') || buyerIndustry.includes('steel'))) industryScore = 98;
    else industryScore = 88;

    // 5. Location / Logistics calculation
    const buyerLocation = `${buyer.city || ''}, ${buyer.state || ''}`.trim() || 'Coimbatore, Tamil Nadu';
    const logistics = calculateRealLogistics(sellerLocation, buyerLocation, quantity, category);

    // Location compatibility based on real calculated distance
    let locationScore = 85;
    if (logistics.distanceKm <= 50) {
      locationScore = 96;
    } else if (logistics.distanceKm <= 150) {
      locationScore = 88;
    } else if (logistics.distanceKm <= 350) {
      locationScore = 78;
    } else {
      locationScore = 65;
    }

    // Weighted Overall Opportunity Score
    // Material 30%, Quantity 20%, Quality 15%, Price 15%, Location 10%, Industry 10%
    const overallScore = Math.round(
      materialScore * 0.30 +
      quantityScore * 0.20 +
      qualityScore * 0.15 +
      priceScore * 0.15 +
      locationScore * 0.10 +
      industryScore * 0.10
    );

    // Financial & Net Circular Value calculations
    const offeredPrice = buyer.max_price || sellerExpectedPrice || 32;
    const grossValue = quantity * offeredPrice;
    const netCircularVal = calculateNetCircularValue(grossValue, logistics.estimatedFreightCost, quantity, category);

    // Transparent "Why This Buyer?" Explainability Breakdown
    const whyThisBuyer = [
      {
        factor: 'Material Compatibility',
        score: materialScore,
        description: isDirectMatch ? 'Direct stream match with buyer procurement requirement' : 'Cross-industry circular feedstock substitute',
        passed: materialScore >= 80
      },
      {
        factor: 'Quantity Fit',
        score: quantityScore,
        description: `Batch size (${quantity.toLocaleString()} KG) fits buyer intake bracket (${minQ.toLocaleString()}–${maxQ.toLocaleString()} KG)`,
        passed: quantityScore >= 75
      },
      {
        factor: 'Quality Fit',
        score: qualityScore,
        description: `Offered condition matches buyer preference (${buyer.preferred_quality || 'Commercial Grade'})`,
        passed: qualityScore >= 80
      },
      {
        factor: 'Price Fit',
        score: priceScore,
        description: `Expected price aligned with buyer ceiling of ₹${buyerMaxPrice}/KG`,
        passed: priceScore >= 75
      },
      {
        factor: 'Logistics & Proximity',
        score: locationScore,
        description: `${logistics.distanceKm} KM road distance between ${sellerLocation} and ${buyerLocation}`,
        passed: locationScore >= 70
      }
    ];

    const reasons = [
      `Material compatibility: ${materialScore}%`,
      `Quantity fit: ${quantityScore}%`,
      `Quality fit: ${qualityScore}%`,
      `Price fit: ${priceScore}%`,
      `Logistics proximity: ${locationScore}% (${logistics.distanceKm} KM)`
    ];

    matches.push({
      buyer,
      opportunityScore: overallScore,
      compatibilityScore: overallScore,
      breakdown: {
        material: materialScore,
        quantity: quantityScore,
        quality: qualityScore,
        price: priceScore,
        location: locationScore,
        industry: industryScore,
      },
      grossValue,
      transportCost: logistics.estimatedFreightCost,
      processingCost: netCircularVal.estimatedProcessingCost,
      netValue: netCircularVal.netValue,
      netCircularValue: netCircularVal,
      logistics,
      whyThisBuyer,
      reason: reasons,
      disclaimer: 'Opportunity score and Net Circular Value are derived from deterministic transportation and pre-processing cost algorithms based on actual buyer procurement specifications.'
    });
  }

  // Sort descending by opportunity score
  return matches.sort((a, b) => b.opportunityScore - a.opportunityScore);
};
