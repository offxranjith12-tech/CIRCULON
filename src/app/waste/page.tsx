"use client";

import { useState, useEffect } from "react";
import { getWasteMaterials, deleteWasteMaterial, updateWasteStatus, type WasteMaterial } from "@/lib/actions/waste";
import { 
  Trash2, 
  Image as ImageIcon, 
  Sparkles, 
  MapPin, 
  Scale, 
  Edit3, 
  Eye, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Check, 
  X, 
  IndianRupee, 
  Droplets,
  Tag,
  ArrowUpRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import { SuitableBuyersModal } from "@/components/SuitableBuyersModal";
import { motion, AnimatePresence } from "framer-motion";

export default function ManageWastePage() {
  const [wastes, setWastes] = useState<WasteMaterial[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedWasteForMatch, setSelectedWasteForMatch] = useState<WasteMaterial | null>(null);
  const [viewingListing, setViewingListing] = useState<WasteMaterial | null>(null);
  const [editingListing, setEditingListing] = useState<WasteMaterial | null>(null);
  const [editForm, setEditForm] = useState({
    material_name: "",
    quantity: 1000,
    expected_price: 35,
    condition: "",
    status: "active" as any
  });

  const fetchWastes = async () => {
    const data = await getWasteMaterials();
    setWastes(data);
  };

  useEffect(() => {
    fetchWastes();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      await deleteWasteMaterial(id);
      fetchWastes();
    }
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    await updateWasteStatus(id, newStatus);
    fetchWastes();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;
    await updateWasteStatus(editingListing.id, editForm.status);
    setWastes(prev => prev.map(w => w.id === editingListing.id ? { ...w, ...editForm } : w));
    setEditingListing(null);
  };

  const filteredWastes = wastes.filter(w => {
    if (filterStatus === "all") return true;
    return w.status === filterStatus;
  });

  const statusCounts = {
    all: wastes.length,
    active: wastes.filter(w => w.status === 'active').length,
    pending: wastes.filter(w => w.status === 'pending').length,
    matched: wastes.filter(w => w.status === 'matched').length,
    sold: wastes.filter(w => w.status === 'sold' || w.status === 'completed').length,
    rejected: wastes.filter(w => w.status === 'rejected').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100 text-green-800 border border-green-200">
              Inventory Management
            </span>
            <span className="text-xs text-gray-500 font-medium">Waste Generator Portal</span>
          </div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight mt-1.5">My Waste Listings</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Track material batches, run AI re-analyses, inspect compatibility scores, and manage buyer outreach.
          </p>
        </div>
        <Link 
          href="/waste/add"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white font-bold rounded-xl shadow-xs transition text-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Waste Listing
        </Link>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-100">
        {[
          { key: "all", label: "All Listings", count: statusCounts.all },
          { key: "active", label: "Active", count: statusCounts.active },
          { key: "pending", label: "Pending", count: statusCounts.pending },
          { key: "matched", label: "Matched", count: statusCounts.matched },
          { key: "sold", label: "Sold / Completed", count: statusCounts.sold },
          { key: "rejected", label: "Rejected", count: statusCounts.rejected },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
              filterStatus === tab.key
                ? "bg-green-800 text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${filterStatus === tab.key ? "bg-green-950 text-white" : "bg-gray-200 text-gray-700"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWastes.map(waste => {
          const isSold = waste.status === 'sold' || waste.status === 'completed';
          const isPending = waste.status === 'pending';

          return (
            <motion.div 
              key={waste.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden relative"
            >
              <div>
                {/* Image or Banner */}
                {waste.image_url ? (
                  <div className="h-44 bg-gray-100 relative overflow-hidden group">
                    <img src={waste.image_url} alt={waste.material_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm ${
                        waste.status === 'active' ? 'bg-emerald-600 text-white' :
                        waste.status === 'matched' ? 'bg-blue-600 text-white' :
                        isSold ? 'bg-gray-900 text-white' :
                        isPending ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {waste.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-44 bg-emerald-50/70 flex flex-col items-center justify-center text-emerald-600 relative">
                    <ImageIcon className="w-10 h-10 mb-1 opacity-70" />
                    <span className="text-xs font-bold">{waste.category || "Industrial Scrap"}</span>
                    <div className="absolute top-3 left-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        waste.status === 'active' ? 'bg-emerald-600 text-white' :
                        waste.status === 'matched' ? 'bg-blue-600 text-white' :
                        isSold ? 'bg-gray-900 text-white' :
                        isPending ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {waste.status}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Content */}
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-base text-gray-950 line-clamp-1">{waste.material_name}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingListing(waste);
                          setEditForm({
                            material_name: waste.material_name,
                            quantity: waste.quantity,
                            expected_price: waste.expected_price || 30,
                            condition: waste.condition || "",
                            status: waste.status || "active"
                          });
                        }}
                        className="text-gray-400 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        title="Edit listing"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(waste.id)} 
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <Scale className="w-3.5 h-3.5" /> Quantity:
                      </span>
                      <strong className="text-gray-900">{waste.quantity.toLocaleString()} {waste.unit || "KG"}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <IndianRupee className="w-3.5 h-3.5" /> Target Price:
                      </span>
                      <strong className="text-emerald-700">₹{waste.expected_price || 35} / {waste.unit || "KG"}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <MapPin className="w-3.5 h-3.5" /> Location:
                      </span>
                      <span className="text-gray-800 font-medium truncate max-w-[140px]">{waste.location}</span>
                    </div>

                    {waste.moisture_percentage !== undefined && (
                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-gray-100">
                        <span>Moisture: <strong>{waste.moisture_percentage}%</strong></span>
                        <span>Contamination: <strong>{waste.contamination_level || "Low"}</strong></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Card Footer Actions */}
              <div className="p-5 pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    onClick={() => setSelectedWasteForMatch(waste)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Find Buyers
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewingListing(waste)}
                    className="px-3 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
                    title="View technical details"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-400 px-1 pt-1">
                  <Link 
                    href={`/matches?materialType=${encodeURIComponent(waste.material_name)}&quantity=${waste.quantity}&wasteId=${waste.id}`}
                    className="text-emerald-700 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    Match Breakdown ↗
                  </Link>

                  <select
                    value={waste.status}
                    onChange={(e) => handleStatusChange(waste.id, e.target.value)}
                    className="text-[11px] bg-transparent border-0 text-gray-500 hover:text-gray-800 font-medium cursor-pointer outline-none"
                  >
                    <option value="active">Active</option>
                    <option value="matched">Matched</option>
                    <option value="sold">Sold</option>
                    <option value="completed">Completed</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredWastes.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white border border-dashed border-gray-300 rounded-3xl">
             <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
               <Sparkles className="w-6 h-6" />
             </div>
             <p className="text-gray-800 font-bold mb-1">No listings found for this filter</p>
             <p className="text-xs text-gray-500 mb-4 max-w-sm mx-auto">
               Switch status tabs or list a new byproduct batch to connect with circular buyers.
             </p>
             <Link 
               href="/waste/add" 
               className="inline-flex items-center px-4 py-2 bg-green-700 hover:bg-green-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
             >
               List Waste Batch Now
             </Link>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* FULL LISTING DETAILS MODAL */}
      {/* ------------------------------------------------------------------- */}
      {viewingListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5"
          >
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {viewingListing.category || "General Waste"}
                </span>
                <h3 className="text-xl font-bold text-gray-950 mt-1">{viewingListing.material_name}</h3>
                <p className="text-xs text-gray-500">Status: <strong className="text-emerald-700 uppercase">{viewingListing.status}</strong></p>
              </div>
              <button
                onClick={() => setViewingListing(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase text-[10px]">Available Quantity</div>
                  <div className="text-base font-black text-gray-900 mt-0.5">{viewingListing.quantity.toLocaleString()} {viewingListing.unit || "KG"}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase text-[10px]">Expected Price</div>
                  <div className="text-base font-black text-emerald-800 mt-0.5">₹{viewingListing.expected_price || 30} / {viewingListing.unit || "KG"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase text-[10px]">Moisture Level</div>
                  <div className="font-bold text-gray-800 mt-0.5">{viewingListing.moisture_percentage || 6}%</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-400 font-bold uppercase text-[10px]">Contamination Level</div>
                  <div className="font-bold text-gray-800 mt-0.5">{viewingListing.contamination_level || "Low"}</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <div className="text-gray-400 font-bold uppercase text-[10px]">Pickup Location</div>
                <div className="font-bold text-gray-900">{viewingListing.location}</div>
                <div className="text-gray-500">Condition: {viewingListing.condition || "Dry and sorted"}</div>
              </div>

              {viewingListing.description && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-gray-700">
                  <div className="font-bold text-emerald-950 uppercase text-[10px] mb-0.5">Description</div>
                  <p className="leading-relaxed">{viewingListing.description}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  const target = viewingListing;
                  setViewingListing(null);
                  setSelectedWasteForMatch(target);
                }}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Find Compatible Buyers
              </button>
              <button
                onClick={() => setViewingListing(null)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* QUICK EDIT MODAL */}
      {/* ------------------------------------------------------------------- */}
      {editingListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-base text-gray-950">Edit Listing Specifications</h3>
              <button onClick={() => setEditingListing(null)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">Material Name</label>
                <input
                  type="text"
                  value={editForm.material_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, material_name: e.target.value }))}
                  className="w-full p-2.5 border rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">Quantity</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">Expected Price (₹)</label>
                  <input
                    type="number"
                    value={editForm.expected_price}
                    onChange={(e) => setEditForm(prev => ({ ...prev, expected_price: Number(e.target.value) }))}
                    className="w-full p-2.5 border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">Condition</label>
                <input
                  type="text"
                  value={editForm.condition}
                  onChange={(e) => setEditForm(prev => ({ ...prev, condition: e.target.value }))}
                  className="w-full p-2.5 border rounded-xl"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold uppercase text-[10px] mb-1">Listing Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full p-2.5 border rounded-xl bg-white"
                >
                  <option value="active">Active</option>
                  <option value="matched">Matched</option>
                  <option value="sold">Sold</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-green-700 hover:bg-green-800 text-white shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* In-place Suitable Buyers Modal */}
      {selectedWasteForMatch && (
        <SuitableBuyersModal
          isOpen={!!selectedWasteForMatch}
          onClose={() => setSelectedWasteForMatch(null)}
          materialName={selectedWasteForMatch.material_name}
          quantity={selectedWasteForMatch.quantity}
          wasteId={selectedWasteForMatch.id}
        />
      )}
    </div>
  );
}
