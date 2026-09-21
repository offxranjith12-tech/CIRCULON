"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Recycle, 
  TrendingUp, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  BarChart3, 
  Truck, 
  Clock, 
  ArrowUpRight,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Leaf,
  Layers,
  Factory,
  ShoppingBag,
  Calculator,
  Sliders,
  DollarSign,
  HelpCircle,
  Zap,
  Package,
  FileCheck,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Supported Material Categories Data
const MATERIAL_CATEGORIES = [
  {
    id: "textiles",
    title: "Textiles & Apparel Scrap",
    icon: "🧵",
    materials: "Cotton comber, fabric clips, yarn waste, synthetic offcuts",
    avgRate: "₹25 - ₹48 / KG",
    demand: "High Demand",
    industries: "Acoustic panels, recycled yarn, cushion batting, insulation"
  },
  {
    id: "plastics",
    title: "Polymers & Engineering Plastics",
    icon: "🧴",
    materials: "HDPE drums, PET regrind, LDPE film, PP woven sacks",
    avgRate: "₹20 - ₹42 / KG",
    demand: "Very High Demand",
    industries: "Plastic lumber, drainage pipes, packaging pellets, granules"
  },
  {
    id: "metallurgy",
    title: "Foundry & Non-Ferrous Metals",
    icon: "⚙️",
    materials: "Aluminium turnings, copper scraps, brass dross, mild steel",
    avgRate: "₹65 - ₹220 / KG",
    demand: "Extremely High",
    industries: "Secondary smelting, automotive casting, alloy components"
  },
  {
    id: "paper",
    title: "Paper & Corrugated Packaging",
    icon: "📦",
    materials: "OCC cardboard bales, unprinted Kraft rolls, pulp trimmings",
    avgRate: "₹12 - ₹22 / KG",
    demand: "Moderate Demand",
    industries: "Duplex board manufacturing, egg trays, honeycomb packaging"
  },
  {
    id: "minerals",
    title: "Minerals & Industrial Slag",
    icon: "🧱",
    materials: "Fly ash, blast furnace slag, crushed concrete, silica sludge",
    avgRate: "₹6 - ₹18 / KG",
    demand: "Steady Demand",
    industries: "Geopolymer bricks, cement blending, road sub-base fill"
  }
];

// Presets for ROI Calculator
const CALCULATOR_MATERIALS: Record<string, { name: string; pricePerKg: number; category: string }> = {
  cotton: { name: "Cotton Mill Waste", pricePerKg: 38, category: "Textiles" },
  plastics: { name: "HDPE / PET Polymers", pricePerKg: 28, category: "Plastics" },
  aluminium: { name: "Aluminium Scrap Shavings", pricePerKg: 115, category: "Metals" },
  cardboard: { name: "Corrugated OCC Bales", pricePerKg: 15, category: "Paper" },
  flyash: { name: "Fly Ash / Foundry Sand", pricePerKg: 8, category: "Minerals" }
};

// Presets for AI Quick Diagnostics Demo
const AI_DEMO_PRESETS: Record<string, { material: string; category: string; industries: string[]; applications: string[]; confidence: number }> = {
  "cotton": {
    material: "Cotton Comber Waste (Grade A)",
    category: "Industrial Textiles",
    industries: ["Acoustic Panel Manufacturing", "Regenerated Yarn Spinning", "Automotive Insulation", "Medical Absorbents"],
    applications: ["High-density soundproofing felt", "Carded open-end spinning feedstock", "Cellulose fiber recovery"],
    confidence: 96
  },
  "plastic": {
    material: "HDPE Regrind Flakes",
    category: "Rigid Thermoplastics",
    industries: ["Agricultural Pipe Extrusion", "Heavy-Duty Pallet Molding", "Recycled Bottle Manufacturing"],
    applications: ["Direct extrusion for drip irrigation", "Injection-molded industrial crates", "Blow molding blend"],
    confidence: 94
  },
  "metal": {
    material: "Aluminium 6063 Turnings",
    category: "Non-Ferrous Metallurgy",
    industries: ["Secondary Billet Casting", "Deoxidant Steel Manufacturing", "Die-Cast Component Foundry"],
    applications: ["Direct remelting into architectural billets", "Aluminium shot for metallurgy", "Powder metallurgy"],
    confidence: 98
  }
};

