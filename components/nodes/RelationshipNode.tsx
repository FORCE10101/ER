"use client";

import { Handle, Position } from "@xyflow/react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function RelationshipNode({ data, selected }: any) {
  const isIdentifying = data.type === "Identifying Relationship";

  return (
    <div className="relative w-32 h-20 flex items-center justify-center pointer-events-auto">
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-0 !h-0" style={{ top: "10%" }} />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-0 !h-0" style={{ bottom: "10%" }} />
      <Handle type="target" position={Position.Left} id="left" className="!bg-transparent !border-none !w-0 !h-0" style={{ left: "5%" }} />
      <Handle type="source" position={Position.Right} id="right" className="!bg-transparent !border-none !w-0 !h-0" style={{ right: "5%" }} />

      {/* SVG diamond background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
      >
        <polygon
          points="50,2 98,30 50,58 2,30"
          className={cn(
            "transition-colors duration-200",
            selected ? "fill-orange-100 stroke-orange-600 stroke-[3px]" : "fill-orange-50 stroke-orange-500 stroke-2",
          )}
        />
        {isIdentifying && (
          <polygon
            points="50,7 93,30 50,53 7,30"
            className="fill-transparent stroke-orange-500 stroke-1"
          />
        )}
      </svg>

      {/* Label */}
      <div className="relative z-10 text-[11px] font-bold text-orange-900 tracking-wider text-center uppercase px-3 leading-tight select-none">
        {data.name}
      </div>
    </div>
  );
}
