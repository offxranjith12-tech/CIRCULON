"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Recycle, 
  Users, 
  Settings, 
  LogOut, 
  Inbox, 
  ShieldCheck, 
  Truck, 
  UserPlus,
  MessageSquare,
  Sparkles,
  Heart
} from "lucide-react";
import { logout } from "@/app/login/actions";

interface SidebarProps {
  role: string;
  userEmail?: string;
}

export function Sidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") || "overview" : "overview";

  const sellerLinks = [
    { name: "Dashboard", href: "/dashboard?tab=overview", tab: "overview", icon: LayoutDashboard },
    { name: "Deals Pipeline", href: "/dashboard?tab=deals", tab: "deals", icon: MessageSquare },
    { name: "Live Fleet Tracking", href: "/dashboard?tab=tracking", tab: "tracking", icon: Truck },
    { name: "My Waste", href: "/waste", icon: Recycle },
    { name: "Add Waste", href: "/waste/add", icon: Recycle },
    { name: "Manage Buyers", href: "/buyers", icon: Users },
    { name: "Available Drivers", href: "/driver", icon: Truck },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const buyerLinks = [
    { name: "Dashboard", href: "/buyer?tab=overview", tab: "overview", icon: LayoutDashboard },
    { name: "Sourcing Requirements", href: "/buyer?tab=requirements", tab: "requirements", icon: Inbox },
    { name: "Marketplace", href: "/buyer?tab=marketplace", tab: "marketplace", icon: Recycle },
    { name: "AI Match Finder", href: "/buyer?tab=ai-finder", tab: "ai-finder", icon: Sparkles },
    { name: "Deals & Pipeline", href: "/buyer?tab=deals", tab: "deals", icon: MessageSquare },
    { name: "Saved Listings", href: "/buyer?tab=saved", tab: "saved", icon: Heart },
    { name: "Live Tracking", href: "/buyer?tab=tracking", tab: "tracking", icon: Truck },
    { name: "Incoming Requests", href: "/buyer/requests", icon: Inbox },
    { name: "Available Drivers", href: "/driver", icon: Truck },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const adminLinks = [
    { name: "Company Verification", href: "/admin?tab=verification", tab: "verification", icon: ShieldCheck },
    { name: "Manage Companies & Drivers", href: "/admin?tab=users", tab: "users", icon: Users },
    { name: "Dispatched Email Audits", href: "/admin?tab=emails", tab: "emails", icon: Inbox },
    { name: "Fleet Logistics Map", href: "/admin?tab=tracking", tab: "tracking", icon: Truck },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const driverLinks = [
    { name: "Driver Dashboard", href: "/driver", icon: LayoutDashboard },
    { name: "My Pickups", href: "/driver/pickups", icon: Inbox },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const links = role === "admin" ? adminLinks : role === "buyer" ? buyerLinks : role === "driver" ? driverLinks : sellerLinks;

  const roleTitle = role === 'admin' 
    ? 'Admin Portal' 
    : role === 'buyer' 
    ? 'Buyer Portal' 
    : role === 'driver'
    ? 'Driver Portal'
    : 'Seller Portal';

  const badgeColor = role === 'admin'
    ? 'bg-purple-100 text-purple-700 border-purple-200'
    : role === 'buyer'
    ? 'bg-blue-100 text-blue-700 border-blue-200'
    : role === 'driver'
    ? 'bg-orange-100 text-orange-700 border-orange-200'
    : 'bg-green-100 text-green-700 border-green-200';

  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-green-950 text-white h-screen sticky top-0 flex flex-col shadow-2xl z-40 border-r border-green-900/50 shrink-0"
    >
      <div className="p-6 border-b border-green-900/40">
        <Link href="/" className="font-extrabold text-2xl tracking-tight flex items-center gap-2">
          <Recycle className="text-green-400" />
          CIRCULON
        </Link>
        <div className={`mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${badgeColor}`}>
          {roleTitle}
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 mt-4 overflow-y-auto">
        {links.map((link) => {
          const itemTab = (link as any).tab;
          const basePath = link.href.split('?')[0];
          const isActive = itemTab
            ? pathname === basePath && currentTab === itemTab
            : pathname === basePath;
          const Icon = link.icon;
          return (
            <Link key={link.name + link.href} href={link.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors hover:bg-white/10 ${
                  isActive ? "bg-green-700 text-white shadow-inner font-bold" : "text-green-100 hover:text-white font-medium"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-green-300" : "text-green-400"}`} />
                <span className="text-sm">{link.name}</span>
              </motion.div>
            </Link>
          );
        })}


      </nav>

      {userEmail && (
        <div className="p-4 border-t border-green-800 bg-green-950/30">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center font-bold">
              {userEmail[0].toUpperCase()}
            </div>
            <div className="text-sm truncate text-green-100 font-medium">
              {userEmail}
            </div>
          </div>
          <form action={logout}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 text-sm text-red-300 py-2 rounded-lg transition-colors hover:bg-red-500/20 font-bold border border-red-900/50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </motion.button>
          </form>
        </div>
      )}
    </motion.div>
  );
}
