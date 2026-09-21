"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { IndianRupee, Recycle, ArrowUpRight, TrendingUp, Sparkles, Building2, ExternalLink } from 'lucide-react';
import { getWasteMaterials } from "@/lib/actions/waste";
import { getBuyers } from "@/lib/actions/buyers";
import { calculateMatches } from "@/lib/matching";
import { motion } from "framer-motion";
import { SuitableBuyersModal } from "@/components/SuitableBuyersModal";
import Link from "next/link";
import { MapWrapper } from "@/components/MapWrapper";
import { getDrivers, getShipments } from "@/lib/actions/logistics";
import { getDeals, updateDealStatus, addDealMessage, type Deal } from "@/lib/actions/deals";
import { createClient } from "@/utils/supabase/client";
import { CheckCircle2, Clock, MessageSquare, Truck, ShieldAlert, Award, FileText } from 'lucide-react';

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#bbf7d0'];

export default function Dashboard() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams ? searchParams.get("tab") : "overview";
  const [activeTab, setActiveTab] = useState<"overview" | "deals" | "tracking">(
    (tabFromUrl as any) || "overview"
  );

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl as any);
    }
  }, [tabFromUrl]);
  const [wastes, setWastes] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealForModal, setSelectedDealForModal] = useState<Deal | null>(null);
  const [dealReplyMsg, setDealReplyMsg] = useState("");
  const [dealReplyPrice, setDealReplyPrice] = useState<number | undefined>(undefined);
  const [isSendingDealMsg, setIsSendingDealMsg] = useState(false);

  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const [potentialRevenue, setPotentialRevenue] = useState(0);
  const [topOpp, setTopOpp] = useState<any>(null);
  
  const [categoryData, setCategoryData] = useState<{name: string, value: number}[]>([]);
  const [modalMatchInfo, setModalMatchInfo] = useState<{ material: string, quantity: number, wasteId?: string } | null>(null);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const [w, b, d, s, dl] = await Promise.all([
      getWasteMaterials(),
      getBuyers(),
      getDrivers(),
      getShipments("seller", user?.id),
      getDeals("seller", user?.id)
    ]);
    setWastes(w);
    setBuyers(b);
    setDrivers(d);
    setShipments(s);
    setDeals(dl);

    let qty = 0;
    const catMap: Record<string, number> = {};
    let matchesCount = 0;
    let maxRevenue = 0;
    let bestMatch: any = null;

    w.forEach(waste => {
      qty += waste.quantity;
      
      const type = waste.material_name.split(' ')[0] || 'Unknown';
      catMap[type] = (catMap[type] || 0) + waste.quantity;

      // Find matches for this waste
      const matches = calculateMatches(waste.material_name, waste.quantity, b);
      if (matches.length > 0) {
        matchesCount += matches.length;
        
        // Add highest gross value to potential revenue (optimistic projection)
        maxRevenue += matches[0].grossValue;

        if (!bestMatch || matches[0].opportunityScore > bestMatch.score) {
          bestMatch = {
            id: waste.id,
            waste: waste.material_name,
            buyer: matches[0].buyer.company_name,
            score: matches[0].opportunityScore,
            material: waste.material_name,
            quantity: waste.quantity
          };
        }
      }
    });

    setTotalQuantity(qty);
    setTotalMatches(matchesCount);
    setPotentialRevenue(maxRevenue);
    setTopOpp(bestMatch);

    const cData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] }));
    if(cData.length === 0) cData.push({name: 'No Data', value: 1});
    setCategoryData(cData);
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
    await fetchData();
    // update local modal view
    const refreshed = await getDeals("seller");
    const d = refreshed.find(x => x.id === dealId);
    if (d) setSelectedDealForModal(d);
  };

  const handleUpdateDealStatus = async (dealId: string, status: any) => {
    await updateDealStatus(dealId, status);
    await fetchData();
    const refreshed = await getDeals("seller");
    const d = refreshed.find(x => x.id === dealId);
    if (d) setSelectedDealForModal(d);
  };

  // Metrics
  const completedDeals = deals.filter(d => d.status === 'COMPLETED');
  const activeDeals = deals.filter(d => d.status !== 'COMPLETED' && d.status !== 'CANCELLED');
  const totalDivertedKg = deals.filter(d => d.status === 'COMPLETED').reduce((acc, curr) => acc + (curr.landfill_diverted_kg || 0), 0);
  const totalCo2Saved = deals.filter(d => d.status === 'COMPLETED').reduce((acc, curr) => acc + (curr.co2_saved_kg || 0), 0);

  // Mock revenue trend based on dynamic potential revenue
  const revenueData = [
    { month: 'Jan', value: potentialRevenue * 0.2 },
    { month: 'Feb', value: potentialRevenue * 0.4 },
    { month: 'Mar', value: potentialRevenue * 0.6 },
    { month: 'Apr', value: potentialRevenue * 0.8 },
    { month: 'May', value: potentialRevenue },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
              Waste Generator Portal
            </span>
            <span className="text-xs text-gray-500 font-semibold">
              Circular Economy Network
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-1.5">Seller Dashboard</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Monitor byproduct inventory, AI buyer compatibility, active negotiations, and verified landfill diversion.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/waste/add"
            className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            + Add Waste Listing
          </Link>
          <Link
            href="/waste"
            className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-800 font-bold text-xs rounded-xl border border-gray-200 transition"
          >
            Manage Listings ({wastes.length})
          </Link>
        </div>
      </div>



      {activeTab === "tracking" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mt-4">
          <h2 className="text-xl font-bold mb-4">My Shipments Live Map</h2>
          <MapWrapper drivers={drivers} shipments={shipments} />
        </div>
      )}

      {activeTab === "overview" && (
        <>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Waste Listed</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{totalQuantity.toLocaleString()} <span className="text-sm font-normal text-gray-500">KG</span></h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <Recycle className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
            <span className="font-bold text-green-700">{wastes.length} active listings</span> across {categoryData.length} streams
          </div>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Verified Landfill Diversion</p>
              <h3 className="text-3xl font-extrabold text-emerald-800 mt-2">
                {(totalDivertedKg / 1000).toFixed(1)} <span className="text-sm font-normal text-gray-500">MT</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Award className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
            <span className="font-bold text-emerald-700">{completedDeals.length} completed transactions</span> • {totalCo2Saved.toLocaleString()} KG CO₂e saved
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Commercial Deals</p>
              <h3 className="text-3xl font-extrabold text-gray-900 mt-2 flex items-baseline gap-2">
                {activeDeals.length} <span className="text-sm font-normal text-amber-600">In Progress</span>
              </h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <MessageSquare className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500 flex items-center gap-1.5">
            <button 
              type="button" 
              onClick={() => setActiveTab("deals")} 
              className="text-amber-700 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              Open Deals Pipeline →
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          onClick={() => {
            if (topOpp) {
              setModalMatchInfo({ material: topOpp.material, quantity: topOpp.quantity, wasteId: topOpp.id });
            }
          }}
          className="bg-gradient-to-br from-green-700 via-emerald-800 to-green-950 p-6 rounded-2xl shadow-md text-white flex flex-col justify-between hover:shadow-xl transition-all cursor-pointer group"
        >
          <div>
            <div className="flex items-center justify-between">
              <p className="text-green-200 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-green-300" />
                Top Commercial Match
              </p>
              <span className="text-[11px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                Direct
              </span>
            </div>
            <h3 className="text-lg font-bold mt-2 line-clamp-1">{topOpp?.waste || 'No Active Waste'}</h3>
            <p className="text-xs text-green-100/80 mt-1 truncate">Lead Buyer: <strong>{topOpp?.buyer || 'N/A'}</strong></p>
          </div>
          <div className="mt-4 flex justify-between items-end pt-3 border-t border-white/10">
            <div>
              <div className="text-[10px] text-green-200 uppercase font-semibold">Match Score</div>
              <div className="text-2xl font-black text-white">{topOpp?.score || 0}<span className="text-sm font-normal text-green-200">/100</span></div>
            </div>
            {topOpp && (
              <span className="text-xs font-bold text-emerald-200 group-hover:text-white group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                Suitable Buyers →
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Active Listings Quick Match Section */}
      {wastes.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-600" />
                Instant Buyer Discovery for Active Listings
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Click "Find Suitable Buyers" on any material to view verified contact details, pricing, and company background.
              </p>
            </div>
            <Link href="/waste" className="text-xs font-bold text-green-700 hover:underline">
              View All ({wastes.length}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wastes.slice(0, 3).map((w) => (
              <div key={w.id} className="p-4 rounded-xl border border-gray-200/80 bg-gray-50/50 hover:bg-white hover:border-emerald-300 transition-all flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-950 line-clamp-1">{w.material_name}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Volume: <strong>{w.quantity.toLocaleString()} KG</strong> • Location: {w.location}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setModalMatchInfo({ material: w.material_name, quantity: w.quantity, wasteId: w.id })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Find Suitable Buyers
                  </button>
                  <Link
                    href={`/matches?materialType=${encodeURIComponent(w.material_name)}&quantity=${w.quantity}&wasteId=${w.id}`}
                    className="text-[11px] text-gray-400 hover:text-gray-700"
                  >
                    Page ↗
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity Stream */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-700" />
              Recent Circular Activity Feed
            </h3>
            <p className="text-xs text-gray-500">Live operational events, buyer interactions, and pickup dispatches</p>
          </div>
          <span className="text-xs font-bold text-green-700 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
            Realtime
          </span>
        </div>

        <div className="divide-y divide-gray-100 text-xs">
          {deals.slice(0, 3).map((deal) => (
            <div key={deal.id} className="py-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                  {deal.status === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Truck className="w-4 h-4 text-blue-600" />}
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    Deal with {deal.buyer_name} ({deal.status.replace('_', ' ')})
                  </div>
                  <div className="text-gray-500 text-[11px] mt-0.5">
                    {deal.waste_name} • <strong>{deal.agreed_quantity.toLocaleString()} KG</strong> @ ₹{deal.agreed_price}/KG (₹{deal.total_amount.toLocaleString()})
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDealForModal(deal);
                  setActiveTab("deals");
                }}
                className="text-xs font-bold text-green-700 hover:underline shrink-0"
              >
                Inspect Deal →
              </button>
            </div>
          ))}

          {wastes.slice(0, 2).map((w) => (
            <div key={w.id} className="py-3 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Recycle className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-gray-900">
                    Material Inventory Listed: {w.material_name}
                  </div>
                  <div className="text-gray-500 text-[11px] mt-0.5">
                    Quantity: {w.quantity.toLocaleString()} KG • Location: {w.location}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-gray-400 shrink-0">
                {new Date(w.created_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Waste by Category (KG)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(((percent as number) || 0) * 100).toFixed(0)}%`}
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

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Potential Revenue Trend (₹)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <RechartsTooltip cursor={{fill: '#f0fdf4'}} />
                <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      </>
      )}

      {/* TAB 2: COMMERCIAL DEALS & NEGOTIATION */}
      {activeTab === "deals" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-gray-950">Commercial Deals & Negotiation Pipeline</h2>
              <p className="text-xs text-gray-500 mt-1">
                Track pricing negotiations, dispatch logistics drivers, and monitor delivery confirmation with verified buyers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-green-50 text-green-800 border border-green-200 px-3 py-1.5 rounded-xl">
                {deals.length} Recorded Commercial Deals
              </span>
            </div>
          </div>

          {deals.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-gray-200 shadow-xs">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No active commercial deals yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Initiate negotiation with buyers directly from "Find Suitable Buyers" on your waste listings.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {deals.map((deal) => {
                const isCompleted = deal.status === 'COMPLETED';
                const isPickup = deal.status === 'PICKUP_SCHEDULED';
                const isAgreed = deal.status === 'AGREED';
                const isNegotiating = deal.status === 'NEGOTIATING';

                return (
                  <div
                    key={deal.id}
                    className={`bg-white rounded-2xl border p-6 transition-all shadow-xs hover:shadow-md ${
                      isCompleted ? 'border-green-300 bg-green-50/20' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-gray-100">
                      <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isCompleted ? 'bg-green-100 text-green-800 border border-green-300' :
                            isPickup ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            isAgreed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {deal.status.replace('_', ' ')}
                          </span>

                          <span className="text-xs font-semibold text-gray-500">
                            Deal ID: <span className="font-mono text-gray-700">{deal.id}</span>
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-950 mt-2">
                          {deal.waste_name}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-600">
                          <span>Buyer: <strong>{deal.buyer_name}</strong></span>
                          <span>•</span>
                          <span>Agreed Volume: <strong>{deal.agreed_quantity.toLocaleString()} KG</strong></span>
                          <span>•</span>
                          <span>Rate: <strong>₹{deal.agreed_price}/KG</strong></span>
                          <span>•</span>
                          <span>Gross Value: <strong className="text-green-700">₹{deal.total_amount.toLocaleString()}</strong></span>
                        </div>
                      </div>

                      {/* Financial / Impact Summary */}
                      <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 sm:text-right shrink-0">
                        <div className="text-[10px] uppercase font-bold text-emerald-800">Total Value</div>
                        <div className="text-xl font-black text-green-800 flex items-center sm:justify-end">
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {deal.total_amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-700 mt-0.5">
                          CO₂e Saved: <strong>{deal.co2_saved_kg.toLocaleString()} KG</strong>
                        </div>
                      </div>
                    </div>

                    {/* Logistics & Driver Details (If scheduled) */}
                    {deal.driver_info && (
                      <div className="my-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 text-xs flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-green-700" />
                          <div>
                            <strong>Assigned Logistics Driver:</strong> {deal.driver_info.driver_name} ({deal.driver_info.vehicle_number}) • {deal.driver_info.driver_phone}
                          </div>
                        </div>
                        <div className="text-gray-500">
                          Pickup Slot: <strong>{deal.driver_info.pickup_date}</strong>
                        </div>
                      </div>
                    )}

                    {/* Recent Message Snippet */}
                    {deal.messages && deal.messages.length > 0 && (
                      <div className="my-3 text-xs bg-gray-50/70 p-3 rounded-xl border border-gray-100 text-gray-700">
                        <span className="font-bold text-gray-900">Latest message: </span>
                        <span className="italic">"{deal.messages[deal.messages.length - 1].message}"</span>
                        <span className="text-[10px] text-gray-400 ml-2">
                          — {deal.messages[deal.messages.length - 1].sender_name || 'Counterparty'}
                        </span>
                      </div>
                    )}

                    {/* Action Toolbar */}
                    <div className="pt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isNegotiating && (
                          <button
                            type="button"
                            onClick={() => handleUpdateDealStatus(deal.id, 'AGREED')}
                            className="px-3.5 py-1.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition cursor-pointer"
                          >
                            ✓ Agree to Terms
                          </button>
                        )}
                        {isAgreed && (
                          <button
                            type="button"
                            onClick={() => handleUpdateDealStatus(deal.id, 'PICKUP_SCHEDULED')}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                          >
                            Schedule Factory Pickup
                          </button>
                        )}
                        {isPickup && (
                          <button
                            type="button"
                            onClick={() => handleUpdateDealStatus(deal.id, 'IN_TRANSIT')}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer"
                          >
                            Confirm Driver Loaded (In Transit)
                          </button>
                        )}
                        {deal.status === 'DELIVERED' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateDealStatus(deal.id, 'COMPLETED')}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer"
                          >
                            Mark Deal Completed & Record Impact
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDealForModal(deal)}
                        className="px-4 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-green-700" />
                        Negotiate & Messages ({deal.messages?.length || 0})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DEAL NEGOTIATION MODAL */}
      {selectedDealForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-green-700 tracking-wider">
                  Commercial Negotiation Desk
                </span>
                <h3 className="text-xl font-bold text-gray-950 mt-0.5">
                  {selectedDealForModal.waste_name}
                </h3>
                <p className="text-xs text-gray-500">
                  Counterparty: <strong>{selectedDealForModal.buyer_name}</strong> • Current Terms: {selectedDealForModal.agreed_quantity.toLocaleString()} KG @ ₹{selectedDealForModal.agreed_price}/KG
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
                    <div className="text-[11px] font-bold text-green-700">
                      Proposed Price: ₹{msg.proposed_price}/KG
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Send Reply */}
            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Enter counter-offer or terms message..."
                    value={dealReplyMsg}
                    onChange={(e) => setDealReplyMsg(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-600 text-xs"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Counter Price ₹/KG"
                    value={dealReplyPrice || ""}
                    onChange={(e) => setDealReplyPrice(Number(e.target.value) || undefined)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-green-600 text-xs"
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
                  className="px-5 py-2 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {isSendingDealMsg ? "Sending..." : "Dispatch Counter-Offer"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* In-place Suitable Buyers Modal (No page redirect!) */}
      {modalMatchInfo && (
        <SuitableBuyersModal
          isOpen={!!modalMatchInfo}
          onClose={() => setModalMatchInfo(null)}
          materialName={modalMatchInfo.material}
          quantity={modalMatchInfo.quantity}
          wasteId={modalMatchInfo.wasteId}
        />
      )}
    </div>
  );
}
