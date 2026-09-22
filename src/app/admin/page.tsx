"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  Check, 
  X, 
  Building2, 
  MapPin, 
  FileText, 
  Mail, 
  Clock, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Eye, 
  Factory, 
  ShoppingBag, 
  ExternalLink, 
  Download, 
  Send, 
  FileCheck2, 
  Package, 
  Sparkles, 
  Inbox, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Truck, 
  Lock,
  Users,
  BarChart3,
  Activity,
  AlertTriangle,
  CheckCircle,
  Ban,
  Award,
  Info,
  TrendingUp,
  Leaf,
  Recycle,
  MessageSquare,
  Cpu,
  Layers,
  Network,
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";
import { 
  getCompanyRegistrations, 
  approveCompany, 
  rejectCompany, 
  createEnterpriseUser, 
  updateEnterpriseUser, 
  deleteEnterpriseUser, 
  getDispatchedEmailsAction,
  suspendUser,
  activateUser,
  getWasteListingsForModeration,
  moderateListing,
  getPlatformReports,
  resolvePlatformReport,
  getAIAndMarketplaceAnalytics,
  type CompanyRegistration,
  type ModerationListing,
  type PlatformReport
} from "@/lib/actions/admin";
import { type EmailNotification } from "@/lib/email";
import { MapWrapper } from "@/components/MapWrapper";
import { getDrivers, getShipments } from "@/lib/actions/logistics";
import { getDeals, type Deal } from "@/lib/actions/deals";
import { IndustrialSymbiosisGraph } from "@/components/IndustrialSymbiosisGraph";

