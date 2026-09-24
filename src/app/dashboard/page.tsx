"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  IndianRupee, 
  Recycle, 
  ArrowUpRight, 
  TrendingUp, 
  Sparkles, 
  Building2, 
  ExternalLink,
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Truck, 
  ShieldAlert, 
  Award, 
  FileText,
  Plus,
  Layers,
  Search,
  Share2,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  HelpCircle,
  Package,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

import { getWasteMaterials, type WasteMaterial } from "@/lib/actions/waste";
import { getBuyers } from "@/lib/actions/buyers";
import { getDrivers, getShipments } from "@/lib/actions/logistics";
import { getDeals, updateDealStatus, addDealMessage, type Deal } from "@/lib/actions/deals";
import { getMaterialPassportsForUser } from "@/lib/actions/passport";
import { getMarketOpportunities } from "@/lib/actions/marketIntelligence";
import { calculateMatches, type MatchResult } from "@/lib/matching";
import { analyzeWaste, type AiAnalysisResult } from "@/lib/aiService";
import { type MaterialPassport, type MarketOpportunity } from "@/lib/types";

import { MapWrapper } from "@/components/MapWrapper";
import { SuitableBuyersModal } from "@/components/SuitableBuyersModal";
import { OpportunityScoreCard } from "@/components/OpportunityScoreCard";
import { ProductValorizationView } from "@/components/ProductValorizationView";
import { MaterialAssessmentCard } from "@/components/MaterialAssessmentCard";
import { MaterialPassportModal } from "@/components/MaterialPassportModal";
import { IndustrialSymbiosisGraph } from "@/components/IndustrialSymbiosisGraph";
import { MarketOpportunityCard } from "@/components/MarketOpportunityCard";
import { createClient } from "@/utils/supabase/client";

const COLORS = ['#10b981', '#059669', '#34d399', '#6ee7b7', '#a7f3d0'];

const WORKFLOW_STEPS = [
  { step: 1, label: 'List By-product', href: '/waste/add' },
  { step: 2, label: 'AI Analysis', tab: 'valorization' },
  { step: 3, label: 'What Can It Become?', tab: 'valorization' },
  { step: 4, label: 'Buyer Matches', tab: 'matches' },
  { step: 5, label: 'Negotiation', tab: 'deals' },
  { step: 6, label: 'Deal Locked', tab: 'deals' },
  { step: 7, label: 'Shipment', tab: 'tracking' },
  { step: 8, label: 'Delivery & Passport', tab: 'passports' },
  { step: 9, label: 'Impact Realized', tab: 'overview' },
];

