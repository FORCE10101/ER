"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Connection,
  type Edge,
  type Node,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { pharmaSchema } from "@/lib/schemaData";
import EntityNode from "@/components/nodes/EntityNode";
import RelationshipNode from "@/components/nodes/RelationshipNode";
import HierarchyNode from "@/components/nodes/HierarchyNode";
import DetailsPanel from "@/components/DetailsPanel";
import ParticipationEdge from "@/components/edges/ParticipationEdge";

/* ── Register custom renderers ── */
const nodeTypes = {
  entityNode: EntityNode,
  relationshipNode: RelationshipNode,
  hierarchyNode: HierarchyNode,
};

const edgeTypes = {
  participation: ParticipationEdge,
};

/*
 * ═══════════════════════════════════════════════════════════════════════
 * STRICT 5-TIER LAYOUT
 *
 *   Tier 1 (y=0):     ACTOR (center)
 *   ISA circle:        Between Tier 1 and 2
 *   Tier 2 (y=480):    MANUFACTURER | PHARMACY | ADMIN | CUSTOMER
 *   Tier 3 (y=900):    MEDICINE | BATCH + relationship diamonds
 *   Tier 4 (y=1350):   INVENTORY | TRANSFER_LOG | SALE_TRANSACTION
 *   Tier 5 (y=1800):   SCAN_LOG | ALERT
 * ═══════════════════════════════════════════════════════════════════════
 */

const COL_W = 340;   // horizontal spacing between nodes
const CENTER = 800;   // horizontal center point

const positions: Record<string, { x: number; y: number }> = {
  // ── TIER 1: Inheritance Root ──
  actor:                { x: CENTER,     y: 0 },

  // ── ISA Circle (between Tier 1 & 2) ──
  h_actor:              { x: CENTER + 30,  y: 230 },

  // ── TIER 2: Subclasses (spread horizontally) ──
  manufacturer:         { x: CENTER - COL_W * 1.5,  y: 480 },
  pharmacy:             { x: CENTER - COL_W * 0.5,  y: 480 },
  admin:                { x: CENTER + COL_W * 0.5,  y: 480 },
  customer:             { x: CENTER + COL_W * 1.5,  y: 480 },

  // ── TIER 3: Core entities ──
  medicine:             { x: CENTER - COL_W,    y: 920 },
  batch:                { x: CENTER + COL_W * 0.3,   y: 920 },

  // Relationship diamonds — Tier 2→3 area
  rel_defines:          { x: CENTER - COL_W * 0.35,  y: 870 },
  rel_currently_owns:   { x: CENTER + COL_W * 0.9,   y: 680 },

  // ── TIER 4: Action entities ──
  inventory:            { x: CENTER - COL_W,         y: 1350 },
  transfer_log:         { x: CENTER + COL_W * 0.15,  y: 1350 },
  sale_transaction:     { x: CENTER + COL_W * 1.3,   y: 1350 },

  // Relationship diamonds — Tier 3→4 area
  rel_manages:          { x: CENTER - COL_W * 1.2,   y: 1180 },
  rel_stocked_in:       { x: CENTER - COL_W * 0.4,   y: 1180 },
  rel_movement_history: { x: CENTER,                  y: 1180 },
  rel_sends:            { x: CENTER + COL_W * 0.6,    y: 770 },
  rel_receives:         { x: CENTER + COL_W * 1.4,    y: 770 },
  rel_sold_via:         { x: CENTER + COL_W * 0.8,    y: 1180 },
  rel_executes:         { x: CENTER + COL_W * 1.5,    y: 1180 },

  // ── TIER 5: Security entities ──
  scan_log:             { x: CENTER - COL_W * 0.6,   y: 1800 },
  alert:                { x: CENTER + COL_W * 0.8,   y: 1800 },

  // Relationship diamonds — Tier 4→5 area
  rel_scanned_as:       { x: CENTER - COL_W * 0.1,   y: 1620 },
  rel_scanned_by:       { x: CENTER - COL_W * 1.2,   y: 1620 },
  rel_triggers:         { x: CENTER + COL_W * 0.6,   y: 1620 },
};

/* ── Tier band definitions for background labels ── */
const tierBands = [
  { label: "Tier 1 · Inheritance Root", y: -40 },
  { label: "Tier 2 · Subclasses (Disjoint Specialization)", y: 420 },
  { label: "Tier 3 · Core Entities", y: 860 },
  { label: "Tier 4 · Action & Transactions", y: 1290 },
  { label: "Tier 5 · Security & Auditing", y: 1740 },
];

