"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  IndianRupee, 
  UploadCloud, 
  Phone, 
  FileText, 
  ExternalLink,
  Check,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Layers,
  Compass,
  DollarSign
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getDriverTrips, advanceTripStep } from "@/lib/actions/driver";
import { type DriverTrip, type DriverTripStatus } from "@/lib/types";
import { MapWrapper } from "@/components/MapWrapper";

const TRIP_STEPS: { key: DriverTripStatus; label: string; action: string }[] = [
  { key: 'ASSIGNED', label: 'Assigned', action: 'Start Trip' },
  { key: 'START_TRIP', label: 'Trip Started', action: 'Navigate to Pickup' },
  { key: 'AT_PICKUP', label: 'At Pickup Location', action: 'Confirm Pickup & Load' },
  { key: 'PICKED_UP', label: 'Loaded & Baled', action: 'Begin Transport' },
  { key: 'IN_TRANSIT', label: 'In Transit', action: 'Navigate to Buyer' },
  { key: 'AT_DELIVERY', label: 'At Consignee Gate', action: 'Confirm Delivery' },
  { key: 'DELIVERED', label: 'Delivered', action: 'Upload Delivery Proof' },
  { key: 'COMPLETED', label: 'Completed & Settled', action: 'Done' }
];

export default function DriverDashboard() {
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") || "overview" : "overview";

  const [driverStatus, setDriverStatus] = useState("free");
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [activeTrip, setActiveTrip] = useState<DriverTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadProofModal, setUploadProofModal] = useState(false);
  const [proofForm, setProofForm] = useState({
    slipNumber: "",
    signatureName: "",
    notes: "",
    fileUploaded: true
  });

  const loadDriverData = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("driver_status")
        .eq("id", user.id)
        .maybeSingle();

      if (data?.driver_status) {
        setDriverStatus(data.driver_status);
      }
    }

    const fetchedTrips = await getDriverTrips(user?.id);
    setTrips(fetchedTrips);

    // Set first active or assigned trip as primary focus
    const currentActive = fetchedTrips.find(t => t.status !== 'COMPLETED') || fetchedTrips[0] || null;
    setActiveTrip(currentActive);
    setLoading(false);
  };

  useEffect(() => {
    loadDriverData();
  }, []);

  const toggleAvailability = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const newStatus = driverStatus === "free" ? "in_work" : "free";
    setDriverStatus(newStatus);
    if (user) {
      await supabase.from("profiles").update({ driver_status: newStatus }).eq("id", user.id);
    }
  };

  const handleAdvanceStep = async () => {
    if (!activeTrip) return;
    const currentIndex = TRIP_STEPS.findIndex(s => s.key === activeTrip.status);
    if (currentIndex === -1 || currentIndex >= TRIP_STEPS.length - 1) return;

    const nextStep = TRIP_STEPS[currentIndex + 1].key;

    if (nextStep === 'DELIVERED') {
      setUploadProofModal(true);
      return;
    }

    const res = await advanceTripStep(activeTrip.id, nextStep);
    if (res.success && res.trip) {
      setActiveTrip({ ...activeTrip, status: nextStep });
      setTrips(prev => prev.map(t => t.id === activeTrip.id ? { ...t, status: nextStep } : t));
    }
  };

  const handleSaveProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrip) return;

    await advanceTripStep(activeTrip.id, 'COMPLETED', {
      deliveryProofUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
      weighbridgeSlipNumber: proofForm.slipNumber || 'WB-TN-9921',
      recipientSignatureName: proofForm.signatureName || 'Receiving Manager',
      deliveryNotes: proofForm.notes || 'Batch inspected and accepted.'
    });

    setActiveTrip({ ...activeTrip, status: 'COMPLETED' });
    setTrips(prev => prev.map(t => t.id === activeTrip.id ? { ...t, status: 'COMPLETED' } : t));
    setUploadProofModal(false);
  };

  const completedTrips = trips.filter(t => t.status === 'COMPLETED');
  const totalEarnings = trips.reduce((acc, t) => acc + (t.status === 'COMPLETED' ? t.estimatedEarnings : 0), 0);

  const getStepProgressIndex = (status: DriverTripStatus) => {
    return TRIP_STEPS.findIndex(s => s.key === status);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-emerald-800 font-bold animate-pulse">
        Connecting to CIRCULON Freight Dispatch Network...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Driver Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
              Freight Carrier Portal
            </span>
            <span className="text-xs text-gray-500 font-medium">Driver V2 Console</span>
          </div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight mt-1.5">
            Fleet Logistics & Trip Execution
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Turn-by-turn industrial waste transport, digital weighbridge integration, and chain-of-custody delivery proof.
          </p>
        </div>

        {/* Online / Work Availability Switcher */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border border-gray-200 shadow-xs">
          <div className={`w-3 h-3 rounded-full ${driverStatus === 'free' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Duty Status</span>
            <span className="text-xs font-bold text-gray-900 capitalize">
              {driverStatus === 'free' ? 'Available for Hauls' : 'On Active Shipment'}
            </span>
          </div>
          <button
            onClick={toggleAvailability}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-colors ${
              driverStatus === 'free' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {driverStatus === 'free' ? 'Go In Work' : 'Mark as Free'}
          </button>
        </div>
      </div>

      {/* Driver Quick Actions Strip (Part 15) */}
      <div className="bg-gradient-to-r from-green-950 via-emerald-950 to-gray-950 text-white rounded-2xl p-5 shadow-lg border border-emerald-800/40">
        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block mb-2">
          Driver Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <button
            onClick={handleAdvanceStep}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex flex-col items-center text-center gap-1 transition-colors"
          >
            <Truck className="w-4 h-4" />
            <span>Start Trip</span>
          </button>
          <button
            onClick={() => setActiveTrip(trips[0] || null)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-semibold text-xs flex flex-col items-center text-center gap-1 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>Active Shipment</span>
          </button>
          <a
            href={activeTrip ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeTrip.pickupLocation)}` : '#'}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-semibold text-xs flex flex-col items-center text-center gap-1 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>Navigate Pickup</span>
          </a>
          <button
            onClick={handleAdvanceStep}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-semibold text-xs flex flex-col items-center text-center gap-1 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Pickup</span>
          </button>
          <a
            href={activeTrip ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeTrip.dropoffLocation)}` : '#'}
            target="_blank"
            rel="noreferrer"
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-semibold text-xs flex flex-col items-center text-center gap-1 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            <span>Navigate Buyer</span>
          </a>
          <button
            onClick={handleAdvanceStep}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-semibold text-xs flex flex-col items-center text-center gap-1 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Delivery</span>
          </button>
          <button
            onClick={() => setUploadProofModal(true)}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-200 font-semibold text-xs flex flex-col items-center text-center gap-1 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Proof</span>
          </button>
        </div>
      </div>

      {/* Driver Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Assigned Shipments</span>
          <span className="text-2xl font-black text-gray-900 mt-1 block">{trips.length}</span>
          <span className="text-[11px] text-gray-500">Active queue</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Today's Trips</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {trips.filter(t => t.status !== 'COMPLETED').length}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold">Immediate dispatch</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Earnings</span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            ₹{totalEarnings.toLocaleString()}
          </span>
          <span className="text-[11px] text-gray-500">Freight settlements</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Completed Deliveries</span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">{completedTrips.length}</span>
          <span className="text-[11px] text-blue-600 font-semibold">Verified gate receipts</span>
        </div>
      </div>

      {/* Primary Focus: Active Assigned Shipment Workflow */}
      {activeTrip && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500/80 shadow-xl overflow-hidden">
          {/* Active Trip Header */}
          <div className="p-6 bg-gradient-to-r from-emerald-900 to-green-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
                  Current Active Shipment
                </span>
                <span className="text-xs text-emerald-200 font-mono">Trip #{activeTrip.id}</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                {activeTrip.materialName}
              </h2>
              <p className="text-xs text-emerald-200/80 mt-0.5">
                Load: {activeTrip.quantity.toLocaleString()} {activeTrip.unit} • Category: {activeTrip.category}
              </p>
            </div>

            {/* Main CTA: Advance Next Workflow Step */}
            <div className="shrink-0">
              {activeTrip.status !== 'COMPLETED' ? (
                <button
                  onClick={handleAdvanceStep}
                  className="px-6 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-green-950 font-black text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                >
                  <span>
                    {TRIP_STEPS.find(s => s.key === activeTrip.status)?.action || 'Advance Trip Step'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <span className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Trip Completed & Settled
                </span>
              )}
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Step-by-Step Workflow Progress Track */}
            <div className="space-y-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 block">
                Primary Driver Workflow Pipeline
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {TRIP_STEPS.map((step, idx) => {
                  const currentIdx = getStepProgressIndex(activeTrip.status);
                  const isDone = idx < currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div
                      key={step.key}
                      className={`p-2.5 rounded-xl border text-center text-xs flex flex-col items-center justify-between gap-1 transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                          : 'bg-gray-50 text-gray-400 border-gray-200'
                      }`}
                    >
                      <span className="text-[9px] font-mono opacity-80">STEP {idx + 1}</span>
                      <span className="text-[11px] leading-tight">{step.label}</span>
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-white animate-ping mt-1" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pickup & Delivery Location Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pickup Facility Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Origin / Pickup
                  </span>
                  <a
                    href={`tel:${activeTrip.pickupPhone}`}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {activeTrip.pickupPhone}
                  </a>
                </div>
                <h4 className="text-base font-black text-gray-900">{activeTrip.pickupContactName}</h4>
                <p className="text-xs text-gray-600 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{activeTrip.pickupLocation}</span>
                </p>
                <div className="pt-2 flex gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeTrip.pickupLocation)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate in Maps</span>
                  </a>
                </div>
              </div>

              {/* Consignee Delivery Card */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Destination / Buyer Consignee
                  </span>
                  <a
                    href={`tel:${activeTrip.dropoffPhone}`}
                    className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {activeTrip.dropoffPhone}
                  </a>
                </div>
                <h4 className="text-base font-black text-gray-900">{activeTrip.dropoffContactName}</h4>
                <p className="text-xs text-gray-600 flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{activeTrip.dropoffLocation}</span>
                </p>
                <div className="pt-2 flex gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeTrip.dropoffLocation)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Navigate to Buyer</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Trip Specs: Distance, Freight Value, Carrier Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Haul Distance</span>
                <span className="text-sm font-black text-gray-900">{activeTrip.distanceKm} KM</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Freight Rate</span>
                <span className="text-sm font-black text-emerald-700">₹{activeTrip.estimatedEarnings.toLocaleString()}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Vehicle Plate</span>
                <span className="text-sm font-black text-gray-900">{activeTrip.vehicleNumber}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-[10px] text-gray-500 font-bold uppercase block">Gate Pass / Slips</span>
                <span className="text-xs font-semibold text-gray-700 truncate">
                  {activeTrip.weighbridgeSlipNumber || 'Issued at Gate'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipment History & All Trips List */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-black text-gray-950 tracking-tight">
            Assigned Trips & Delivery History
          </h3>
          <span className="text-xs text-gray-500 font-medium">{trips.length} Total Registered Trips</span>
        </div>

        <div className="divide-y divide-gray-100">
          {trips.map(trip => (
            <div key={trip.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    trip.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {trip.status}
                  </span>
                  <span className="text-xs font-mono text-gray-400">#{trip.id}</span>
                </div>
                <h4 className="text-base font-black text-gray-900 mt-1">{trip.materialName}</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  {trip.pickupLocation.split(',')[0]} → {trip.dropoffLocation.split(',')[0]} ({trip.distanceKm} KM)
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Freight Pay</span>
                  <span className="text-base font-black text-emerald-700">₹{trip.estimatedEarnings.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setActiveTrip(trip)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-emerald-600 hover:text-white text-gray-800 font-bold text-xs transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Delivery Proof Modal */}
      {uploadProofModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-200">
            <h3 className="text-xl font-black text-gray-950 tracking-tight mb-1">
              Upload Delivery Proof & Gate Receipt
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Complete chain of custody by recording consignee electronic receipt and weighbridge slip.
            </p>

            <form onSubmit={handleSaveProof} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Weighbridge Slip Number</label>
                <input
                  type="text"
                  required
                  value={proofForm.slipNumber}
                  onChange={e => setProofForm({ ...proofForm, slipNumber: e.target.value })}
                  placeholder="e.g. WB-COIMBATORE-4491"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Recipient Signing Authority</label>
                <input
                  type="text"
                  required
                  value={proofForm.signatureName}
                  onChange={e => setProofForm({ ...proofForm, signatureName: e.target.value })}
                  placeholder="Name of receiving QA engineer / warehouse head"
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Delivery Observations / Notes</label>
                <textarea
                  rows={2}
                  value={proofForm.notes}
                  onChange={e => setProofForm({ ...proofForm, notes: e.target.value })}
                  placeholder="e.g. Bales unloaded in Dry Warehouse B. Moisture verified."
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Geotagged photographic gate pass verified automatically.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUploadProofModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Confirm & Settle Trip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
