"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Recycle, 
  QrCode, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  ExternalLink,
  Printer,
  Sparkles,
  Download
} from "lucide-react";
import { type MaterialPassport } from "@/lib/types";
import { generateQRCodeSVG } from "@/utils/qrCode";
import Link from "next/link";

interface MaterialPassportModalProps {
  passport: MaterialPassport | null;
  onClose: () => void;
}

export function MaterialPassportModal({ passport, onClose }: MaterialPassportModalProps) {
  if (!passport) return null;

  const qrSvg = generateQRCodeSVG(
    typeof window !== 'undefined' ? `${window.location.origin}/passport/${passport.id}` : `/passport/${passport.id}`,
    160
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
        >
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-green-950 via-emerald-950 to-gray-950 text-white p-6 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-green-950 font-black">
                  <Recycle className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold block">
                    Digital Material Passport (DPP)
                  </span>
                  <h3 className="text-xl font-black text-white tracking-tight">{passport.materialName}</h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/passport/${passport.id}`}
                  target="_blank"
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 hover:text-white transition-colors"
                  title="Open in new window"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Main Spec & QR */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="sm:col-span-2 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Passport ID</span>
                    <span className="text-xs font-mono font-bold text-gray-900 block mt-0.5">{passport.id}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Batch Code</span>
                    <span className="text-xs font-mono font-bold text-gray-900 block mt-0.5">{passport.batchNumber}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Generator</span>
                    <span className="text-xs font-bold text-gray-900 block mt-0.5 truncate">{passport.originCompany}</span>
                    <span className="text-[10px] text-gray-500">{passport.originLocation}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 border border-gray-200">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Batch Volume</span>
                    <span className="text-base font-black text-emerald-700 block mt-0.5">
                      {passport.quantity.toLocaleString()} {passport.unit}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Circularity</span>
                    <span className="text-xl font-black text-emerald-800">{passport.circularityScore}/100</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-blue-700 block">Purity</span>
                    <span className="text-xl font-black text-blue-800">{passport.purityPercentage}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200">
                    <span className="text-[10px] uppercase font-bold text-teal-700 block">Quality</span>
                    <span className="text-xl font-black text-teal-800">{passport.qualityScore}/100</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col items-center text-center">
                <div 
                  className="w-36 h-36 rounded-xl border border-gray-200 bg-white p-2 flex items-center justify-center shadow-inner"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <span className="text-[11px] font-bold text-gray-800 mt-2">Scan for Verified History</span>
                <span className="text-[9px] text-gray-400 mt-0.5 font-mono truncate max-w-[140px]">
                  {passport.certificateHash}
                </span>
              </div>
            </div>

            {/* Environmental Dividends */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-green-900 text-white grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">CO2 Avoided</span>
                <span className="text-lg font-black text-white mt-0.5 block">{passport.co2AvoidedKg.toLocaleString()} KG</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Landfill Diverted</span>
                <span className="text-lg font-black text-white mt-0.5 block">{passport.landfillDivertedKg.toLocaleString()} KG</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Water Saved</span>
                <span className="text-lg font-black text-white mt-0.5 block">{passport.waterSavedLiters.toLocaleString()} L</span>
              </div>
            </div>

            {/* Chain of Custody */}
            <div className="space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-500 block">
                Chain of Custody Timeline
              </span>
              <div className="border-l-2 border-emerald-200 ml-3 pl-4 space-y-3 text-xs">
                {passport.custodyTimeline.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">{item.title}</span>
                      <span className="text-[10px] font-mono text-gray-400">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-gray-500">{item.actor} • {item.location}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xs">
              <span className="text-gray-400 font-mono text-[10px]">CIRCULON V2 Standard Protocol</span>
              <Link
                href={`/passport/${passport.id}`}
                target="_blank"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <span>View Full Passport Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
