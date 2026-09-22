"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  HelpCircle, 
  Truck, 
  IndianRupee, 
  Navigation, 
  Layers, 
  Scale, 
  Clock, 
  ShieldCheck, 
  TrendingUp,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from "lucide-react";
import { type MatchResult } from "@/lib/matching";

interface OpportunityScoreCardProps {
  match: MatchResult;
  onInitiateDeal?: (buyer: any) => void;
}

export function OpportunityScoreCard({ match, onInitiateDeal }: OpportunityScoreCardProps) {
  const [showExplanation, setShowExplanation] = useState(false);
  const { buyer, opportunityScore, breakdown, netCircularValue, logistics, whyThisBuyer } = match;

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'bg-emerald-500 text-white shadow-emerald-600/30';
    if (score >= 70) return 'bg-teal-600 text-white shadow-teal-600/30';
    return 'bg-amber-500 text-white shadow-amber-600/30';
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-md hover:shadow-lg transition-all overflow-hidden">
      {/* Top Banner: Buyer & Opportunity Score */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-gray-50 via-white to-emerald-50/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
              {buyer.industry || 'Industrial Buyer'}
            </span>
            <span className="text-xs text-gray-500">
              {buyer.city ? `${buyer.city}, ${buyer.state}` : 'Verified Partner'}
            </span>
          </div>
          <h4 className="text-xl font-black text-gray-950 tracking-tight mt-1">
            {buyer.company_name}
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Procuring: {(buyer.materials_required || []).slice(0, 3).join(', ')}
          </p>
        </div>

        {/* Opportunity Score Indicator */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">
              Opportunity Score
            </span>
            <span className="text-xs font-semibold text-emerald-700">
              High Probability Match
            </span>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-md ${getScoreBadge(opportunityScore)}`}>
            <span className="text-2xl leading-none">{opportunityScore}</span>
            <span className="text-[9px] uppercase tracking-wider opacity-80 mt-0.5">/100</span>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Net Circular Value Breakdown Strip */}
        <div className="p-4 rounded-xl bg-emerald-950 text-white grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-300 block">Gross Value</span>
            <span className="text-base font-black text-white mt-0.5 block">
              ₹{netCircularValue.grossMaterialValue.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-300 block">- Freight Cost</span>
            <span className="text-base font-black text-rose-200 mt-0.5 block">
              ₹{netCircularValue.logisticsCost.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-300 block">- Pre-Processing</span>
            <span className="text-base font-black text-amber-200 mt-0.5 block">
              ₹{netCircularValue.estimatedProcessingCost.toLocaleString()}
            </span>
          </div>
          <div className="bg-emerald-800/60 rounded-lg p-1.5 border border-emerald-500/40">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Net Circular Value</span>
            <span className="text-lg font-black text-emerald-300 mt-0.5 block">
              ₹{netCircularValue.netValue.toLocaleString()}
            </span>
            <span className="text-[9px] text-emerald-200/80">{netCircularValue.marginPercentage}% Margin</span>
          </div>
        </div>

        {/* Transparent "Why This Buyer?" Explainable Checklist */}
        <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              WHY THIS BUYER? (Explainable Fit Criteria)
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Transparent Algorithm
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {whyThisBuyer.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xs p-2 rounded-lg bg-white border border-gray-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{item.factor}</span>
                    <span className="font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[11px]">
                      {item.score}%
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Logistics & Carbon Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
            <Truck className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Route & Vehicle</span>
              <span className="font-bold text-gray-900">{logistics.distanceKm} KM ({logistics.vehicleType})</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
            <Clock className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Estimated Transit</span>
              <span className="font-bold text-gray-900">{logistics.estimatedTransitHours} Hours Door-to-Door</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Net Carbon Avoided</span>
              <span className="font-bold text-emerald-700">{logistics.netCarbonAvoidedKg.toLocaleString()} KG CO2e</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {onInitiateDeal && (
          <div className="pt-2 flex gap-3">
            <button
              onClick={() => onInitiateDeal(buyer)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span>Connect & Initiate Commercial Deal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
