"use client";

import { useEffect, useState, useTransition } from "react";
import { 
  Building2, 
  Lock, 
  ShieldCheck, 
  User, 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Save, 
  MapPin, 
  Phone, 
  FileText, 
  KeyRound, 
  Sparkles,
  Recycle,
  Check
} from "lucide-react";
import { getUserSettings, updateProfileSettings, changePassword } from "@/lib/actions/settings";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "preferences">("profile");

  // Profile Form state
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [idProofNumber, setIdProofNumber] = useState("");

  // Feedback state
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isPendingProfile, startProfileTransition] = useTransition();
  const [isPendingPassword, startPasswordTransition] = useTransition();

  // Notification toggles
  const [notifyMatches, setNotifyMatches] = useState(true);
  const [notifyProposals, setNotifyProposals] = useState(true);
  const [notifyESG, setNotifyESG] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getUserSettings();
        if (data) {
          setUserData(data);
          const p = data.profile;
          setCompanyName(p?.company_name || "");
          setIndustry(p?.industry || "");
          setPhone(p?.phone || "");
          setCompanyAddress(p?.company_address || "");
          setIdProofNumber(p?.id_proof_number || "");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileMsg(null);
    const formData = new FormData(e.currentTarget);
    startProfileTransition(async () => {
      const res = await updateProfileSettings(formData);
      if (res.success) {
        setProfileMsg({ text: "Profile details updated successfully!", type: "success" });
      } else {
        setProfileMsg({ text: res.error || "Failed to save profile", type: "error" });
      }
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMsg(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startPasswordTransition(async () => {
      const res = await changePassword(formData);
      if (res.success) {
        setPasswordMsg({ text: "Password updated successfully!", type: "success" });
        form.reset();
      } else {
        setPasswordMsg({ text: res.error || "Failed to update password", type: "error" });
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
          <Loader2 className="w-5 h-5 animate-spin text-green-600" />
          Loading account settings...
        </div>
      </div>
    );
  }

  const role = userData?.profile?.role || "seller";
  const email = userData?.email || "";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-gray-200/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
              role === "admin" 
                ? "bg-amber-100 text-amber-800 border-amber-200" 
                : role === "buyer" 
                ? "bg-emerald-100 text-emerald-800 border-emerald-200" 
                : "bg-green-100 text-green-800 border-green-200"
            }`}>
              {role.toUpperCase()} ACCOUNT
            </span>
            <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              Verified Enterprise
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-gray-950 mt-2">
            Account Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your company profile, security credentials, and circular network preferences.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "profile" 
                ? "bg-white text-gray-900 shadow-xs" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Company Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "security" 
                ? "bg-white text-gray-900 shadow-xs" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Security & Password
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "preferences" 
                ? "bg-white text-gray-900 shadow-xs" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Preferences
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: COMPANY PROFILE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "profile" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {profileMsg && (
            <div className={`p-4 rounded-xl text-sm flex items-center gap-2 border ${
              profileMsg.type === "success" 
                ? "bg-green-50 text-green-800 border-green-200" 
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              {profileMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-gray-950 mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-green-700" />
              Company Details
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              This information is visible to verified counterparties on match proposals.
            </p>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Company Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Registered Company Name *
                  </label>
                  <input
                    name="company_name"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Industrial Recycling Corp"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Industry Sector
                  </label>
                  <input
                    name="industry"
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Textiles, Metallurgy, Plastics"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  />
                </div>

                {/* Email (Read Only) */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Registered Email (Read Only)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Business Phone
                  </label>
                  <input
                    name="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                  />
                </div>
              </div>

              {/* Company Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Physical Plant / Office Address
                </label>
                <textarea
                  name="company_address"
                  rows={3}
                  value={companyAddress}
                  onChange={(e) => setCompanyAddress(e.target.value)}
                  placeholder="Plot 42, Industrial Estate, City, State - PIN"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>

              {/* ID Proof Number */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  GSTIN / Corporate Identification Number (CIN)
                </label>
                <input
                  name="id_proof_number"
                  type="text"
                  value={idProofNumber}
                  onChange={(e) => setIdProofNumber(e.target.value)}
                  placeholder="33AAAAA0000A1Z5"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isPendingProfile}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg shadow-green-600/20 transition duration-150 disabled:opacity-70 cursor-pointer"
                >
                  {isPendingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: SECURITY & PASSWORD */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "security" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {passwordMsg && (
            <div className={`p-4 rounded-xl text-sm flex items-center gap-2 border ${
              passwordMsg.type === "success" 
                ? "bg-green-50 text-green-800 border-green-200" 
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              {passwordMsg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-gray-950 mb-1 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-green-700" />
              Update Account Password
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Ensure your password is at least 6 characters long and contains letters and numbers.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  New Password *
                </label>
                <input
                  name="new_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password *
                </label>
                <input
                  name="confirm_password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                />
              </div>

              <button
                type="submit"
                disabled={isPendingPassword}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg shadow-green-600/20 transition duration-150 disabled:opacity-70 cursor-pointer"
              >
                {isPendingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: PREFERENCES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === "preferences" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-gray-950 mb-1 flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-700" />
              Notification Settings
            </h2>
            <p className="text-xs text-gray-500 mb-6">
              Configure how and when CIRCULON alerts you about trade matches and market updates.
            </p>

            <div className="space-y-4 divide-y divide-gray-100">
              <div className="flex items-center justify-between pt-3">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">AI Match Notifications</h3>
                  <p className="text-xs text-gray-500">Get notified immediately when an AI waste-to-buyer match exceeds 80% compatibility.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyMatches}
                  onChange={(e) => setNotifyMatches(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Connection Proposals</h3>
                  <p className="text-xs text-gray-500">Receive alerts when counterparties accept or dispatch inquiries for your materials.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyProposals}
                  onChange={(e) => setNotifyProposals(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">ESG Diversion Report Summaries</h3>
                  <p className="text-xs text-gray-500">Receive automated monthly landfill diversion metrics formatted for ESG compliance.</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifyESG}
                  onChange={(e) => setNotifyESG(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
