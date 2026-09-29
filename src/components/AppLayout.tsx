"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { AIChatbot } from "@/components/AIChatbot";
import { Loader2 } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  user: any;
  role: string;
}

export function AppLayout({ children, user, role }: AppLayoutProps) {
  const pathname = usePathname();
  const [isRedirectingToHome, setIsRedirectingToHome] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If user is authenticated, maintain active session and never redirect away from dashboard
    if (user) {
      sessionStorage.setItem("circulon_session_active", "true");
      localStorage.removeItem("circulon_site_closed");
      setIsRedirectingToHome(false);
      return;
    }

    // Detect if this page was loaded via a browser reload (F5 / Cmd+R)
    let isPageReload = false;
    try {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries.length > 0) {
        isPageReload = (navEntries[0] as PerformanceNavigationTiming).type === "reload";
      } else if ((performance as any).navigation) {
        isPageReload = (performance as any).navigation.type === 1;
      }
    } catch {
      isPageReload = false;
    }

    const sessionActive = sessionStorage.getItem("circulon_session_active") === "true";
    const siteClosed = localStorage.getItem("circulon_site_closed") === "true";
    const closedAt = Number(localStorage.getItem("circulon_closed_at") || "0");
    const timeSinceClose = Date.now() - closedAt;

    // 1. If currently on Home page ('/'), establish and renew the active session
    if (pathname === "/") {
      sessionStorage.setItem("circulon_session_active", "true");
      localStorage.removeItem("circulon_site_closed");
      setIsRedirectingToHome(false);
    } else if (pathname !== "/login") {
      // 2. If NOT on Home and NOT on Login:
      // Check if the site was closed previously (tab/browser closed, or fresh new tab opened directly to a leaving page)
      // We do NOT redirect on a simple F5 refresh within an active session
      const isFreshOpenAfterClose = !sessionActive || (siteClosed && !isPageReload && timeSinceClose > 500);

      if (isFreshOpenAfterClose) {
        // The website was closed and reopened directly on an internal leaving page
        // Force redirect to Home ('/') immediately so the user starts at Home
        setIsRedirectingToHome(true);
        sessionStorage.setItem("circulon_session_active", "true");
        localStorage.removeItem("circulon_site_closed");
        window.location.replace("/");
        return;
      }
    }

    // 3. Set up listeners to detect when the website/tab is closed
    const handleBeforeUnload = () => {
      localStorage.setItem("circulon_site_closed", "true");
      localStorage.setItem("circulon_closed_at", Date.now().toString());
    };

    const handlePageHide = () => {
      localStorage.setItem("circulon_site_closed", "true");
      localStorage.setItem("circulon_closed_at", Date.now().toString());
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [pathname, user]);

  const isDashboardRoute = 
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/buyer") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/driver") ||
    pathname.startsWith("/waste") ||
    pathname.startsWith("/buyers") ||
    pathname.startsWith("/matches") ||
    pathname.startsWith("/messages") ||
    pathname.startsWith("/passport") ||
    pathname.startsWith("/settings");

  // If redirecting to home because website was closed, show clean loading indicator
  if (isRedirectingToHome) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          <p className="text-sm font-medium">Opening CIRCULON Home...</p>
        </div>
      </div>
    );
  }

  // 1. Authenticated Dashboard Routes (Admin, Seller Dashboard, Buyer Portal, Driver, Waste, etc.)
  if (isDashboardRoute && user) {
    return (
      <div className="flex flex-1 w-full min-h-screen">
        <Suspense fallback={<div className="w-64 bg-green-950 h-screen shrink-0" />}>
          <Sidebar role={role} userEmail={user?.email} />
        </Suspense>
        <div className="flex-1 overflow-y-auto w-full bg-gray-50">
          <main className="max-w-7xl mx-auto p-4 pt-16 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
        <AIChatbot />
      </div>
    );
  }

  // 2. Authentication Route (/login)
  if (pathname === "/login") {
    return (
      <div className="flex-1 flex flex-col w-full min-h-screen bg-gray-50">
        <main className="flex-1 w-full flex items-center justify-center">
          {children}
        </main>
        <AIChatbot />
      </div>
    );
  }

  // 3. Public Marketing & Informational Pages (/, /about, /contact, etc.)
  // Always display Top Navbar + Full Page Content + Footer
  return (
    <div className="flex-1 flex flex-col w-full min-h-screen bg-gray-50">
      <Navbar userEmail={user?.email} role={role} />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
      <AIChatbot />
    </div>
  );
}
