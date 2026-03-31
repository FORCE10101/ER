"use client";

import { Handle, Position } from "@xyflow/react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function HierarchyNode({ data, selected }: any) {
  return (
    <div
      className={cn(
        "w-12 h-12 rounded-full bg-amber-50 border-2 flex items-center justify-center shadow-md font-bold text-amber-900 text-sm transition-all",
        selected ? "border-amber-600 ring-4 ring-amber-100" : "border-amber-500",
      )}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-0 !h-0" style={{ top: -2 }} />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-0 !h-0" style={{ bottom: -2 }} />
      <Handle type="target" position={Position.Left} id="left" className="!bg-transparent !border-none !w-0 !h-0" style={{ left: -2 }} />
      <Handle type="source" position={Position.Right} id="right" className="!bg-transparent !border-none !w-0 !h-0" style={{ right: -2 }} />

      {data.type === "disjoint" ? "d" : "o"}
    </div>
  );
}
