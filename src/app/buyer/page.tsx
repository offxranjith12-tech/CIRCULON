"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ShoppingBag, 
  TrendingDown, 
  Sparkles, 
  Recycle, 
  MapPin, 
  Package, 
  Inbox, 
  Leaf, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ArrowRight,
  Plus,
  X,
  Send,
  Loader2,
  Tag,
  Filter,
  Check,
  Bookmark,
  BookmarkCheck,
  Search,
  SlidersHorizontal,
  IndianRupee,
  MessageSquare,
  Truck,
  Award,
  AlertCircle,
  FileText
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { getIncomingRequests, updateRequestStatus, sendBuyerInquiry } from "@/lib/actions/connections";
import { getMarketplaceWaste } from "@/lib/actions/waste";
import { 
  getBuyerProfileAndRequirements, 
  saveBuyerRequirements,
  getDetailedBuyerRequirements,
  addDetailedBuyerRequirement,
  deleteDetailedBuyerRequirement,
  getSavedListingIds,
  toggleSaveListing,
  findAIMatchesForBuyer,
  type BuyerRequirement
} from "@/lib/actions/buyers";
import { getDeals, createDeal, addDealMessage, updateDealStatus, type Deal } from "@/lib/actions/deals";
import { getDrivers, getShipments } from "@/lib/actions/logistics";
import { MapWrapper } from "@/components/MapWrapper";
import { createClient } from "@/utils/supabase/client";

