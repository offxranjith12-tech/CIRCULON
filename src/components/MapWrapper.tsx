"use client";

import dynamic from "next/dynamic";
import { type MapProps } from "./Map";

const MapComponent = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Loading Map...</p>
    </div>
  ),
});

export function MapWrapper(props: MapProps) {
  return <MapComponent {...props} />;
}