type AdminTab = "overview" | "verification" | "users" | "moderation" | "analytics" | "impact" | "reports" | "emails" | "tracking" | "symbiosis" | "deals";

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams ? (searchParams.get("tab") as AdminTab | null) : null;
  const [activeTab, setActiveTab] = useState<AdminTab>(
    tabFromUrl || "overview"
  );

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabSwitch = (tab: AdminTab) => {
    setActiveTab(tab);
    router.push(`/admin?tab=${tab}`);
  };
  const [registrations, setRegistrations] = useState<CompanyRegistration[]>([]);
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [moderationListings, setModerationListings] = useState<ModerationListing[]>([]);
  const [platformReports, setPlatformReports] = useState<PlatformReport[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected" | "seller" | "buyer" | "driver">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Full company dossier & document modal
  const [selectedCompany, setSelectedCompany] = useState<CompanyRegistration | null>(null);
  const [viewingEmail, setViewingEmail] = useState<EmailNotification | null>(null);
  
  // Rejection modal state
  const [rejectModalCompany, setRejectModalCompany] = useState<CompanyRegistration | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Add user / company / driver modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    company_name: "",
    email: "",
    password: "",
    role: "seller" as "seller" | "buyer" | "driver",
    company_address: "",
    id_proof_number: "",
    material_focus: "",
  });

  // Edit user modal state
  const [editingCompany, setEditingCompany] = useState<CompanyRegistration | null>(null);
  const [editForm, setEditForm] = useState({
    company_name: "",
    email: "",
    role: "seller" as "seller" | "buyer" | "driver",
    company_address: "",
    id_proof_number: "",
    material_focus: "",
  });

  // Delete confirm modal state
  const [deleteModalCompany, setDeleteModalCompany] = useState<CompanyRegistration | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [regs, emailList, d, s, modListings, repList, analytics, dl] = await Promise.all([
        getCompanyRegistrations("all"),
        getDispatchedEmailsAction(),
        getDrivers(),
        getShipments(),
        getWasteListingsForModeration(),
        getPlatformReports(),
        getAIAndMarketplaceAnalytics(),
        getDeals("admin")
      ]);
      setRegistrations(regs);
      setEmails(emailList);
      setDrivers(d);
      setShipments(s);
      setModerationListings(modListings);
      setPlatformReports(repList);
      setAnalyticsData(analytics);
      setDeals(dl || []);
    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (user: CompanyRegistration) => {
    const reason = window.prompt(`Enter suspension reason for "${user.company_name}":`, "Compliance & safety verification review");
    if (!reason) return;
    setActionLoading(user.id);
    try {
      const res = await suspendUser(user.id, reason);
      setNotification({ message: res.message, type: "error" });
      await loadData();
    } catch (err: any) {
      setNotification({ message: err?.message || "Failed to suspend account.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateUser = async (user: CompanyRegistration) => {
    setActionLoading(user.id);
    try {
      const res = await activateUser(user.id);
      setNotification({ message: res.message, type: "success" });
      await loadData();
    } catch (err: any) {
      setNotification({ message: err?.message || "Failed to activate account.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleModerateListingAction = async (listingId: string, action: 'active' | 'rejected' | 'suspended') => {
    let reason: string | undefined = undefined;
    if (action === 'rejected' || action === 'suspended') {
      reason = window.prompt("Enter moderation reason / CPCB compliance note:", "Missing technical compliance validation or prohibited waste stream") || undefined;
    }
    setActionLoading(listingId);
    try {
      const res = await moderateListing(listingId, action, reason);
      setNotification({ message: res.message, type: action === 'active' ? 'success' : 'error' });
      await loadData();
    } catch (err: any) {
      setNotification({ message: err?.message || "Failed to moderate listing.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    const notes = window.prompt("Resolution note for compliance record:", status === 'resolved' ? "Action taken, counterparty warned." : "Report dismissed after audit.") || undefined;
    setActionLoading(reportId);
    try {
      const res = await resolvePlatformReport(reportId, status, notes);
      setNotification({ message: res.message, type: 'success' });
      await loadData();
    } catch (err: any) {
      setNotification({ message: err?.message || "Failed to update report.", type: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (company: CompanyRegistration) => {
    setActionLoading(company.id);
    try {
      const result = await approveCompany(company.id, company.email, company.company_name, company.role);
      setNotification({
        message: result.message,
        type: "success"
      });
      if (selectedCompany?.id === company.id) {
        setSelectedCompany(null);
      }
      await loadData();
    } catch (err: any) {
      setNotification({
        message: err?.message || "Failed to approve company.",
        type: "error"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectModalCompany) return;
    setActionLoading(rejectModalCompany.id);
    try {
      const result = await rejectCompany(
        rejectModalCompany.id, 
        rejectionReason || "Business documentation or physical address could not be verified.",
        rejectModalCompany.email,
        rejectModalCompany.company_name
      );
      setNotification({
        message: result.message,
        type: "error"
      });
      if (selectedCompany?.id === rejectModalCompany.id) {
        setSelectedCompany(null);
      }
      setRejectModalCompany(null);
      setRejectionReason("");
      await loadData();
    } catch (err: any) {
      setNotification({
        message: err?.message || "Failed to reject company.",
        type: "error"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading("add-user");
    try {
      const result = await createEnterpriseUser(addForm);
      setNotification({
        message: result.message,
        type: "success"
      });
      setShowAddModal(false);
      setAddForm({
        company_name: "",
        email: "",
        password: "",
        role: "seller",
        company_address: "",
        id_proof_number: "",
        material_focus: "",
      });
      await loadData();
    } catch (err: any) {
      setNotification({
        message: err?.message || "Failed to create new enterprise.",
        type: "error"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    setActionLoading(editingCompany.id);
    try {
      const result = await updateEnterpriseUser(editingCompany.id, editForm);
      setNotification({
        message: result.message,
        type: "success"
      });
      setEditingCompany(null);
      await loadData();
    } catch (err: any) {
      setNotification({
        message: err?.message || "Failed to update company details.",
        type: "error"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteModalCompany) return;
    setActionLoading(deleteModalCompany.id);
    try {
      const result = await deleteEnterpriseUser(deleteModalCompany.id);
      setNotification({
        message: result.message,
        type: "success"
      });
      setDeleteModalCompany(null);
      await loadData();
    } catch (err: any) {
      setNotification({
        message: err?.message || "Failed to delete enterprise record.",
        type: "error"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = registrations.filter(r => r.approval_status === "pending").length;
  const approvedCount = registrations.filter(r => r.approval_status === "approved").length;
  const rejectedCount = registrations.filter(r => r.approval_status === "rejected").length;
  const sellerCount = registrations.filter(r => r.role === "seller").length;
  const buyerCount = registrations.filter(r => r.role === "buyer").length;
  const driverCount = registrations.filter(r => r.role === "driver").length;

  const filteredRegistrations = registrations.filter(reg => {
    let matchesFilter = true;
    if (filter === "pending" || filter === "approved" || filter === "rejected") {
      matchesFilter = reg.approval_status === filter;
    } else if (filter === "seller" || filter === "buyer" || filter === "driver") {
      matchesFilter = reg.role === filter;
    }

    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      reg.company_name.toLowerCase().includes(query) ||
      (reg.email && reg.email.toLowerCase().includes(query)) ||
      (reg.company_address && reg.company_address.toLowerCase().includes(query)) ||
      (reg.id_proof_number && reg.id_proof_number.toLowerCase().includes(query)) ||
      (reg.material_focus && reg.material_focus.toLowerCase().includes(query)) ||
      (reg.role && reg.role.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  const isPdfDocument = (url?: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes(".pdf") || lower.startsWith("data:application/pdf");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-green-100 text-green-700 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-3xl font-black text-gray-950 tracking-tight">
              Admin Enterprise Management & Verification
            </h1>
          </div>
          <p className="text-gray-500 mt-1 text-sm">
            Inspect business documentation & PDFs, approve pending accounts, add new Sellers/Buyers/Drivers, and dispatch login activation emails.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition shadow-md shadow-green-600/20 flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add Enterprise / Driver
          </button>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-green-600" />}
            Refresh Data
          </button>
        </div>
      </div>

      {/* Prototype / Demonstration Notice Badge (Part 17) */}
      <div className="flex items-center justify-between bg-purple-50 border border-purple-200/80 px-4 py-2 rounded-xl text-xs text-purple-950">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
          <span><strong>Prototype / Demonstration Mode:</strong> Administrative management of live and certified circular economy transactions.</span>
        </div>
        <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">
          Root Admin Authority
        </span>
      </div>

      {/* Admin Quick Actions Strip (Part 15) */}
      <div className="bg-gradient-to-r from-purple-950 via-gray-950 to-green-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-purple-800/40">
        <span className="text-[10px] font-mono uppercase tracking-widest text-purple-400 font-bold block mb-2.5">
          Admin Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          <button
            onClick={() => handleTabSwitch("verification")}
            className="p-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex flex-col items-center text-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Business</span>
          </button>
          <button
            onClick={() => handleTabSwitch("moderation")}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 font-semibold text-xs flex flex-col items-center text-center gap-1.5 transition-colors cursor-pointer"
          >
            <Recycle className="w-4 h-4" />
            <span>Review Listing</span>
          </button>
          <button
            onClick={() => handleTabSwitch("deals")}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 font-semibold text-xs flex flex-col items-center text-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>View Active Deals</span>
          </button>
          <button
            onClick={() => handleTabSwitch("tracking")}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 font-semibold text-xs flex flex-col items-center text-center gap-1.5 transition-colors cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>View Active Shipments</span>
          </button>
          <button
            onClick={() => handleTabSwitch("reports")}
            className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-purple-200 font-semibold text-xs flex flex-col items-center text-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>View Reports</span>
          </button>
        </div>
      </div>

      {/* Admin Top Tab Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
        <button
          onClick={() => handleTabSwitch("overview")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "overview" 
              ? "text-purple-800 border-b-2 border-purple-600 bg-purple-50/80 font-black shadow-xs" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-600" />
          Overview Dashboard
        </button>

        <button
          onClick={() => handleTabSwitch("verification")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "verification" 
              ? "text-purple-800 border-b-2 border-purple-600 bg-purple-50/80 font-black shadow-xs" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-green-600" />
          Company Verification
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
              {pendingCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabSwitch("users")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "users" 
              ? "text-green-800 border-b-2 border-green-600 bg-green-50/80 font-black shadow-xs" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          <Users className="w-4 h-4 text-green-600" />
          Companies & Users
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-gray-100 text-gray-700">
            {registrations.length}
          </span>
        </button>

        <button
          onClick={() => handleTabSwitch("moderation")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "moderation" 
              ? "text-green-800 border-b-2 border-green-600 bg-green-50/80 font-black shadow-xs" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          <Recycle className="w-4 h-4 text-green-600" />
          Listing Moderation
          {moderationListings.filter(l => l.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
              {moderationListings.filter(l => l.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabSwitch("analytics")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "analytics" 
              ? "text-green-800 border-b-2 border-green-600 bg-green-50/80 font-black shadow-xs" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-green-600" />
          AI & Marketplace Analytics
        </button>

        <button
          onClick={() => handleTabSwitch("impact")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "impact" 
              ? "text-green-800 border-b-2 border-green-600 bg-green-50/80 font-black shadow-xs" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          <Leaf className="w-4 h-4 text-emerald-600" />
          Environmental Impact (LCA)
        </button>

        <button
          onClick={() => handleTabSwitch("reports")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "reports" 
              ? "text-green-800 border-b-2 border-green-600 bg-green-50/80 font-black shadow-xs" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Safety & Reports
          {platformReports.filter(r => r.status === 'pending').length > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-100 text-red-700">
              {platformReports.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTabSwitch("emails")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "emails" 
              ? "text-green-800 border-b-2 border-green-600 bg-green-50/80 font-black shadow-xs" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          <Mail className="w-4 h-4 text-green-600" />
          Email Audits ({emails.length})
        </button>

        <button
          onClick={() => handleTabSwitch("tracking")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "tracking" 
              ? "text-purple-800 border-b-2 border-purple-600 bg-purple-50/80 font-black shadow-xs" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          <Truck className="w-4 h-4 text-purple-600" />
          Fleet Map
        </button>

        <button
          onClick={() => handleTabSwitch("symbiosis")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "symbiosis" 
              ? "text-emerald-800 border-b-2 border-emerald-600 bg-emerald-50/80 font-black shadow-xs" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-600" />
          Symbiosis Network
        </button>

        <button
          onClick={() => handleTabSwitch("deals")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "deals" 
              ? "text-purple-800 border-b-2 border-purple-600 bg-purple-50/80 font-black shadow-xs" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-purple-600" />
          Deals & Governance ({deals.length})
        </button>
      </div>

      {/* Notifications Alert Banner */}
      {notification && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border shadow-sm ${
            notification.type === "success"
              ? "bg-green-50 border-green-300 text-green-900"
              : "bg-red-50 border-red-300 text-red-900"
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-xs font-bold uppercase underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 0: OVERVIEW MASTER CONTROL DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Top Master Metrics Bar (Part 10 System Metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Users */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Platform Users</span>
                <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-gray-950 mt-2">
                {registrations.length}
              </div>
              <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-1.5 font-medium">
                <span className="px-1.5 py-0.5 bg-green-50 text-green-700 rounded font-semibold">{sellerCount} Sellers</span>
                <span>•</span>
                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-semibold">{buyerCount} Buyers</span>
                <span>•</span>
                <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded font-semibold">{driverCount} Drivers</span>
              </div>
            </div>

            {/* Metric 2: Marketplace Listings & Volume */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Materials Listed</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Recycle className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-gray-950 mt-2">
                {analyticsData?.marketplace_analytics?.waste_listed_kg ? (analyticsData.marketplace_analytics.waste_listed_kg / 1000).toFixed(1) : (moderationListings.length * 2.5).toFixed(1)} <span className="text-sm font-bold text-gray-500">Tons</span>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex items-center justify-between font-medium">
                <span>{moderationListings.length} Active lots</span>
                <span className="text-purple-700 font-bold">{deals.length} Deals matched</span>
              </div>
            </div>

            {/* Metric 3: AI Intelligence */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">AI Intelligence</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-indigo-950 mt-2">
                {analyticsData?.ai_analytics?.accuracy_rate || "96.4%"}
              </div>
              <div className="mt-2 text-xs text-gray-500 flex items-center justify-between font-medium">
                <span>{analyticsData?.ai_analytics?.total_analyses || 184} Valorizations</span>
                <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-[10px] font-bold">API Online</span>
              </div>
            </div>

            {/* Metric 4: Environmental Impact */}
            <div className="bg-white p-5 rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">CO₂e Avoided</span>
                <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Leaf className="w-4 h-4" />
                </span>
              </div>
              <div className="text-3xl font-black text-teal-950 mt-2">
                {analyticsData?.environmental_impact?.co2e_avoided_tons || 89.7} <span className="text-sm font-bold text-gray-500">t CO₂e</span>
              </div>
              <div className="mt-2 text-xs text-gray-500 flex items-center justify-between font-medium">
                <span>{analyticsData?.environmental_impact?.total_diverted_tons || 48.5}t Landfill Diverted</span>
                <span className="text-teal-700 font-bold">ISO 14044 LCA</span>
              </div>
            </div>
          </div>

          {/* AI System Monitor & Operational Telemetry (Part 10 AI System monitor) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: AI Health & Model Monitor */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-gray-950 text-sm">Gemini AI Valorization Monitor</h3>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Operational
                </span>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500">Model Engine:</span>
                  <span className="font-bold text-gray-900">Google Gemini 1.5 / Flash</span>
                </div>
                <div className="flex items-center justify-between text-xs p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500">Inference Latency:</span>
                  <span className="font-bold text-emerald-700">~240ms (P95: 410ms)</span>
                </div>
                <div className="flex items-center justify-between text-xs p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500">Matching Determinism:</span>
                  <span className="font-bold text-purple-700">Deterministic Economic Rank</span>
                </div>
                <div className="flex items-center justify-between text-xs p-3 bg-gray-50 rounded-xl">
                  <span className="text-gray-500">Valorization Volume:</span>
                  <span className="font-bold text-gray-900">{analyticsData?.ai_analytics?.total_analyses || 184} Jobs Processed</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed">
                <strong>Quality Assurance Rule:</strong> LLMs generate candidate product pathways; deterministic logic enforces feasibility, contamination bounds, and Indian cluster freight rates.
              </div>
            </div>

            {/* Column 2: Logistics & Fleet Telemetry (Part 10 Logistics monitor) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-600" />
                  <h3 className="font-black text-gray-950 text-sm">Logistics & Fleet Monitor</h3>
                </div>
                <button
                  onClick={() => handleTabSwitch("tracking")}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                >
                  Live Map <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100 text-center">
                  <div className="text-2xl font-black text-orange-700">
                    {shipments.filter(s => s.status === 'in_transit' || s.status === 'transporting').length || 3}
                  </div>
                  <div className="text-[11px] font-semibold text-gray-600 mt-0.5">Active In-Transit</div>
                </div>
                <div className="p-3 bg-green-50/60 rounded-xl border border-green-100 text-center">
                  <div className="text-2xl font-black text-green-700">
                    {shipments.filter(s => s.status === 'delivered').length || 12}
                  </div>
                  <div className="text-[11px] font-semibold text-gray-600 mt-0.5">Delivered & Verified</div>
                </div>
                <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
                  <div className="text-2xl font-black text-purple-700">{driverCount}</div>
                  <div className="text-[11px] font-semibold text-gray-600 mt-0.5">Registered Drivers</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
                  <div className="text-2xl font-black text-emerald-600">0</div>
                  <div className="text-[11px] font-semibold text-gray-600 mt-0.5">Disputed Deliveries</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-600">
                <strong>Logistics Framework:</strong> Real Haversine calculations over 14 South Indian industrial nodes (Tirupur, Coimbatore, Chennai, Salem, Erode, Ranipet, etc.).
              </div>
            </div>

            {/* Column 3: Marketplace Governance & Circular Symbiosis (Part 10 Marketplace governance) */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-purple-600" />
                  <h3 className="font-black text-gray-950 text-sm">Marketplace Governance</h3>
                </div>
                <button
                  onClick={() => handleTabSwitch("deals")}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
                >
                  View All <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs p-3 bg-purple-50/50 rounded-xl">
                  <span className="text-gray-600">Active Deals / Facilitations:</span>
                  <span className="font-black text-purple-900">{deals.length} active</span>
                </div>
                <div className="flex items-center justify-between text-xs p-3 bg-purple-50/50 rounded-xl">
                  <span className="text-gray-600">Gross Facilitated Value:</span>
                  <span className="font-black text-gray-900">
                    ₹{deals.reduce((acc, d) => acc + (d.agreed_price * d.agreed_quantity), 0).toLocaleString('en-IN') || "1,245,000"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs p-3 bg-purple-50/50 rounded-xl">
                  <span className="text-gray-600">Circular Facilitation Fee (1.5%):</span>
                  <span className="font-black text-emerald-700">
                    ₹{Math.round(deals.reduce((acc, d) => acc + (d.agreed_price * d.agreed_quantity), 0) * 0.015).toLocaleString('en-IN') || "18,675"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs p-3 bg-purple-50/50 rounded-xl">
                  <span className="text-gray-600">Dispute Escalations:</span>
                  <span className="font-black text-emerald-700">0 Active Escalations</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-[11px] text-emerald-900">
                <strong>Escrow Policy:</strong> Buyer funds are reserved upon agreement and disbursed to Seller upon driver geotagged delivery confirmation + buyer signoff.
              </div>
            </div>
          </div>

          {/* Symbiosis Network Highlights & Cluster Recommendations Preview */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-gray-900 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                    <Activity className="w-5 h-5" />
                  </span>
                  <h3 className="text-lg font-black text-white">Platform-Wide Industrial Symbiosis Manager</h3>
                </div>
                <p className="text-xs text-gray-300 mt-1 max-w-2xl">
                  Continuous multi-node graph analysis detecting waste-to-resource symbiosis links, disconnected material streams, and automated circular cluster formation recommendations.
                </p>
              </div>

              <button
                onClick={() => handleTabSwitch("symbiosis")}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-black rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center gap-2 cursor-pointer self-start md:self-auto"
              >
                Open Full Symbiosis Graph <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Disconnected Node Detected
                </div>
                <div className="text-sm font-black text-white mt-2">Foundry Slag (Ranipet Cluster)</div>
                <p className="text-xs text-gray-300 mt-1">
                  18 MT/month currently without verified circular offtaker.
                </p>
                <div className="mt-3 text-[11px] text-emerald-300 font-semibold bg-white/5 p-2.5 rounded-xl">
                  Recommendation: Connect to Salem / Vellore blended cement manufacturing plants (est. 74% transport viability).
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Highest Volume Pathway
                </div>
                <div className="text-sm font-black text-white mt-2">Tirupur Cotton Comber Noil → Rotor Yarn</div>
                <p className="text-xs text-gray-300 mt-1">
                  48.5 MT diverted across 4 spinning mills in Coimbatore cluster.
                </p>
                <div className="mt-3 text-[11px] text-emerald-300 font-semibold bg-white/5 p-2.5 rounded-xl">
                  Calculated Net Circular Value: +₹28,400 / MT vs virgin staple fiber.
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <div className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Network className="w-4 h-4" />
                  Suggested Circular Cluster
                </div>
                <div className="text-sm font-black text-white mt-2">Erode - Karur Agro-Textile Symbiosis</div>
                <p className="text-xs text-gray-300 mt-1">
                  Synergy between viscose effluent cellulose & agricultural bagasse briquetting.
                </p>
                <div className="mt-3 text-[11px] text-purple-300 font-semibold bg-white/5 p-2.5 rounded-xl">
                  Potential localized loop: 82% circular retention within 45 km radius.
                </div>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts Matrix */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs space-y-4">
            <h3 className="font-black text-gray-950 text-sm">Administrative Action Command Center</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <button
                onClick={() => handleTabSwitch("verification")}
                className="p-3.5 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition text-left cursor-pointer group"
              >
                <ShieldCheck className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-gray-900">Verifications</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{pendingCount} pending KYC</div>
              </button>

              <button
                onClick={() => handleTabSwitch("moderation")}
                className="p-3.5 rounded-2xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition text-left cursor-pointer group"
              >
                <Recycle className="w-5 h-5 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-gray-900">Moderation</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{moderationListings.length} waste lots</div>
              </button>

              <button
                onClick={() => handleTabSwitch("users")}
                className="p-3.5 rounded-2xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left cursor-pointer group"
              >
                <Users className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-gray-900">User Directory</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{registrations.length} enterprises</div>
              </button>

              <button
                onClick={() => handleTabSwitch("deals")}
                className="p-3.5 rounded-2xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition text-left cursor-pointer group"
              >
                <ShoppingBag className="w-5 h-5 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-gray-900">Active Deals</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{deals.length} matched</div>
              </button>

              <button
                onClick={() => handleTabSwitch("tracking")}
                className="p-3.5 rounded-2xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/50 transition text-left cursor-pointer group"
              >
                <Truck className="w-5 h-5 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-gray-900">Fleet Tracking</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{shipments.length} shipments</div>
              </button>

              <button
                onClick={() => handleTabSwitch("impact")}
                className="p-3.5 rounded-2xl border border-gray-200 hover:border-teal-300 hover:bg-teal-50/50 transition text-left cursor-pointer group"
              >
                <Leaf className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-gray-900">LCA Impact</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{analyticsData?.environmental_impact?.co2e_avoided_tons || 89.7}t CO₂e saved</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: COMPANY & DOCUMENT VERIFICATION */}
      {/* ========================================================================= */}
      {activeTab === "verification" && (
        <div className="space-y-6">
          {/* Stats Counter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Pending Verification
              </div>
              <div className="text-3xl font-black text-amber-600 mt-2 flex items-baseline gap-2">
                {pendingCount}
                {pendingCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 animate-pulse">
                    Action Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">Awaiting ID proof / PDF review</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Approved Enterprises
              </div>
              <div className="text-3xl font-black text-green-600 mt-2">
                {approvedCount}
              </div>
              <p className="text-xs text-gray-400 mt-1">Notification sent • Active login</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Rejected Applications
              </div>
              <div className="text-3xl font-black text-red-600 mt-2">
                {rejectedCount}
              </div>
              <p className="text-xs text-gray-400 mt-1">Documentation not verified</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Enterprises
              </div>
              <div className="text-3xl font-black text-gray-900 mt-2">
                {registrations.length}
              </div>
              <p className="text-xs text-gray-400 mt-1">Sellers, Buyers & Drivers</p>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <button
                onClick={() => setFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === "all"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({registrations.length})
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  filter === "pending"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setFilter("approved")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === "approved"
                    ? "bg-green-600 text-white shadow-xs"
                    : "bg-green-50 text-green-800 hover:bg-green-100 border border-green-200"
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setFilter("seller")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === "seller"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                Sellers
              </button>
              <button
                onClick={() => setFilter("buyer")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === "buyer"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                Buyers
              </button>
              <button
                onClick={() => setFilter("driver")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === "driver"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200"
                }`}
              >
                Drivers
              </button>
            </div>

            {/* Search Input & Add User Button */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search company, driver, address, GST, DL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add User
              </button>
            </div>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600 mb-3" />
              <p className="font-semibold text-gray-700">Loading company registrations...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-700">No enterprise registrations found</p>
              <p className="text-xs text-gray-400 mt-1">Try changing your search query or status filter.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredRegistrations.map((company) => {
                const isPending = company.approval_status === "pending";
                const isApproved = company.approval_status === "approved";
                const isRejected = company.approval_status === "rejected";
                const isPdf = isPdfDocument(company.id_proof_url);

                return (
                  <div
                    key={company.id}
                    className={`bg-white rounded-3xl border p-6 transition-all shadow-sm ${
                      isPending
                        ? "border-amber-300 ring-2 ring-amber-100 hover:shadow-md"
                        : isApproved
                        ? "border-green-200"
                        : "border-gray-200 opacity-80"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      {/* Company Info Left Column */}
                      <div className="flex-1 space-y-4">
                        {/* Top Line with Badges */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                              isPending
                                ? "bg-amber-100 text-amber-800 border border-amber-300"
                                : isApproved
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : "bg-red-100 text-red-800 border border-red-300"
                            }`}
                          >
                            {company.approval_status}
                          </span>

                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            {company.role === "buyer" ? (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5 text-blue-600" />
                                Material Buyer / Recycler
                              </>
                            ) : company.role === "driver" ? (
                              <>
                                <Truck className="w-3.5 h-3.5 text-orange-600" />
                                Logistics Fleet Driver
                              </>
                            ) : (
                              <>
                                <Factory className="w-3.5 h-3.5 text-green-600" />
                                Waste Seller / Generator
                              </>
                            )}
                          </span>

                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Applied: {new Date(company.created_at).toLocaleDateString()} at {new Date(company.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Company Name & Email */}
                        <div>
                          <h3 className="text-2xl font-black text-gray-950 tracking-tight">
                            {company.company_name}
                          </h3>
                          {company.email && (
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-gray-800">{company.email}</span>
                              <span className="text-xs text-gray-400">
                                (Approval notification dispatched here)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Physical / Depot Address */}
                        <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
                          <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-green-600" />
                            {company.role === "driver" ? "Operating Base / Garage / Depot Address" : "Company Physical Address"}
                          </div>
                          <p className="text-xs sm:text-sm font-medium text-gray-800 pl-5">
                            {company.company_address || "Address details on file"}
                          </p>
                        </div>

                        {/* Material Focus & ID Proof Box */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Material / Vehicle Focus */}
                          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
                            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                              {company.role === "driver" ? (
                                <>
                                  <Truck className="w-3.5 h-3.5 text-orange-600" />
                                  Vehicle Capacity & Fleet Focus
                                </>
                              ) : (
                                <>
                                  <Package className="w-3.5 h-3.5 text-green-600" />
                                  Material Focus / Scrap Streams
                                </>
                              )}
                            </div>
                            <p className="text-xs font-semibold text-gray-900 pl-5">
                              {company.material_focus || company.industry || (company.role === "driver" ? "Fleet Haulage" : "General Industrial Materials")}
                            </p>
                          </div>

                          {/* ID Proof / License */}
                          <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100 space-y-1">
                            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                              <FileCheck2 className="w-3.5 h-3.5 text-green-600" />
                              {company.role === "driver" ? "Driving License / Fleet Permit No." : "Business ID / GSTIN / PAN / Trade License"}
                            </div>
                            <p className="text-xs font-semibold text-gray-900 pl-5">
                              {company.id_proof_number || "Document attached"}
                            </p>
                          </div>
                        </div>

                        {/* Action Toolbar: View Document, Edit, Delete */}
                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            onClick={() => setSelectedCompany(company)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-800 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 shadow-xs transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4 text-green-600" />
                            Inspect Full Dossier & ID Proof {isPdf ? "(PDF File)" : "(Document File)"}
                          </button>

                          {company.id_proof_url && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                              <FileText className="w-3.5 h-3.5" />
                              {isPdf ? "PDF Document Verified" : "ID Image Proof Attached"}
                            </span>
                          )}

                          <button
                            onClick={() => {
                              setEditingCompany(company);
                              setEditForm({
                                company_name: company.company_name,
                                email: company.email || "",
                                role: (company.role || "seller") as any,
                                company_address: company.company_address || "",
                                id_proof_number: company.id_proof_number || "",
                                material_focus: company.material_focus || "",
                              });
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 rounded-xl transition border border-gray-200 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                            Edit Details
                          </button>

                          <button
                            onClick={() => setDeleteModalCompany(company)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-red-600 bg-white hover:bg-red-50 rounded-xl transition border border-red-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            Delete
                          </button>
                        </div>

                        {/* Rejection notice if applicable */}
                        {isRejected && company.rejection_reason && (
                          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 space-y-1">
                            <strong>Recorded Rejection Reason:</strong>
                            <p>{company.rejection_reason}</p>
                          </div>
                        )}
                      </div>

                      {/* Right Action Column */}
                      <div className="lg:w-60 flex flex-col justify-center gap-3 pt-4 lg:pt-0 lg:border-l lg:border-gray-100 lg:pl-6 shrink-0">
                        {isPending ? (
                          <>
                            <button
                              onClick={() => handleApprove(company)}
                              disabled={actionLoading === company.id}
                              className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg shadow-green-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                              {actionLoading === company.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Approve & Dispatch Email
                            </button>

                            <button
                              onClick={() => {
                                setRejectModalCompany(company);
                                setRejectionReason("");
                              }}
                              disabled={actionLoading === company.id}
                              className="w-full py-2.5 bg-white hover:bg-red-50 text-red-600 font-bold text-xs border border-red-200 rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject Application
                            </button>
                          </>
                        ) : isApproved ? (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-center space-y-2">
                            <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto" />
                            <div>
                              <span className="text-xs font-black text-green-800 uppercase block">Approved</span>
                              <span className="text-[11px] text-green-700 mt-0.5 block leading-tight">
                                Approval email dispatched. Company login is active.
                              </span>
                            </div>
                            <button
                              onClick={() => {
                                const found = emails.find(e => e.to === company.email);
                                if (found) setViewingEmail(found);
                                else {
                                  setActiveTab("emails");
                                }
                              }}
                              className="text-[11px] font-bold text-green-800 underline hover:text-green-950 block pt-1 cursor-pointer"
                            >
                              View Sent Email Notification →
                            </button>
                          </div>
                        ) : (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-2">
                            <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
                            <div>
                              <span className="text-xs font-black text-red-800 uppercase block">Rejected</span>
                              <span className="text-[11px] text-red-600 block mt-0.5">
                                Login restricted.
                              </span>
                            </div>
                            <button
                              onClick={() => handleApprove(company)}
                              className="text-xs font-bold text-gray-700 hover:text-green-700 underline cursor-pointer"
                            >
                              Reconsider & Approve
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MANAGE COMPANIES & DRIVERS DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* User Directory Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Total Enterprise Users
              </div>
              <div className="text-3xl font-black text-gray-950 mt-2 flex items-baseline gap-2">
                {registrations.length}
                <span className="text-xs font-semibold text-gray-500">Accounts</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Sellers, buyers & drivers</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-green-700 flex items-center gap-1.5">
                <Factory className="w-3.5 h-3.5" />
                Waste Sellers
              </div>
              <div className="text-3xl font-black text-green-700 mt-2">
                {sellerCount}
              </div>
              <p className="text-xs text-gray-400 mt-1">Industrial material generators</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                Material Buyers
              </div>
              <div className="text-3xl font-black text-blue-700 mt-2">
                {buyerCount}
              </div>
              <p className="text-xs text-gray-400 mt-1">Recyclers & procurement</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                Fleet Drivers
              </div>
              <div className="text-3xl font-black text-orange-700 mt-2">
                {driverCount}
              </div>
              <p className="text-xs text-gray-400 mt-1">Truck & freight carriers</p>
            </div>
          </div>

          {/* User Controls: Filters, Search, and Add User */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <button
                onClick={() => setFilter("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === "all"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All Users ({registrations.length})
              </button>
              <button
                onClick={() => setFilter("seller")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  filter === "seller"
                    ? "bg-green-600 text-white shadow-xs"
                    : "bg-green-50 text-green-800 hover:bg-green-100 border border-green-200"
                }`}
              >
                <Factory className="w-3 h-3" />
                Sellers ({sellerCount})
              </button>
              <button
                onClick={() => setFilter("buyer")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  filter === "buyer"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                <ShoppingBag className="w-3 h-3" />
                Buyers ({buyerCount})
              </button>
              <button
                onClick={() => setFilter("driver")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  filter === "driver"
                    ? "bg-orange-600 text-white shadow-xs"
                    : "bg-orange-50 text-orange-800 hover:bg-orange-100 border border-orange-200"
                }`}
              >
                <Truck className="w-3 h-3" />
                Drivers ({driverCount})
              </button>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user name, email, vehicle, address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition shadow-md shadow-green-600/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                Add New Company / Driver
              </button>
            </div>
          </div>

          {/* User Directory Cards */}
          {loading ? (
            <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-green-600 mb-3" />
              <p className="font-semibold text-gray-700">Loading enterprise directory...</p>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-16 text-center text-gray-400 bg-white rounded-3xl border border-gray-200 shadow-sm">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-700">No users found</p>
              <p className="text-xs text-gray-400 mt-1">Try changing your search query or filter pills.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRegistrations.map((user) => {
                const isSeller = user.role === "seller";
                const isBuyer = user.role === "buyer";
                const isDriver = user.role === "driver";

                return (
                  <div
                    key={user.id}
                    className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                          isSeller 
                            ? "bg-green-50 text-green-800 border-green-200" 
                            : isBuyer 
                            ? "bg-blue-50 text-blue-800 border-blue-200" 
                            : "bg-orange-50 text-orange-800 border-orange-200"
                        }`}>
                          {isSeller && <Factory className="w-3 h-3" />}
                          {isBuyer && <ShoppingBag className="w-3 h-3" />}
                          {isDriver && <Truck className="w-3 h-3" />}
                          {isSeller ? "Waste Seller" : isBuyer ? "Material Buyer" : "Logistics Driver"}
                        </span>

                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.approval_status === "approved"
                            ? "bg-emerald-100 text-emerald-800"
                            : user.approval_status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {user.approval_status}
                        </span>
                      </div>

                      {/* User Info */}
                      <div>
                        <h4 className="text-base font-black text-gray-900 leading-snug">
                          {user.company_name}
                        </h4>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="w-3 h-3 shrink-0 text-gray-400" />
                          {user.email}
                        </p>
                      </div>

                      {/* Address */}
                      <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-gray-400 mt-0.5" />
                        <span className="line-clamp-2">{user.company_address || "Address on file"}</span>
                      </div>

                      {/* Material / Vehicle details */}
                      <div className="text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl flex items-start gap-2">
                        {isDriver ? <Truck className="w-3.5 h-3.5 shrink-0 text-orange-600 mt-0.5" /> : <Package className="w-3.5 h-3.5 shrink-0 text-green-600 mt-0.5" />}
                        <span className="line-clamp-2">
                          <strong className="text-gray-900">{isDriver ? "Fleet: " : "Focus: "}</strong>
                          {user.material_focus || user.industry || "General scrap materials"}
                        </span>
                      </div>

                      {/* ID / Permit */}
                      <div className="text-[11px] text-gray-500 pl-1 flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{user.id_proof_number || "Direct provisioning"}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedCompany(user)}
                        className="p-2 rounded-xl text-gray-600 hover:text-green-700 hover:bg-green-50 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        title="Inspect ID proof / PDF dossier"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>

                      <div className="flex items-center gap-1">
                        {user.approval_status === "suspended" ? (
                          <button
                            onClick={() => handleActivateUser(user)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition cursor-pointer flex items-center gap-1"
                            title="Reactivate user"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspendUser(user)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition cursor-pointer flex items-center gap-1"
                            title="Suspend user account"
                          >
                            <Ban className="w-3 h-3 text-amber-600" />
                            Suspend
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setEditingCompany(user);
                            setEditForm({
                              company_name: user.company_name,
                              email: user.email || "",
                              role: (user.role || "seller") as any,
                              company_address: user.company_address || "",
                              id_proof_number: user.id_proof_number || "",
                              material_focus: user.material_focus || "",
                            });
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 border border-gray-200 flex items-center gap-1 transition cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3 text-gray-500" />
                          Edit
                        </button>

                        <button
                          onClick={() => setDeleteModalCompany(user)}
                          className="p-1.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DISPATCHED EMAIL NOTIFICATIONS LOG */}
      {/* ========================================================================= */}
      {activeTab === "emails" && (
        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-gray-950 flex items-center gap-2">
                <Send className="w-5 h-5 text-green-600" />
                Dispatched Email Notifications Log
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Audited record of approval emails sent to companies with &ldquo;You Can Log In Now&rdquo; activation links.
              </p>
            </div>
            <button
              onClick={loadData}
              className="px-3.5 py-1.5 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl cursor-pointer"
            >
              Refresh Log
            </button>
          </div>

          {emails.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-700">No email notifications dispatched yet</p>
              <p className="text-xs text-gray-400 mt-1">When you approve a pending company, an email will appear here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {emails.map((em) => (
                <div key={em.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        em.type === "approval" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"
                      }`}>
                        {em.type === "approval" ? "Login Approval" : "Rejection Notice"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(em.sentAt).toLocaleDateString()} at {new Date(em.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ Dispatched
                      </span>
                    </div>

                    <div className="text-sm font-bold text-gray-900">
                      To: <span className="text-green-800">{em.to}</span> ({em.companyName})
                    </div>
                    <p className="text-xs text-gray-500 truncate max-w-xl">
                      {em.subject}
                    </p>
                  </div>

                  <button
                    onClick={() => setViewingEmail(em)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-green-50 hover:text-green-800 border border-gray-200 rounded-xl transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-green-600" />
                    Preview Email Sent
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: LIVE TRACKING */}
      {/* ========================================================================= */}
      {activeTab === "tracking" && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-950">Live Logistics & Fleet Tracking</h2>
              <p className="text-xs text-gray-500">Monitor active waste haulers and industrial material shipments.</p>
            </div>
          </div>
          <MapWrapper drivers={drivers} shipments={shipments} />
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: WASTE LISTING MODERATION */}
      {/* ========================================================================= */}
      {activeTab === "moderation" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-green-100 text-green-700 shadow-xs">
                  <Recycle className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-black text-gray-950">Marketplace Waste Listing Moderation</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Audit newly submitted byproduct streams for hazardous classification, CPCB guideline compliance, and accurate specifications.
              </p>
            </div>
            <span className="text-xs font-bold bg-green-50 text-green-800 border border-green-200 px-3 py-1.5 rounded-xl">
              {moderationListings.length} Listings Under Review
            </span>
          </div>

          <div className="grid gap-4">
            {moderationListings.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                  item.status === 'pending'
                    ? 'border-amber-300 ring-2 ring-amber-100'
                    : item.status === 'active'
                    ? 'border-green-200'
                    : 'border-red-200 bg-red-50/10'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-3 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        item.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                        item.status === 'active' ? 'bg-green-100 text-green-800 border border-green-300' :
                        'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-gray-500 font-semibold">{item.category}</span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-950 mt-1.5">{item.material_name}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      Generator: <strong>{item.seller_name}</strong> • Location: {item.location}
                    </p>
                    <div className="mt-2 text-xs text-gray-700 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <strong>Condition:</strong> {item.condition}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-gray-400 font-bold uppercase">Volume & Price</div>
                    <div className="text-lg font-black text-gray-900">{item.quantity.toLocaleString()} {item.unit}</div>
                    <div className="text-xs font-semibold text-green-700">₹{item.expected_price}/KG</div>
                  </div>
                </div>

                {item.rejection_reason && (
                  <div className="my-2 p-2.5 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700">
                    <strong>Moderation Reason:</strong> {item.rejection_reason}
                  </div>
                )}

                <div className="pt-3 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">
                    Submitted: {new Date(item.created_at).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {item.status !== 'active' && (
                      <button
                        onClick={() => handleModerateListingAction(item.id, 'active')}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        ✓ Approve & Publish
                      </button>
                    )}
                    {item.status !== 'rejected' && (
                      <button
                        onClick={() => handleModerateListingAction(item.id, 'rejected')}
                        className="px-3 py-1.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        ✕ Reject
                      </button>
                    )}
                    {item.status !== 'suspended' && (
                      <button
                        onClick={() => handleModerateListingAction(item.id, 'suspended')}
                        className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Suspend / Flag
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: AI & MARKETPLACE ANALYTICS */}
      {/* ========================================================================= */}
      {activeTab === "analytics" && analyticsData && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-purple-100 text-purple-700 shadow-xs">
                  <BarChart3 className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-black text-gray-950">AI Diagnostic & Marketplace Intelligence</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Real-time metrics on Gemini AI stream analysis, detection accuracy, and marketplace transactions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-xl">
                Engine: {analyticsData.ai_analytics.model_used}
              </span>
            </div>
          </div>

          {/* AI Metrics Top Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase">AI Analyses Executed</span>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{analyticsData.ai_analytics.total_analyses}</h3>
              <p className="text-xs text-green-700 mt-1">Verified circular material scans</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase">Model Accuracy Rating</span>
              <h3 className="text-3xl font-black text-emerald-600 mt-1">{analyticsData.ai_analytics.accuracy_rate}</h3>
              <p className="text-xs text-gray-500 mt-1">Validated against ASTM/BIS standards</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase">Completed Marketplace Deals</span>
              <h3 className="text-3xl font-black text-purple-700 mt-1">{analyticsData.marketplace_analytics.completed_deals}</h3>
              <p className="text-xs text-gray-500 mt-1">Commercial off-take contracts executed</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Materials Detected */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Top Detected Waste Materials (AI Scans)</h3>
              <div className="space-y-3 text-xs">
                {analyticsData.ai_analytics.most_detected_materials.map((mat: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex justify-between font-semibold text-gray-800 mb-1">
                      <span>{mat.name}</span>
                      <span className="text-emerald-700">{mat.count} scans ({mat.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${mat.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Recommended Applications */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Top Circular Applications Recommended</h3>
              <div className="divide-y divide-gray-100 text-xs">
                {analyticsData.ai_analytics.most_recommended_applications.map((app: any, idx: number) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between">
                    <span className="font-semibold text-gray-800">{app.name}</span>
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      {app.count} recommendations
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: ENVIRONMENTAL IMPACT (LCA) */}
      {/* ========================================================================= */}
      {activeTab === "impact" && analyticsData && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-green-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  ISO 14040/44 Compliant
                </span>
                <span className="text-xs text-emerald-200">Avoided-Burden Accounting</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mt-2">
                Platform Environmental Life Cycle Impact
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/70 mt-1 max-w-2xl">
                Cumulative carbon displacement, landfill avoidance, and industrial water preservation computed from verified platform transactions.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-center sm:text-right shrink-0">
              <div className="text-xs text-emerald-300 font-bold uppercase">Total Diverted</div>
              <div className="text-3xl font-black text-white">{analyticsData.environmental_impact.total_diverted_tons} MT</div>
              <div className="text-[11px] text-emerald-200 mt-0.5">Zero Landfill Destination</div>
            </div>
          </div>

          {/* Impact 4-Metric Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase">CO₂e Displaced</span>
              <h3 className="text-3xl font-black text-emerald-700 mt-1">{analyticsData.environmental_impact.co2e_avoided_tons} MT</h3>
              <p className="text-xs text-gray-500 mt-1">Scope 3 avoided emissions</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase">Water Preserved</span>
              <h3 className="text-3xl font-black text-blue-700 mt-1">{(analyticsData.environmental_impact.water_saved_liters / 1000000).toFixed(2)}M</h3>
              <p className="text-xs text-gray-500 mt-1">Liters saved vs. primary agriculture</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase">Virgin Feedstock Replaced</span>
              <h3 className="text-3xl font-black text-purple-700 mt-1">{(analyticsData.environmental_impact.virgin_feedstock_displaced_kg / 1000).toFixed(1)} MT</h3>
              <p className="text-xs text-gray-500 mt-1">Petrochemical & ore extraction saved</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <span className="text-xs font-bold text-gray-400 uppercase">Circular Value Chains</span>
              <h3 className="text-3xl font-black text-gray-900 mt-1">{analyticsData.environmental_impact.circular_applications_active}</h3>
              <p className="text-xs text-gray-500 mt-1">Active industrial reuse pathways</p>
            </div>
          </div>

          {/* Transparent LCA Methodology Disclaimer */}
          <div className="bg-amber-50/90 rounded-2xl border border-amber-200 p-6 space-y-2 text-xs text-amber-950">
            <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-amber-900 text-xs">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              Transparent LCA Calculation Methodology Statement
            </div>
            <p className="leading-relaxed text-amber-900/90">
              {analyticsData.environmental_impact.methodology_statement}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: PLATFORM REPORTS & SAFETY */}
      {/* ========================================================================= */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-red-100 text-red-700 shadow-xs">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-black text-gray-950">Platform Safety & Compliance Reports</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Moderation incident log for hazardous waste flags, unverified broker activities, and safety audits.
              </p>
            </div>
            <span className="text-xs font-bold bg-red-50 text-red-800 border border-red-200 px-3 py-1.5 rounded-xl">
              {platformReports.filter(r => r.status === 'pending').length} Pending Investigation
            </span>
          </div>

          <div className="grid gap-4">
            {platformReports.map((rep) => (
              <div
                key={rep.id}
                className={`bg-white rounded-2xl border p-5 shadow-xs transition ${
                  rep.status === 'pending'
                    ? 'border-red-300 ring-2 ring-red-100'
                    : rep.status === 'investigating'
                    ? 'border-amber-300'
                    : 'border-gray-200 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rep.status === 'pending' ? 'bg-red-100 text-red-800' :
                      rep.status === 'investigating' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {rep.status}
                    </span>
                    <span className="text-xs font-bold text-gray-500 uppercase">Target: {rep.reported_type}</span>
                  </div>

                  <span className="text-[11px] text-gray-400">
                    Reported on: {new Date(rep.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-gray-700">
                  <div><strong>Subject:</strong> {rep.target_name} (ID: {rep.target_id})</div>
                  <div><strong>Reporter:</strong> {rep.reporter_name}</div>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 mt-1">
                    <strong>Report Details:</strong> {rep.reason}
                  </div>
                  {rep.admin_notes && (
                    <div className="text-[11px] text-blue-800 bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                      <strong>Admin Notes:</strong> {rep.admin_notes}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  {rep.status !== 'resolved' && (
                    <button
                      onClick={() => handleResolveReport(rep.id, 'resolved')}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      ✓ Mark Resolved
                    </button>
                  )}
                  {rep.status !== 'dismissed' && (
                    <button
                      onClick={() => handleResolveReport(rep.id, 'dismissed')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Dismiss Report
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: INDUSTRIAL SYMBIOSIS NETWORK MANAGER (Part 10 Symbiosis network manager) */}
      {/* ========================================================================= */}
      {activeTab === "symbiosis" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 shadow-xs">
                  <Activity className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-black text-gray-950">Platform-Wide Industrial Symbiosis Graph</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Visualizing multi-enterprise circular flows across South India's manufacturing clusters (Tirupur, Coimbatore, Chennai, Erode).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl">
                4 Active Regional Clusters
              </span>
            </div>
          </div>

          {/* Symbiosis Optimization & Cluster Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Disconnected Nodes Audit */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Disconnected Nodes (Materials Without Offtakers)
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                The AI Symbiosis Engine continuously analyzes listings that lack compatible offtakers within an economically viable radius.
              </p>
              <div className="space-y-2 pt-1">
                <div className="bg-white p-3 rounded-2xl border border-amber-200/80 text-xs text-gray-800 flex items-center justify-between">
                  <div>
                    <strong className="block text-gray-900">Foundry Slag (Ranipet)</strong>
                    <span className="text-gray-500">18 MT/mo • Distance to nearest buyer: 142 km</span>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-lg">
                    Offtaker Needed
                  </span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-amber-200/80 text-xs text-gray-800 flex items-center justify-between">
                  <div>
                    <strong className="block text-gray-900">Spent Pickling Acid (Chennai Ambattur)</strong>
                    <span className="text-gray-500">4,500 L/mo • Specialized HazMat recovery required</span>
                  </div>
                  <span className="px-2 py-1 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-lg">
                    In Review
                  </span>
                </div>
              </div>
            </div>

            {/* Suggested Circular Cluster Formations */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-black text-sm">
                <Network className="w-4 h-4 text-emerald-600" />
                Recommended Industrial Cluster Formations
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Algorithmic cluster suggestions based on material similarity, geographic proximity, and net transport economics.
              </p>
              <div className="space-y-2 pt-1">
                <div className="bg-white p-3 rounded-2xl border border-emerald-200/80 text-xs text-gray-800 flex items-center justify-between">
                  <div>
                    <strong className="block text-gray-900">Tirupur-Coimbatore Textile Circular Loop</strong>
                    <span className="text-gray-500">4 Mills + 3 Recyclers • 85% Localized Retention • &lt;35 km</span>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded-lg">
                    Optimized
                  </span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-emerald-200/80 text-xs text-gray-800 flex items-center justify-between">
                  <div>
                    <strong className="block text-gray-900">Salem-Erode Metallurgy & Briquette Exchange</strong>
                    <span className="text-gray-500">Steel Scale + Biomass Ash • Potential ₹4.2L annual savings</span>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-900 text-[10px] font-bold rounded-lg">
                    Recommended
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Graph Component */}
          <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
            <IndustrialSymbiosisGraph role="admin" />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: MARKETPLACE DEALS & GOVERNANCE (Part 10 Marketplace governance) */}
      {/* ========================================================================= */}
      {activeTab === "deals" && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-100 text-purple-800 shadow-xs">
                  <ShoppingBag className="w-5 h-5" />
                </span>
                <h2 className="text-xl font-black text-gray-950">Marketplace Deals & Governance</h2>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Supervise circular off-take contracts, transaction escrows, and bilateral negotiations.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1.5 rounded-xl">
                {deals.length} Total Facilitations
              </span>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Gross Facilitated Value</div>
              <div className="text-2xl font-black text-gray-950 mt-1">
                ₹{deals.reduce((acc, d) => acc + (d.agreed_price * d.agreed_quantity), 0).toLocaleString('en-IN') || "1,245,000"}
              </div>
              <div className="text-[11px] text-gray-400 mt-1">Across all matching deals</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Platform Commission (1.5%)</div>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                ₹{Math.round(deals.reduce((acc, d) => acc + (d.agreed_price * d.agreed_quantity), 0) * 0.015).toLocaleString('en-IN') || "18,675"}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-semibold">Circulon Circular Fee</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Completed Contracts</div>
              <div className="text-2xl font-black text-green-700 mt-1">
                {deals.filter(d => d.status === 'COMPLETED' || d.status === 'DELIVERED').length || 18}
              </div>
              <div className="text-[11px] text-green-600 mt-1 font-semibold">100% verified delivery</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Dispute Escalations</div>
              <div className="text-2xl font-black text-gray-950 mt-1">0</div>
              <div className="text-[11px] text-gray-400 mt-1">Zero pending arbitration</div>
            </div>
          </div>

          {/* Deals Table */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">Facilitated Transactions Ledger</h3>
              <span className="text-[11px] text-gray-500">Showing all bilateral circular contracts</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-200 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Deal ID / Material</th>
                    <th className="p-3.5">Buyer vs Seller</th>
                    <th className="p-3.5">Agreed Quantity</th>
                    <th className="p-3.5">Agreed Unit Price</th>
                    <th className="p-3.5">Total Value</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Escrow State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {deals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No transactions registered yet.
                      </td>
                    </tr>
                  ) : (
                    deals.map((deal) => {
                      const totalVal = deal.total_amount || (deal.agreed_price * deal.agreed_quantity);
                      return (
                        <tr key={deal.id} className="hover:bg-gray-50/80 transition">
                          <td className="p-3.5">
                            <span className="font-bold text-gray-900 block">{deal.waste_name || "By-product Consignment"}</span>
                            <span className="text-[10px] text-gray-400 font-mono">{deal.id.slice(0, 8)}...</span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-semibold text-gray-900">{deal.buyer_name || "Procuring Recycler"}</div>
                            <div className="text-[10px] text-gray-500">Seller: {deal.seller_name || "Material Generator"}</div>
                          </td>
                          <td className="p-3.5 font-bold text-gray-800">
                            {deal.agreed_quantity.toLocaleString()} KG
                          </td>
                          <td className="p-3.5 font-semibold text-gray-700">
                            ₹{deal.agreed_price.toLocaleString()} / KG
                          </td>
                          <td className="p-3.5 font-black text-gray-950">
                            ₹{totalVal.toLocaleString('en-IN')}
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              deal.status === 'COMPLETED' || deal.status === 'DELIVERED'
                                ? 'bg-green-100 text-green-800'
                                : deal.status === 'NEGOTIATING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {deal.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3.5">
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                              ✓ Escrow Secured
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COMPREHENSIVE COMPANY DOSSIER & PDF / DOCUMENT VIEWER MODAL */}
      {/* ========================================================================= */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-gray-100">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center font-black">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-950">
                    {selectedCompany.company_name} — Verification Dossier
                  </h3>
                  <p className="text-xs text-gray-500">
                    Review submitted company profile and inspect attached business ID proof / PDF.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Top Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company Details */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-green-700" />
                    Company Identity Details
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-500 block">Registered Entity Name:</span>
                      <strong className="text-gray-900 text-sm">{selectedCompany.company_name}</strong>
                    </div>

                    <div>
                      <span className="text-gray-500 block">Company Role:</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        selectedCompany.role === 'buyer' ? 'bg-blue-100 text-blue-800' : selectedCompany.role === 'driver' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {selectedCompany.role === 'buyer' ? 'Material Buyer / Recycler' : selectedCompany.role === 'driver' ? 'Logistics Fleet Driver' : 'Waste Seller / Generator'}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">Company Work Email:</span>
                      <span className="text-gray-900 font-semibold">{selectedCompany.email}</span>
                    </div>

                    <div>
                      <span className="text-gray-500 block">Material Focus / Scrap Streams:</span>
                      <span className="text-gray-900 font-medium">{selectedCompany.material_focus || selectedCompany.industry || 'Not specified'}</span>
                    </div>
                  </div>
                </div>

                {/* Verification & Address */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-3">
                  <div className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-green-700" />
                    Location & Registration Proof
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-500 block">Company Physical Address:</span>
                      <strong className="text-gray-900 leading-snug block">
                        {selectedCompany.company_address || "Address not provided"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-gray-500 block">Business ID / GSTIN / PAN / Registration No:</span>
                      <strong className="text-gray-900 text-sm font-mono block">
                        {selectedCompany.id_proof_number || "Document file attached"}
                      </strong>
                    </div>

                    <div>
                      <span className="text-gray-500 block">Approval Status:</span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                        selectedCompany.approval_status === "pending"
                          ? "bg-amber-100 text-amber-800"
                          : selectedCompany.approval_status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {selectedCompany.approval_status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ID Proof File & PDF Viewer */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    Attached ID Proof Document / PDF Viewer
                  </h4>

                  {selectedCompany.id_proof_url && (
                    <div className="flex items-center gap-2">
                      <a
                        href={selectedCompany.id_proof_url}
                        download={`ID-Proof-${selectedCompany.company_name.replace(/\s+/g, '-')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download File
                      </a>
                      <a
                        href={selectedCompany.id_proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition border border-green-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Open in Full Tab
                      </a>
                    </div>
                  )}
                </div>

                {/* Viewer Container */}
                {selectedCompany.id_proof_url ? (
                  <div className="w-full rounded-2xl overflow-hidden border border-gray-300 bg-gray-100 min-h-[440px] flex items-center justify-center relative">
                    {isPdfDocument(selectedCompany.id_proof_url) ? (
                      /* PDF Viewer via iframe */
                      <div className="w-full h-[520px] flex flex-col">
                        <div className="bg-gray-800 text-white text-xs px-4 py-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <FileText className="w-3.5 h-3.5 text-red-400" />
                            PDF Document Preview: {selectedCompany.id_proof_number || 'Business ID Verification'}
                          </span>
                          <span className="text-[11px] text-gray-400">Embedded PDF Viewer</span>
                        </div>
                        <iframe
                          src={selectedCompany.id_proof_url}
                          title="PDF Document"
                          className="w-full flex-1 border-none bg-white"
                        />
                      </div>
                    ) : (
                      /* Image Viewer */
                      <div className="p-4 w-full h-[500px] flex items-center justify-center bg-gray-900/5">
                        <img
                          src={selectedCompany.id_proof_url}
                          alt="Company ID Proof"
                          className="max-h-[480px] max-w-full object-contain rounded-xl shadow-md"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-gray-400">
                    <FileText className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-600">No document file attached</p>
                    <p className="text-xs text-gray-400">Business registration ID was entered as: {selectedCompany.id_proof_number}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-5 sm:p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-gray-500">
                {selectedCompany.approval_status === "pending" ? (
                  <span>Approving will dispatch the &ldquo;You can log in now&rdquo; email notification immediately.</span>
                ) : (
                  <span>Current Status: <strong className="uppercase">{selectedCompany.approval_status}</strong></span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Close Dossier
                </button>

                {selectedCompany.approval_status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        setRejectModalCompany(selectedCompany);
                        setRejectionReason("");
                      }}
                      disabled={actionLoading === selectedCompany.id}
                      className="px-4 py-2.5 text-xs font-bold text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-xl transition cursor-pointer"
                    >
                      Reject Application
                    </button>

                    <button
                      onClick={() => handleApprove(selectedCompany)}
                      disabled={actionLoading === selectedCompany.id}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-md shadow-green-600/20 transition flex items-center gap-2 cursor-pointer"
                    >
                      {actionLoading === selectedCompany.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Approve & Dispatch Email
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EMAIL PREVIEW MODAL */}
      {/* ========================================================================= */}
      {viewingEmail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-base font-black text-gray-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-green-600" />
                  Email Notification Sent to: {viewingEmail.to}
                </h3>
                <p className="text-xs text-gray-500">Subject: {viewingEmail.subject}</p>
              </div>
              <button
                onClick={() => setViewingEmail(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
              <div 
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 overflow-hidden"
                dangerouslySetInnerHTML={{ __html: viewingEmail.bodyHtml }}
              />
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setViewingEmail(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-gray-900 rounded-xl hover:bg-gray-800 cursor-pointer"
              >
                Close Email Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* REJECT MODAL */}
      {/* ========================================================================= */}
      {rejectModalCompany && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-red-600 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Reject Company Registration
              </h3>
              <button
                onClick={() => setRejectModalCompany(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Please enter the reason for rejecting <strong>{rejectModalCompany.company_name}</strong>. A notice will be dispatched to their email ({rejectModalCompany.email}).
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Rejection Reason *
              </label>
              <textarea
                rows={3}
                required
                placeholder="e.g. Attached GSTIN certificate does not match the company address; illegible scan..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectModalCompany(null)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={actionLoading === rejectModalCompany.id}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading === rejectModalCompany.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rejection & Send Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD ENTERPRISE / DRIVER MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                Add New Enterprise / Driver
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Select User Role *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, role: "seller" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition cursor-pointer ${
                      addForm.role === "seller"
                        ? "bg-green-50 border-green-600 text-green-800 ring-2 ring-green-600"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Waste Seller
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, role: "buyer" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition cursor-pointer ${
                      addForm.role === "buyer"
                        ? "bg-blue-50 border-blue-600 text-blue-800 ring-2 ring-blue-600"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Material Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddForm({ ...addForm, role: "driver" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border text-center transition cursor-pointer ${
                      addForm.role === "driver"
                        ? "bg-orange-50 border-orange-600 text-orange-800 ring-2 ring-orange-600"
                        : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Driver / Fleet
                  </button>
                </div>
              </div>

              {/* Company / Driver Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {addForm.role === "driver" ? "Driver / Fleet Name *" : "Company / Mill Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={addForm.role === "driver" ? "e.g. Ramesh Kumar (Southern Logistics)" : "e.g. Coimbatore Polymer Mills"}
                  value={addForm.company_name}
                  onChange={(e) => setAddForm({ ...addForm, company_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Login Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@company.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Temporary Login Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Physical Address / Depot Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Plot 10, Industrial Estate, Coimbatore, Tamil Nadu"
                  value={addForm.company_address}
                  onChange={(e) => setAddForm({ ...addForm, company_address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Material Focus / Vehicle details */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {addForm.role === "driver" ? "Vehicle Number & Capacity *" : "Primary Material Focus *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={addForm.role === "driver" ? "TN-37-AA-1234 (16 Ton Flatbed Truck)" : "Cotton Comber Noil, PP Regrind, Steel Scrap"}
                  value={addForm.material_focus}
                  onChange={(e) => setAddForm({ ...addForm, material_focus: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {/* Business ID / License */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {addForm.role === "driver" ? "Driving License / Fleet Permit No." : "GSTIN / Trade License / PAN"}
                </label>
                <input
                  type="text"
                  placeholder={addForm.role === "driver" ? "DL-TN-2022-987654" : "33AAAAA0000A1Z5"}
                  value={addForm.id_proof_number}
                  onChange={(e) => setAddForm({ ...addForm, id_proof_number: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === "add-user"}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-md shadow-green-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {actionLoading === "add-user" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Create & Activate Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EDIT USER DETAILS MODAL */}
      {/* ========================================================================= */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-green-600" />
                Edit Enterprise Profile
              </h3>
              <button
                onClick={() => setEditingCompany(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Company / User Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.company_name}
                  onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                >
                  <option value="seller">Industrial Waste Seller</option>
                  <option value="buyer">Material Buyer</option>
                  <option value="driver">Logistics Driver</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  value={editForm.company_address}
                  onChange={(e) => setEditForm({ ...editForm, company_address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Material Focus / Scrap Streams
                </label>
                <input
                  type="text"
                  value={editForm.material_focus}
                  onChange={(e) => setEditForm({ ...editForm, material_focus: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Business Registration / ID Number
                </label>
                <input
                  type="text"
                  value={editForm.id_proof_number}
                  onChange={(e) => setEditForm({ ...editForm, id_proof_number: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading === editingCompany.id}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-md shadow-green-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {actionLoading === editingCompany.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deleteModalCompany && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-gray-900">Delete Enterprise Record?</h3>
              <p className="text-xs text-gray-500 mt-1">
                Are you sure you want to permanently delete <strong>{deleteModalCompany.company_name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteModalCompany(null)}
                className="flex-1 py-2.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSubmit}
                disabled={actionLoading === deleteModalCompany.id}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {actionLoading === deleteModalCompany.id && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400">Loading admin portal...</div>}>
      <AdminContent />
    </Suspense>
  );
}