/* ══════════════════════════════════════════════════════════════════════ */
/* Inner component (needs ReactFlowProvider above it)                   */
/* ══════════════════════════════════════════════════════════════════════ */
function DiagramInner() {
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  /* ── Build node list from schema ── */
  const initialNodes = useMemo(() => {
    const nodes: Node[] = [];

    // Tier band label nodes (non-interactive background labels)
    tierBands.forEach((band, i) => {
      nodes.push({
        id: `tier_label_${i}`,
        type: "default",
        position: { x: -80, y: band.y },
        data: { label: band.label },
        selectable: false,
        draggable: false,
        connectable: false,
        style: {
          background: "rgba(241, 245, 249, 0.6)",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          borderRadius: "8px",
          padding: "6px 16px",
          fontSize: "11px",
          fontWeight: 800,
          color: "#94a3b8",
          letterSpacing: "0.12em",
          textTransform: "uppercase" as const,
          pointerEvents: "none" as const,
          width: "auto",
          whiteSpace: "nowrap" as const,
        },
      });
    });

    // Entity nodes
    pharmaSchema.entities.forEach((ent) => {
      nodes.push({
        id: ent.id,
        type: "entityNode",
        position: positions[ent.id] || { x: Math.random() * 800, y: Math.random() * 800 },
        data: ent,
      });
    });

    // Relationship diamond nodes
    pharmaSchema.relationships.forEach((rel) => {
      nodes.push({
        id: rel.id,
        type: "relationshipNode",
        position: positions[rel.id] || { x: Math.random() * 800, y: Math.random() * 800 },
        data: rel,
      });
    });

    // Hierarchy circle nodes
    pharmaSchema.hierarchies.forEach((h) => {
      nodes.push({
        id: h.id,
        type: "hierarchyNode",
        position: positions[h.id] || { x: Math.random() * 800, y: Math.random() * 800 },
        data: h,
      });
    });

    return nodes;
  }, []);

  /* ── Build edge list from schema ── */
  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];

    // Relationship edges (diamond ↔ entity)
    pharmaSchema.relationships.forEach((rel) => {
      rel.connections.forEach((conn) => {
        edges.push({
          id: "e_" + rel.id + "_" + conn.entityId,
          source: rel.id,
          target: conn.entityId,
          type: "participation",
          data: {
            participation: conn.participation,
            lineColor: conn.participation === "total" ? "#334155" : "#94a3b8",
          },
          label: conn.cardinality,
          labelStyle: { fill: "#475569", fontWeight: 700, fontSize: 12 },
          labelBgStyle: { fill: "#f8fafc", fillOpacity: 0.92 },
        });
      });
    });

    // Hierarchy edges (ISA)
    pharmaSchema.hierarchies.forEach((h) => {
      // Superclass → circle: total participation = double line
      edges.push({
        id: "e_" + h.id + "_super",
        source: h.superclassId,
        target: h.id,
        type: "participation",
        data: {
          participation: h.participation,
          lineColor: "#92400e",
        },
        label: "ISA",
        labelStyle: { fill: "#92400e", fontWeight: 700, fontSize: 11 },
        labelBgStyle: { fill: "#fffbeb", fillOpacity: 0.92 },
      });

      // Circle → each subclass: partial lines with arrows
      h.subclassIds.forEach((subId) => {
        edges.push({
          id: "e_" + h.id + "_" + subId,
          source: h.id,
          target: subId,
          type: "participation",
          data: { participation: "partial", lineColor: "#b45309" },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#b45309" },
        });
      });
    });

    return edges;
  }, []);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = (_event: React.MouseEvent, node: any) => {
    // Skip tier label clicks
    if (node.id.startsWith("tier_label")) return;
    setSelectedElement(node);
  };

  const onPaneClick = () => {
    setSelectedElement(null);
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 font-sans overflow-hidden">
      {/* ─── Diagram Pane ─── */}
      <div className="flex-1 relative">
        {/* Header badge */}
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-md shadow-blue-200/50">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M2 4h12M4 4v8M12 4v8M4 8h8M4 12h8" />
              </svg>
            </div>
            <div>
              <h1 className="text-[15px] font-black text-slate-800 tracking-tight">PharmaGuard EER Explorer</h1>
              <p className="text-[10px] font-semibold text-slate-400 tracking-wide">
                Interactive Entity-Relationship Diagram &middot; Click any node for details
              </p>
            </div>
          </div>
        </div>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.12 }}
          minZoom={0.08}
          maxZoom={2.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#cbd5e1" gap={32} size={1} />
          <Controls
            showZoom={false}
            showFitView={false}
            showInteractive={false}
            className="!hidden"
          />
          <MiniMap
            nodeColor={(n) => {
              if (n.id.startsWith("tier_label")) return "transparent";
              if (n.type === "entityNode") return "#60a5fa";
              if (n.type === "relationshipNode") return "#fb923c";
              return "#fbbf24";
            }}
            maskColor="rgba(15, 23, 42, 0.12)"
            className="!bg-white/80 !border !border-slate-200 !rounded-lg !shadow-lg"
            style={{ width: 160, height: 100 }}
          />
        </ReactFlow>

        {/* ─── Custom Zoom Controls ─── */}
        <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
          <button
            onClick={() => zoomIn({ duration: 300 })}
            className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:shadow-blue-100 transition-all font-bold text-lg"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => zoomOut({ duration: 300 })}
            className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:shadow-blue-100 transition-all font-bold text-lg"
            title="Zoom Out"
          >
            &minus;
          </button>
          <button
            onClick={() => fitView({ duration: 400, padding: 0.12 })}
            className="w-10 h-10 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 hover:shadow-blue-100 transition-all"
            title="Fit to View"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <rect x="2" y="2" width="12" height="12" rx="2" />
              <path d="M5 8h6M8 5v6" />
            </svg>
          </button>
        </div>
      </div>

      {/* ─── Details Panel Sidebar ─── */}
      <div className="w-[380px] flex-shrink-0 z-20 shadow-[-12px_0_32px_-10px_rgba(0,0,0,0.12)]">
        <DetailsPanel selectedNode={selectedElement} schema={pharmaSchema} />
      </div>
    </div>
  );
}

/* ── Exported wrapper with ReactFlowProvider ── */
export default function Home() {
  return (
    <ReactFlowProvider>
      <DiagramInner />
    </ReactFlowProvider>
  );
}
