"use client";

import { useState, useTransition, Suspense, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, signup } from "./actions";
import { 
  Recycle, 
  ArrowLeft, 
  Lock, 
  Mail, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Factory, 
  ShoppingBag,
  Truck,
  MapPin,
  FileCheck2,
  Upload,
  Clock,
  X,
  ShieldAlert,
  Package
} from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get("message");
  const messageType = searchParams.get("type") || "error";

  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [selectedRole, setSelectedRole] = useState<"seller" | "buyer" | "driver">("seller");
  const [isPending, startTransition] = useTransition();

  // ID Proof upload state
  const [idFile, setIdFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdFile(file);
      if (file.type.startsWith("image/")) {
        setIdPreview(URL.createObjectURL(file));
      } else {
        setIdPreview(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setIdFile(null);
    setIdPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSignInSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await login(formData);
    });
  };

  const handleSignUpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("role", selectedRole);
    if (idFile) {
      formData.set("id_proof_file", idFile);
    }
    startTransition(async () => {
      await signup(formData);
    });
  };

  return (
    <div className="w-full max-w-lg">
      {/* Return to Home link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-green-700 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

      </div>

      {/* Main Card */}
      <div className="bg-white p-8 sm:p-10 rounded-3xl border border-gray-200/80 shadow-xl shadow-gray-200/50">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-green-700 via-green-600 to-emerald-500 flex items-center justify-center text-white mx-auto shadow-md shadow-green-600/20 mb-3">
            <Recycle className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-950 tracking-tight">
            CIRCULON
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Industrial Waste-to-Buyer Intelligence Network
          </p>
        </div>

        {/* Tab Toggle (Sign In vs Create Account) */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-6 border border-gray-200/60">
          <button
            type="button"
            onClick={() => setActiveTab("signin")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "signin"
                ? "bg-white text-green-800 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
              activeTab === "signup"
                ? "bg-white text-green-800 shadow-xs"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Create Company Account
          </button>
        </div>

        {/* Status / Feedback Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 border ${
              messageType === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : messageType === "pending"
                ? "bg-amber-50 border-amber-300 text-amber-900"
                : "bg-red-50 border-red-200 text-red-800"
            }`}
          >
            {messageType === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : messageType === "pending" ? (
              <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed font-medium">{message}</p>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SIGN IN FORM */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "signin" && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="signin-email">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="contact@company.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="signin-password">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg shadow-green-600/20 transition duration-150 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className="text-xs text-gray-500 hover:text-green-700 transition font-medium"
              >
                Need to register your company? <span className="font-bold text-green-700 underline">Create account</span>
              </button>
            </div>
          </form>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* CREATE ACCOUNT FORM (WITH ADDRESS & ID PROOF) */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === "signup" && (
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            {/* Explicit Hidden Role Input to guarantee submission */}
            <input type="hidden" name="role" value={selectedRole} />

            {/* Mandatory Company / Driver Account Role Selection */}
            <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
                  Mandatory: Choose Registration Role *
                </label>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Required
                </span>
              </div>

              <p className="text-[11px] text-emerald-800/80">
                Please specify whether you are registering as an <strong>Industrial Waste Seller</strong>, <strong>Material Buyer</strong>, or <strong>Logistics Driver</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Option 1: Waste Seller */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("seller")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    selectedRole === "seller"
                      ? "border-green-600 bg-white ring-2 ring-green-600 shadow-md"
                      : "border-gray-200 bg-white/80 hover:bg-white hover:border-gray-300"
                  }`}
                >
                  {selectedRole === "seller" && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedRole === "seller" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        <Factory className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-gray-900 block leading-tight">Waste Seller</span>
                        <span className="text-[9px] uppercase font-bold text-green-700">Generator</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-600 leading-snug pt-1">
                      Factories, mills, and plants selling industrial scrap & byproducts.
                    </p>
                  </div>
                </button>

                {/* Option 2: Material Buyer */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("buyer")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    selectedRole === "buyer"
                      ? "border-blue-600 bg-white ring-2 ring-blue-600 shadow-md"
                      : "border-gray-200 bg-white/80 hover:bg-white hover:border-gray-300"
                  }`}
                >
                  {selectedRole === "buyer" && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedRole === "buyer" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-gray-900 block leading-tight">Material Buyer</span>
                        <span className="text-[9px] uppercase font-bold text-blue-700">Recycler</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-600 leading-snug pt-1">
                      Recyclers, foundries, compounders procuring raw scrap materials.
                    </p>
                  </div>
                </button>

                {/* Option 3: Logistics Driver */}
                <button
                  type="button"
                  onClick={() => setSelectedRole("driver")}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                    selectedRole === "driver"
                      ? "border-orange-600 bg-white ring-2 ring-orange-600 shadow-md"
                      : "border-gray-200 bg-white/80 hover:bg-white hover:border-gray-300"
                  }`}
                >
                  {selectedRole === "driver" && (
                    <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px]">
                      ✓
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedRole === "driver" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-gray-900 block leading-tight">Driver / Fleet</span>
                        <span className="text-[9px] uppercase font-bold text-orange-700">Logistics</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-600 leading-snug pt-1">
                      Commercial truck operators and freight carriers hauling bulk scrap.
                    </p>
                  </div>
                </button>
              </div>

              {/* Active Role Confirmation Banner */}
              <div className="p-2 rounded-lg bg-white border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-900 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Registering as: <strong className="text-emerald-950 font-bold">
                    {selectedRole === "seller" ? "Industrial Waste Seller" : selectedRole === "buyer" ? "Industrial Material Buyer" : "Logistics Fleet Driver"}
                  </strong> ({selectedRole === "seller" ? "Seller Dashboard & Waste Listings" : selectedRole === "buyer" ? "Buyer Dashboard & Intake Wishlists" : "Driver Logistics & Pickup Route Tracking"})
                </span>
              </div>
            </div>

            {/* Dynamic Role-specific Material / Vehicle Focus Field */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="material-focus">
                {selectedRole === "seller" 
                  ? "Primary Waste Materials Generated *" 
                  : selectedRole === "buyer" 
                  ? "Primary Raw Scrap Materials Required *" 
                  : "Vehicle Capacity, Fleet Type & Transport Focus *"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  {selectedRole === "driver" ? <Truck className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                </div>
                <input
                  id="material-focus"
                  name="material_focus"
                  type="text"
                  required
                  placeholder={
                    selectedRole === "seller"
                      ? "e.g. Cotton Comber Scraps, HDPE Flakes, Steel Slag"
                      : selectedRole === "buyer"
                      ? "e.g. Post-Industrial Cotton, PET Bottles, Shredded Scrap Iron"
                      : "e.g. 16-Ton Multi-Axle Truck, Tipper, 32ft Container, Flatbed"
                  }
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
              <span className="text-[10px] text-gray-400 mt-1 block">
                {selectedRole === "seller" 
                  ? "Helps AI match your factory immediately with compatible buyer requirements." 
                  : selectedRole === "buyer"
                  ? "Helps AI filter and alert you to matching factory waste listings."
                  : "Helps match heavy freight shipments to your vehicle weight capacity."}
              </span>
            </div>

            {/* Company / Driver Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="company-name">
                {selectedRole === "driver" ? "Driver Full Name / Fleet Transport Company *" : "Company / Mill Name *"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  {selectedRole === "driver" ? <Truck className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                </div>
                <input
                  id="company-name"
                  name="company_name"
                  type="text"
                  required
                  placeholder={
                    selectedRole === "driver"
                      ? "e.g. Rajesh Kumar (Southern Express Transport)"
                      : "e.g. Apex Textiles & Spinners Ltd"
                  }
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
            </div>

            {/* Physical / Depot Address */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="company-address">
                {selectedRole === "driver" ? "Operating Base / Garage / Depot Address *" : "Company Physical Address *"}
              </label>
              <div className="relative">
                <div className="absolute top-2.5 left-3.5 pointer-events-none text-gray-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  id="company-address"
                  name="company_address"
                  rows={2}
                  required
                  placeholder={
                    selectedRole === "driver"
                      ? "e.g. Shed 14, Transporters Bypass Road, Salem, Tamil Nadu - 636005"
                      : "e.g. Plot 12, Industrial Estate, Coimbatore, Tamil Nadu - 641001"
                  }
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
            </div>

            {/* ID Proof / License Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="id-proof-number">
                {selectedRole === "driver" 
                  ? "Commercial Driving License / Fleet Transport Permit No *" 
                  : "Business ID / GSTIN / PAN / Registration No *"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <input
                  id="id-proof-number"
                  name="id_proof_number"
                  type="text"
                  required
                  placeholder={
                    selectedRole === "driver"
                      ? "e.g. DL No: TN-30-20220001234 or Vehicle RC / Permit"
                      : "e.g. GSTIN: 33AAAAA0000A1Z5 or CIN No."
                  }
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
            </div>

            {/* Upload ID Proof Document */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                {selectedRole === "driver" 
                  ? "Upload Driving License / Vehicle RC / Transport Permit (PDF/Image)" 
                  : "Upload ID Proof Document (GST / Trade License / Certificate)"}
              </label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              {idFile ? (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCheck2 className="w-4 h-4 text-green-700 shrink-0" />
                    <span className="text-xs font-semibold text-green-900 truncate">
                      {idFile.name}
                    </span>
                    <span className="text-[10px] text-green-700">
                      ({(idFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50/50 rounded-xl p-3 text-center cursor-pointer transition"
                >
                  <Upload className="w-4 h-4 mx-auto text-gray-400 mb-1" />
                  <span className="text-xs font-semibold text-gray-700">
                    {selectedRole === "driver" ? "Click to upload Driving License / Vehicle RC" : "Click to upload business document"}
                  </span>
                  <span className="block text-[10px] text-gray-400">PDF, PNG, JPG up to 10MB</span>
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5" htmlFor="signup-email">
                {selectedRole === "driver" ? "Driver / Transport Contact Email *" : "Company Work Email *"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder={selectedRole === "driver" ? "driver.rajesh@transporters.com" : "contact@company.com"}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider" htmlFor="signup-password">
                  Account Password *
                </label>
                <span className="text-[10px] text-gray-400">Min. 6 characters</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>
            </div>

            {/* Verification Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Admin Approval Required:</strong> Your {selectedRole === "driver" ? "commercial driver license, vehicle details, and operating depot address" : "company address and ID proof"} will be reviewed by our administrator. Once approved, you will receive an approval confirmation email to activate your account and log in.
              </span>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg shadow-green-600/20 transition duration-150 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting for Verification...
                </>
              ) : (
                "Submit Registration for Approval"
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className="text-xs text-gray-500 hover:text-green-700 transition font-medium"
              >
                Already approved? <span className="font-bold text-green-700 underline">Sign in here</span>
              </button>
            </div>
          </form>
        )}

        {/* Security / Privacy notice */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Enterprise Verification Protected by Supabase Auth with Row-Level Security.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading authentication...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
