"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in react-leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const driverIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export interface Location {
  lat: number;
  lng: number;
}

export interface Driver {
  id: string;
  name: string;
  status: string;
  location?: Location;
}

export interface Shipment {
  id: string;
  driverId?: string;
  pickup: Location;
  dropoff: Location;
  status: string;
}

export interface MapProps {
  shipments: Shipment[];
  drivers: Driver[];
  className?: string;
}

export default function Map({ shipments, drivers, className }: MapProps) {
  // Center of India
  const center: [number, number] = [20.5937, 78.9629];

  return (
    <div className={`h-[500px] w-full rounded-lg overflow-hidden shadow-lg border border-border ${className || ''}`}>
      <MapContainer center={center} zoom={5} scrollWheelZoom={true} className="h-full w-full relative z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Render Drivers */}
        {drivers.map((driver) => (
          driver.location ? (
            <Marker key={`driver-${driver.id}`} position={[driver.location.lat, driver.location.lng]} icon={driverIcon}>
              <Popup>
                <div className="font-semibold text-green-700">Driver: {driver.name}</div>
                <div className="text-sm">Status: {driver.status === 'in_work' ? 'Working' : 'Free'}</div>
              </Popup>
            </Marker>
          ) : null
        ))}

        {/* Render Shipments */}
        {shipments.map((shipment) => (
          <div key={`shipment-${shipment.id}`}>
            <Marker position={[shipment.pickup.lat, shipment.pickup.lng]} icon={icon}>
              <Popup>
                <div className="font-semibold text-blue-700">Pickup Location</div>
                <div className="text-sm">Shipment ID: {shipment.id.slice(0, 8)}...</div>
              </Popup>
            </Marker>
            <Marker position={[shipment.dropoff.lat, shipment.dropoff.lng]} icon={icon}>
              <Popup>
                <div className="font-semibold text-red-700">Dropoff Location</div>
                <div className="text-sm">Shipment ID: {shipment.id.slice(0, 8)}...</div>
              </Popup>
            </Marker>
            <Polyline 
              positions={[
                [shipment.pickup.lat, shipment.pickup.lng],
                [shipment.dropoff.lat, shipment.dropoff.lng]
              ]} 
              color="blue" 
              dashArray="5, 10" 
            />
          </div>
        ))}
      </MapContainer>
    </div>
  );
}
