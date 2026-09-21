"use client";

import { useEffect, useState } from "react";
import { 
  getIncomingRequests, 
  updateRequestStatus 
} from "@/lib/actions/connections";
import {
  parseDriverInfo, 
  getCleanMessage,
  VERIFIED_FLEET_DRIVERS,
  type DriverInfo 
} from "@/lib/logistics";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Check, 
  X, 
  MapPin, 
  Package, 
  Calendar, 
  Truck, 
  Phone, 
  User, 
  ShieldCheck, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Navigation
} from "lucide-react";

export default function BuyerRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Driver Assignment Modal State
  const [selectedReqForDriver, setSelectedReqForDriver] = useState<any | null>(null);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(0);
  const [driverName, setDriverName] = useState(VERIFIED_FLEET_DRIVERS[0].driver_name);
  const [driverPhone, setDriverPhone] = useState(VERIFIED_FLEET_DRIVERS[0].driver_phone);
  const [vehicleNumber, setVehicleNumber] = useState(VERIFIED_FLEET_DRIVERS[0].vehicle_number);
  const [transporter, setTransporter] = useState(VERIFIED_FLEET_DRIVERS[0].transporter);
  const [pickupDate, setPickupDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0] + " 10:00 AM";
  });
  const [transitNotes, setTransitNotes] = useState("Weighbridge gross & tare slip required at pickup site. Driver carrying verified Gate Pass.");
  const [isSubmittingDriver, setIsSubmittingDriver] = useState(false);

  const fetchRequests = async () => {
    const data = await getIncomingRequests();
    setRequests(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Open modal with pre-filled driver info
  const handleOpenDriverModal = (req: any) => {
    setSelectedReqForDriver(req);
    const existingDriver = parseDriverInfo(req.message);
    if (existingDriver) {
      setDriverName(existingDriver.driver_name);
      setDriverPhone(existingDriver.driver_phone);
      setVehicleNumber(existingDriver.vehicle_number);
      setTransporter(existingDriver.transporter || "Circulon Logistics");
      setPickupDate(existingDriver.pickup_date);
      setTransitNotes(existingDriver.notes || "");
    } else {
      const preset = VERIFIED_FLEET_DRIVERS[0];
      setSelectedPresetIndex(0);
      setDriverName(preset.driver_name);
      setDriverPhone(preset.driver_phone);
      setVehicleNumber(preset.vehicle_number);
      setTransporter(preset.transporter);
    }
  };

  // Switch between presets
  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    if (idx < VERIFIED_FLEET_DRIVERS.length) {
      const p = VERIFIED_FLEET_DRIVERS[idx];
      setDriverName(p.driver_name);
      setDriverPhone(p.driver_phone);
      setVehicleNumber(p.vehicle_number);
      setTransporter(p.transporter);
    } else {
      // Custom entry
      setDriverName("");
      setDriverPhone("");
      setVehicleNumber("");
      setTransporter("");
    }
  };

  // Confirm Acceptance with Driver Dispatch
  const handleConfirmAcceptWithDriver = async () => {
    if (!selectedReqForDriver) return;
    if (!driverName.trim() || !driverPhone.trim() || !vehicleNumber.trim()) {
      alert("Please complete Driver Name, Contact Phone, and Vehicle Number.");
      return;
    }

    setIsSubmittingDriver(true);

    const driverPayload: DriverInfo = {
      driver_name: driverName.trim(),
      driver_phone: driverPhone.trim(),
      vehicle_number: vehicleNumber.trim(),
      pickup_date: pickupDate,
      transporter: transporter.trim() || "Circulon Freight Logistics",
      notes: transitNotes.trim()
    };

    const res = await updateRequestStatus(selectedReqForDriver.id, "accepted", driverPayload);
    setIsSubmittingDriver(false);

    if (res.success) {
      // Update local state
      const cleanMsg = getCleanMessage(selectedReqForDriver.message);
      const updatedMessage = cleanMsg 
        ? `${cleanMsg}\n\n[DRIVER_DISPATCH]:${JSON.stringify(driverPayload)}` 
        : `[DRIVER_DISPATCH]:${JSON.stringify(driverPayload)}`;

      setRequests(prev => prev.map(r => r.id === selectedReqForDriver.id ? { ...r, status: "accepted", message: updatedMessage } : r));
      setSelectedReqForDriver(null);
    } else {
      alert("Failed to assign driver. Please try again.");
    }
  };

  // Direct quick accept without driver
  const handleQuickAccept = async (id: string) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "accepted" } : req));
    await updateRequestStatus(id, "accepted");
    setSelectedReqForDriver(null);
  };

  // Decline
  const handleDecline = async (id: string) => {
    if (confirm("Are you sure you want to decline this material supply offer?")) {
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status: "rejected" } : req));
      await updateRequestStatus(id, "rejected");
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
        <p className="text-sm font-bold text-gray-700">Loading incoming supplier proposals & logistics queue...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="border-b pb-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Incoming Supply Proposals & Logistics</h1>
          <p className="text-gray-500 mt-1 text-sm">Review seller offers, accept supply agreements, and assign circular logistics drivers for factory pickup.</p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5">
          <Truck className="w-4 h-4 text-emerald-700" />
          Driver Logistics Enabled
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-2xl shadow-xs border border-gray-200">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-800">No incoming proposals right now</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            When waste generators and mills find your company in buyer discovery, their commercial supply proposals will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((req, index) => {
            const waste = req.waste_materials;
            const seller = req.seller;
            const driver = parseDriverInfo(req.message);
            const cleanMsg = getCleanMessage(req.message);

            return (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                key={req.id} 
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  req.status === 'pending' 
                    ? 'border-yellow-300 ring-2 ring-yellow-100 shadow-md' 
                    : req.status === 'accepted'
                    ? 'border-emerald-300 ring-1 ring-emerald-100 shadow-xs'
                    : 'border-gray-200 opacity-70'
                }`}
              >
                {/* Status Bar */}
                <div className={`py-1.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-between ${
                  req.status === 'pending'
                    ? 'bg-amber-500 text-white'
                    : req.status === 'accepted'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  <span className="flex items-center gap-1.5">
                    {req.status === 'accepted' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Offer Accepted {driver ? "• Driver Dispatched" : "• Awaiting Logistics"}
                      </>
                    ) : req.status === 'pending' ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Pending Your Acceptance
                      </>
                    ) : (
                      <>
                        <X className="w-3.5 h-3.5" />
                        Offer Declined
                      </>
                    )}
                  </span>
                  <span className="text-[11px] font-normal opacity-90">
                    Received: {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="p-6 flex flex-col lg:flex-row justify-between gap-6">
                  {/* Left Column: Material & Proposal Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Offered Material Listing</span>
                      <h3 className="text-2xl font-black text-gray-950 mt-0.5">
                        {waste?.material_name || "Industrial Secondary Material"}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-600">
                        <span className="flex items-center font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Package className="w-3.5 h-3.5 mr-1 text-emerald-700"/> {waste?.quantity ? Number(waste.quantity).toLocaleString() : 500} KG Available
                        </span>
                        <span className="flex items-center text-gray-700">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400"/> Pickup Location: <strong>{waste?.location || "Factory Gate"}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Proposal Message */}
                    <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-700 border border-gray-200/70 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-700" />
                          Proposal from Supplier: {seller?.company_name || 'Industrial Waste Generator'}
                        </span>
                        {seller?.phone && (
                          <a href={`tel:${seller.phone}`} className="text-emerald-700 hover:underline font-bold flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {seller.phone}
                          </a>
                        )}
                      </div>
                      <p className="italic text-gray-600 pt-1">
                        "{cleanMsg || "We have verified byproduct inventory available and propose supplying to your procurement facility."}"
                      </p>
                    </div>

                    {/* ASSIGNED DRIVER & LOGISTICS CARD (If Accepted) */}
                    {req.status === 'accepted' && driver && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-emerald-50 via-green-50/50 to-white p-4 rounded-2xl border border-emerald-200 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                              <Truck className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="text-xs font-black text-emerald-950 uppercase tracking-wider block">
                                Assigned Circular Logistics Driver
                              </span>
                              <span className="text-[10px] text-emerald-700 font-semibold">
                                {driver.transporter || "GreenFleet Logistics"}
                              </span>
                            </div>
                          </div>

                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <Check className="w-3 h-3 text-emerald-700" />
                            Dispatched for Pickup
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                            <div className="text-[10px] text-gray-400 font-bold uppercase">Driver & Contact</div>
                            <div className="font-bold text-gray-900 mt-0.5">{driver.driver_name}</div>
                            <a href={`tel:${driver.driver_phone}`} className="text-emerald-700 font-bold hover:underline mt-0.5 flex items-center gap-1 text-[11px]">
                              <Phone className="w-3 h-3" /> {driver.driver_phone}
                            </a>
                          </div>

                          <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                            <div className="text-[10px] text-gray-400 font-bold uppercase">Vehicle / Truck No.</div>
                            <div className="font-mono font-bold text-gray-900 mt-0.5">{driver.vehicle_number}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">Heavy Goods Carrier</div>
                          </div>

                          <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                            <div className="text-[10px] text-gray-400 font-bold uppercase">Pickup Schedule</div>
                            <div className="font-bold text-emerald-950 mt-0.5">{driver.pickup_date}</div>
                            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">Gate Pass Verified</div>
                          </div>
                        </div>

                        {driver.notes && (
                          <div className="text-[11px] text-gray-600 bg-white/70 p-2 rounded-lg border border-emerald-100/60">
                            <strong>Transit Instructions:</strong> {driver.notes}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDriverModal(req)}
                            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                          >
                            Edit / Reassign Driver →
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-col justify-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6 min-w-[220px]">
                    {req.status === 'pending' ? (
                      <>
                        {/* Primary Action: Accept & Assign Driver */}
                        <button 
                          type="button"
                          onClick={() => handleOpenDriverModal(req)}
                          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-md shadow-emerald-700/20 cursor-pointer text-xs"
                        >
                          <Truck className="w-4 h-4" />
                          Accept & Assign Driver
                        </button>

                        {/* Quick Accept without Driver */}
                        <button 
                          type="button"
                          onClick={() => handleQuickAccept(req.id)}
                          className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition border border-emerald-200 text-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Quick Accept
                        </button>

                        {/* Decline */}
                        <button 
                          type="button"
                          onClick={() => handleDecline(req.id)}
                          className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition text-xs cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Decline Offer
                        </button>
                      </>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200/80 space-y-2 text-center">
                        {req.status === 'accepted' ? (
                          <>
                            <div className="inline-flex items-center gap-1 text-emerald-700 font-black text-xs uppercase tracking-wider">
                              <CheckCircle2 className="w-4 h-4" />
                              Agreement Active
                            </div>
                            <p className="text-[11px] text-gray-500">
                              Direct supplier coordinate: <br />
                              <strong className="text-gray-800">{seller?.email || 'Registered Supplier'}</strong>
                            </p>
                            {!driver && (
                              <button
                                type="button"
                                onClick={() => handleOpenDriverModal(req)}
                                className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Truck className="w-3.5 h-3.5" />
                                + Assign Driver Now
                              </button>
                            )}
                          </>
                        ) : (
                          <p className="text-red-500 font-bold text-xs">Proposal Declined</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* DRIVER ASSIGNMENT & LOGISTICS DISPATCH MODAL */}
      {/* ------------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedReqForDriver && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Circulon Freight Logistics
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-950 mt-1">
                    Assign Logistics Driver for Material Pickup
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pickup: <strong>{selectedReqForDriver.waste_materials?.material_name}</strong> ({selectedReqForDriver.waste_materials?.quantity || 500} KG) from <strong>{selectedReqForDriver.waste_materials?.location}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReqForDriver(null)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Preset Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  1. Select Verified Circular Driver Preset:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {VERIFIED_FLEET_DRIVERS.map((vDriver, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(idx)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                        selectedPresetIndex === idx
                          ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20"
                          : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-gray-950">{vDriver.driver_name}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">{vDriver.vehicle_number}</div>
                      </div>
                      <div className="text-[9px] text-gray-500 mt-2">
                        {vDriver.rating} • {vDriver.vehicle_type}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Driver Form Fields */}
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Driver Full Name *
                    </label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Driver Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="+91 98410 22334"
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Truck / Vehicle Reg. No. *
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      placeholder="e.g. TN 38 BX 4421"
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                      Scheduled Pickup Date & Slot *
                    </label>
                    <input
                      type="text"
                      value={pickupDate}
                      onChange={(e) => setPickupDate(e.target.value)}
                      placeholder="e.g. 2026-09-12 10:00 AM"
                      className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Special Transit / Weighbridge Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={transitNotes}
                    onChange={(e) => setTransitNotes(e.target.value)}
                    placeholder="e.g. Weighbridge slip required at pickup site..."
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  type="button"
                  onClick={handleConfirmAcceptWithDriver}
                  disabled={isSubmittingDriver}
                  className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-emerald-700/20 cursor-pointer disabled:opacity-70"
                >
                  {isSubmittingDriver ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Dispatching Logistics...
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4" />
                      Confirm Acceptance & Dispatch Driver
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickAccept(selectedReqForDriver.id)}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Accept without Driver
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
