"use client";

import { Handle, Position } from "@xyflow/react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function HierarchyNode({ data, selected }: any) {
  const label = data.type === "disjoint" ? "d" : "o";
  const fullLabel = data.type === "disjoint" ? "Disjoint" : "Overlapping";

  return (
    <div className="flex flex-col items-center gap-1 node-animate-in">
      {/* The circle */}
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center",
          "font-extrabold text-amber-800 text-lg transition-all duration-200",
          "bg-gradient-to-br from-amber-50 to-orange-50",
          "shadow-lg",
          selected
            ? "ring-[3px] ring-amber-500 ring-offset-2 shadow-amber-200/50"
            : "ring-2 ring-amber-400 hover:ring-amber-500 hover:shadow-amber-100/60",
        )}
        style={{
          boxShadow: selected
            ? "0 0 20px 4px rgba(245, 158, 11, 0.25), 0 4px 12px rgba(0,0,0,0.08)"
            : "0 4px 12px rgba(0,0,0,0.08)",
        }}
      >
        {/* Handles positioned on the circle itself */}
        <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-0 !h-0" style={{ top: -2 }} />
        <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-0 !h-0" style={{ bottom: -2 }} />
        <Handle type="target" position={Position.Left} id="left" className="!bg-transparent !border-none !w-0 !h-0" style={{ left: -2 }} />
        <Handle type="source" position={Position.Right} id="right" className="!bg-transparent !border-none !w-0 !h-0" style={{ right: -2 }} />

        {label}
      </div>

      {/* Label below the circle */}
      <span className="text-[9px] font-bold uppercase tracking-widest text-amber-600/70 select-none">
        {fullLabel}
      </span>
    </div>
  );
}
