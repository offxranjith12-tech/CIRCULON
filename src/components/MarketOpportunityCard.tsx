"use client";

import { 
  TrendingUp, 
  Users, 
  IndianRupee, 
  Scale, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { type MarketOpportunity } from "@/lib/types";

interface MarketOpportunityCardProps {
  opportunity: MarketOpportunity;
  onActionClick?: (opp: MarketOpportunity) => void;
}

export function MarketOpportunityCard({ opportunity, onActionClick }: MarketOpportunityCardProps) {
  const getBadgeStyle = (level: 'HIGH' | 'MODERATE' | 'EMERGING') => {
    if (level === 'HIGH') return 'bg-rose-500 text-white shadow-rose-500/20';
    if (level === 'MODERATE') return 'bg-emerald-600 text-white shadow-emerald-600/20';
    return 'bg-amber-500 text-white shadow-amber-500/20';
  };

  const supplyDeficit = opportunity.demandKg - opportunity.availableSupplyKg;
  const isDeficit = supplyDeficit > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
      <div>
        {/* Header: Demand Level & Category */}
        <div className="flex items-center justify-between gap-2">
          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-xs ${getBadgeStyle(opportunity.opportunityLevel)}`}>
            {opportunity.opportunityLevel} DEMAND
          </span>
          <span className="text-[11px] font-semibold text-gray-500">
            {opportunity.category}
          </span>
        </div>

        {/* Material Name */}
        <h3 className="text-lg font-black text-gray-950 tracking-tight mt-2">
          {opportunity.materialName}
        </h3>

        {/* Demand vs Supply Comparison Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-100">
          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Buyer Demand</span>
            <span className="text-base font-black text-rose-600 mt-0.5 block">
              {opportunity.demandKg.toLocaleString()} KG
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Available Supply</span>
            <span className="text-base font-black text-emerald-700 mt-0.5 block">
              {opportunity.availableSupplyKg.toLocaleString()} KG
            </span>
          </div>
        </div>

        {/* Potential Buyers & Price Range */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 p-2 rounded-lg">
            <Users className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span><strong>{opportunity.potentialBuyersCount}</strong> Potential Buyers</span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-700 bg-gray-50 p-2 rounded-lg">
            <IndianRupee className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-bold text-emerald-700">₹{opportunity.preferredPriceMin}–₹{opportunity.preferredPriceMax}/kg</span>
          </div>
        </div>

        {/* Top Demand Clusters */}
        {opportunity.topDemandClusters.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Demand hubs: {opportunity.topDemandClusters.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Mandatory Data Quality Attribution & Action */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-[10px] text-emerald-800 font-semibold bg-emerald-50/70 px-2 py-1 rounded-md mb-3 border border-emerald-100">
          <Info className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>{opportunity.dataSource}</span>
        </div>

        {onActionClick && (
          <button
            onClick={() => onActionClick(opportunity)}
            className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Supply This Demand</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