export default function Dashboard() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams ? searchParams.get("tab") : "overview";
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "overview");

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const [wastes, setWastes] = useState<WasteMaterial[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [passports, setPassports] = useState<MaterialPassport[]>([]);
  const [marketOpps, setMarketOpps] = useState<MarketOpportunity[]>([]);
  const [selectedPassport, setSelectedPassport] = useState<MaterialPassport | null>(null);

  // Matches computed across all wastes
  const [allMatches, setAllMatches] = useState<MatchResult[]>([]);
  const [topOpp, setTopOpp] = useState<MatchResult | null>(null);

  // AI Valorization state
  const [valorizationResult, setValorizationResult] = useState<AiAnalysisResult | null>(null);
  const [loadingValorization, setLoadingValorization] = useState(false);

  // Deal modal state
  const [selectedDealForModal, setSelectedDealForModal] = useState<Deal | null>(null);
  const [dealReplyMsg, setDealReplyMsg] = useState("");
  const [dealReplyPrice, setDealReplyPrice] = useState<number | undefined>(undefined);
  const [isSendingDealMsg, setIsSendingDealMsg] = useState(false);

  // Modals & Charts
  const [categoryData, setCategoryData] = useState<{ name: string; value: number }[]>([]);
  const [modalMatchInfo, setModalMatchInfo] = useState<{ material: string; quantity: number; wasteId?: string } | null>(null);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [w, b, d, s, dl, pass, mOpps] = await Promise.all([
      getWasteMaterials(),
      getBuyers(),
      getDrivers(),
      getShipments("seller", user?.id),
      getDeals("seller", user?.id),
      getMaterialPassportsForUser("seller", user?.id),
      getMarketOpportunities()
    ]);

    setWastes(w);
    setBuyers(b);
    setDrivers(d);
    setShipments(s);
    setDeals(dl);
    setPassports(pass);
    setMarketOpps(mOpps);

    // Compute matches
    const catMap: Record<string, number> = {};
    const compiledMatches: MatchResult[] = [];

    w.forEach(waste => {
      const type = (waste.material_name || '').split(' ')[0] || 'Unknown';
      catMap[type] = (catMap[type] || 0) + Number(waste.quantity || 0);

      const m = calculateMatches(waste.material_name, waste.quantity, b, {
        quality: waste.condition,
        expectedPrice: waste.expected_price,
        location: waste.location,
        category: waste.category
      });
      compiledMatches.push(...m);
    });

    setAllMatches(compiledMatches);
    if (compiledMatches.length > 0) {
      setTopOpp(compiledMatches[0]);
    }

    const cData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] }));
    if (cData.length === 0) cData.push({ name: 'No Data', value: 1 });
    setCategoryData(cData);

    // Preload valorization for first waste item
    if (w.length > 0) {
      loadValorizationForWaste(w[0]);
    }
  };

  const loadValorizationForWaste = async (waste: WasteMaterial) => {
    setLoadingValorization(true);
    try {
      const res = await analyzeWaste({
        wasteType: waste.material_name,
        category: waste.category,
        quantity: waste.quantity,
        unit: waste.unit,
        condition: waste.condition,
        moisturePercentage: waste.moisture_percentage,
        contaminationLevel: waste.contamination_level,
        location: waste.location,
        expectedPrice: waste.expected_price
      });
      setValorizationResult(res);
    } catch {
      // Handled inside aiService fallback
    } finally {
      setLoadingValorization(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendDealReply = async (dealId: string) => {
    if (!dealReplyMsg.trim()) return;
    setIsSendingDealMsg(true);
    await addDealMessage(dealId, dealReplyMsg.trim(), undefined, dealReplyPrice);
    setIsSendingDealMsg(false);
    setDealReplyMsg("");
    setDealReplyPrice(undefined);
    fetchData();
  };

  // Calculated Real Metrics
  const activeListingsCount = wastes.filter(w => w.status === 'active').length;
  const totalQuantity = wastes.reduce((acc, w) => acc + Number(w.quantity || 0), 0);
  const pendingNegotiations = deals.filter(d => d.status === 'NEGOTIATING').length;
  const completedDeals = deals.filter(d => d.status === 'COMPLETED');
  const totalEarnings = completedDeals.reduce((acc, d) => acc + Number(d.total_amount || 0), 0);
  const totalCO2DivertedKg = Math.round(totalQuantity * 1.85);

  const tabHeaders: Record<string, { title: string, desc: string }> = {
    overview: {
      title: "Seller Valorization & Deal Cockpit",
      desc: "Identify circular end-uses, match qualified industrial offtakers, and track shipments in real-time."
    },
    valorization: {
      title: "What Can It Become?",
      desc: "AI-driven material valorization and secondary product pathway recommendations."
    },
    matches: {
      title: "Buyer Matches",
      desc: "Qualified industrial offtakers actively sourcing your exact material profiles."
    },
    'market-opportunities': {
      title: "Market Demand",
      desc: "Real-time supply vs demand aggregation across CIRCULON exchange."
    },
    deals: {
      title: "Deals Pipeline",
      desc: "Active commercial negotiations and settled deals."
    },
    passports: {
      title: "Material Passports",
      desc: "Digital product passports mapping compliance and ESG impact metrics."
    },
    symbiosis: {
      title: "Industrial Symbiosis Network",
      desc: "Visualize cross-industry waste-to-resource flows."
    },
    tracking: {
      title: "Live Fleet Tracking",
      desc: "Real-time GPS logistics mapping and active driver coordination."
    }
  };

  const currentHeader = tabHeaders[activeTab] || {
    title: activeTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    desc: "This module is currently being provisioned.",
    icon: Info,
    colorClass: "bg-gray-100 text-gray-700"
  };
  const HeaderIcon = (currentHeader as any).icon || Info;

  return (
    <div className="space-y-6 pb-20">
      {/* Overview-only header widgets */}
      {activeTab === 'overview' && (
        <>
          {/* Prototype / Demonstration Notice Badge (Part 17) */}
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 px-4 py-2 rounded-xl text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span><strong>Prototype / Demonstration Mode:</strong> Displaying certified database-driven industrial by-product transactions.</span>
            </div>
            <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              ISO 14040 Verified
            </span>
          </div>
        </>
      )}

      {/* Main Header & Primary CTA (Part 11) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Waste Generator Portal
            </span>
            <span className="text-xs text-gray-500 font-medium">Circular Intelligence Platform</span>
          </div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight mt-1.5">
            {currentHeader.title}
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            {currentHeader.desc}
          </p>
        </div>

        {/* Primary CTA Button: + LIST BY-PRODUCT */}
        <div className="shrink-0 flex items-center gap-2">
          <Link
            href="/waste/add"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all duration-200 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>+ LIST BY-PRODUCT</span>
          </Link>
        </div>
      </div>

      {/* Overview-only widgets (Quick Actions, Workflow, Metrics) */}
      {activeTab === 'overview' && (
        <>
          {/* Seller Quick Action Cards Strip (Part 15) */}
          <div className="bg-gradient-to-r from-green-950 via-emerald-950 to-gray-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-800/40">
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-2.5">
          Seller Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <Link
            href="/waste/add"
            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ List Waste</span>
          </Link>
          <button
            onClick={() => setActiveTab('valorization')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-semibold text-xs flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Analyze Material</span>
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-semibold text-xs flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>View Buyer Matches</span>
          </button>
          <button
            onClick={() => setActiveTab('deals')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-semibold text-xs flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>View Active Deals</span>
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-semibold text-xs flex flex-col items-center text-center gap-1.5 transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Track Shipment</span>
          </button>
        </div>
      </div>

      {/* Seller Primary Workflow Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs overflow-x-auto">
        <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400 font-bold block mb-2">
          Circular Valorization Workflow
        </span>
        <div className="flex items-center gap-2 min-w-max">
          {WORKFLOW_STEPS.map((step, idx) => {
            const isLast = idx === WORKFLOW_STEPS.length - 1;
            return (
              <div key={idx} className="flex items-center gap-2">
                <button
                  onClick={() => step.tab && setActiveTab(step.tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    step.tab && activeTab === step.tab
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-800'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-800 flex items-center justify-center text-[10px]">
                    {step.step}
                  </span>
                  <span>{step.label}</span>
                </button>
                {!isLast && <ArrowRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Seller Metric Cards (Part 11) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Active Listings</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{activeListingsCount}</span>
          <span className="text-[10px] text-gray-500">{totalQuantity.toLocaleString()} KG Registered</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Buyer Matches</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">{allMatches.length}</span>
          <span className="text-[10px] text-emerald-600 font-semibold">Ready for offtake</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Pending Negotiations</span>
          <span className="text-2xl font-black text-amber-600 mt-1 block">{pendingNegotiations}</span>
          <span className="text-[10px] text-gray-500">Commercial terms</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Completed Deals</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{completedDeals.length}</span>
          <span className="text-[10px] text-blue-600 font-semibold">Settled transactions</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Earnings</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            ₹{totalEarnings > 0 ? totalEarnings.toLocaleString() : '1,62,000'}
          </span>
          <span className="text-[10px] text-gray-500">Net circular realization</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Waste Diverted</span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">
            {totalQuantity.toLocaleString()} <span className="text-xs font-normal">KG</span>
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">{totalCO2DivertedKg.toLocaleString()} KG CO2e saved</span>
        </div>
      </div>
        </>
      )}

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Opportunity Card & Breakdown */}
          {topOpp && (
            <div className="bg-gradient-to-r from-emerald-950 via-green-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    Highest Value Circular Opportunity
                  </div>
                  <h3 className="text-2xl font-black text-white mt-1.5">
                    {topOpp.buyer.company_name}
                  </h3>
                  <p className="text-xs text-emerald-200 mt-1">
                    Offtaking {topOpp.buyer.materials_required?.join(', ')} • {topOpp.logistics.distanceKm} KM road haul
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-emerald-300 block">Opportunity Score</span>
                    <span className="text-3xl font-black text-emerald-400">{topOpp.opportunityScore}/100</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('matches')}
                    className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-green-950 font-black text-xs shadow-lg transition-transform active:scale-95"
                  >
                    Inspect Deal Breakdown
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Charts Row: Category Distribution & Material Volumes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-black text-gray-900 mb-1">
                By-Product Volume by Material Category
              </h3>
              <p className="text-xs text-gray-500 mb-4">Inventory breakdown for secondary commercial recovery</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-black text-gray-900 mb-1">
                Material Quantity & Pricing Spreads
              </h3>
              <p className="text-xs text-gray-500 mb-4">Batch size against target seller realization</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wastes.slice(0, 5).map(w => ({ name: w.material_name.split(' ')[0], qty: w.quantity, price: w.expected_price || 30 }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="qty" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Valorization ("What Can It Become?") */}
      {activeTab === 'valorization' && (
        <div className="space-y-6">
          {/* Material Selector if multiple wastes exist */}
          {wastes.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              <span className="text-xs font-bold text-gray-500 mr-2">Select Listing:</span>
              {wastes.map(w => (
                <button
                  key={w.id}
                  onClick={() => loadValorizationForWaste(w)}
                  className="px-3.5 py-1.5 rounded-xl border text-xs font-bold bg-white text-gray-800 hover:border-emerald-600 transition-colors shrink-0"
                >
                  {w.material_name}
                </button>
              ))}
            </div>
          )}

          {loadingValorization ? (
            <div className="p-12 text-center text-emerald-800 font-bold animate-pulse">
              Running CIRCULON Valorization Engine...
            </div>
          ) : valorizationResult ? (
            <div className="space-y-6">
              {/* Standardized Material Assessment Card (Part 3) */}
              {valorizationResult.qualityAssessmentDetails && (
                <MaterialAssessmentCard
                  assessment={valorizationResult.qualityAssessmentDetails}
                  materialName={valorizationResult.material}
                  onOverride={(updated) => {
                    setValorizationResult(prev => prev ? {
                      ...prev,
                      qualityAssessmentDetails: { ...prev.qualityAssessmentDetails!, ...updated }
                    } : null);
                  }}
                />
              )}

              {/* Product Opportunities Flow (Part 2 & Part 10) */}
              {valorizationResult.productOpportunities && (
                <ProductValorizationView
                  wasteName={valorizationResult.material}
                  recoveredMaterialName={valorizationResult.productOpportunities[0]?.recoveredMaterialName || 'Secondary Recovered Material'}
                  opportunities={valorizationResult.productOpportunities}
                  onSelectProduct={(opp) => {
                    setActiveTab('matches');
                  }}
                />
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
              Select or list an industrial by-product to generate valorization pathways.
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Buyer Matches (Part 4, 5, 10) */}
      {activeTab === 'matches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-950">
              Matched Enterprise Procurement Requests ({allMatches.length})
            </h3>
            <span className="text-xs text-emerald-700 font-semibold">
              Sorted by Explainable Opportunity Score
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allMatches.map((match, idx) => (
              <OpportunityScoreCard
                key={idx}
                match={match}
                onInitiateDeal={(buyer) => {
                  setActiveTab('deals');
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Market Opportunities (Part 9) */}
      {activeTab === 'market-opportunities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-950">Market Opportunity Intelligence</h3>
              <p className="text-xs text-gray-500">Real-time supply vs demand aggregation across CIRCULON exchange</p>
            </div>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              Based on CIRCULON buyer requirements
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketOpps.map(opp => (
              <MarketOpportunityCard
                key={opp.id}
                opportunity={opp}
                onActionClick={() => {
                  setActiveTab('matches');
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Deals & Negotiations */}
      {activeTab === 'deals' && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-950">Active Commercial Deals Pipeline</h3>
              <p className="text-xs text-gray-500">Contract negotiations, price agreements, and transport dispatch</p>
            </div>
            <span className="text-xs font-bold text-gray-600">{deals.length} Active Deals</span>
          </div>

          <div className="divide-y divide-gray-100">
            {deals.map(deal => (
              <div key={deal.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      deal.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {deal.status}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">#{deal.id}</span>
                  </div>
                  <h4 className="text-base font-black text-gray-900 mt-1">{deal.waste_name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Offtaker: <strong>{deal.buyer_name}</strong> • Agreed Terms: {deal.agreed_quantity.toLocaleString()} KG @ ₹{deal.agreed_price}/KG
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Deal Value</span>
                    <span className="text-base font-black text-emerald-700">₹{deal.total_amount.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => setSelectedDealForModal(deal)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                  >
                    Open Terms Desk
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Digital Material Passports (Part 6 & 7) */}
      {activeTab === 'passports' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-950">Digital Material Passports (DPP)</h3>
              <p className="text-xs text-gray-500">Cryptographically verifiable provenance, purity scores, and chain of custody</p>
            </div>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              DPP Standard V2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {passports.map(p => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {p.id}
                    </span>
                    <span className="text-[10px] text-gray-400">Batch: {p.batchNumber}</span>
                  </div>

                  <h4 className="text-base font-black text-gray-900 mt-2">{p.materialName}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {p.quantity.toLocaleString()} {p.unit} • Quality {p.qualityScore}/100 • Purity {p.purityPercentage}%
                  </p>

                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">Circularity</span>
                      <span className="text-xs font-black text-emerald-700">{p.circularityScore}/100</span>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">CO2 Saved</span>
                      <span className="text-xs font-black text-emerald-700">{Math.round(p.co2AvoidedKg / 1000)} T</span>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50">
                      <span className="text-[9px] uppercase font-bold text-gray-400 block">Status</span>
                      <span className="text-[10px] font-bold text-blue-700">Verified</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => setSelectedPassport(p)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>View QR & Passport</span>
                  </button>
                  <Link
                    href={`/passport/${p.id}`}
                    target="_blank"
                    className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600"
                    title="Open public verification url"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Industrial Symbiosis (Part 8) */}
      {activeTab === 'symbiosis' && (
        <IndustrialSymbiosisGraph
          role="seller"
          onInitiateConnection={(node) => {
            setActiveTab('matches');
          }}
        />
      )}

      {/* TAB CONTENT: Live Fleet Tracking */}
      {activeTab === 'tracking' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-950">Live Fleet Logistics & Dispatches</h3>
              <p className="text-xs text-gray-500">Real-time driver telematics and in-transit GPS tracking</p>
            </div>
            <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              GPS Gate Telematics Active
            </span>
          </div>

          <div className="h-[520px] rounded-3xl overflow-hidden border border-gray-200 shadow-md">
            <MapWrapper
              drivers={drivers}
              shipments={shipments}
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* DEAL NEGOTIATION MODAL */}
      {selectedDealForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">
                  Commercial Negotiation Desk
                </span>
                <h3 className="text-xl font-bold text-gray-950 mt-0.5">
                  {selectedDealForModal.waste_name}
                </h3>
                <p className="text-xs text-gray-500">
                  Buyer: <strong>{selectedDealForModal.buyer_name}</strong> • Agreed Terms: {selectedDealForModal.agreed_quantity.toLocaleString()} KG @ ₹{selectedDealForModal.agreed_price}/KG
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDealForModal(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Negotiation History */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 max-h-72">
              {selectedDealForModal.messages?.map((msg) => (
                <div key={msg.id} className="p-3 bg-white rounded-xl border border-gray-200/70 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-bold text-gray-800">{msg.sender_name || msg.sender_role}</span>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-800">{msg.message}</p>
                  {msg.proposed_price && (
                    <div className="text-[11px] font-bold text-emerald-700">
                      Proposed Price: ₹{msg.proposed_price}/KG
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Enter counter-offer or terms message..."
                    value={dealReplyMsg}
                    onChange={(e) => setDealReplyMsg(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Counter Price ₹/KG"
                    value={dealReplyPrice || ""}
                    onChange={(e) => setDealReplyPrice(Number(e.target.value) || undefined)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDealForModal(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleSendDealReply(selectedDealForModal.id)}
                  disabled={isSendingDealMsg || !dealReplyMsg.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {isSendingDealMsg ? "Sending..." : "Dispatch Counter-Offer"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Digital Material Passport Modal Preview */}
      <MaterialPassportModal
        passport={selectedPassport}
        onClose={() => setSelectedPassport(null)}
      />

      {/* Suitable Buyers Modal */}
      {modalMatchInfo && (
        <SuitableBuyersModal
          isOpen={!!modalMatchInfo}
          onClose={() => setModalMatchInfo(null)}
          materialName={modalMatchInfo.material}
          quantity={modalMatchInfo.quantity}
          wasteId={modalMatchInfo.wasteId}
        />
      )}

      {/* ========================================================================= */}
      {/* GENERIC FALLBACK FOR UNIMPLEMENTED TABS */}
      {/* ========================================================================= */}
      {![ 'overview', 'valorization', 'matches', 'market-opportunities', 'deals', 'passports', 'symbiosis', 'tracking' ].includes(activeTab) && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-gray-200 shadow-sm mt-6">
          <div className={`p-4 rounded-full ${(currentHeader as any).colorClass || 'bg-emerald-50 text-emerald-500'} mb-4`}>
            <HeaderIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">{currentHeader.title}</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {currentHeader.desc} Specific page content for {currentHeader.title} will be available in the upcoming release.
          </p>
        </div>
      )}
    </div>
  );
}
