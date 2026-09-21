"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Recycle, Menu, X, User, ShieldCheck } from "lucide-react";

interface NavbarProps {
  userEmail?: string | null;
  role?: string;
}

export function Navbar({ userEmail, role = 'seller' }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Hide Navbar when logged in (dashboard has its own sidebar) or on the login page
  const isDashboardRoute = pathname.startsWith('/dashboard') || 
                          pathname.startsWith('/buyer') || 
                          pathname.startsWith('/admin') || 
                          pathname.startsWith('/waste') || 
                          pathname.startsWith('/buyers') || 
                          pathname.startsWith('/matches') || 
                          pathname.startsWith('/settings');

  if (userEmail || pathname === '/login' || isDashboardRoute) {
    return null;
  }

  const dashboardHref = role === 'admin' ? '/admin' : role === 'buyer' ? '/buyer' : '/dashboard';
  const dashboardLabel = role === 'admin' ? 'Admin Portal' : role === 'buyer' ? 'Buyer Portal' : 'Seller Dashboard';

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Scrap Calculator", href: "/#calculator" },
    { name: "How It Works", href: "/#how-it-works" },
    { name: "About", href: "/#about" },
    { name: "Contact", href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-green-700 via-green-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-green-600/20 group-hover:scale-105 transition-transform duration-200">
              <Recycle className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-gray-950 font-sans">
                  CIRCULON
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
                  AI
                </span>
              </div>
              <span className="text-[11px] font-medium text-gray-500 tracking-wide">
                Waste-to-Buyer Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-green-700 bg-green-50"
                      : "text-gray-600 hover:text-green-700 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action / Auth Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {userEmail ? (
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  role === 'admin' 
                    ? 'bg-amber-50 text-amber-800 border-amber-200' 
                    : role === 'buyer' 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                    : 'bg-green-50 text-green-800 border-green-200'
                }`}>
                  {role}
                </span>
                <Link
                  href={dashboardHref}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm hover:shadow-md shadow-green-600/20 transition-all duration-200"
                >
                  <User className="w-4 h-4 text-white" />
                  {dashboardLabel}
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm hover:shadow-md shadow-green-600/20 transition-all duration-200"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2.5 rounded-lg text-gray-600 hover:text-green-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white/98 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-base font-semibold text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            {userEmail ? (
              <Link
                href={dashboardHref}
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-base font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm"
              >
                <User className="w-5 h-5" />
                {dashboardLabel}
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center px-4 py-2.5 text-base font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
