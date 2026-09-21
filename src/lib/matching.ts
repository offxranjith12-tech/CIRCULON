export interface CompatibilityBreakdown {
  material: number;
  quantity: number;
  location: number;
  quality: number;
  price: number;
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
  reason: string[];
  disclaimer: string;
}

const TRANSPORT_RATE = 35; // ₹35 per km

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
  const sellerLocation = (wasteDetails?.location || '').toLowerCase();

  for (const buyer of buyers) {
    const requiredMaterials: string[] = buyer.materials_required || [];
    
    // Check material compatibility
    let materialScore = 0;
    const isDirectMatch = requiredMaterials.some((req: string) => {
      const r = req.toLowerCase();
      return matLower.includes(r) || r.includes(matLower);
    });

    // Synonym & stream compatibility checks
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
      (matLower.includes('rice') || matLower.includes('bagasse') || matLower.includes('coir')) && requiredMaterials.some(r => r.toLowerCase().includes('biomass') || r.toLowerCase().includes('agricultural'));

    if (isDirectMatch) {
      materialScore = 100;
    } else if (isRelatedMatch) {
      materialScore = 85;
    } else {
      // General fallback if buyer is an aggregator
      if (buyer.industry?.toLowerCase().includes('recycl') || buyer.buyer_type?.toLowerCase().includes('aggregator')) {
        materialScore = 65;
      } else {
        continue; // No compatibility
      }
    }

    // 1. Quantity compatibility (0-100)
    let quantityScore = 75;
    const minQ = Number(buyer.min_quantity) || 100;
    const maxQ = Number(buyer.max_quantity) || 10000;
    if (quantity >= minQ && quantity <= maxQ) {
      quantityScore = 95;
    } else if (quantity > maxQ) {
      quantityScore = 80;
    } else {
      quantityScore = Math.max(50, Math.round((quantity / minQ) * 75));
    }

    // 2. Price compatibility (0-100)
    const buyerMaxPrice = Number(buyer.max_price) || 35;
    let priceScore = 85;
    if (sellerExpectedPrice > 0) {
      if (sellerExpectedPrice <= buyerMaxPrice) {
        priceScore = 95;
      } else {
        const ratio = buyerMaxPrice / sellerExpectedPrice;
        priceScore = Math.max(45, Math.min(90, Math.round(ratio * 90)));
      }
    } else {
      priceScore = buyerMaxPrice >= 30 ? 92 : 84;
    }

    // 3. Quality compatibility (0-100)
    let qualityScore = 90;
    const prefQuality = (buyer.preferred_quality || 'High').toLowerCase();
    if (qualityGiven.includes('high') || qualityGiven.includes('clean')) {
      qualityScore = 95;
    } else if (qualityGiven.includes('medium')) {
      qualityScore = prefQuality.includes('high') ? 80 : 92;
    } else {
      qualityScore = 70;
    }

    // 4. Location / Distance compatibility (0-100)
    let locationScore = 85;
    const buyerState = (buyer.state || '').toLowerCase();
    const buyerCity = (buyer.city || '').toLowerCase();
    if (sellerLocation && (sellerLocation.includes(buyerState) || sellerLocation.includes(buyerCity))) {
      locationScore = 95;
    } else {
      locationScore = 80;
    }

    // 5. Industry compatibility (0-100)
    let industryScore = 90;
    const buyerIndustry = (buyer.industry || '').toLowerCase();
    if (matLower.includes('cotton') && buyerIndustry.includes('textile')) industryScore = 98;
    else if ((matLower.includes('plastic') || matLower.includes('hdpe')) && (buyerIndustry.includes('plastic') || buyerIndustry.includes('polymer'))) industryScore = 98;
    else if (matLower.includes('metal') && (buyerIndustry.includes('metal') || buyerIndustry.includes('steel'))) industryScore = 98;
    else industryScore = 85;

    // Weighted Overall Compatibility Score
    // Material 30%, Quantity 20%, Price 15%, Quality 15%, Location 10%, Industry 10%
    const overallScore = Math.round(
      materialScore * 0.30 +
      quantityScore * 0.20 +
      priceScore * 0.15 +
      qualityScore * 0.15 +
      locationScore * 0.10 +
      industryScore * 0.10
    );

    // Financial calculations
    const offeredPrice = buyer.max_price || 30;
    const grossValue = quantity * offeredPrice;
    const mockDistance = locationScore >= 90 ? 35 : 75;
    const transportCost = mockDistance * TRANSPORT_RATE;
    const processingCost = 0;
    const netValue = Math.max(0, grossValue - transportCost - processingCost);

    // Reasons breakdown
    const reasons: string[] = [];
    if (materialScore >= 90) reasons.push('Direct material specification match');
    else reasons.push('Related circular feedstock match');

    if (quantityScore >= 90) reasons.push(`Batch matches buyer intake limit (${minQ.toLocaleString()} - ${maxQ.toLocaleString()} KG)`);
    if (locationScore >= 90) reasons.push('Proximity logistics match (under 50 KM)');
    if (priceScore >= 90) reasons.push(`Strong price point up to ₹${offeredPrice}/KG`);
    if (qualityScore >= 90) reasons.push('Quality condition meets procurement grade');

    matches.push({
      buyer,
      opportunityScore: overallScore,
      compatibilityScore: overallScore,
      breakdown: {
        material: materialScore,
        quantity: quantityScore,
        location: locationScore,
        quality: qualityScore,
        price: priceScore,
        industry: industryScore,
      },
      grossValue,
      transportCost,
      processingCost,
      netValue,
      reason: reasons,
      disclaimer: 'Compatibility score is an algorithmic estimate based on buyer criteria and material profile, not a contractual guarantee.',
    });
  }

  // Sort descending by compatibility score
  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
};
