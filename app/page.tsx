"use client";

import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  addEdge,
  type Connection,
  type Edge,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { pharmaSchema } from "@/lib/schemaData";
import EntityNode from "@/components/nodes/EntityNode";
import RelationshipNode from "@/components/nodes/RelationshipNode";
import HierarchyNode from "@/components/nodes/HierarchyNode";
import DetailsPanel from "@/components/DetailsPanel";
import ParticipationEdge from "@/components/edges/ParticipationEdge";

/* Register custom node renderers */
const nodeTypes = {
  entityNode: EntityNode,
  relationshipNode: RelationshipNode,
  hierarchyNode: HierarchyNode,
};

/* Register custom edge renderers */
const edgeTypes = {
  participation: ParticipationEdge,
};

/*
 * Layout positions following the user's zone guide:
 *   Top Zone:          ACTOR → d circle → MANUFACTURER | PHARMACY | ADMIN
 *   Middle-Left Zone:  MEDICINE, BATCH
 *   Middle-Right Zone: TRANSFER_LOG
 *   Bottom-Center:     INVENTORY, SALE_TRANSACTION
 *   Bottom Edges:      SCAN_LOG (left), ALERT (right)
 *
 * Relationship diamonds are placed between the entities they connect.
 */
const positions: Record<string, { x: number; y: number }> = {
  // ═══════════════════════════════════════════════════════════
  // TOP ZONE: ACTOR → ISA circle → Subclasses
  // ═══════════════════════════════════════════════════════════
  actor:            { x: 680, y: 0 },
  h_actor:         { x: 740, y: 220 },
  manufacturer:     { x: 100, y: 400 },
  pharmacy:         { x: 660, y: 400 },
  admin:            { x: 1200, y: 400 },

  // ═══════════════════════════════════════════════════════════
  // MIDDLE-LEFT ZONE: MEDICINE ← Defines → BATCH
  // ═══════════════════════════════════════════════════════════
  medicine:         { x: 0,   y: 750 },
  rel_defines:      { x: 350, y: 720 },
  batch:            { x: 550, y: 750 },

  // ═══════════════════════════════════════════════════════════
  // OWNERSHIP: ACTOR → Currently_Owns → BATCH
  // ═══════════════════════════════════════════════════════════
  rel_currently_owns: { x: 700, y: 580 },

  // ═══════════════════════════════════════════════════════════
  // MIDDLE-RIGHT ZONE: TRANSFER_LOG + Sends/Receives
  // ═══════════════════════════════════════════════════════════
  transfer_log:       { x: 1150, y: 750 },
  rel_movement_history: { x: 880, y: 680 },
  rel_sends:          { x: 1050, y: 550 },
  rel_receives:       { x: 1350, y: 550 },

  // ═══════════════════════════════════════════════════════════
  // BOTTOM-CENTER ZONE: INVENTORY + SALE_TRANSACTION
  // ═══════════════════════════════════════════════════════════
  inventory:          { x: 300, y: 1100 },
  rel_manages:        { x: 480, y: 950 },
  rel_stocked_in:     { x: 600, y: 1020 },

  sale_transaction:   { x: 900, y: 1100 },
  rel_sold_via:       { x: 750, y: 1020 },
  rel_executes:       { x: 820, y: 900 },

  // ═══════════════════════════════════════════════════════════
  // BOTTOM EDGES: SCAN_LOG (left) + ALERT (right)
  // ═══════════════════════════════════════════════════════════
  scan_log:           { x: 0,    y: 1400 },
  rel_scanned_as:     { x: 300,  y: 1300 },
  rel_scanned_by:     { x: 100,  y: 1200 },

  alert:              { x: 1200, y: 1400 },
  rel_triggers:       { x: 1000, y: 1300 },
};

/* ── Inner component (needs ReactFlowProvider above it) ────────── */
function DiagramInner() {
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  /* ── Build node list from schema ────────────────────────────────── */
  const initialNodes = useMemo(() => {
    const nodes: any[] = [];

    pharmaSchema.entities.forEach((ent) => {
      nodes.push({
        id: ent.id,
        type: "entityNode",
        position: positions[ent.id] || { x: Math.random() * 800, y: Math.random() * 800 },
        data: ent,
      });
    });

    pharmaSchema.relationships.forEach((rel) => {
      nodes.push({
        id: rel.id,
        type: "relationshipNode",
        position: positions[rel.id] || { x: Math.random() * 800, y: Math.random() * 800 },
        data: rel,
      });
    });

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

  /* ── Build edge list from schema ────────────────────────────────── */
  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];

    // ── Relationship edges (diamond ↔ entity) ──
    // Each connection carries its own participation:
    //   total  → double line (ParticipationEdge)
    //   partial → single line (ParticipationEdge)
    pharmaSchema.relationships.forEach((rel) => {
      rel.connections.forEach((conn) => {
        edges.push({
          id: "e_" + rel.id + "_" + conn.entityId,
          source: rel.id,
          target: conn.entityId,
          type: "participation",
          data: {
            participation: conn.participation,
            lineColor: conn.participation === "total" ? "#1e293b" : "#94a3b8",
          },
          label: conn.cardinality,
          labelStyle: { fill: "#475569", fontWeight: 700, fontSize: 13 },
          labelBgStyle: { fill: "#f8fafc", fillOpacity: 0.9 },
        });
      });
    });

    // ── Hierarchy edges (ISA) ──
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
        labelStyle: { fill: "#92400e", fontWeight: 700, fontSize: 12 },
        labelBgStyle: { fill: "#fffbeb", fillOpacity: 0.9 },
      });

      // Circle → each subclass: single lines (partial)
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
    setSelectedElement(node);
  };

  const onPaneClick = () => {
    setSelectedElement(null);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans overflow-hidden">
      {/* ─── Diagram Pane ─── */}
      <div className="flex-1 relative">
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-5 py-3 rounded-xl shadow-md border border-slate-200">
          <h1 className="text-lg font-black text-slate-800 tracking-tight">PharmaGuard EER Explorer</h1>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Interactive Entity-Relationship Diagram &middot; Click any node for details</p>
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
          fitViewOptions={{ padding: 0.15 }}
          attributionPosition="bottom-left"
          minZoom={0.15}
          maxZoom={2}
        >
          <Background color="#cbd5e1" gap={28} size={1} />
          <Controls className="bg-white shadow-lg border border-slate-200 rounded-lg overflow-hidden" />
        </ReactFlow>

        {/* ─── Custom Zoom Buttons ─── */}
        <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2">
          <button
            onClick={() => zoomIn({ duration: 300 })}
            className="w-10 h-10 bg-white rounded-lg shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all font-bold text-lg"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => zoomOut({ duration: 300 })}
            className="w-10 h-10 bg-white rounded-lg shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all font-bold text-lg"
            title="Zoom Out"
          >
            &minus;
          </button>
          <button
            onClick={() => fitView({ duration: 400, padding: 0.15 })}
            className="w-10 h-10 bg-white rounded-lg shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
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
      <div className="w-[380px] flex-shrink-0 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] z-20">
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
