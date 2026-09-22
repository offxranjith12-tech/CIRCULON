"use client";

import { useState } from "react";
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  Factory, 
  Building2, 
  CheckCircle2, 
  HelpCircle, 
  IndianRupee, 
  TrendingUp, 
  ShieldCheck, 
  Cpu, 
  Info,
  ChevronDown,
  ChevronUp,
  Package,
  Wrench,
  Leaf
} from "lucide-react";
import { type ProductOpportunity } from "@/lib/types";

interface ProductValorizationViewProps {
  wasteName: string;
  recoveredMaterialName: string;
  opportunities: ProductOpportunity[];
  onSelectProduct?: (opp: ProductOpportunity) => void;
}

export function ProductValorizationView({
  wasteName,
  recoveredMaterialName,
  opportunities,
  onSelectProduct
}: ProductValorizationViewProps) {
  const [expandedReasonId, setExpandedReasonId] = useState<string | null>(null);
  const [filterIndustry, setFilterIndustry] = useState<string>("all");

  const industries = Array.from(new Set(opportunities.map(o => o.potentialIndustry)));

  const filteredOpportunities = opportunities.filter(o => {
    if (filterIndustry === "all") return true;
    return o.potentialIndustry === filterIndustry;
  });

  return (
    <div className="space-y-6">
      {/* Visual Valorization Pipeline Architecture Header */}
      <div className="bg-gradient-to-br from-emerald-900 via-green-950 to-gray-950 text-white rounded-2xl p-6 shadow-lg border border-emerald-800/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-800/50 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              Circular Valorization Engine
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              What Can This Material Become?
            </h2>
            <p className="text-xs text-emerald-200/80 mt-1 max-w-2xl">
              Transforming low-margin industrial by-products into high-value secondary commodities and precision manufacturing inputs through deterministic feasibility scoring.
            </p>
          </div>

          {/* Valorization Flow Pathway Breadcrumbs */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2 text-xs overflow-x-auto">
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Input Waste</span>
              <span className="font-bold text-white whitespace-nowrap">{wasteName}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Recovered Feedstock</span>
              <span className="font-bold text-emerald-200 whitespace-nowrap">{recoveredMaterialName}</span>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Valorized End-Use</span>
              <span className="font-bold text-white whitespace-nowrap">{opportunities.length} Product Streams</span>
            </div>
          </div>
        </div>

        {/* Filter by Industry */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-emerald-300 font-semibold mr-1">Target Industry:</span>
          <button
            onClick={() => setFilterIndustry("all")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
              filterIndustry === "all" ? "bg-emerald-500 text-green-950" : "bg-white/10 text-emerald-200 hover:bg-white/20"
            }`}
          >
            All Sectors ({opportunities.length})
          </button>
          {industries.map(ind => (
            <button
              key={ind}
              onClick={() => setFilterIndustry(ind)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                filterIndustry === ind ? "bg-emerald-500 text-green-950" : "bg-white/10 text-emerald-200 hover:bg-white/20"
              }`}
            >
              {ind}
            </button>
          ))}
        </div>
      </div>

      {/* Product Opportunities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredOpportunities.map((opp) => {
          const isExpanded = expandedReasonId === opp.id;
          return (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-gray-200 hover:border-emerald-500/60 shadow-sm hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
            >
              <div>
                {/* Header: Product Name & Feasibility */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {opp.potentialIndustry}
                    </span>
                    <h3 className="text-lg font-black text-gray-950 tracking-tight mt-1.5">
                      {opp.productName}
                    </h3>
                    <p className="text-xs text-gray-600 font-medium mt-1">
                      {opp.whySuitable}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Feasibility</span>
                    <span className="text-xl font-black text-emerald-600">
                      {opp.approximateFeasibility}%
                    </span>
                  </div>
                </div>

                {/* Key Metrics: Processing, Required Quality, Price Range */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100">
                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Required Quality</span>
                    <span className="text-xs font-bold text-gray-900 mt-0.5 block">{opp.requiredQuality}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block">Est. Market Value</span>
                    <span className="text-xs font-bold text-emerald-700 mt-0.5 block">
                      ₹{opp.estimatedMarketValueMin} – ₹{opp.estimatedMarketValueMax} / kg
                    </span>
                  </div>
                </div>

                {/* Potential Buyer Category */}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span><strong>Target Buyer:</strong> {opp.potentialBuyerCategory}</span>
                </div>

                {/* Required Processing Steps */}
                <div className="mt-3">
                  <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1.5">
                    Manufacturing & Processing Route:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.requiredProcessing.map((step, sIdx) => (
                      <span key={sIdx} className="text-[11px] font-medium bg-gray-100 text-gray-800 px-2 py-0.5 rounded-md border border-gray-200">
                        {step}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Explainability Accordion: "Why was this product recommended?" */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setExpandedReasonId(isExpanded ? null : opp.id)}
                    className="w-full flex items-center justify-between text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                      WHY WAS THIS PRODUCT RECOMMENDED?
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs space-y-2">
                      <div className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">
                        Transparent Algorithmic Match Proof
                      </div>
                      <ul className="space-y-1">
                        {opp.explainabilityReasons.map((reason, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-2 text-emerald-900 text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="text-[10px] text-emerald-700/80 pt-1 border-t border-emerald-200">
                        Economic ranking score: {opp.economicRankingScore}/100 based on virgin substitution parity and regional processing capacity.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              {onSelectProduct && (
                <div className="mt-5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => onSelectProduct(opp)}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Target {opp.productName} Offtakers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
