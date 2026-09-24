"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Recycle, 
  Users, 
  Settings, 
  LogOut, 
  Inbox, 
  ShieldCheck, 
  Truck, 
  MessageSquare, 
  Sparkles, 
  Heart,
  FileCheck2,
  FileText,
  Building2,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  PlusCircle,
  BarChart3,
  TrendingUp,
  Activity,
  Layers,
  Search,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Share2,
  QrCode,
  IndianRupee,
  Navigation,
  UploadCloud,
  FileBadge,
  Eye,
  Bell,
  UserCheck,
  Package,
  Compass,
  DollarSign
} from "lucide-react";
import { logout } from "@/app/login/actions";
import { NotificationBell } from "./NotificationBell";

interface SidebarProps {
  role: string;
  userEmail?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  tab?: string;
  badge?: string;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

export function Sidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") || "overview" : "overview";
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route/tab change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, currentTab]);

  // Admin Navigation Sections
  const adminSections: NavSection[] = [
    {
      heading: "OVERVIEW",
      items: [
        { name: "Dashboard", href: "/admin?tab=overview", tab: "overview", icon: LayoutDashboard }
      ]
    },
    {
      heading: "USER MANAGEMENT",
      items: [
        { name: "Users", href: "/admin?tab=users", tab: "users", icon: Users },
        { name: "Sellers", href: "/admin?tab=sellers", tab: "sellers", icon: Building2 },
        { name: "Buyers", href: "/admin?tab=buyers", tab: "buyers", icon: Package },
        { name: "Drivers", href: "/admin?tab=fleet-drivers", tab: "fleet-drivers", icon: Truck }
      ]
    },
    {
      heading: "VERIFICATION",
      items: [
        { name: "Pending Businesses", href: "/admin?tab=verification", tab: "verification", icon: ShieldAlert },
        { name: "Documents", href: "/admin?tab=documents", tab: "documents", icon: FileText },
        { name: "Verified Businesses", href: "/admin?tab=verified", tab: "verified", icon: ShieldCheck }
      ]
    },
    {
      heading: "MATERIAL MANAGEMENT",
      items: [
        { name: "All Materials", href: "/admin?tab=materials", tab: "materials", icon: Layers },
        { name: "Pending Listings", href: "/admin?tab=pending-materials", tab: "pending-materials", icon: Clock },
        { name: "Material Categories", href: "/admin?tab=categories", tab: "categories", icon: Recycle },
        { name: "Flagged Materials", href: "/admin?tab=flagged", tab: "flagged", icon: ShieldAlert }
      ]
    },
    {
      heading: "AI & MATCHING",
      items: [
        { name: "AI Analyses", href: "/admin?tab=ai-analyses", tab: "ai-analyses", icon: Sparkles },
        { name: "Buyer Matches", href: "/admin?tab=buyer-matches", tab: "buyer-matches", icon: Share2 },
        { name: "Matching Analytics", href: "/admin?tab=matching-analytics", tab: "matching-analytics", icon: BarChart3 }
      ]
    },
    {
      heading: "MARKETPLACE",
      items: [
        { name: "Active Deals", href: "/admin?tab=deals", tab: "deals", icon: MessageSquare },
        { name: "Transactions", href: "/admin?tab=transactions", tab: "transactions", icon: IndianRupee },
        { name: "Negotiations", href: "/admin?tab=negotiations", tab: "negotiations", icon: Clock },
        { name: "Disputes", href: "/admin?tab=disputes", tab: "disputes", icon: ShieldAlert }
      ]
    },
    {
      heading: "LOGISTICS",
      items: [
        { name: "Shipments", href: "/admin?tab=shipments", tab: "shipments", icon: Truck },
        { name: "Live Tracking", href: "/admin?tab=tracking", tab: "tracking", icon: Navigation },
        { name: "Drivers", href: "/admin?tab=fleet-drivers", tab: "fleet-drivers", icon: Users }
      ]
    },
    {
      heading: "IMPACT",
      items: [
        { name: "Environmental Impact", href: "/admin?tab=impact", tab: "impact", icon: TrendingUp },
        { name: "Waste Diverted", href: "/admin?tab=waste-diverted", tab: "waste-diverted", icon: Recycle },
        { name: "CO2e Impact", href: "/admin?tab=co2e", tab: "co2e", icon: Activity },
        { name: "Circularity Reports", href: "/admin?tab=circularity-reports", tab: "circularity-reports", icon: FileBadge }
      ]
    },
    {
      heading: "NETWORK",
      items: [
        { name: "Industrial Symbiosis", href: "/admin?tab=symbiosis", tab: "symbiosis", icon: Share2 }
      ]
    },
    {
      heading: "REPORTS",
      items: [
        { name: "Reports & Analytics", href: "/admin?tab=reports", tab: "reports", icon: BarChart3 }
      ]
    },
    {
      heading: "SYSTEM",
      items: [
        { name: "Messages", href: "/messages", icon: MessageSquare },
        { name: "Notifications", href: "/admin?tab=notifications", tab: "notifications", icon: Bell },
        { name: "Settings", href: "/settings", icon: Settings }
      ]
    }
  ];

  // Seller Navigation Sections
  const sellerSections: NavSection[] = [
    {
      heading: "MAIN",
      items: [
        { name: "Dashboard", href: "/dashboard?tab=overview", tab: "overview", icon: LayoutDashboard }
      ]
    },
    {
      heading: "MATERIALS",
      items: [
        { name: "My Listings", href: "/waste", icon: Layers },
        { name: "List By-Product", href: "/waste/add", icon: PlusCircle },
        { name: "Drafts", href: "/waste?filter=drafts", icon: Clock },
        { name: "Sold / Completed", href: "/waste?filter=sold", icon: CheckCircle2 },
        { name: "AI Material Analysis", href: "/dashboard?tab=ai-analysis", tab: "ai-analysis", icon: Sparkles }
      ]
    },
    {
      heading: "VALORIZATION",
      items: [
        { name: "What Can It Become?", href: "/dashboard?tab=valorization", tab: "valorization", icon: Sparkles },
        { name: "Product Recommendations", href: "/dashboard?tab=product-recs", tab: "product-recs", icon: Package },
        { name: "Processing Options", href: "/dashboard?tab=processing", tab: "processing", icon: Recycle },
        { name: "Circular Value", href: "/dashboard?tab=circular-value", tab: "circular-value", icon: IndianRupee }
      ]
    },
    {
      heading: "MARKETPLACE",
      items: [
        { name: "Buyer Matches", href: "/dashboard?tab=matches", tab: "matches", icon: Share2 },
        { name: "Buyer Requests", href: "/dashboard?tab=requests", tab: "requests", icon: Inbox },
        { name: "Saved Buyers", href: "/buyers", icon: Heart },
        { name: "Negotiations", href: "/dashboard?tab=deals", tab: "deals", icon: MessageSquare },
        { name: "My Deals", href: "/dashboard?tab=deals", tab: "deals", icon: FileCheck2 }
      ]
    },
    {
      heading: "LOGISTICS",
      items: [
        { name: "Shipments", href: "/dashboard?tab=shipments", tab: "shipments", icon: Truck },
        { name: "Track Shipment", href: "/dashboard?tab=tracking", tab: "tracking", icon: Navigation },
        { name: "Material Passport", href: "/dashboard?tab=passports", tab: "passports", icon: QrCode }
      ]
    },
    {
      heading: "INSIGHTS",
      items: [
        { name: "Impact", href: "/dashboard?tab=impact", tab: "impact", icon: TrendingUp },
        { name: "Earnings", href: "/dashboard?tab=earnings", tab: "earnings", icon: DollarSign }
      ]
    },
    {
      heading: "SYSTEM",
      items: [
        { name: "Messages", href: "/messages", icon: MessageSquare },
        { name: "Notifications", href: "/dashboard?tab=notifications", tab: "notifications", icon: Bell },
        { name: "Profile & Verification", href: "/settings?tab=profile", icon: UserCheck },
        { name: "Settings", href: "/settings", icon: Settings }
      ]
    }
  ];

  // Buyer Navigation Sections
  const buyerSections: NavSection[] = [
    {
      heading: "MAIN",
      items: [
        { name: "Dashboard", href: "/buyer?tab=overview", tab: "overview", icon: LayoutDashboard }
      ]
    },
    {
      heading: "DISCOVER",
      items: [
        { name: "Find Materials", href: "/buyer?tab=marketplace", tab: "marketplace", icon: Search },
        { name: "Material Marketplace", href: "/buyer?tab=marketplace", tab: "marketplace", icon: Layers },
        { name: "AI Material Discovery", href: "/buyer?tab=ai-finder", tab: "ai-finder", icon: Sparkles },
        { name: "Recommended Matches", href: "/buyer?tab=ai-finder", tab: "ai-finder", icon: Share2 },
        { name: "Saved Materials", href: "/buyer?tab=saved", tab: "saved", icon: Heart }
      ]
    },
    {
      heading: "PROCUREMENT",
      items: [
        { name: "My Requirements", href: "/buyer?tab=requirements", tab: "requirements", icon: Inbox },
        { name: "Create Requirement", href: "/buyer?tab=create-requirement", tab: "create-requirement", icon: PlusCircle },
        { name: "Buyer Requests", href: "/buyer/requests", icon: Inbox },
        { name: "Negotiations", href: "/buyer?tab=deals", tab: "deals", icon: MessageSquare },
        { name: "My Orders", href: "/buyer?tab=deals", tab: "deals", icon: Package }
      ]
    },
    {
      heading: "LOGISTICS",
      items: [
        { name: "Shipments", href: "/buyer?tab=tracking", tab: "tracking", icon: Truck },
        { name: "Track Shipment", href: "/buyer?tab=tracking", tab: "tracking", icon: Navigation },
        { name: "Material Passport", href: "/buyer?tab=passports", tab: "passports", icon: QrCode }
      ]
    },
    {
      heading: "NETWORK",
      items: [
        { name: "Industrial Network", href: "/buyer?tab=symbiosis", tab: "symbiosis", icon: Share2 }
      ]
    },
    {
      heading: "INSIGHTS",
      items: [
        { name: "Impact", href: "/buyer?tab=impact", tab: "impact", icon: TrendingUp },
        { name: "Procurement Analytics", href: "/buyer?tab=analytics", tab: "analytics", icon: BarChart3 }
      ]
    },
    {
      heading: "SYSTEM",
      items: [
        { name: "Messages", href: "/messages", icon: MessageSquare },
        { name: "Notifications", href: "/buyer?tab=notifications", tab: "notifications", icon: Bell },
        { name: "Company Profile", href: "/settings?tab=profile", icon: Building2 },
        { name: "Settings", href: "/settings", icon: Settings }
      ]
    }
  ];

  // Driver Navigation Sections
  const driverSections: NavSection[] = [
    {
      heading: "MAIN",
      items: [
        { name: "Dashboard", href: "/driver?tab=overview", tab: "overview", icon: LayoutDashboard }
      ]
    },
    {
      heading: "TRIPS",
      items: [
        { name: "My Trips", href: "/driver?tab=trips", tab: "trips", icon: Truck },
        { name: "Active Trip", href: "/driver?tab=active-trip", tab: "active-trip", icon: Navigation },
        { name: "Pickup", href: "/driver?tab=pickup", tab: "pickup", icon: Package },
        { name: "Delivery", href: "/driver?tab=delivery", tab: "delivery", icon: CheckCircle2 }
      ]
    },
    {
      heading: "NAVIGATION",
      items: [
        { name: "Live Tracking", href: "/driver?tab=tracking", tab: "tracking", icon: Navigation },
        { name: "Route / Navigation", href: "/driver?tab=route", tab: "route", icon: Compass }
      ]
    },
    {
      heading: "HISTORY",
      items: [
        { name: "Shipment History", href: "/driver?tab=history", tab: "history", icon: Clock },
        { name: "Delivery Proof", href: "/driver?tab=proofs", tab: "proofs", icon: UploadCloud }
      ]
    },
    {
      heading: "ACCOUNT",
      items: [
        { name: "Earnings", href: "/driver?tab=earnings", tab: "earnings", icon: IndianRupee },
        { name: "Messages", href: "/messages", icon: MessageSquare },
        { name: "Notifications", href: "/driver?tab=notifications", tab: "notifications", icon: Bell },
        { name: "Profile", href: "/settings?tab=profile", icon: UserCheck },
        { name: "Settings", href: "/settings", icon: Settings }
      ]
    }
  ];

  const sections = role === "admin" 
    ? adminSections 
    : role === "buyer" 
    ? buyerSections 
    : role === "driver" 
    ? driverSections 
    : sellerSections;

  const roleTitle = role === 'admin' 
    ? 'Admin Portal' 
    : role === 'buyer' 
    ? 'Buyer Portal' 
    : role === 'driver'
    ? 'Driver Portal'
    : 'Seller Portal';

  const badgeColor = role === 'admin'
    ? 'bg-purple-900/60 text-purple-200 border-purple-700'
    : role === 'buyer'
    ? 'bg-blue-900/60 text-blue-200 border-blue-700'
    : role === 'driver'
    ? 'bg-amber-900/60 text-amber-200 border-amber-700'
    : 'bg-emerald-900/60 text-emerald-200 border-emerald-700';

  // Helper to check if item is active
  const isItemActive = (item: NavItem) => {
    const basePath = item.href.split('?')[0];
    if (item.tab) {
      return pathname === basePath && currentTab === item.tab;
    }
    return pathname === basePath;
  };

  const renderNavContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-green-900/50 flex items-center justify-between">
        <Link href="/" className="font-extrabold text-xl sm:text-2xl tracking-tight flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-green-950 font-black shadow-md shadow-emerald-500/20 shrink-0">
            <Recycle className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-black text-white text-lg tracking-tight">CIRCULON</span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">V2 Enterprise</span>
            </div>
          )}
        </Link>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-green-900/70 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-green-900/70"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-green-950/60 border-b border-green-900/30">
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${badgeColor}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {roleTitle}
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {sections.map((section, idx) => (
          <div key={section.heading + idx} className="space-y-1">
            {!collapsed ? (
              <div className="px-2.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-400/80 mb-1.5">
                {section.heading}
              </div>
            ) : (
              <div className="w-full border-t border-green-900/50 my-2" />
            )}

            {section.items.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name + item.href}
                  href={item.href}
                  title={collapsed ? `${section.heading}: ${item.name}` : undefined}
                >
                  <motion.div
                    whileHover={{ x: collapsed ? 0 : 3 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 relative ${
                      active
                        ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/40"
                        : "text-emerald-100 hover:text-white hover:bg-white/10 font-medium"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-emerald-400"}`} />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {active && !collapsed && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Footer & Sign Out */}
      <div className="p-3 border-t border-green-900/60 bg-green-950/80 shrink-0">
        {!collapsed && userEmail && (
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2.5 truncate">
              <div className="w-8 h-8 rounded-full bg-emerald-700 border border-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {userEmail[0].toUpperCase()}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-semibold text-white truncate">{userEmail}</p>
                <p className="text-[10px] text-emerald-300 capitalize">{role}</p>
              </div>
            </div>
            <NotificationBell />
          </div>
        )}

        <form action={logout}>
          <button
            type="submit"
            title="Sign Out"
            className={`w-full flex items-center justify-center gap-2 text-xs text-rose-300 py-2 rounded-lg transition-colors hover:bg-rose-500/20 font-bold border border-rose-900/40 ${
              collapsed ? "px-2" : "px-3"
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Floating Button */}
      <div className="lg:hidden fixed top-3 left-3 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2.5 rounded-xl bg-green-950 text-emerald-300 border border-green-800 shadow-xl hover:text-white"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-50"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", bounce: 0, duration: 0.25 }}
              className="lg:hidden fixed inset-y-0 left-0 w-72 bg-green-950 text-white z-50 shadow-2xl border-r border-green-900/60"
            >
              {renderNavContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-green-950 text-white h-screen sticky top-0 border-r border-green-900/50 shadow-xl z-30 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {renderNavContent()}
      </aside>
    </>
  );
}