// FAQ Data
const FAQS = [
  {
    q: "How does CIRCULON verify buyer and seller credibility?",
    a: "Every enterprise account must submit a physical company address and valid business registration (GSTIN, PAN, or Certificate of Incorporation). Our compliance administrators verify documents before any account can access the marketplace."
  },
  {
    q: "Who manages freight logistics and transportation?",
    a: "Our algorithm automatically factors in transportation logistics at ₹35/km and models the optimal delivery radius. Buyers and sellers can either coordinate their preferred logistics provider or use our integrated freight partners upon deal acceptance."
  },
  {
    q: "Is it completely free to list industrial waste?",
    a: "Yes! Listing your materials, receiving Google Gemini AI composition diagnostics, and reviewing buyer match opportunities is 100% free for industrial waste generators."
  },
  {
    q: "How does the Google Gemini AI material diagnostic work?",
    a: "When you enter waste details or upload photos, Google Gemini 2.5 Flash analyzes composition, standardizes naming, classifies quality tiers, and cross-references global circular manufacturing databases to uncover profitable reuse pathways."
  },
  {
    q: "What types of industrial waste are supported?",
    a: "We support a broad spectrum of commercial by-products including industrial textiles, thermoplastics and polymers, non-ferrous metals, corrugated packaging, and mineral slags."
  }
];

