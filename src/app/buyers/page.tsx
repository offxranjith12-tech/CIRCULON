"use client";

import { useState, useEffect } from "react";
import { Trash2, PlusCircle, Factory, MapPin } from "lucide-react";
import { getBuyers, addBuyer, deleteBuyer } from "@/lib/actions/buyers";

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    distanceKm: "50",
    offeredPrice: "30",
    demandLevel: "Medium",
    processingRequired: "Low",
    materialsRequired: "Textile, Plastic",
    minQuantity: "100",
    maxQuantity: "1000",
  });

  const fetchBuyers = async () => {
    const data = await getBuyers();
    setBuyers(data);
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteBuyer(id);
    fetchBuyers();
  };

  const handleAdd = async (e: React.FormEvent) => {
    const formDataObj = new FormData();
    formDataObj.append('company_name', formData.name);
    formDataObj.append('industry', formData.industry);
    // mapping client states to db fields
    formDataObj.append('city', 'Unknown City'); // Add fields if needed
    formDataObj.append('state', 'Unknown State');
    formDataObj.append('min_quantity', formData.minQuantity);
    formDataObj.append('max_quantity', formData.maxQuantity);
    formDataObj.append('min_price', (Number(formData.offeredPrice) * 0.9).toString());
    formDataObj.append('max_price', formData.offeredPrice);
    formDataObj.append('materials_required', formData.materialsRequired);

    await addBuyer(formDataObj);
    fetchBuyers();
    setShowForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Buyers</h1>
          <p className="text-gray-500 mt-2">Add or remove buyers from your dynamic matching database.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
        >
          {showForm ? 'Cancel' : <><PlusCircle className="w-5 h-5 mr-2"/> Add Buyer</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <input required placeholder="Company Name" className="border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input required placeholder="Industry" className="border p-2 rounded" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
          <input required type="number" placeholder="Distance (km)" className="border p-2 rounded" value={formData.distanceKm} onChange={e => setFormData({...formData, distanceKm: e.target.value})} />
          <input required type="number" placeholder="Offered Price (₹/kg)" className="border p-2 rounded" value={formData.offeredPrice} onChange={e => setFormData({...formData, offeredPrice: e.target.value})} />
          <select className="border p-2 rounded" value={formData.demandLevel} onChange={e => setFormData({...formData, demandLevel: e.target.value})}>
            <option value="Low">Low Demand</option>
            <option value="Medium">Medium Demand</option>
            <option value="High">High Demand</option>
          </select>
          <select className="border p-2 rounded" value={formData.processingRequired} onChange={e => setFormData({...formData, processingRequired: e.target.value})}>
            <option value="Low">Low Processing Required</option>
            <option value="Medium">Medium Processing Required</option>
            <option value="High">High Processing Required</option>
          </select>
          <input required placeholder="Materials Required (comma separated)" className="border p-2 rounded md:col-span-2" value={formData.materialsRequired} onChange={e => setFormData({...formData, materialsRequired: e.target.value})} />
          <input required type="number" placeholder="Min Qty (kg)" className="border p-2 rounded" value={formData.minQuantity} onChange={e => setFormData({...formData, minQuantity: e.target.value})} />
          <input required type="number" placeholder="Max Qty (kg)" className="border p-2 rounded" value={formData.maxQuantity} onChange={e => setFormData({...formData, maxQuantity: e.target.value})} />
          <button type="submit" className="md:col-span-2 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">Save Buyer</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buyers.map(buyer => (
          <div key={buyer.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-gray-900">{buyer.company_name}</h3>
                <button onClick={() => handleDelete(buyer.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p className="flex items-center"><Factory className="w-4 h-4 mr-2" /> {buyer.industry}</p>
                <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> {buyer.city}, {buyer.state}</p>
                <p><strong>Price Range:</strong> ₹{buyer.min_price} - ₹{buyer.max_price}/kg</p>
                <p><strong>Materials:</strong> {buyer.materials_required?.join(', ')}</p>
              </div>
            </div>
          </div>
        ))}
        {buyers.length === 0 && <p className="text-gray-500">No buyers found in database.</p>}
      </div>
    </div>
  );
}
