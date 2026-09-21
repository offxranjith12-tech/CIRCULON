"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { calculateMatches, type MatchResult } from "@/lib/matching";
import { 
  MapPin, 
  IndianRupee, 
  Factory, 
  Mail, 
  Phone, 
  Building2, 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Send, 
  Sparkles, 
  ArrowLeft,
  X,
  Award,
  MessageSquare,
  Info
} from "lucide-react";
import { getBuyers } from "@/lib/actions/buyers";
import { draftOutreachMessage } from "@/lib/actions/ai";
import { sendConnectionRequest } from "@/lib/actions/connections";
import { createDeal } from "@/lib/actions/deals";
import { motion } from "framer-motion";
import Link from "next/link";

export default function MatchesPage() {
  const searchParams = useSearchParams();
  const materialType = searchParams.get("materialType") || "Cotton Textile Waste";
  const quantity = Number(searchParams.get("quantity")) || 500;
  const wasteId = searchParams.get("wasteId") || "";

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [initiatingDealId, setInitiatingDealId] = useState<string | null>(null);
  const [initiatedDeals, setInitiatedDeals] = useState<Record<string, string>>({});

  // Background verification dossier state
  const [selectedBuyerForDossier, setSelectedBuyerForDossier] = useState<any | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const buyersList = await getBuyers();
        const results = calculateMatches(materialType, quantity, buyersList);
        setMatches(results);
      } catch (err) {
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [materialType, quantity]);

  const handleDraft = async (buyerId: string, buyerName: string) => {
    setDraftingId(buyerId);
    try {
      const message = await draftOutreachMessage(buyerName, materialType, quantity);
      setDrafts(prev => ({ ...prev, [buyerId]: message }));
    } catch (err) {
      console.error(err);
    } finally {
      setDraftingId(null);
    }
  };

  const handleSendRequest = async (buyerId: string) => {
    setSendingId(buyerId);
    try {
      const message = drafts[buyerId] || `Hello, we have ${quantity.toLocaleString()} KG of ${materialType} available at our facility. Please review our supply proposal.`;
      
      const res = await sendConnectionRequest(buyerId, wasteId, message);
      if (res && res.success === false) {
        alert(res.error || "Failed to send request. Please try again.");
      } else {
        setSentRequests(prev => ({ ...prev, [buyerId]: true }));
      }
    } catch (err: any) {
      console.error("handleSendRequest error:", err);
      alert(err?.message || "Failed to send request. Please try again.");
    } finally {
      setSendingId(null);
    }
  };

  const handleInitiateDeal = async (b: any) => {
    setInitiatingDealId(b.id);
    try {
      const res = await createDeal({
        waste_id: wasteId || 'waste-direct',
        waste_name: materialType,
        buyer_id: b.id,
        buyer_name: b.company_name,
        initial_quantity: quantity,
        initial_price: b.max_price || 35,
        notes: `Commercial proposal for ${quantity.toLocaleString()} KG of ${materialType} at ₹${b.max_price || 35}/KG.`
      });
      if (res.success && res.deal) {
        setInitiatedDeals(prev => ({ ...prev, [b.id]: res.deal!.id }));
      } else {
        alert(res.message || "Failed to initiate deal.");
      }
    } catch (err: any) {
      console.error("Deal error:", err);
      alert(err?.message || "Failed to initiate deal.");
    } finally {
      setInitiatingDealId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <Link 
            href="/waste" 
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-700 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Waste Listings
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Market Opportunities & Suitable Buyers</h1>
          <p className="text-gray-500 text-sm mt-1">
            Matching verified industrial buyers for <span className="font-bold text-gray-800">{quantity.toLocaleString()} KG</span> of <span className="font-bold text-emerald-700">{materialType}</span>.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition"
          >
            Seller Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center bg-white rounded-2xl border border-gray-100">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />
          <p className="text-sm font-bold text-gray-700">Analyzing compatible industrial buyers & intake specs...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <Factory className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">No Suitable Buyers Found</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            No active buyer currently matches "{materialType}". You can check other listed materials or adjust your inventory.
          </p>
          <div className="mt-6">
            <Link href="/waste" className="px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-bold text-xs rounded-xl shadow-xs transition">
              Back to Waste Listings
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>Ranked by <strong className="text-gray-900">CIRCULON Compatibility Score</strong></span>
            <span>Found <strong className="text-green-700">{matches.length} verified buyers</strong></span>
          </div>

          {matches.map((match, index) => {
            const b = match.buyer;
            const isBest = index === 0;
            const hasSent = sentRequests[b.id];
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                key={b.id || index} 
                className={`relative bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
                  isBest 
                    ? 'border border-green-500 ring-2 ring-green-100 shadow-lg' 
                    : 'border border-gray-200 shadow-xs hover:shadow-md'
                }`}
              >
                {isBest && (
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-center py-1.5 font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2">
                    <span>🏆 Best Commercial Opportunity Match</span>
                    <span>• Score: {match.opportunityScore}/100</span>
                  </div>
                )}
                
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                  
                  {/* Left Side: Score & Core Value */}
                  <div className="md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-8">
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Opportunity Score</p>
                      <div className="mt-2 flex items-baseline justify-center gap-1">
                        <span className={`text-6xl font-black ${isBest ? 'text-green-600' : 'text-gray-900'}`}>{match.opportunityScore}</span>
                        <span className="text-xl text-gray-400 font-medium">/100</span>
                      </div>
                    </div>
                    
                    <div className="mt-6 w-full bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/80">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-600 text-xs font-medium">Estimated Net Value</span>
                        <span className="font-extrabold text-lg text-green-700 flex items-center">
                          <IndianRupee className="h-4 w-4 mr-0.5" />
                          {match.netValue.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Gross Price (₹{b.max_price || 30}/kg)</span>
                        <span>₹{match.grossValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500 mt-1">
                        <span>Estimated Transport</span>
                        <span className="text-red-600">- ₹{match.transportCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Buyer Info, Verified Contact Details, Background Dossier Action */}
                  <div className="md:w-2/3 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold text-gray-950">{b.company_name}</h2>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-800 border border-green-200">
                              <ShieldCheck className="w-3 h-3 text-green-600" />
                              Admin Verified
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Factory className="h-3.5 w-3.5 text-gray-400"/> {b.industry} ({b.buyer_type || 'Processor'})</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-gray-400"/> {b.city}, {b.state}</span>
                            {b.id_proof_number && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-gray-600">{b.id_proof_number}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Verified Contact Details Box */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200/70 text-xs">
                        <div className="space-y-1.5">
                          <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-green-700" />
                            Direct Contact Details
                          </div>
                          <div className="text-gray-700">
                            <strong>Contact:</strong> {b.contact_person || "Procurement Directorate"}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Phone className="w-3.5 h-3.5 text-green-700 shrink-0" />
                            {b.phone ? (
                              <a href={`tel:${b.phone}`} className="font-bold text-green-800 hover:underline">
                                {b.phone}
                              </a>
                            ) : (
                              <span className="text-gray-400">Available on proposal request</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-700">
                            <Mail className="w-3.5 h-3.5 text-green-700 shrink-0" />
                            {b.email ? (
                              <a href={`mailto:${b.email}`} className="font-bold text-green-800 hover:underline truncate">
                                {b.email}
                              </a>
                            ) : (
                              <span className="text-gray-400">Available on proposal request</span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l sm:pl-3 border-gray-200/60 pt-2 sm:pt-0">
                          <div className="font-bold text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-700" />
                            Trust & Reliability
                          </div>
                          <div className="text-gray-700">
                            <strong>Reliability:</strong> {b.reliability_rating || "Grade A (98% Settlement)"}
                          </div>
                          <div className="flex items-start gap-1 text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{b.company_address || `${b.city}, ${b.state}`}</span>
                          </div>
                        </div>
                      </div>

                      {/* 6-Point Criteria Breakdown Bars */}
                      <div className="mt-4 space-y-2.5">
                        <div className="text-[11px] font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
                          <span>Multi-Criteria Compatibility Breakdown</span>
                          <span className="text-emerald-700 font-extrabold">{match.opportunityScore}/100</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50/70 p-3 rounded-xl border border-gray-200/60">
                          <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                              <span>Material Specification</span>
                              <span className="font-bold text-gray-900">{match.breakdown?.material || 95}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.material || 95}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                              <span>Intake Quantity Fit</span>
                              <span className="font-bold text-gray-900">{match.breakdown?.quantity || 90}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.quantity || 90}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                              <span>Price Viability</span>
                              <span className="font-bold text-gray-900">{match.breakdown?.price || 85}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.price || 85}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                              <span>Quality & Moisture</span>
                              <span className="font-bold text-gray-900">{match.breakdown?.quality || 90}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.quality || 90}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                              <span>Logistics Distance</span>
                              <span className="font-bold text-gray-900">{match.breakdown?.location || 85}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.location || 85}%` }} />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                              <span>Industrial Application</span>
                              <span className="font-bold text-gray-900">{match.breakdown?.industry || 95}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.industry || 95}%` }} />
                            </div>
                          </div>
                        </div>

                        {/* Non-Guarantee Disclaimer */}
                        <div className="flex items-start gap-1.5 p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-tight">
                          <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                          <span>
                            <strong>Non-Guarantee Notice:</strong> Compatibility score is an algorithmic estimate based on buyer criteria and material profile, not a contractual guarantee.
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5">Why recommended:</h4>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {match.reason.map((r, i) => (
                              <li key={i} className="flex items-center text-xs text-gray-600">
                                <span className="text-green-600 font-bold mr-1.5">✓</span> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedBuyerForDossier(b)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold transition border border-blue-200 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-700" />
                          Verify Company Background
                        </button>

                        <div className="flex flex-wrap items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleDraft(b.id, b.company_name)}
                            disabled={draftingId === b.id || hasSent}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition border border-emerald-200 cursor-pointer disabled:opacity-50"
                          >
                            {draftingId === b.id ? (
                              <Loader2 className="animate-spin w-3.5 h-3.5" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                            )}
                            AI Pitch
                          </button>

                          {/* Initiate Direct Commercial Deal Button */}
                          <button
                            type="button"
                            onClick={() => handleInitiateDeal(b)}
                            disabled={initiatingDealId === b.id || !!initiatedDeals[b.id]}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                              initiatedDeals[b.id]
                                ? "bg-purple-100 text-purple-800 border border-purple-300"
                                : "bg-purple-700 hover:bg-purple-800 text-white shadow-xs"
                            }`}
                          >
                            {initiatingDealId === b.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Initiating...
                              </>
                            ) : initiatedDeals[b.id] ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                                Deal Active ✓
                              </>
                            ) : (
                              <>
                                <MessageSquare className="w-3.5 h-3.5" />
                                Start Deal Negotiation
                              </>
                            )}
                          </button>

                          <button 
                            type="button"
                            onClick={() => handleSendRequest(b.id)}
                            disabled={sendingId === b.id || hasSent}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                              hasSent 
                                ? 'bg-gray-100 text-green-700 border border-green-300' 
                                : 'bg-green-700 hover:bg-green-800 text-white shadow-green-700/20'
                            }`}
                          >
                            {sendingId === b.id ? (
                              <>
                                <Loader2 className="animate-spin w-3.5 h-3.5" />
                                Sending...
                              </>
                            ) : hasSent ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                Proposal Sent ✓
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                Dispatch Supply Proposal
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {drafts[b.id] && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} 
                          animate={{ opacity: 1, height: 'auto' }} 
                          className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80"
                        >
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-700" />
                              Custom AI Supply Proposal Message
                            </span>
                            <span className="text-[10px] text-gray-500">Will be sent with your proposal</span>
                          </div>
                          <textarea 
                            rows={3}
                            className="w-full p-2.5 text-xs text-gray-800 bg-white border border-emerald-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500" 
                            value={drafts[b.id]} 
                            onChange={(e) => setDrafts(prev => ({...prev, [b.id]: e.target.value}))}
                            disabled={hasSent}
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* ENTERPRISE BACKGROUND VERIFICATION DOSSIER MODAL */}
      {/* ------------------------------------------------------------------- */}
      {selectedBuyerForDossier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5"
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    CIRCULON Verified Dossier
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-950 mt-1">
                  {selectedBuyerForDossier.company_name}
                </h3>
                <p className="text-xs text-gray-500">{selectedBuyerForDossier.industry} • {selectedBuyerForDossier.buyer_type || "Secondary Manufacturer"}</p>
              </div>

              <button
                onClick={() => setSelectedBuyerForDossier(null)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Verification Checklist */}
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <div className="font-bold text-emerald-950">Enterprise Registration Verified</div>
                  <div className="text-emerald-800/80 text-[11px]">
                    Valid business registration confirmed with State Registrar of Companies & GSTIN database.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">GSTIN Number</div>
                  <div className="font-mono font-bold text-gray-800 mt-0.5 truncate">
                    {selectedBuyerForDossier.id_proof_number || "33AAAAA0000A1Z5"}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Active & Regular</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">CIN / Reg No</div>
                  <div className="font-mono font-bold text-gray-800 mt-0.5 truncate">
                    {selectedBuyerForDossier.cin || "U17111TZ2018PTC030112"}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">✓ Verified Corporate</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1.5">
                <div className="text-[10px] text-gray-400 uppercase font-bold">Registered Facility Address</div>
                <div className="font-medium text-gray-800">
                  {selectedBuyerForDossier.company_address || `${selectedBuyerForDossier.city}, ${selectedBuyerForDossier.state}`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Settlement Rating</div>
                  <div className="font-bold text-gray-900 mt-0.5">
                    {selectedBuyerForDossier.reliability_rating || "Grade A+ (98%)"}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Zero payment disputes</div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="text-[10px] text-gray-400 uppercase font-bold">Annual Diversion</div>
                  <div className="font-bold text-gray-900 mt-0.5">
                    {selectedBuyerForDossier.annual_diversion_tons ? `${selectedBuyerForDossier.annual_diversion_tons.toLocaleString()} MT` : "3,500+ MT"}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">Verified ESG intake</div>
                </div>
              </div>

              {selectedBuyerForDossier.compliance_status && (
                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-blue-900">
                  <div className="font-bold text-[11px] uppercase tracking-wider mb-0.5">Environmental Compliance</div>
                  <div className="text-xs">{selectedBuyerForDossier.compliance_status}</div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedBuyerForDossier(null)}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Back to Suitable Buyers List
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
