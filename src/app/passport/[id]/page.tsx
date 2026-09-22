import { getMaterialPassport } from "@/lib/actions/passport";
import { generateQRCodeSVG } from "@/utils/qrCode";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  Recycle, 
  ShieldCheck, 
  Award, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Download, 
  Printer, 
  ArrowLeft,
  Building2,
  Cpu,
  Layers,
  Sparkles,
  Share2
} from "lucide-react";

interface PassportPageProps {
  params: Promise<{ id: string }>;
}

export default async function PassportPage({ params }: PassportPageProps) {
  const { id } = await params;
  const passport = await getMaterialPassport(id);

  if (!passport) {
    notFound();
  }

  const qrSvg = generateQRCodeSVG(
    typeof window !== 'undefined' ? window.location.href : `https://circulon.ai/passport/${passport.id}`,
    180
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation / Action Bar */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-mono hidden sm:inline">
              Hash: {passport.certificateHash.slice(0, 16)}...
            </span>
          </div>
        </div>

        {/* Digital Product Passport Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden print:shadow-none print:border-none">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-green-950 via-emerald-950 to-gray-950 text-white p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-green-950 font-black shadow-lg shadow-emerald-500/30">
                  <Recycle className="w-7 h-7 animate-[spin_12s_linear_infinite]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold tracking-widest uppercase text-emerald-400">
                      CIRCULON DIGITAL MATERIAL PASSPORT
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      DPP V2 VERIFIED
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                    {passport.materialName}
                  </h1>
                </div>
              </div>

              {/* Passport ID & Batch */}
              <div className="text-left sm:text-right bg-white/5 border border-white/10 rounded-xl p-3">
                <span className="text-[10px] uppercase font-bold text-emerald-300 block">Passport ID</span>
                <span className="text-sm font-mono font-black text-white">{passport.id}</span>
                <span className="text-[10px] text-gray-400 block mt-0.5">Batch: {passport.batchNumber}</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            {/* Primary Details Grid & QR Code */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Material Origin & Spec */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                  Material Profile & Chain of Origin
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Originating Generator</span>
                    <span className="text-sm font-black text-gray-900 mt-0.5 block">{passport.originCompany}</span>
                    <span className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {passport.originLocation}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Verified Consignee</span>
                    <span className="text-sm font-black text-gray-900 mt-0.5 block">
                      {passport.buyerCompany || 'Pending Final Allocation'}
                    </span>
                    <span className="text-xs text-emerald-600 mt-0.5 font-semibold">
                      {passport.buyerCompany ? 'Contract Locked' : 'Open for Bidding'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Net Batch Quantity</span>
                    <span className="text-xl font-black text-gray-900 mt-0.5 block">
                      {passport.quantity.toLocaleString()} {passport.unit}
                    </span>
                    <span className="text-xs text-gray-500">Certified Tare Weighbridge</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Material Category</span>
                    <span className="text-sm font-black text-emerald-800 mt-0.5 block">{passport.category}</span>
                    <span className="text-xs text-gray-500">Industrial By-Product</span>
                  </div>
                </div>

                {/* Score Indicators */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Circularity Index</span>
                    <span className="text-2xl font-black text-emerald-800">{passport.circularityScore}/100</span>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-blue-700 block">Material Purity</span>
                    <span className="text-2xl font-black text-blue-800">{passport.purityPercentage}%</span>
                  </div>

                  <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-teal-700 block">Quality Grade</span>
                    <span className="text-2xl font-black text-teal-800">{passport.qualityScore}/100</span>
                  </div>
                </div>
              </div>

              {/* QR Code Verification Display */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col items-center text-center">
                <div 
                  className="w-44 h-44 rounded-xl shadow-inner border border-gray-200 bg-white p-2 flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
                <span className="text-xs font-black text-gray-900 mt-3">Scan to Verify Chain of Custody</span>
                <span className="text-[11px] text-gray-500 mt-0.5">
                  Public decentralized verification record
                </span>
                <div className="mt-3 w-full pt-3 border-t border-gray-200">
                  <span className="text-[9px] font-mono text-gray-400 block truncate" title={passport.certificateHash}>
                    {passport.certificateHash}
                  </span>
                </div>
              </div>
            </div>

            {/* Environmental Impact Credits */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-900 to-green-950 text-white p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300">
                  Certified Ecological Avoidance Dividends (ISO 14040 Benchmark)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-emerald-200 block">CO2e Emissions Avoided</span>
                  <span className="text-2xl font-black text-emerald-300 mt-1 block">
                    {passport.co2AvoidedKg.toLocaleString()} KG
                  </span>
                  <span className="text-[10px] text-emerald-100/70">Equivalent to {(passport.co2AvoidedKg / 22).toFixed(0)} tree years</span>
                </div>

                <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-emerald-200 block">Landfill Diversion</span>
                  <span className="text-2xl font-black text-emerald-300 mt-1 block">
                    {passport.landfillDivertedKg.toLocaleString()} KG
                  </span>
                  <span className="text-[10px] text-emerald-100/70">100% Diverted from Municipal Dump</span>
                </div>

                <div className="p-3 rounded-xl bg-white/10 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-emerald-200 block">Industrial Water Conserved</span>
                  <span className="text-2xl font-black text-emerald-300 mt-1 block">
                    {passport.waterSavedLiters.toLocaleString()} L
                  </span>
                  <span className="text-[10px] text-emerald-100/70">Virgin Processing Water Offset</span>
                </div>
              </div>
            </div>

            {/* Verified Chain of Custody Timeline */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400">
                Verified Chain of Custody & Physical Journey
              </h3>

              <div className="relative border-l-2 border-emerald-200 ml-3.5 pl-6 space-y-6">
                {passport.custodyTimeline.map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className={`absolute -left-[31px] top-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white ${
                      item.status === 'completed' ? 'bg-emerald-600' : item.status === 'in_progress' ? 'bg-amber-500 animate-pulse' : 'bg-gray-300'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                    </div>

                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span className="text-sm font-black text-gray-900">{item.title}</span>
                        <span className="text-xs font-mono text-gray-500">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-emerald-800 font-semibold mt-0.5">
                        {item.actor} • {item.location}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100 mt-1.5">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Proof Footer */}
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Digitally signed and cryptographically anchored by CIRCULON V2 Protocol.</span>
              </div>
              <span>Registered on: {new Date(passport.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
