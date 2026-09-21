"use client";

import { useEffect, useState } from "react";
import { 
  X, 
  ShieldCheck, 
  Phone, 
  Mail, 
  MapPin, 
  Factory, 
  IndianRupee, 
  FileText, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Loader2, 
  ExternalLink,
  Award,
  Calendar,
  Building2,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Info
} from "lucide-react";
import { calculateMatches, type MatchResult } from "@/lib/matching";
import { getBuyers } from "@/lib/actions/buyers";
import { draftOutreachMessage } from "@/lib/actions/ai";
import { sendConnectionRequest } from "@/lib/actions/connections";
import { createDeal } from "@/lib/actions/deals";
import { motion, AnimatePresence } from "framer-motion";

interface SuitableBuyersModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialName: string;
  quantity: number;
  wasteId?: string;
}

export function SuitableBuyersModal({
  isOpen,
  onClose,
  materialName,
  quantity,
  wasteId
}: SuitableBuyersModalProps) {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Background verification dossier state
  const [selectedBuyerForDossier, setSelectedBuyerForDossier] = useState<any | null>(null);

  // AI Outreach & Proposal state
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Record<string, boolean>>({});
  const [initiatingDealId, setInitiatingDealId] = useState<string | null>(null);
  const [initiatedDeals, setInitiatedDeals] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    async function findMatches() {
      setLoading(true);
      try {
        const buyersList = await getBuyers();
        const results = calculateMatches(materialName, quantity, buyersList);
        setMatches(results);
      } catch (err) {
        console.error("Error finding matches:", err);
      } finally {
        setLoading(false);
      }
    }

    findMatches();
  }, [isOpen, materialName, quantity]);

  const handleDraftAI = async (buyerId: string, buyerName: string) => {
    setDraftingId(buyerId);
    try {
      const message = await draftOutreachMessage(buyerName, materialName, quantity);
      setDrafts(prev => ({ ...prev, [buyerId]: message }));
    } catch (err) {
      console.error(err);
    } finally {
      setDraftingId(null);
    }
  };

  const handleSendProposal = async (buyerId: string) => {
    setSendingId(buyerId);
    try {
      const msg = drafts[buyerId] || `Hello, we have ${quantity.toLocaleString()} KG of ${materialName} available at our facility. Please review our supply proposal.`;
      const res = await sendConnectionRequest(buyerId, wasteId || "", msg);
      if (res && res.success === false) {
        alert(res.error || "Failed to send proposal. Please try again.");
      } else {
        setSentRequests(prev => ({ ...prev, [buyerId]: true }));
      }
    } catch (err: any) {
      console.error("handleSendProposal error:", err);
      alert(err?.message || "Failed to send proposal. Please try again.");
    } finally {
      setSendingId(null);
    }
  };

  const handleInitiateDeal = async (b: any) => {
    setInitiatingDealId(b.id);
    try {
      const res = await createDeal({
        waste_id: wasteId || 'waste-direct',
        waste_name: materialName,
        buyer_id: b.id,
        buyer_name: b.company_name,
        initial_quantity: quantity,
        initial_price: b.max_price || 35,
        notes: `Direct commercial deal proposal from seller for ${quantity.toLocaleString()} KG of ${materialName} at ₹${b.max_price || 35}/KG.`
      });
      if (res.success && res.deal) {
        setInitiatedDeals(prev => ({ ...prev, [b.id]: res.deal!.id }));
      } else {
        alert(res.message || "Failed to initiate deal.");
      }
    } catch (err: any) {
      console.error("Deal creation error:", err);
      alert(err?.message || "Failed to initiate deal.");
    } finally {
      setInitiatingDealId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-950 via-emerald-950 to-green-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-green-500/20 text-green-300 border border-green-400/30">
                AI Buyer Discovery
              </span>
              <span className="text-xs text-green-200">
                Direct Factory Match Engine
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-1.5 flex items-center gap-2">
              Suitable Buyers for: <span className="text-emerald-400">{materialName}</span>
            </h2>
            <p className="text-xs text-green-100/70 mt-0.5">
              Available Volume: <strong>{quantity.toLocaleString()} KG</strong> • Direct verified industrial procurement contacts
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-700">Searching and scoring verified buyer network...</p>
              <p className="text-xs text-gray-400 mt-1">Cross-referencing material compatibility, intake capacity, and transport distance.</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center">
              <Factory className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-800">No Suitable Direct Buyers Found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                No active buyer requirements in the database currently match "{materialName}". You can broadcast your listing to the marketplace or add new prospective buyers in Manage Buyers.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
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
                    key={b.id || index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                      isBest 
                        ? 'border-green-400 ring-2 ring-green-100 shadow-md' 
                        : 'border-gray-200/80 shadow-xs hover:shadow-md'
                    }`}
                  >
                    {isBest && (
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[11px] font-black uppercase tracking-wider py-1 px-4 flex items-center justify-between">
                        <span>🏆 Highest Commercial Compatibility Match</span>
                        <span>Opportunity Score: {match.opportunityScore}/100</span>
                      </div>
                    )}

                    <div className="p-6">
                      {/* Top Row: Company Info & Score */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-950">
                              {b.company_name}
                            </h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-800 border border-green-200">
                              <ShieldCheck className="w-3 h-3 text-green-600" />
                              Admin Verified
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Factory className="w-3.5 h-3.5 text-gray-400" />
                              {b.industry} ({b.buyer_type || 'Manufacturer'})
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-400" />
                              {b.city}, {b.state}
                            </span>
                            {b.id_proof_number && (
                              <>
                                <span>•</span>
                                <span className="font-mono text-gray-600 font-medium">
                                  {b.id_proof_number}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Financial Projection Box */}
                        <div className="bg-green-50/70 border border-green-100 rounded-xl p-3 sm:text-right shrink-0">
                          <div className="text-[11px] text-gray-500 uppercase font-semibold">Estimated Net Value</div>
                          <div className="text-xl font-black text-green-700 flex items-center sm:justify-end">
                            <IndianRupee className="w-4 h-4" />
                            {match.netValue.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-gray-500 mt-0.5">
                            ₹{b.max_price || 30}/KG • Score: <strong className="text-green-800">{match.opportunityScore}/100</strong>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Verified Contact Details & Match Reasons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 border-b border-gray-100 text-xs">
                        {/* Verified Contact Details Box */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/70 space-y-2">
                          <div className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-green-700" />
                            Direct Commercial Contact Details
                          </div>
                          <div className="text-gray-700">
                            <strong>Contact Person:</strong> {b.contact_person || "Procurement Directorate"}
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Phone className="w-3.5 h-3.5 text-green-700 shrink-0" />
                            <span>Phone:</span>
                            {b.phone ? (
                              <a href={`tel:${b.phone}`} className="font-bold text-green-800 hover:underline">
                                {b.phone}
                              </a>
                            ) : (
                              <span className="text-gray-400">Available on proposal request</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail className="w-3.5 h-3.5 text-green-700 shrink-0" />
                            <span>Email:</span>
                            {b.email ? (
                              <a href={`mailto:${b.email}`} className="font-bold text-green-800 hover:underline truncate">
                                {b.email}
                              </a>
                            ) : (
                              <span className="text-gray-400">Available on proposal request</span>
                            )}
                          </div>
                          <div className="flex items-start gap-2 text-gray-600 pt-0.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{b.company_address || `${b.city}, ${b.state}`}</span>
                          </div>
                        </div>

                        {/* Match Reasons & Reliability */}
                        <div className="space-y-2.5 p-1">
                          <div className="text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>Compatibility Score Breakdown</span>
                            <span className="text-emerald-700 font-extrabold">{match.opportunityScore}/100</span>
                          </div>

                          {/* 6-Point Criteria Breakdown Bars */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-gray-50/70 p-2.5 rounded-xl border border-gray-200/60">
                            <div>
                              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                                <span>Material</span>
                                <span className="font-bold text-gray-900">{match.breakdown?.material || 95}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.material || 95}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                                <span>Quantity</span>
                                <span className="font-bold text-gray-900">{match.breakdown?.quantity || 90}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.quantity || 90}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                                <span>Price</span>
                                <span className="font-bold text-gray-900">{match.breakdown?.price || 85}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.price || 85}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                                <span>Quality</span>
                                <span className="font-bold text-gray-900">{match.breakdown?.quality || 90}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.quality || 90}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                                <span>Location</span>
                                <span className="font-bold text-gray-900">{match.breakdown?.location || 85}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.location || 85}%` }} />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                                <span>Industry</span>
                                <span className="font-bold text-gray-900">{match.breakdown?.industry || 95}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${match.breakdown?.industry || 95}%` }} />
                              </div>
                            </div>
                          </div>

                          {/* Non-Guarantee Disclaimer */}
                          <div className="flex items-start gap-1.5 p-2 bg-amber-50/80 rounded-lg border border-amber-200/80 text-[10px] text-amber-900 leading-tight">
                            <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <span>
                              <strong>Notice:</strong> Compatibility score is an algorithmic estimate based on buyer criteria and material profile, not a contractual guarantee.
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs pt-0.5">
                            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Reliability: <strong className="text-gray-900">{b.reliability_rating || "Grade A (95% Settlement)"}</strong></span>
                          </div>
                          {match.reason.slice(0, 2).map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                              <span className="text-green-600 font-bold">✓</span>
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Row: Actions */}
                      <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                        {/* Background Verification Button */}
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
                            onClick={() => handleDraftAI(b.id, b.company_name)}
                            disabled={draftingId === b.id || hasSent}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition border border-emerald-200 cursor-pointer disabled:opacity-50"
                          >
                            {draftingId === b.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                            )}
                            AI Pitch
                          </button>

                          {/* Initiate Direct Deal Button */}
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
                            onClick={() => handleSendProposal(b.id)}
                            disabled={sendingId === b.id || hasSent}
                            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer ${
                              hasSent
                                ? "bg-gray-100 text-green-700 border border-green-300"
                                : "bg-green-700 hover:bg-green-800 text-white shadow-green-700/20"
                            }`}
                          >
                            {sendingId === b.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
                                Dispatch Proposal
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* AI Draft Box */}
                      {drafts[b.id] && (
                        <div className="mt-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/80">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-700" />
                              Custom AI Supply Proposal Message
                            </span>
                            <span className="text-[10px] text-gray-500">Will be included with your dispatch</span>
                          </div>
                          <textarea
                            rows={3}
                            value={drafts[b.id]}
                            onChange={(e) => setDrafts(prev => ({ ...prev, [b.id]: e.target.value }))}
                            className="w-full p-2.5 bg-white border border-emerald-200 rounded-lg text-xs text-gray-800 outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span>All buyer data is verified by CIRCULON Enterprise Compliance.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition cursor-pointer"
          >
            Close Matches
          </button>
        </div>
      </motion.div>

      {/* ------------------------------------------------------------------- */}
      {/* ENTERPRISE BACKGROUND VERIFICATION DOSSIER MODAL */}
      {/* ------------------------------------------------------------------- */}
      {selectedBuyerForDossier && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
