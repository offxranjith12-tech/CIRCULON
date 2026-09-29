"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Share2, 
  Factory, 
  Building2, 
  Recycle, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  MapPin, 
  CheckCircle2, 
  X, 
  ExternalLink,
  Layers,
  Leaf,
  Info
} from "lucide-react";
import { type SymbiosisNode, type SymbiosisLink } from "@/lib/types";

interface IndustrialSymbiosisGraphProps {
  role?: string;
  userCompany?: string;
  nodes?: SymbiosisNode[];
  links?: SymbiosisLink[];
  onInitiateConnection?: (node: SymbiosisNode) => void;
}

const NODES: SymbiosisNode[] = [];
const LINKS: SymbiosisLink[] = [];

export function IndustrialSymbiosisGraph({
  role = 'seller',
  userCompany,
  nodes,
  links,
  onInitiateConnection
}: IndustrialSymbiosisGraphProps) {
  const activeNodes = nodes || NODES;
  const activeLinks = links || LINKS;
  const [selectedNode, setSelectedNode] = useState<SymbiosisNode | null>(activeNodes[0] || null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const getNodeColor = (r: 'producer' | 'consumer' | 'both') => {
    if (r === 'producer') return '#10b981'; // emerald
    if (r === 'consumer') return '#3b82f6'; // blue
    return '#8b5cf6'; // purple (both)
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-md overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-950 via-emerald-950 to-gray-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <Share2 className="w-3.5 h-3.5" />
            Circular Industrial Symbiosis Map
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Regional Material Exchange Network
          </h2>
          <p className="text-xs text-emerald-200/80 mt-0.5 max-w-xl">
            Interactive topology of circular feedstock exchanges, industrial cross-substitution routes, and secondary byproduct pipelines across Indian manufacturing hubs.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs bg-white/5 p-3 rounded-xl border border-white/10 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-gray-300">Byproduct Generator</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-300">Offtaker / Recycler</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-gray-300">Integrated Closed-Loop</span>
          </div>
        </div>
      </div>

      {/* Main Grid: SVG Graph Canvas + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[500px]">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-2 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
          <svg viewBox="0 0 900 600" className="w-full h-full max-h-[560px]">
            {/* Background Grid Pattern */}
            <defs>
              <pattern id="symbiosis-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
              </pattern>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="28"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
              </marker>
            </defs>

            <rect width="100%" height="100%" fill="url(#symbiosis-grid)" />

            {/* Empty state message */}
            {activeNodes.length === 0 && (
              <text
                x="450"
                y="300"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="14"
                fontWeight="500"
              >
                No active industrial symbiosis nodes mapped yet. Network flows will appear as deals are finalized.
              </text>
            )}

            {/* Connection Links */}
            {activeLinks.map(link => {
              const src = activeNodes.find(n => n.id === link.sourceId);
              const tgt = activeNodes.find(n => n.id === link.targetId);
              if (!src || !tgt) return null;

              const isHighlighted = 
                selectedNode?.id === src.id || 
                selectedNode?.id === tgt.id ||
                hoveredNode === src.id || 
                hoveredNode === tgt.id;

              const strokeColor = link.status === 'active' ? '#10b981' : '#f59e0b';
              const strokeWidth = isHighlighted ? 3.5 : 1.8;
              const strokeOpacity = isHighlighted ? 0.95 : 0.4;

              // Quadratic curve midpoint
              const midX = (src.coordinates.x + tgt.coordinates.x) / 2;
              const midY = (src.coordinates.y + tgt.coordinates.y) / 2 - 25;
              const pathD = `M ${src.coordinates.x} ${src.coordinates.y} Q ${midX} ${midY} ${tgt.coordinates.x} ${tgt.coordinates.y}`;

              return (
                <g key={link.id} className="cursor-pointer">
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeOpacity={strokeOpacity}
                    strokeDasharray={link.status === 'potential' ? '5,5' : undefined}
                    markerEnd="url(#arrowhead)"
                  />
                  {/* Floating Link Label */}
                  <text
                    x={midX}
                    y={midY - 8}
                    fill={isHighlighted ? '#ffffff' : '#94a3b8'}
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="select-none pointer-events-none drop-shadow"
                  >
                    {link.materialName} ({Math.round(link.annualVolumeKg / 1000)} T/yr)
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {activeNodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode === node.id;
              const color = getNodeColor(node.role);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.coordinates.x}, ${node.coordinates.y})`}
                  onClick={() => setSelectedNode(node)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer group"
                >
                  {/* Pulse Ring for Selected Node */}
                  {isSelected && (
                    <circle
                      r="28"
                      fill="none"
                      stroke={color}
                      strokeWidth="2"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  )}

                  {/* Node Outer Circle */}
                  <circle
                    r={isSelected || isHovered ? 24 : 20}
                    fill="#0f172a"
                    stroke={color}
                    strokeWidth={isSelected ? 4 : 2.5}
                    className="transition-all duration-200 shadow-xl"
                  />

                  {/* Center Dot */}
                  <circle
                    r="8"
                    fill={color}
                  />

                  {/* Label */}
                  <text
                    y="36"
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#cbd5e1'}
                    fontSize="11"
                    fontWeight="bold"
                    className="select-none pointer-events-none drop-shadow-md"
                  >
                    {node.name}
                  </text>
                  <text
                    y="49"
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="9"
                    className="select-none pointer-events-none"
                  >
                    {node.location.split(',')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Node Detail Drawer / Inspection Panel */}
        <div className="p-6 bg-gray-50 border-l border-gray-200 flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    selectedNode.role === 'producer'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedNode.role === 'consumer'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {selectedNode.role === 'producer' ? 'Feedstock Producer' : selectedNode.role === 'consumer' ? 'Circular Offtaker' : 'Dual Closed-Loop'}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {selectedNode.industry}
                  </span>
                </div>

                <h3 className="text-xl font-black text-gray-950 tracking-tight mt-1.5">
                  {selectedNode.companyName}
                </h3>
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {selectedNode.location}
                </p>
              </div>

              {/* Environmental Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs text-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Annual Diversion</span>
                  <span className="text-lg font-black text-emerald-700 mt-0.5 block">
                    {selectedNode.annualDivertedTons.toLocaleString()} Tons
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-gray-200 shadow-xs text-center">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">CO2e Offset</span>
                  <span className="text-lg font-black text-blue-700 mt-0.5 block">
                    {selectedNode.co2AvoidedTons.toLocaleString()} Tons
                  </span>
                </div>
              </div>

              {/* Materials Supplied */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block mb-1.5">
                  Available Secondary By-Products:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.materialsSupplied.map((m, idx) => (
                    <span key={idx} className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Materials Consumed */}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-blue-900 block mb-1.5">
                  Procurement Feedstock Intake:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.materialsConsumed.map((m, idx) => (
                    <span key={idx} className="text-xs font-semibold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connected Active Pipelines */}
              <div className="pt-2 border-t border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Active Symbiosis Exchange Channels ({
                    activeLinks.filter(l => l.sourceId === selectedNode.id || l.targetId === selectedNode.id).length
                  })
                </span>
                <div className="space-y-1.5 text-xs">
                  {activeLinks.filter(l => l.sourceId === selectedNode.id || l.targetId === selectedNode.id).map(l => (
                    <div key={l.id} className="p-2 rounded-lg bg-white border border-gray-200 flex items-center justify-between">
                      <span className="font-bold text-gray-800">{l.materialName}</span>
                      <span className="text-emerald-700 font-bold">{Math.round(l.annualVolumeKg / 1000)} T/yr</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connect Action Button */}
              {onInitiateConnection && (
                <div className="pt-3">
                  <button
                    onClick={() => onInitiateConnection(selectedNode)}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                  >
                    <span>Initiate Industrial Symbiosis Link</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400">
              <Share2 className="w-8 h-8 mb-2" />
              <p className="text-xs">Click any industrial node to inspect by-product exchange capabilities.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
