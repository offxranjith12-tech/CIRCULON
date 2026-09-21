"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, CheckCircle2, Send, Clock, ShieldCheck } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-green-700 font-bold text-xs uppercase tracking-widest bg-green-100 px-3 py-1 rounded-md border border-green-200">
          Contact Us
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-950 tracking-tight">
          Let's Talk Circular Solutions
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Connect with our industrial recycling specialists, request buyer network onboarding, or inquire about enterprise waste management.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Contact Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-gray-950">Direct Contact</h3>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">Email Support</div>
                <a href="mailto:support@circulon.ai" className="text-sm font-semibold text-green-700 hover:underline">
                  support@circulon.ai
                </a>
                <p className="text-xs text-gray-500 mt-0.5">Response within 24 hours</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">Customer Support Line</div>
                <a href="tel:+914428367890" className="text-sm font-semibold text-green-700 hover:underline">
                  +91 (0) 44 2836 7890
                </a>
                <p className="text-xs text-gray-500 mt-0.5">Mon - Sat: 9:00 AM - 6:30 PM IST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">Headquarters</div>
                <p className="text-sm text-gray-700 font-medium">
                  Industrial Corridor Technology Park, Chennai & Coimbatore, Tamil Nadu, India
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <ShieldCheck className="w-6 h-6 text-green-700" />
              <h4 className="font-bold text-green-900">Verified Buyer Guarantee</h4>
            </div>
            <p className="text-sm text-green-800 leading-relaxed">
              Are you an industrial buyer or manufacturer seeking scrap inputs? Contact us to become a verified buyer and receive direct material matches.
            </p>
          </div>
        </div>

        {/* Right Side: Interactive Inquiry Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Message Received!</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Thank you for contacting CIRCULON. Our team will review your inquiry and follow up shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", phone: "", company: "", message: "" });
                }}
                className="mt-4 px-6 py-2.5 bg-green-600 text-white font-semibold text-sm rounded-lg hover:bg-green-700 transition"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Send an Inquiry</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ramesh@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tirupur Spinners Ltd"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Your Message or Inquiry *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your material requirements, listing volume, or question..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm hover:shadow-md transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit Inquiry
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
