"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Upload, 
  Loader2, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  Leaf, 
  Recycle, 
  Layers, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  IndianRupee, 
  Factory, 
  Calendar, 
  ShieldCheck, 
  ArrowRight,
  Droplets,
  Scale
} from "lucide-react";
import { analyzeWaste, type WasteData, type AiAnalysisResult } from "@/lib/aiService";
import { addWasteMaterial } from "@/lib/actions/waste";
import Link from "next/link";
import { motion } from "framer-motion";

const MATERIAL_CATEGORIES = [
  "Textiles",
  "Plastics & Polymers",
  "Metallurgy & Foundry",
  "Paper & Packaging",
  "Agricultural Residue",
  "Biomass & Bio-Energy",
  "Minerals & Slag",
  "General Industrial Waste"
];

export default function AddWastePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    wasteType: "",
    category: "Textiles",
    quantity: 1000,
    unit: "KG",
    condition: "Dry, clean, baled",
    moisturePercentage: 6,
    contaminationLevel: "Low",
    location: "Tamil Nadu",
    expectedPrice: 35,
    availableDate: "Immediate Dispatch",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "quantity" || name === "moisturePercentage" || name === "expectedPrice" ? Number(value) : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataPayload: WasteData = {
        wasteType: formData.wasteType,
        category: formData.category,
        quantity: formData.quantity,
        unit: formData.unit,
        condition: formData.condition,
        moisturePercentage: formData.moisturePercentage,
        contaminationLevel: formData.contaminationLevel,
        location: formData.location,
        expectedPrice: formData.expectedPrice,
        availableDate: formData.availableDate,
        description: formData.description,
        imageUrl: imagePreview || undefined,
      };

      const result = await analyzeWaste(dataPayload);
      setAiResult(result);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndFindBuyers = async () => {
    setPublishing(true);
    const form = new FormData();
    form.append('material_name', aiResult?.material || formData.wasteType);
    form.append('category', aiResult?.category || formData.category);
    form.append('quantity', formData.quantity.toString());
    form.append('unit', formData.unit);
    form.append('condition', formData.condition);
    form.append('moisture_percentage', formData.moisturePercentage.toString());
    form.append('contamination_level', formData.contaminationLevel);
    form.append('location', formData.location);
    form.append('expected_price', formData.expectedPrice.toString());
    form.append('available_date', formData.availableDate);
    form.append('description', formData.description);
    if (imageFile) form.append('image_file', imageFile);

    let newWasteId = "";
    try {
      const result = await addWasteMaterial(form);
      if (result) newWasteId = result.id;
    } catch (err) {
      console.error(err);
      setPublishing(false);
      return;
    }

    const params = new URLSearchParams({
      wasteId: newWasteId,
      materialType: aiResult?.material || formData.wasteType,
      quantity: formData.quantity.toString()
    });
    router.push(`/matches?${params.toString()}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Page Header */}
      <div className="border-b border-gray-200/80 pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
              Waste Generator
            </span>
            <span className="text-xs text-gray-500 font-medium">Step 1: Classification & AI Diagnostics</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 mt-1.5">
            Add New Waste Listing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Provide byproduct specifications for automated AI circular classification, valuation, and verified buyer matching.
          </p>
        </div>

        <Link
          href="/waste"
          className="text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
        >
          View My Listings →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FORM SECTION (LEFT COLUMN) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs">
          <form onSubmit={handleAnalyze} className="space-y-5">
            {/* Material Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Material Name / Waste Stream *
              </label>
              <input 
                type="text" 
                name="wasteType"
                placeholder="e.g. Cotton Textile Waste, PET Flakes, Rice Husk"
                value={formData.wasteType}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" 
                required 
              />
            </div>

            {/* Category & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Material Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                >
                  {MATERIAL_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Quantity *
                  </label>
                  <input 
                    type="number" 
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  >
                    <option value="KG">KG</option>
                    <option value="MT">MT (Tons)</option>
                    <option value="Bales">Bales</option>
                    <option value="Litres">Litres</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Moisture & Contamination */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  Moisture Percentage (%)
                </label>
                <input 
                  type="number" 
                  name="moisturePercentage"
                  min="0"
                  max="100"
                  value={formData.moisturePercentage}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Contamination Level
                </label>
                <select
                  name="contaminationLevel"
                  value={formData.contaminationLevel}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                >
                  <option value="Low">Low (Negligible impurities, &lt; 2%)</option>
                  <option value="Medium">Medium (Sortable mixed impurities, 2-10%)</option>
                  <option value="High">High (Requires specialized pre-cleaning)</option>
                </select>
              </div>
            </div>

            {/* Location & Expected Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Pickup Location / City *
                </label>
                <input 
                  type="text" 
                  name="location"
                  placeholder="e.g. Tirupur, Tamil Nadu"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5 text-green-700" />
                  Expected Target Price (₹ / {formData.unit})
                </label>
                <input 
                  type="number" 
                  name="expectedPrice"
                  min="0"
                  value={formData.expectedPrice}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                />
              </div>
            </div>

            {/* Condition & Available Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Material Condition *
                </label>
                <input 
                  type="text" 
                  name="condition"
                  placeholder="e.g. Dry, clean, baled, sorted"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  Available Date / Batch Readiness
                </label>
                <input 
                  type="text" 
                  name="availableDate"
                  placeholder="e.g. Immediate, or 2026-10-01"
                  value={formData.availableDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Technical Description & Storage Context
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                placeholder="Details on generation process, fiber length, particle size, packaging, or moisture protection..."
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none" 
              />
            </div>

            {/* Waste Image Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Upload Waste Photo (For AI Vision Diagnostics)
              </label>
              <input 
                type="file" 
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="hidden" 
              />
              {imagePreview ? (
                <div className="relative border border-gray-300 rounded-2xl overflow-hidden h-44 bg-gray-50 flex items-center justify-center">
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => { setImagePreview(null); setImageFile(null); if(fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white p-1.5 rounded-full text-red-600 shadow-md transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-2xl p-5 flex flex-col items-center justify-center bg-gray-50/70 text-gray-500 cursor-pointer hover:bg-emerald-50/50 hover:border-emerald-400 transition"
                >
                  <Upload className="h-6 w-6 mb-1 text-emerald-600" />
                  <span className="text-xs font-semibold text-gray-700">Click to upload material photo</span>
                  <span className="text-[10px] text-gray-400">JPG, PNG up to 10MB</span>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={loading || !formData.wasteType}
              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg shadow-green-600/20 transition flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Running AI Waste Classification & Diagnostics...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-green-200" />
                  Run AI Waste Analysis
                </>
              )}
            </button>
          </form>
        </div>

        {/* AI ANALYSIS RESULTS (RIGHT COLUMN) */}
        <div className="lg:col-span-5 space-y-6">
          {aiResult ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-2 border-emerald-500 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5"
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                      AI Diagnostic Complete
                    </span>
                    <span className="text-[11px] text-emerald-700 font-semibold">
                      Google Gemini Circular Intelligence
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {Math.round(aiResult.confidence * 100)}% Confidence
                </span>
              </div>

              {/* Detected Material & Category */}
              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 space-y-1">
                <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Detected Material & Grade</div>
                <div className="text-lg font-black text-gray-950">{aiResult.material}</div>
                <div className="text-xs text-gray-600">Category: <strong>{aiResult.category}</strong> • Quality: <strong>{aiResult.quality}</strong> • Contamination: <strong>{aiResult.contamination}</strong></div>
              </div>

              {/* Reuse Applications with Suitability Scores */}
              <div>
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Recycle className="w-3.5 h-3.5 text-emerald-700" />
                  Possible Circular Applications:
                </div>
                <div className="space-y-2">
                  {aiResult.applications.map((app, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-900">{idx + 1}. {app.name}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {Math.round(app.suitability * 100)}% Suitability
                        </span>
                      </div>
                      {app.description && (
                        <p className="text-[11px] text-gray-500 leading-tight">{app.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Potential Industries */}
              <div>
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Factory className="w-3.5 h-3.5 text-emerald-700" />
                  Potential Sourcing Industries:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {aiResult.industries.map((ind, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* Processing Steps */}
              <div>
                <div className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  Required Processing Steps:
                </div>
                <ol className="list-decimal list-inside text-xs text-gray-600 space-y-1 pl-1">
                  {aiResult.processing_steps.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Valuation & Environmental Benefit */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                  <div className="text-[10px] text-green-700 font-bold uppercase">Estimated Value Range</div>
                  <div className="text-base font-black text-green-950 mt-0.5">
                    ₹{aiResult.estimated_value_min} – ₹{aiResult.estimated_value_max}
                    <span className="text-xs font-normal text-green-800"> / {formData.unit}</span>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-emerald-700 font-bold uppercase">CO₂e Avoided</div>
                  <div className="text-base font-black text-emerald-950 mt-0.5 flex items-center gap-1">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    {aiResult.co2_savings_kg.toLocaleString()} KG
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 italic">
                * {aiResult.disclaimer}
              </div>

              {/* Action Button: Find Compatible Buyers */}
              <div className="pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleSaveAndFindBuyers}
                  disabled={publishing}
                  className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg shadow-emerald-700/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Publishing & Sourcing Buyers...
                    </>
                  ) : (
                    <>
                      Save Listing & Match Buyers
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 text-center bg-gray-50 flex flex-col items-center justify-center space-y-3 min-h-[420px]">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Ready for AI Analysis</h3>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Fill out the waste details and click <strong>"Run AI Waste Analysis"</strong> to generate circular applications, recycling methods, market value, and compatible buyers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
