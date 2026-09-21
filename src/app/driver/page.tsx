"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Truck, MapPin, CheckCircle } from "lucide-react";

export default function DriverDashboard() {
  const [status, setStatus] = useState("free");
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState("");
  const supabase = createClient();

  useEffect(() => {
    async function loadDriver() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setProfileId(user.id);
      const { data } = await supabase
        .from("profiles")
        .select("driver_status")
        .eq("id", user.id)
        .single();
        
      if (data) {
        setStatus(data.driver_status);
      }
      setLoading(false);
    }
    loadDriver();
  }, [supabase]);

  const toggleStatus = async () => {
    const newStatus = status === "free" ? "in_work" : "free";
    setStatus(newStatus);
    await supabase
      .from("profiles")
      .update({ driver_status: newStatus })
      .eq("id", profileId);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading Driver Dashboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Driver Portal</h1>
        <p className="text-gray-500 mt-2">Manage your availability and active shipments</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${status === 'free' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Current Status</h2>
            <p className="text-gray-500">
              {status === "free" ? "You are currently available for new pickups." : "You are currently on a job."}
            </p>
          </div>
        </div>
        <button
          onClick={toggleStatus}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            status === "free" 
              ? "bg-orange-600 hover:bg-orange-700 text-white" 
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {status === "free" ? "Mark as In Work" : "Mark as Free"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Active Pickups</h3>
        </div>
        <div className="p-6 text-center text-gray-500">
          <MapPin className="w-8 h-8 mx-auto mb-3 text-gray-400" />
          <p>You have no active shipments at the moment.</p>
        </div>
      </div>
    </div>
  );
}