export default function Home() {
  // 1. ROI Calculator State
  const [calcMaterial, setCalcMaterial] = useState<string>("cotton");
  const [calcQuantity, setCalcQuantity] = useState<number>(2500); // in KG
  const [calcDistance, setCalcDistance] = useState<number>(60); // in KM

  const selectedMaterialData = CALCULATOR_MATERIALS[calcMaterial];
  const grossValue = calcQuantity * selectedMaterialData.pricePerKg;
  const transportCost = calcDistance * 35; // ₹35 per km
  const netValue = Math.max(0, grossValue - transportCost);
  const opportunityScore = Math.min(99, Math.max(60, Math.round(75 + (selectedMaterialData.pricePerKg / 10) - (calcDistance / 40))));

  // 2. Audience Toggle State ("seller" vs "buyer")
  const [audienceTab, setAudienceTab] = useState<"seller" | "buyer">("seller");

  // 3. AI Quick Diagnostic Demo State
  const [demoSelected, setDemoSelected] = useState<string>("cotton");
  const [isDemoAnalyzing, setIsDemoAnalyzing] = useState(false);
  const activeDemo = AI_DEMO_PRESETS[demoSelected];

  const triggerDemoAnalysis = (key: string) => {
    setIsDemoAnalyzing(true);
    setDemoSelected(key);
    setTimeout(() => {
      setIsDemoAnalyzing(false);
    }, 450);
  };

  // 4. FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // 5. Contact Form State
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    company: "",
    materialType: "",
    message: ""
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="flex flex-col w-full bg-white selection:bg-green-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 0. LIVE MARKETPLACE ACTIVITY TICKER */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-green-950 via-green-900 to-emerald-950 text-green-100 text-xs py-2.5 px-4 border-b border-green-800/60 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-bold text-white tracking-wide uppercase text-[11px]">
              Live Circular Intelligence Network
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] font-medium text-green-200">
            <span>🟢 48 Verified Buyers Active</span>
            <span>•</span>
            <span>📦 45,200 KG Diverted This Month</span>
            <span>•</span>
            <span>⚡ ₹35/km Route Cost Engine</span>
            <span>•</span>
            <span>🛡️ 100% Zero-Landfill Verified</span>
          </div>
          <Link href="/login" className="text-white hover:text-green-300 font-bold underline text-[11px]">
            Join Network →
          </Link>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH UI MOCKUP PREVIEW */}
      {/* ========================================================================= */}
      <section id="home" className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-green-50/80 via-emerald-50/30 to-white">
        {/* Glow ambient backdrops */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-green-200/40 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-80 h-80 bg-emerald-300/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Pill Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100/90 border border-green-300/70 text-green-800 text-xs sm:text-sm font-semibold mb-6 shadow-xs hover:bg-green-100 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-green-600 animate-pulse" />
              <span>AI-Powered Waste-to-Buyer Circular Intelligence</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-gray-950 tracking-tight leading-[1.12]"
            >
              Don't recycle everything. <br />
              <span className="bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Find who already needs it.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto"
            >
              CIRCULON pairs <strong>Google Gemini 2.5 AI</strong> with real-time freight economics to transform factory offcuts, scrap, and by-products into high-value raw material supply chains.
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
            >
              <Link 
                href="/waste/add" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/25 hover:shadow-xl hover:shadow-green-600/35 hover:-translate-y-0.5 transition-all duration-200"
              >
                List Your Waste
                <ArrowRight className="ml-2.5 h-5 w-5" />
              </Link>
              <a 
                href="#calculator" 
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-green-800 bg-white border-2 border-green-600/80 hover:bg-green-50 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <Calculator className="w-5 h-5 mr-2 text-green-600" />
                Calculate Scrap Value
              </a>
            </motion.div>

            {/* User Highlighted Cards (Streamlined Operations & Faster Submissions) */}
            <motion.div 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto"
            >
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-green-200/80 shadow-md shadow-green-900/5 hover:border-green-400 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Streamlined Operations</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mt-2 pl-1">
                  Connects buyers and sellers on a single, easy-to-use platform, simplifying the entire waste management and commercial procurement process.
                </p>
              </div>

              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl border border-green-200/80 shadow-md shadow-green-900/5 hover:border-green-400 transition-all group">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-700 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">Faster Submissions</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mt-2 pl-1">
                  Enables sellers to submit scrap or product requests quickly—within a minute—with automated Gemini AI classification and immediate buyer matching.
                </p>
              </div>
            </motion.div>
          </div>

          {/* ========================================================================= */}
          {/* HERO PRODUCT PREVIEW MOCKUP */}
          {/* ========================================================================= */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 max-w-5xl mx-auto"
          >
            <div className="relative rounded-3xl bg-gray-900 p-2 sm:p-4 shadow-2xl ring-1 ring-white/10">
              <div className="bg-white rounded-2xl overflow-hidden border border-gray-200">
                {/* Mockup Header Bar */}
                <div className="bg-gray-100/90 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="text-xs font-mono text-gray-500 ml-2">circulon.ai/matches?material=Cotton+Comber</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-ping" />
                      Live AI Match Found
                    </span>
                  </div>
                </div>

                {/* Mockup Content Body */}
                <div className="p-6 sm:p-8 bg-gray-50/50">
                  <div className="bg-white rounded-xl border border-green-500 ring-2 ring-green-500/20 shadow-lg p-6 flex flex-col md:flex-row gap-6 items-center justify-between">
                    {/* Left Score */}
                    <div className="flex flex-col items-center justify-center md:border-r border-gray-100 md:pr-8">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Opportunity Score</span>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-5xl font-black text-green-600">94</span>
                        <span className="text-sm font-bold text-gray-400">/ 100</span>
                      </div>
                      <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full mt-2">
                        ⭐ Top Commercial Fit
                      </span>
                    </div>

                    {/* Center Details */}
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        <h4 className="text-xl font-bold text-gray-900">EcoThreads Acoustic Mfg.</h4>
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 text-blue-600" /> Verified Buyer
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 flex items-center justify-center md:justify-start gap-3">
                        <span>📍 Coimbatore, Tamil Nadu (50 KM away)</span>
                        <span>•</span>
                        <span>Industry: Acoustic Materials & Recycled Non-Wovens</span>
                      </p>
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs">
                        <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                          <span className="text-gray-500">Gross Offer: </span>
                          <strong className="text-gray-900">₹38 / KG</strong>
                        </div>
                        <div className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                          <span className="text-gray-500">Freight (50 KM): </span>
                          <strong className="text-red-600">- ₹1,750</strong>
                        </div>
                        <div className="bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                          <span className="text-green-700">Projected Net: </span>
                          <strong className="text-green-900 font-bold">₹93,250 (for 2.5 Tons)</strong>
                        </div>
                      </div>
                    </div>

                    {/* Right Button Action */}
                    <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                      <Link
                        href="/login"
                        className="px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition shadow-sm text-center flex items-center justify-center gap-1.5"
                      >
                        <Send className="w-4 h-4" /> Send Request
                      </Link>
                      <span className="text-[10px] text-gray-400 text-center">AI Proposal Drafted</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. DUAL-AUDIENCE TOGGLE (SELLERS VS. BUYERS) */}
      {/* ========================================================================= */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-green-700 font-bold text-xs uppercase tracking-widest bg-green-100/80 px-3 py-1 rounded-md border border-green-200">
              Two Sides of the Circular Platform
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-4 tracking-tight">
              Engineered for Both Scrap Generators & Material Buyers
            </h2>
            <p className="text-gray-600 mt-2 text-base">
              Choose your perspective to see how CIRCULON accelerates your bottom line.
            </p>

            {/* Toggle Selector */}
            <div className="inline-flex rounded-2xl bg-white p-1.5 border border-gray-300 shadow-sm mt-8">
              <button
                onClick={() => setAudienceTab("seller")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  audienceTab === "seller"
                    ? "bg-green-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Factory className="w-4 h-4" />
                I Have Waste to Sell (Generators)
              </button>
              <button
                onClick={() => setAudienceTab("buyer")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                  audienceTab === "buyer"
                    ? "bg-green-600 text-white shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                I Need Raw Materials (Buyers)
              </button>
            </div>
          </div>

          {/* Tab 1: For Waste Generators */}
          {audienceTab === "seller" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  <DollarSign className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Zero Tipping Fees, Real Profit</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Stop treating by-products as disposal liabilities. Sell directly to manufacturers paying top-tier rates for your secondary outputs.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Instant AI Diagnostics</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Upload scrap photos or descriptions. Gemini identifies standardized grades, moisture/condition tiers, and recommended cross-industry buyers.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">ESG & Landfill Diversion</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Generate instant diversion metrics for ESG reporting, meeting strict sustainability directives without administrative friction.
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: For Commercial Buyers */}
          {audienceTab === "buyer" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in duration-300">
              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">30%–50% Lower Input Costs</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Substitute expensive virgin materials with verified industrial by-products that meet your manufacturing quality thresholds.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Admin-Verified Suppliers</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Transact only with verified factories. Every supplier must submit verified physical addresses and valid business registration ID proofs.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Predictable Supply Batches</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Receive real-time notifications whenever factories in your geographic perimeter generate the exact material batches you need.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE SCRAP VALUE & ROI CALCULATOR */}
      {/* ========================================================================= */}
      <section id="calculator" className="py-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-green-700 font-bold text-xs uppercase tracking-widest bg-green-100/80 px-3 py-1 rounded-md border border-green-200">
              Instant Valuation Widget
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-gray-950 mt-3 tracking-tight">
              Calculate Your Estimated Scrap Value
            </h2>
            <p className="text-gray-600 mt-3 text-base sm:text-lg">
              Test how much your industrial scrap could be worth after factoring in ₹35/km freight deductions.
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-green-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-gray-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Left Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 1. Material Selector */}
                <div>
                  <label className="block text-xs font-bold text-green-400 uppercase tracking-wider mb-2">
                    1. Select Scrap Material Type
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.keys(CALCULATOR_MATERIALS).map((key) => {
                      const item = CALCULATOR_MATERIALS[key];
                      const isSelected = calcMaterial === key;
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setCalcMaterial(key)}
                          className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                            isSelected
                              ? "bg-green-600 text-white border-green-400 shadow-md ring-2 ring-green-400/40"
                              : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <div>{item.name}</div>
                          <div className="text-[11px] opacity-80 mt-1">₹{item.pricePerKg} / KG</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Quantity Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-green-400 uppercase tracking-wider">
                      2. Available Scrap Quantity (KG)
                    </label>
                    <span className="text-lg font-black text-white bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                      {calcQuantity.toLocaleString()} KG ({(calcQuantity / 1000).toFixed(1)} Tons)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={15000}
                    step={100}
                    value={calcQuantity}
                    onChange={(e) => setCalcQuantity(Number(e.target.value))}
                    className="w-full h-2.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>200 KG</span>
                    <span>5,000 KG</span>
                    <span>10,000 KG</span>
                    <span>15,000 KG</span>
                  </div>
                </div>

                {/* 3. Distance Slider */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-green-400 uppercase tracking-wider">
                      3. Estimated Transit Distance (KM)
                    </label>
                    <span className="text-lg font-black text-white bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                      {calcDistance} KM
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={250}
                    step={5}
                    value={calcDistance}
                    onChange={(e) => setCalcDistance(Number(e.target.value))}
                    className="w-full h-2.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>10 KM (Local)</span>
                    <span>100 KM</span>
                    <span>250 KM (Regional Hub)</span>
                  </div>
                </div>
              </div>

              {/* Right Output Box (5 cols) */}
              <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-white/15 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-green-300">
                    Projected Economics
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-400 text-green-950">
                    Score: {opportunityScore}/100
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Gross Offered Value:</span>
                    <span className="font-semibold text-white">₹{grossValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Transport Deduction (@ ₹35/km):</span>
                    <span className="font-semibold text-red-400">- ₹{transportCost.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-gray-400 uppercase block">Estimated Net Value</span>
                      <span className="text-3xl sm:text-4xl font-black text-green-400">
                        ₹{netValue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/waste/add?material=${encodeURIComponent(selectedMaterialData.name)}&quantity=${calcQuantity}`}
                  className="w-full py-4 bg-green-500 hover:bg-green-400 text-green-950 font-bold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2"
                >
                  Claim This Value & Find Buyers
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-[11px] text-gray-400 text-center">
                  *Based on verified historical transaction benchmarks in Tamil Nadu & South India.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. INTERACTIVE AI MATERIAL DIAGNOSTIC PREVIEW */}
      {/* ========================================================================= */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-green-700 font-bold text-xs uppercase tracking-widest bg-green-100/80 px-3 py-1 rounded-md border border-green-200">
              Interactive AI Diagnostic Test
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-3 tracking-tight">
              Test How Gemini AI Categorizes Your Scrap
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Click any sample industrial scrap below to see live simulated Google Gemini outputs.
            </p>

            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <button
                onClick={() => triggerDemoAnalysis("cotton")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  demoSelected === "cotton"
                    ? "bg-green-700 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Sample 1: Denim & Cotton Offcuts
              </button>
              <button
                onClick={() => triggerDemoAnalysis("plastic")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  demoSelected === "plastic"
                    ? "bg-green-700 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Sample 2: HDPE Blow-Molding Flakes
              </button>
              <button
                onClick={() => triggerDemoAnalysis("metal")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  demoSelected === "metal"
                    ? "bg-green-700 text-white shadow-sm"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
                }`}
              >
                Sample 3: Foundry Aluminium Turnings
              </button>
            </div>
          </div>

          {/* AI Result Card */}
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border-2 border-green-500 shadow-xl relative">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-base">Gemini 2.5 Diagnostic Output</h4>
                  <span className="text-xs text-gray-500">Autonomous circular classification engine</span>
                </div>
              </div>
              <span className="text-xs font-bold bg-green-100 text-green-800 px-3 py-1 rounded-full">
                Confidence: {activeDemo.confidence}%
              </span>
            </div>

            {isDemoAnalyzing ? (
              <div className="py-12 text-center text-gray-400 space-y-2">
                <Sparkles className="w-8 h-8 animate-spin mx-auto text-green-600" />
                <p className="text-sm font-semibold text-gray-600">Analyzing chemical composition & market index...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">Standardized Material</span>
                    <p className="font-bold text-gray-900 text-base mt-0.5">{activeDemo.material}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <span className="text-[11px] font-bold text-gray-500 uppercase">Material Category</span>
                    <p className="font-bold text-gray-900 text-base mt-0.5">{activeDemo.category}</p>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                    Identified Secondary Consumer Industries:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeDemo.industries.map((ind, i) => (
                      <span key={i} className="px-3 py-1 bg-green-50 text-green-800 border border-green-200 rounded-lg text-xs font-semibold">
                        ✓ {ind}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
                    High-Margin Application Pathways:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700">
                    {activeDemo.applications.map((app, i) => (
                      <li key={i} className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        <span>{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SUPPORTED MATERIAL CATEGORIES GRID */}
      {/* ========================================================================= */}
      <section className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-green-700 font-bold text-xs uppercase tracking-widest bg-green-100/80 px-3 py-1 rounded-md border border-green-200">
              Material Ecosystem
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-3 tracking-tight">
              Supported Industrial Material Streams
            </h2>
            <p className="text-gray-600 mt-2 text-base">
              CIRCULON actively routes five high-volume industrial waste streams to verified commercial manufacturing facilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MATERIAL_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-green-400 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl">{cat.icon}</span>
                    <span className="text-[11px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200">
                      {cat.demand}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.title}</h3>
                  <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                    <strong>Typical Feedstocks:</strong> {cat.materials}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Benchmark Rate:</span>
                    <strong className="text-green-700 font-bold">{cat.avgRate}</strong>
                  </div>
                  <div className="text-gray-500">
                    <span className="font-semibold text-gray-700">Buyer End-Uses:</span> {cat.industries}
                  </div>
                </div>
              </div>
            ))}

            {/* Custom Material Request card */}
            <div className="bg-gradient-to-br from-green-800 to-emerald-900 p-7 rounded-2xl text-white shadow-md flex flex-col justify-between">
              <div>
                <span className="text-3xl">🔬</span>
                <h3 className="text-xl font-bold mt-4 mb-2">Have a Custom Material?</h3>
                <p className="text-xs text-green-100 leading-relaxed">
                  Have unique chemical by-products, electronic scraps, or specialized production sludges? Our AI engine can cross-reference niche global applications.
                </p>
              </div>
              <div className="pt-6">
                <Link
                  href="/waste/add"
                  className="w-full py-3 bg-white text-green-900 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 hover:bg-green-50 transition"
                >
                  Submit Custom Listing
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. SOCIAL PROOF & REAL CASE STUDY */}
      {/* ========================================================================= */}
      <section className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-green-700 font-bold text-xs uppercase tracking-widest bg-green-100/80 px-3 py-1 rounded-md border border-green-200">
              Verified Case Study
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-3 tracking-tight">
              Real Impact: Cotton Waste to Acoustic Panels
            </h2>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-green-800 bg-green-100 px-3 py-1 rounded-full">
                  <Factory className="w-3.5 h-3.5" />
                  Spinning Facility — Tirupur, Tamil Nadu
                </div>
                <h3 className="text-2xl font-black text-gray-900">
                  Converting 4.5 Tons of Disposal Burden into ₹1,48,000 Revenue
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Before CIRCULON, the mill paid local waste contractors ₹4,000 per pickup to haul away tangled cotton comber scrap. Using CIRCULON, the AI matched their comber batch directly to an acoustic insulation manufacturer in Coimbatore within 18 hours.
                </p>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="border-l-2 border-green-500 pl-3">
                    <div className="text-2xl font-black text-green-700">₹1.48L</div>
                    <div className="text-xs text-gray-500">Net Revenue Made</div>
                  </div>
                  <div className="border-l-2 border-green-500 pl-3">
                    <div className="text-2xl font-black text-gray-900">4,500 KG</div>
                    <div className="text-xs text-gray-500">Diverted from Landfill</div>
                  </div>
                  <div className="border-l-2 border-green-500 pl-3">
                    <div className="text-2xl font-black text-green-700">18 Tons</div>
                    <div className="text-xs text-gray-500">CO₂ Eq. Reduced</div>
                  </div>
                </div>
              </div>

              {/* ESG Badges Box */}
              <div className="lg:col-span-5 bg-green-50 p-6 rounded-2xl border border-green-200 space-y-4">
                <h4 className="font-bold text-green-950 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-700" />
                  Regulatory & Compliance Alignment
                </h4>
                <div className="space-y-2.5 text-xs text-green-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span><strong>CPCB Guidelines:</strong> Strict alignment with Central Pollution Control Board.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span><strong>ISO 14001:</strong> Supports environmental management certification.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span><strong>BRSR Audit Trail:</strong> Full digital documentation for ESG disclosures.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. ABOUT CIRCULON */}
      {/* ========================================================================= */}
      <section id="about" className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Col: Info */}
            <div className="space-y-6">
              <span className="text-green-700 font-bold text-xs uppercase tracking-widest bg-green-100/80 px-3 py-1 rounded-md border border-green-200">
                About CIRCULON
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-950 tracking-tight leading-tight">
                Pioneering the Industrial Circular Supply Chain
              </h2>
              <p className="text-gray-600 text-base leading-relaxed">
                Industrial manufacturing produces millions of metric tons of scraps every week. Because material engineers and procurement managers lack cross-industry visibility, high-grade by-products are routinely downcycled into low-grade aggregates or dumped into landfills.
              </p>
              <p className="text-gray-600 text-base leading-relaxed">
                CIRCULON solves this systemic market inefficiency by mapping secondary material properties directly to secondary buyer specifications, transforming waste management into an automated, transparent profit center.
              </p>

              <div className="pt-2">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 hover:underline"
                >
                  Read our full architectural overview <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right Col: 3 Core Pillars */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <span className="text-green-600 font-black">1.</span> Algorithmic Matching
                </h4>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Matches industrial output specs against real-time manufacturing intake parameters without manual broker intervention.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <span className="text-green-600 font-black">2.</span> Transport Cost Truth
                </h4>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Logistics at ₹35/km are calculated upfront so neither party encounters hidden freight surprises.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <span className="text-green-600 font-black">3.</span> Verified Enterprise Network
                </h4>
                <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                  Every company on CIRCULON has had its physical address and business registration proof vetted by an administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. HOW IT WORKS (STEP BY STEP) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-green-700 font-bold text-xs uppercase tracking-widest bg-green-100/70 px-3 py-1 rounded-md border border-green-200">
              Simple 4-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-3 tracking-tight">
              From Scrap to Purchase Order in Minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group hover:border-green-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 font-black flex items-center justify-center mb-4 text-lg">
                1
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Submit Waste Details</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Enter scrap type, estimated quantity in KG, condition, and pickup location in under 60 seconds.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group hover:border-green-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 font-black flex items-center justify-center mb-4 text-lg">
                2
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Instant AI Diagnostic</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Google Gemini standardizes your material and identifies multiple secondary commercial reuse pathways.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group hover:border-green-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 font-black flex items-center justify-center mb-4 text-lg">
                3
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Buyer Scoring & Margin</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                The matching engine scores active buyers, deducts logistics cost, and ranks the highest net profit return.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group hover:border-green-400 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-800 font-black flex items-center justify-center mb-4 text-lg">
                4
              </div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">Connect & Transact</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Send direct connection requests accompanied by AI-drafted business proposals to close deals swiftly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. INTERACTIVE FAQ ACCORDION */}
      {/* ========================================================================= */}
      <section id="faq" className="py-24 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-green-700 font-bold text-xs uppercase tracking-widest bg-green-100/80 px-3 py-1 rounded-md border border-green-200">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-3 tracking-tight">
              Everything You Need to Know
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Got questions about verification, freight calculations, or buyer connections?
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-gray-900 text-sm sm:text-base hover:text-green-700 transition"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-lg bg-white border border-gray-200 text-gray-500">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-200/60 animate-in fade-in duration-200">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. CONTACT SECTION */}
      {/* ========================================================================= */}
      <section id="contact" className="py-24 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-green-700 font-bold text-xs uppercase tracking-widest bg-green-100/70 px-3 py-1 rounded-md border border-green-200">
              Get in Touch
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-950 mt-3 tracking-tight">
              Speak with a Circular Logistics Specialist
            </h2>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Inquire about high-volume industrial contracts or register your plant as an anchor buyer.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Contact Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Direct Support Email</h4>
                  <a href="mailto:support@circulon.ai" className="text-xs font-semibold text-green-700 hover:underline mt-0.5 block">
                    support@circulon.ai
                  </a>
                  <p className="text-[11px] text-gray-400 mt-0.5">Average turnaround under 2 hours</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Enterprise Desk</h4>
                  <a href="tel:+914428367890" className="text-xs font-semibold text-green-700 hover:underline mt-0.5 block">
                    +91 (0) 44 2836 7890
                  </a>
                  <p className="text-[11px] text-gray-400 mt-0.5">Mon - Sat: 9:00 AM – 6:30 PM IST</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Headquarters</h4>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Industrial Technology Corridor, Chennai & Coimbatore Hub, Tamil Nadu, India
                  </p>
                </div>
              </div>
            </div>

            {/* Form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-sm">
              {contactSubmitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Message Received!</h3>
                  <p className="text-xs text-gray-600 max-w-sm mx-auto">
                    Thank you for reaching out. Our industrial team will review your specifications and contact you shortly.
                  </p>
                  <button
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactForm({ name: "", email: "", company: "", materialType: "", message: "" });
                    }}
                    className="mt-2 px-5 py-2 bg-green-600 text-white font-bold text-xs rounded-lg hover:bg-green-700 transition"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Send an Enterprise Inquiry</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Kumar"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="ramesh@company.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Spinning Mills"
                        value={contactForm.company}
                        onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                        className="w-full px-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                        Material Type / Inquiry
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Cotton Comber, HDPE Bales"
                        value={contactForm.materialType}
                        onChange={(e) => setContactForm({ ...contactForm, materialType: e.target.value })}
                        className="w-full px-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Message *
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Tell us about your monthly scrap volumes or procurement requirements..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-2 text-xs rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 11. HIGH-IMPACT CALL TO ACTION BANNER */}
      {/* ========================================================================= */}
      <section className="py-16 bg-gradient-to-r from-green-950 via-green-900 to-emerald-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Unlock Hidden Revenue from Industrial Waste?
          </h2>
          <p className="text-green-100 text-sm sm:text-base max-w-2xl mx-auto">
            Join hundreds of verified manufacturing facilities and commercial recyclers operating on India's most advanced circular economy intelligence platform.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/waste/add"
              className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-400 text-green-950 font-bold rounded-xl shadow-lg transition text-sm"
            >
              List Waste Now (Free)
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold rounded-xl transition text-sm"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