export default function BuyerDashboard() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams ? searchParams.get("tab") : "overview";
  const [activeTab, setActiveTab] = useState<"overview" | "requirements" | "marketplace" | "ai-finder" | "deals" | "saved" | "tracking">(
    (tabFromUrl as any) || "overview"
  );

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl as any);
    }
  }, [tabFromUrl]);
  const [buyerInfo, setBuyerInfo] = useState<any>(null);
  const [requiredMaterials, setRequiredMaterials] = useState<string[]>([]);
  const [detailedReqs, setDetailedReqs] = useState<BuyerRequirement[]>([]);
  const [newMaterialInput, setNewMaterialInput] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const [wasteListings, setWasteListings] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [savedListingIds, setSavedListingIds] = useState<string[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter mode in marketplace tab
  const [filterMode, setFilterMode] = useState<"all" | "matched">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [qualityFilter, setQualityFilter] = useState("all");
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  // New Detailed Requirement Form Modal State
  const [showAddReqModal, setShowAddReqModal] = useState(false);
  const [newReqForm, setNewReqForm] = useState({
    material_name: "",
    category: "Textile",
    min_quantity: 500,
    max_quantity: 10000,
    preferred_quality: "High",
    max_price: 40,
    target_fulfillment_date: "",
    notes: ""
  });
  const [isAddingReq, setIsAddingReq] = useState(false);

  // AI Match Finder State
  const [aiPrompt, setAiPrompt] = useState("");
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [aiResults, setAiResults] = useState<{
    matches: any[];
    analysis: string;
    queryParsed: any;
  } | null>(null);

  // Deals / Negotiation Modal State
  const [selectedDealForModal, setSelectedDealForModal] = useState<Deal | null>(null);
  const [dealReplyMsg, setDealReplyMsg] = useState("");
  const [dealReplyPrice, setDealReplyPrice] = useState<number | undefined>(undefined);
  const [isSendingDealMsg, setIsSendingDealMsg] = useState(false);

  // Direct Deal Initiator Modal (from marketplace or AI finder)
  const [dealInitiateListing, setDealInitiateListing] = useState<any | null>(null);
  const [dealInitQty, setDealInitQty] = useState<number>(1000);
  const [dealInitPrice, setDealInitPrice] = useState<number>(35);
  const [dealInitNotes, setDealInitNotes] = useState("");
  const [isSubmittingDeal, setIsSubmittingDeal] = useState(false);

  // Inquiring modal / state
  const [inquiryModalItem, setInquiryModalItem] = useState<any | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSendingInquiry, setIsSendingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState<string | null>(null);
  const [isPendingReqSave, startReqSaveTransition] = useTransition();

  const loadBuyerData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const [buyerProfile, incomingReqs, marketWastes, d, s, dReqs, savedIds, dl] = await Promise.all([
        getBuyerProfileAndRequirements(),
        getIncomingRequests(),
        getMarketplaceWaste(),
        getDrivers(),
        getShipments("buyer", user?.id),
        getDetailedBuyerRequirements(),
        getSavedListingIds(),
        getDeals("buyer", user?.id)
      ]);

      if (buyerProfile) {
        setBuyerInfo(buyerProfile);
        setRequiredMaterials(buyerProfile.materials || []);
      }
      setRequests(incomingReqs || []);
      setWasteListings(marketWastes || []);
      setDrivers(d);
      setShipments(s);
      setDetailedReqs(dReqs);
      setSavedListingIds(savedIds);
      setDeals(dl);
    } catch (err) {
      console.error("Error loading buyer dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBuyerData();
  }, []);

  // Material matching logic
  const checkCompatibility = (materialName: string, buyerReqs: string[]) => {
    const matLower = (materialName || "").toLowerCase();
    for (const req of buyerReqs) {
      const reqLower = req.toLowerCase();
      if (
        matLower.includes(reqLower) || 
        reqLower.includes(matLower) ||
        (reqLower.includes("cotton") && matLower.includes("cotton")) ||
        (reqLower.includes("plastic") && (matLower.includes("plastic") || matLower.includes("hdpe") || matLower.includes("pet") || matLower.includes("regrind"))) ||
        (reqLower.includes("hdpe") && (matLower.includes("hdpe") || matLower.includes("polyethylene"))) ||
        (reqLower.includes("pet") && matLower.includes("pet")) ||
        (reqLower.includes("iron") && matLower.includes("iron")) ||
        (reqLower.includes("metal") && (matLower.includes("metal") || matLower.includes("iron") || matLower.includes("scrap") || matLower.includes("copper") || matLower.includes("steel"))) ||
        (reqLower.includes("textile") && (matLower.includes("textile") || matLower.includes("fabric") || matLower.includes("yarn") || matLower.includes("cotton")))
      ) {
        return { isMatch: true, matchedKeyword: req };
      }
    }
    return { isMatch: false, matchedKeyword: null };
  };

  // Add / Remove quick tag
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newMaterialInput.trim();
    if (!val || requiredMaterials.some(m => m.toLowerCase() === val.toLowerCase())) return;

    const updated = [...requiredMaterials, val];
    setRequiredMaterials(updated);
    setNewMaterialInput("");

    startReqSaveTransition(async () => {
      await saveBuyerRequirements(updated);
    });
  };

  const handleRemoveMaterial = (materialToRemove: string) => {
    const updated = requiredMaterials.filter(m => m !== materialToRemove);
    setRequiredMaterials(updated);

    startReqSaveTransition(async () => {
      await saveBuyerRequirements(updated);
    });
  };

  // Handle detailed requirement creation
  const handleAddDetailedReq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqForm.material_name.trim()) return;
    setIsAddingReq(true);
    const res = await addDetailedBuyerRequirement(newReqForm);
    setIsAddingReq(false);
    if (res.success) {
      setShowAddReqModal(false);
      setNewReqForm({
        material_name: "",
        category: "Textile",
        min_quantity: 500,
        max_quantity: 10000,
        preferred_quality: "High",
        max_price: 40,
        target_fulfillment_date: "",
        notes: ""
      });
      const updated = await getDetailedBuyerRequirements();
      setDetailedReqs(updated);
    } else {
      alert("Failed to add requirement.");
    }
  };

  const handleDeleteDetailedReq = async (id: string) => {
    await deleteDetailedBuyerRequirement(id);
    setDetailedReqs(prev => prev.filter(r => r.id !== id));
  };

  // Bookmark / Save listing toggle
  const handleToggleSave = async (listingId: string) => {
    const res = await toggleSaveListing(listingId);
    if (res.saved) {
      setSavedListingIds(prev => [...prev, listingId]);
    } else {
      setSavedListingIds(prev => prev.filter(id => id !== listingId));
    }
  };

  // Natural Language AI Match Finder search
  const handleRunAIMatchFinder = async (customQuery?: string) => {
    const q = customQuery || aiPrompt;
    if (!q.trim()) return;
    setIsSearchingAI(true);
    try {
      const res = await findAIMatchesForBuyer(q);
      setAiResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingAI(false);
    }
  };

  // Initiate deal from modal
  const handleConfirmCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealInitiateListing) return;
    setIsSubmittingDeal(true);
    try {
      const res = await createDeal({
        waste_id: dealInitiateListing.id,
        waste_name: dealInitiateListing.material_name,
        waste_category: dealInitiateListing.category,
        seller_id: dealInitiateListing.seller_id,
        seller_name: dealInitiateListing.seller?.company_name || "Factory Generator",
        initial_quantity: dealInitQty,
        initial_price: dealInitPrice,
        notes: dealInitNotes || `Procurement offer for ${dealInitQty.toLocaleString()} KG at ₹${dealInitPrice}/KG.`
      });
      setIsSubmittingDeal(false);
      if (res.success && res.deal) {
        setDealInitiateListing(null);
        setDeals(prev => [res.deal!, ...prev]);
        setActiveTab("deals");
        setSelectedDealForModal(res.deal);
      } else {
        alert(res.message || "Failed to initiate deal.");
      }
    } catch (err: any) {
      setIsSubmittingDeal(false);
      alert(err?.message || "Failed to initiate deal.");
    }
  };

  // Deal message / reply
  const handleSendDealReply = async (dealId: string) => {
    if (!dealReplyMsg.trim()) return;
    setIsSendingDealMsg(true);
    await addDealMessage(dealId, dealReplyMsg.trim(), undefined, dealReplyPrice);
    setIsSendingDealMsg(false);
    setDealReplyMsg("");
    setDealReplyPrice(undefined);
    const refreshed = await getDeals("buyer");
    setDeals(refreshed);
    const d = refreshed.find(x => x.id === dealId);
    if (d) setSelectedDealForModal(d);
  };

  const handleUpdateDealStatus = async (dealId: string, status: any) => {
    await updateDealStatus(dealId, status);
    const refreshed = await getDeals("buyer");
    setDeals(refreshed);
    const d = refreshed.find(x => x.id === dealId);
    if (d) setSelectedDealForModal(d);
  };

  // Handle incoming request action
  const handleRequestAction = async (id: string, status: "accepted" | "rejected") => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    await updateRequestStatus(id, status);
  };

  // Handle sending inquiry
  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryModalItem) return;

    setIsSendingInquiry(true);
    const sellerId = inquiryModalItem.seller_id;
    const wasteId = inquiryModalItem.id;
    const msg = inquiryMessage || `Hello, we are interested in procuring your listing for ${inquiryModalItem.material_name}. Please share technical specification and quotation.`;

    const res = await sendBuyerInquiry(sellerId, wasteId, msg);
    setIsSendingInquiry(false);

    if (res.success) {
      setInquirySuccess(`Inquiry dispatched to ${inquiryModalItem.seller?.company_name || "supplier"}!`);
      setTimeout(() => {
        setInquiryModalItem(null);
        setInquirySuccess(null);
        setInquiryMessage("");
      }, 2000);
    } else {
      alert("Failed to send inquiry. Please try again.");
    }
  };

  // Filtering Marketplace
  const filteredMarketplaceListings = wasteListings.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      item.material_name.toLowerCase().includes(q) ||
      (item.category && item.category.toLowerCase().includes(q)) ||
      (item.location && item.location.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q));

    const matchesCategory = categoryFilter === "all" || (item.category && item.category.toLowerCase().includes(categoryFilter.toLowerCase()));
    const matchesQuality = qualityFilter === "all" || (item.condition && item.condition.toLowerCase().includes(qualityFilter.toLowerCase()));
    const matchesPrice = !maxPriceFilter || (item.expected_price && item.expected_price <= maxPriceFilter);

    const comp = checkCompatibility(item.material_name, requiredMaterials);
    const matchesWishlist = filterMode === "all" || comp.isMatch;

    return matchesSearch && matchesCategory && matchesQuality && matchesPrice && matchesWishlist;
  });

  const savedListings = wasteListings.filter(item => savedListingIds.includes(item.id));
  const matchedListings = wasteListings.filter(item => checkCompatibility(item.material_name, requiredMaterials).isMatch);

  // Compute metrics
  const matchedKg = matchedListings.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const pendingRequests = requests.filter(r => r.status === "pending");
  const estimatedSavings = Math.round(matchedKg * 18);
  const co2AvoidedTons = (matchedKg * 1.6 / 1000).toFixed(1);
  const activeBuyerDeals = deals.filter(d => d.status !== 'COMPLETED' && d.status !== 'CANCELLED');
  const completedBuyerDeals = deals.filter(d => d.status === 'COMPLETED');

  // Chart data
  const materialTypeMap: Record<string, number> = {};
  wasteListings.forEach(w => {
    const key = w.category || w.material_name.split(" ")[0] || "Secondary";
    materialTypeMap[key] = (materialTypeMap[key] || 0) + (Number(w.quantity) || 0);
  });
  const materialChartData = Object.entries(materialTypeMap).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
              Procurement & Circular Sourcing
            </span>
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {buyerInfo?.profile?.company_name || "Enterprise Buyer"}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 mt-2">
            Recycler & Procurement Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Source pre-screened industrial scrap, manage technical requirements, run AI natural-language discovery, and negotiate circular supply contracts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActiveTab("ai-finder")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            AI Match Finder
          </button>

          <Link
            href="/buyer/requests"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-bold transition shadow-xs"
          >
            <Inbox className="w-4 h-4 text-emerald-600" />
            Proposals ({pendingRequests.length})
          </Link>
        </div>
      </div>



      {/* ------------------------------------------------------------- */}
      {/* TAB: LIVE FLEET TRACKING */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "tracking" && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4">My Inbound Logistics Map</h2>
          <MapWrapper drivers={drivers} shipments={shipments} />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: OVERVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Quick Wishlist Banner */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 border border-emerald-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-700" />
                  <h2 className="text-base font-bold text-gray-950">
                    Active Procurement Material Wishlist
                  </h2>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">
                  CIRCULON algorithms cross-reference supplier listings against these streams.
                </p>
              </div>

              <form onSubmit={handleAddMaterial} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. Copper Scrap, PET Flakes"
                  value={newMaterialInput}
                  onChange={(e) => setNewMaterialInput(e.target.value)}
                  className="px-3.5 py-1.5 rounded-xl border border-emerald-300 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 outline-none w-56 shadow-xs"
                />
                <button
                  type="submit"
                  disabled={!newMaterialInput.trim()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </form>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {requiredMaterials.map((mat) => (
                <span
                  key={mat}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-900 border border-emerald-200 shadow-xs group"
                >
                  <span>{mat}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveMaterial(mat)}
                    className="w-4 h-4 rounded-full hover:bg-emerald-100 flex items-center justify-center text-emerald-600 hover:text-red-600 transition cursor-pointer"
                    title={`Remove ${mat}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={() => setActiveTab("requirements")}
                className="text-xs font-bold text-emerald-700 hover:underline ml-2"
              >
                + Manage Full Specifications ({detailedReqs.length}) →
              </button>
            </div>
          </div>

          {/* Primary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Matched Volume</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-gray-950 tracking-tight">{matchedKg.toLocaleString()}</span>
                <span className="text-sm font-semibold text-gray-500 ml-1.5">KG</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-emerald-700 font-bold">{matchedListings.length} listings</span> meet your exact requirements
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Estimated Savings</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-gray-950 tracking-tight">₹{estimatedSavings.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">vs. virgin raw material procurement</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              onClick={() => setActiveTab("deals")}
              className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs hover:border-emerald-300 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Active Deals</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-purple-950 tracking-tight">{activeBuyerDeals.length}</span>
                <span className="text-sm font-semibold text-gray-500 ml-1.5">In Progress</span>
              </div>
              <p className="text-xs text-purple-700 font-bold mt-2">Negotiate & Track Shipments →</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-bold uppercase tracking-wider">Scope 3 Avoidance</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Leaf className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-emerald-700 tracking-tight">{co2AvoidedTons}</span>
                <span className="text-sm font-semibold text-gray-500 ml-1.5">MT CO₂e</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Emissions saved via circular scrap reuse</p>
            </motion.div>
          </div>

          {/* Charts & Circular Advantage */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Available Feedstock by Stream (KG)</h3>
                  <p className="text-xs text-gray-500">Marketplace inventory ready for factory procurement</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Live Feed
                </span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: "#1e293b", borderRadius: "8px", border: "none", color: "#fff", fontSize: "12px" }} />
                    <Bar dataKey="value" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-green-950 p-6 rounded-2xl text-white shadow-lg flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Circular Procurement Intelligence
                </div>
                <h3 className="text-xl font-bold tracking-tight">Direct Factory Byproducts</h3>
                <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
                  Bypass secondary middleman markups by establishing verified, direct off-take agreements with CPCB-compliant generators.
                </p>
              </div>

              <div className="space-y-2.5 my-6 pt-4 border-t border-white/10 text-xs">
                <div className="flex justify-between">
                  <span className="text-emerald-200">Quality Vetting:</span>
                  <span className="font-bold text-white">Pre-screened with AI Analysis</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Payment Security:</span>
                  <span className="font-bold text-emerald-300">Verified Direct PO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-200">Logistics:</span>
                  <span className="font-bold text-white">GreenFleet Fleet Integrated</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("marketplace")}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-xl text-center transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Browse All Marketplace Listings ({wasteListings.length}) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: MATERIAL SPECIFICATIONS / REQUIREMENTS MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "requirements" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-gray-950">Procurement Specifications & Material Wishlist</h2>
              <p className="text-xs text-gray-500 mt-1">
                Define the technical grades, quantity tolerances, and target prices your manufacturing plant requires.
              </p>
            </div>
            <button
              onClick={() => setShowAddReqModal(true)}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              Add Specification
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {detailedReqs.map((req) => (
              <div key={req.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {req.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDetailedReq(req.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Delete requirement"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-gray-950 mt-2.5">{req.material_name}</h3>

                  <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Intake Volume:</span>
                      <strong className="text-gray-800">{req.min_quantity.toLocaleString()} - {req.max_quantity.toLocaleString()} KG</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Grade Required:</span>
                      <span className="font-semibold text-emerald-800">{req.preferred_quality}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Max Procurement Price:</span>
                      <strong className="text-gray-900">₹{req.max_price}/KG</strong>
                    </div>
                    {req.target_fulfillment_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Target Date:</span>
                        <span>{req.target_fulfillment_date}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery(req.material_name);
                      setActiveTab("marketplace");
                    }}
                    className="text-xs font-bold text-emerald-700 hover:underline"
                  >
                    View Matching Scrap →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: WASTE MARKETPLACE WITH MULTI-CRITERIA FILTERS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "marketplace" && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by material, condition, location, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    filterMode === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({wasteListings.length})
                </button>
                <button
                  onClick={() => setFilterMode("matched")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    filterMode === "matched" ? "bg-emerald-700 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  Wishlist Matches ({matchedListings.length})
                </button>
              </div>
            </div>

            {/* Sub Filters */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-1.5 text-gray-500">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="font-semibold">Category:</span>
              </div>
              {["all", "Textile", "Plastics", "Biomass", "Paper", "Metal"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    categoryFilter === cat ? "bg-emerald-100 text-emerald-800 font-bold border border-emerald-300" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat === "all" ? "All Categories" : cat}
                </button>
              ))}

              <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block" />

              <div className="flex items-center gap-1.5 text-gray-500">
                <span className="font-semibold">Quality:</span>
              </div>
              {["all", "Clean", "High", "Medium"].map((q) => (
                <button
                  key={q}
                  onClick={() => setQualityFilter(q)}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    qualityFilter === q ? "bg-emerald-100 text-emerald-800 font-bold border border-emerald-300" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {q === "all" ? "All Grades" : q}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Grid */}
          {filteredMarketplaceListings.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-gray-200">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No scrap listings match your filter</h3>
              <p className="text-xs text-gray-500 mt-1">Try relaxing your search keywords or category filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMarketplaceListings.map((item) => {
                const isSaved = savedListingIds.includes(item.id);
                const comp = checkCompatibility(item.material_name, requiredMaterials);

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between ${
                      comp.isMatch ? "border-emerald-300 ring-2 ring-emerald-100" : "border-gray-200/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {comp.isMatch ? (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <Check className="w-3 h-3 text-emerald-700" />
                              Wishlist Match
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-gray-100 text-gray-700">
                              {item.category || "Secondary"}
                            </span>
                          )}
                          <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> Verified
                          </span>
                        </div>

                        {/* Save Bookmark Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleSave(item.id)}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isSaved ? "text-amber-600 bg-amber-50" : "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                          }`}
                          title={isSaved ? "Remove from saved" : "Save / Bookmark listing"}
                        >
                          {isSaved ? <BookmarkCheck className="w-4 h-4 fill-amber-500" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>

                      <h3 className="text-base font-bold text-gray-950 mt-2.5 line-clamp-1">
                        {item.material_name}
                      </h3>

                      <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Available Volume:</span>
                          <strong className="text-gray-900">{Number(item.quantity).toLocaleString()} {item.unit || "KG"}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Price Expectation:</span>
                          <strong className="text-emerald-800">₹{item.expected_price || 30}/KG</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Condition:</span>
                          <span className="truncate max-w-[170px]">{item.condition || "Dry, Clean"}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500 pt-1">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">{item.location || "Pan-India"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setInquiryModalItem(item)}
                        className="px-3 py-1.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 transition cursor-pointer"
                      >
                        Inquire
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setDealInitiateListing(item);
                          setDealInitQty(Number(item.quantity) || 1000);
                          setDealInitPrice(item.expected_price || 35);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Initiate Deal
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: NATURAL LANGUAGE AI MATCH FINDER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "ai-finder" && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-gray-950 via-emerald-950 to-green-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Gemini 3.6 Flash
              </span>
              <span className="text-xs text-emerald-200">Natural Language Scrap Procurement Engine</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Describe Exactly What Your Mill or Factory Needs
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/70 max-w-2xl">
              Type your requirements in plain English. The AI parses required stream chemistry, acceptable moisture, monthly tonnage, and budget to return ranked suitable waste streams.
            </p>

            <div className="pt-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. I need 1000 kg cotton textile waste suitable for recycled yarn under ₹40/kg..."
                  className="flex-1 p-3.5 rounded-2xl bg-white/10 border border-white/20 text-white text-xs placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-emerald-400"
                />
                <button
                  type="button"
                  onClick={() => handleRunAIMatchFinder()}
                  disabled={isSearchingAI || !aiPrompt.trim()}
                  className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isSearchingAI ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Run AI Search
                    </>
                  )}
                </button>
              </div>

              {/* Sample Quick Prompts */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-emerald-200">
                <span className="font-semibold text-emerald-300">Try quick prompts:</span>
                {[
                  "1000 kg cotton textile waste for recycled yarn",
                  "HDPE regrind flakes for extruded drainage pipes",
                  "Sugarcane bagasse or rice husk for molded tableware",
                  "Clean OCC cardboard scrap under ₹20/kg"
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setAiPrompt(sample);
                      handleRunAIMatchFinder(sample);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition cursor-pointer text-[10px]"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Search Results Display */}
          {aiResults && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <div className="font-bold uppercase tracking-wider text-[11px] text-emerald-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  AI Matching Diagnostic
                </div>
                <p className="leading-relaxed">{aiResults.analysis}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {aiResults.matches.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-emerald-300 p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {item.matchConfidence}% Match
                        </span>
                        <span className="text-xs font-bold text-gray-500">₹{item.expected_price}/KG</span>
                      </div>

                      <h3 className="text-base font-bold text-gray-950 mt-2">{item.material_name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Volume: <strong>{Number(item.quantity).toLocaleString()} {item.unit || "KG"}</strong> • {item.location}
                      </p>

                      <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-100 text-[11px] text-gray-700">
                        <span className="font-bold text-gray-900">Explainability:</span> {item.matchReason}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          setDealInitiateListing(item);
                          setDealInitQty(Number(item.quantity) || 1000);
                          setDealInitPrice(item.expected_price || 35);
                        }}
                        className="w-full py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Initiate Deal from Match
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: DEALS & NEGOTIATIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "deals" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-gray-950">Commercial Supply Agreements & Inbound Deals</h2>
              <p className="text-xs text-gray-500 mt-1">
                Active negotiations with waste generators, driver pickup schedules, and delivery confirmations.
              </p>
            </div>
            <span className="text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-xl">
              {deals.length} Total Contracts
            </span>
          </div>

          {deals.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-gray-200 shadow-xs">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No active commercial deals yet</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Click "Initiate Deal" on any marketplace listing or AI match to start terms negotiation.
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
                            Deal Ref: <span className="font-mono text-gray-700">{deal.id}</span>
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-950 mt-2">{deal.waste_name}</h3>

                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-600">
                          <span>Generator: <strong>{deal.seller_name}</strong></span>
                          <span>•</span>
                          <span>Batch: <strong>{deal.agreed_quantity.toLocaleString()} KG</strong></span>
                          <span>•</span>
                          <span>Rate: <strong>₹{deal.agreed_price}/KG</strong></span>
                          <span>•</span>
                          <span>Total Contract: <strong className="text-green-700">₹{deal.total_amount.toLocaleString()}</strong></span>
                        </div>
                      </div>

                      <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 sm:text-right shrink-0">
                        <div className="text-[10px] uppercase font-bold text-emerald-800">PO Value</div>
                        <div className="text-xl font-black text-green-800 flex items-center sm:justify-end">
                          <IndianRupee className="w-4 h-4 mr-0.5" />
                          {deal.total_amount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-emerald-700 mt-0.5">
                          CO₂e Displaced: <strong>{deal.co2_saved_kg.toLocaleString()} KG</strong>
                        </div>
                      </div>
                    </div>

                    {deal.driver_info && (
                      <div className="my-3 p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 text-xs flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-emerald-700" />
                          <div>
                            <strong>Assigned Fleet Driver:</strong> {deal.driver_info.driver_name} ({deal.driver_info.vehicle_number}) • {deal.driver_info.driver_phone}
                          </div>
                        </div>
                        <div className="text-gray-500">
                          Pickup Slot: <strong>{deal.driver_info.pickup_date}</strong>
                        </div>
                      </div>
                    )}

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
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition cursor-pointer"
                          >
                            ✓ Accept Offer Terms
                          </button>
                        )}
                        {isAgreed && (
                          <button
                            type="button"
                            onClick={() => handleUpdateDealStatus(deal.id, 'PICKUP_SCHEDULED')}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition cursor-pointer"
                          >
                            Schedule Driver Inbound
                          </button>
                        )}
                        {deal.status === 'IN_TRANSIT' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateDealStatus(deal.id, 'DELIVERED')}
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition cursor-pointer"
                          >
                            Confirm Goods Arrived at Factory
                          </button>
                        )}
                        {deal.status === 'DELIVERED' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateDealStatus(deal.id, 'COMPLETED')}
                            className="px-3.5 py-1.5 rounded-xl bg-green-700 hover:bg-green-800 text-white text-xs font-bold transition cursor-pointer"
                          >
                            Mark Completed & Certified Zero Landfill
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedDealForModal(deal)}
                        className="px-4 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-purple-700" />
                        Negotiation Thread ({deal.messages?.length || 0})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: SAVED LISTINGS / BOOKMARKS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "saved" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-950">Saved Listings & Bookmarked Scrap</h2>
              <p className="text-xs text-gray-500 mt-1">Quickly access materials you have earmarked for upcoming procurement cycles.</p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-xl">
              {savedListings.length} Saved
            </span>
          </div>

          {savedListings.length === 0 ? (
            <div className="p-16 text-center bg-white rounded-2xl border border-gray-200 shadow-xs">
              <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No saved scrap listings</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Click the bookmark icon on any item in the marketplace to pin it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {savedListings.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-gray-100 text-gray-700">
                        {item.category || "Secondary"}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleToggleSave(item.id)}
                        className="p-1 text-amber-600 hover:text-gray-400 cursor-pointer"
                        title="Remove bookmark"
                      >
                        <BookmarkCheck className="w-4 h-4 fill-amber-500" />
                      </button>
                    </div>

                    <h3 className="text-base font-bold text-gray-950 mt-2">{item.material_name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Volume: <strong>{Number(item.quantity).toLocaleString()} {item.unit || "KG"}</strong> • Price: ₹{item.expected_price}/KG
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">Location: {item.location}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setInquiryModalItem(item)}
                      className="text-xs font-bold text-gray-700 hover:underline"
                    >
                      Inquire Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDealInitiateListing(item);
                        setDealInitQty(Number(item.quantity) || 1000);
                        setDealInitPrice(item.expected_price || 35);
                      }}
                      className="px-3.5 py-1.5 bg-purple-700 text-white rounded-xl text-xs font-bold hover:bg-purple-800 transition"
                    >
                      Initiate Deal
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD DETAILED SPECIFICATION */}
      {/* ------------------------------------------------------------- */}
      {showAddReqModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-950">Add Material Specification</h3>
                <p className="text-xs text-gray-500">Define intake volume, grade, and maximum price</p>
              </div>
              <button onClick={() => setShowAddReqModal(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDetailedReq} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Material Stream Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 100% Combed Cotton Hosiery Clips"
                  value={newReqForm.material_name}
                  onChange={(e) => setNewReqForm({ ...newReqForm, material_name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={newReqForm.category}
                    onChange={(e) => setNewReqForm({ ...newReqForm, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  >
                    <option value="Textile">Textile</option>
                    <option value="Plastics & Polymers">Plastics & Polymers</option>
                    <option value="Biomass & Agriculture">Biomass & Agriculture</option>
                    <option value="Paper & Packaging">Paper & Packaging</option>
                    <option value="Metals & Foundry">Metals & Foundry</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Acceptable Quality</label>
                  <select
                    value={newReqForm.preferred_quality}
                    onChange={(e) => setNewReqForm({ ...newReqForm, preferred_quality: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                  >
                    <option value="High (Clean/Baled)">High (Clean/Baled)</option>
                    <option value="Medium (Low Contamination)">Medium (Low Contamination)</option>
                    <option value="Unsorted Regrind">Unsorted Regrind</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Min KG</label>
                  <input
                    type="number"
                    value={newReqForm.min_quantity}
                    onChange={(e) => setNewReqForm({ ...newReqForm, min_quantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Max KG</label>
                  <input
                    type="number"
                    value={newReqForm.max_quantity}
                    onChange={(e) => setNewReqForm({ ...newReqForm, max_quantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Max ₹/KG</label>
                  <input
                    type="number"
                    value={newReqForm.max_price}
                    onChange={(e) => setNewReqForm({ ...newReqForm, max_price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Target Procurement Date</label>
                <input
                  type="date"
                  value={newReqForm.target_fulfillment_date}
                  onChange={(e) => setNewReqForm({ ...newReqForm, target_fulfillment_date: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-300 outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddReqModal(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingReq}
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition disabled:opacity-50"
                >
                  {isAddingReq ? "Saving..." : "Save Specification"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: INITIATE DEAL FROM MARKETPLACE */}
      {/* ------------------------------------------------------------- */}
      {dealInitiateListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3 border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-950">Initiate Commercial Deal</h3>
                <p className="text-xs text-gray-500">Propose initial procurement quantity and price</p>
              </div>
              <button onClick={() => setDealInitiateListing(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreateDeal} className="space-y-3 text-xs">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-purple-950">
                <div><strong>Material:</strong> {dealInitiateListing.material_name}</div>
                <div><strong>Seller:</strong> {dealInitiateListing.seller?.company_name || "Factory Generator"} ({dealInitiateListing.location})</div>
                <div><strong>Available:</strong> {dealInitiateListing.quantity?.toLocaleString()} KG</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Procurement Quantity (KG) *</label>
                  <input
                    type="number"
                    required
                    value={dealInitQty}
                    onChange={(e) => setDealInitQty(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Proposed Price (₹/KG) *</label>
                  <input
                    type="number"
                    required
                    value={dealInitPrice}
                    onChange={(e) => setDealInitPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Proposal Message / Gate Pass Notes</label>
                <textarea
                  rows={3}
                  value={dealInitNotes}
                  onChange={(e) => setDealInitNotes(e.target.value)}
                  placeholder="e.g. We can procure the full batch with our GreenFleet truck tomorrow morning..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-gray-500">
                  Total Offer: <strong className="text-purple-900 font-black">₹{(dealInitQty * dealInitPrice).toLocaleString()}</strong>
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setDealInitiateListing(null)}
                    className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingDeal}
                    className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold transition disabled:opacity-50"
                  >
                    {isSubmittingDeal ? "Initiating..." : "Start Deal"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ACTIVE DEAL NEGOTIATION THREAD */}
      {/* ------------------------------------------------------------- */}
      {selectedDealForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 space-y-4 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">
                  Commercial Negotiation Thread
                </span>
                <h3 className="text-xl font-bold text-gray-950 mt-0.5">{selectedDealForModal.waste_name}</h3>
                <p className="text-xs text-gray-500">
                  Seller: <strong>{selectedDealForModal.seller_name}</strong> • Current Terms: {selectedDealForModal.agreed_quantity.toLocaleString()} KG @ ₹{selectedDealForModal.agreed_price}/KG
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

            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 max-h-72">
              {selectedDealForModal.messages?.map((msg) => (
                <div key={msg.id} className="p-3 bg-white rounded-xl border border-gray-200/70 text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span className="font-bold text-gray-800">{msg.sender_name || msg.sender_role}</span>
                    <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-gray-800">{msg.message}</p>
                  {msg.proposed_price && (
                    <div className="text-[11px] font-bold text-purple-700">
                      Proposed Price: ₹{msg.proposed_price}/KG
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-100 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Enter counter-offer or message..."
                    value={dealReplyMsg}
                    onChange={(e) => setDealReplyMsg(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Counter ₹/KG"
                    value={dealReplyPrice || ""}
                    onChange={(e) => setDealReplyPrice(Number(e.target.value) || undefined)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-purple-600 text-xs"
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
                  className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  {isSendingDealMsg ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: INQUIRY QUOTE */}
      {/* ------------------------------------------------------------- */}
      {inquiryModalItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100"
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Request Technical Quotation / Sample</h3>
                <p className="text-xs text-gray-500">Send an inquiry directly to the material generator</p>
              </div>
              <button 
                onClick={() => setInquiryModalItem(null)} 
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {inquirySuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-base font-bold text-gray-900">{inquirySuccess}</h4>
                <p className="text-xs text-gray-500">The seller has received your inquiry and contact details.</p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="mt-4 space-y-4">
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-100 text-xs text-gray-700 space-y-1">
                  <div><strong>Material:</strong> {inquiryModalItem.material_name}</div>
                  <div><strong>Volume:</strong> {Number(inquiryModalItem.quantity).toLocaleString()} {inquiryModalItem.unit || "KG"}</div>
                  <div><strong>Generator:</strong> {inquiryModalItem.seller?.company_name || "Enterprise Factory"}</div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Procurement Message / Specifications
                  </label>
                  <textarea
                    rows={4}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder={`Hello, we are interested in procuring your ${inquiryModalItem.material_name}. Please provide commercial terms and shipping details.`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setInquiryModalItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingInquiry}
                    className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                  >
                    {isSendingInquiry ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Dispatching...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Inquiry
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
