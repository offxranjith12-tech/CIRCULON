import Link from "next/link";
import { Recycle, Sparkles, Target, ArrowRight, CheckCircle2, Factory, TrendingUp } from "lucide-react";

export const metadata = {
  title: "About Us | CIRCULON AI Intelligence",
  description: "Learn about CIRCULON's mission to bridge industrial waste with high-value secondary commercial manufacturing.",
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-green-700 font-bold text-xs uppercase tracking-widest bg-green-100 px-3 py-1 rounded-md border border-green-200">
          About CIRCULON
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
          Pioneering Circular Economy Through AI Intelligence
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Connecting industrial facilities and recyclers to divert waste into profitable manufacturing feedstocks.
        </p>
      </div>

      {/* Vision & Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            Every day, millions of tons of industrial scraps—from cotton yarn waste to polymer offcuts—are sent to landfills or downcycled into low-value products simply because suppliers lack real-time market discovery.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Our mission is to eliminate material waste by pairing deep AI material diagnostics with automated B2B matching and route logistics economics.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 text-green-700 flex items-center justify-center font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Powered by Google Gemini</h2>
          <p className="text-gray-600 leading-relaxed">
            We use Google Gemini 2.5 Flash to automatically interpret industrial materials, identify standard international classifications, and discover cross-industry compatibility in milliseconds.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Combined with our proprietary freight and margin calculation algorithms, sellers see transparent opportunity scores and net value estimates upfront.
          </p>
        </div>
      </div>

      {/* 3 Core Pillars */}
      <div className="bg-green-900 text-white rounded-3xl p-8 sm:p-12 space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-extrabold">Why CIRCULON Wins</h3>
          <p className="text-green-200 mt-2">The competitive advantage of AI-driven material commerce</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <div className="text-green-300 font-bold text-lg mb-2">1. Rapid Submissions</div>
            <p className="text-sm text-green-100">
              List scrap specifications in under a minute with photo uploads and automatic material categorization.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <div className="text-green-300 font-bold text-lg mb-2">2. Route Economics</div>
            <p className="text-sm text-green-100">
              Intelligent freight estimation (₹35/km) prevents unviable logistics from killing transaction profitability.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
            <div className="text-green-300 font-bold text-lg mb-2">3. Direct B2B Reach</div>
            <p className="text-sm text-green-100">
              Cut out commission-heavy middlemen with verified buyer profiles, instant messaging, and proposal generation.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          href="/waste/add"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold text-base shadow-lg transition"
        >
          List Your Waste Now
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
