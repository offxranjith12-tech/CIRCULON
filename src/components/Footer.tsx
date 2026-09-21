import Link from "next/link";
import { Recycle, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-600 to-emerald-400 flex items-center justify-center text-white shadow-md">
                <Recycle className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-white tracking-tight">CIRCULON</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-900/60 text-green-400 border border-green-700/50">
                  AI
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Empowering circular economy ecosystems by connecting industrial waste streams directly with verified commercial buyers using Google Gemini AI.
            </p>
            <div className="text-xs text-gray-500">
              © {new Date().getFullYear()} CIRCULON Inc. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-green-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/#about" className="hover:text-green-400 transition-colors">
                  About Platform
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-green-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-green-400 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-green-400 transition-colors">
                  Portal Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform Capabilities */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/waste/add" className="hover:text-green-400 transition-colors flex items-center gap-1">
                  List Industrial Waste <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-green-400 transition-colors flex items-center gap-1">
                  Market Analytics <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <Link href="/buyers" className="hover:text-green-400 transition-colors flex items-center gap-1">
                  Verified Buyer CRM <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
              <li>
                <span className="text-gray-500">Logistics & Route Cost Engine</span>
              </li>
              <li>
                <span className="text-gray-500">Automated B2B Outreach</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <span>Industrial Corridor, Chennai & Coimbatore, Tamil Nadu, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-green-400 shrink-0" />
                <a href="mailto:support@circulon.ai" className="hover:text-green-400 transition-colors">
                  support@circulon.ai
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-green-400 shrink-0" />
                <a href="tel:+914428367890" className="hover:text-green-400 transition-colors">
                  +91 (0) 44 2836 7890
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
