"use client";

import { Handle, Position } from "@xyflow/react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function RelationshipNode({ data, selected }: any) {
  const isIdentifying = data.type === "Identifying Relationship";

  return (
    <div className="relative w-36 h-[88px] flex items-center justify-center pointer-events-auto node-animate-in">
      {/* Connection handles */}
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-none !w-0 !h-0" style={{ top: "8%" }} />
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none !w-0 !h-0" style={{ bottom: "8%" }} />
      <Handle type="target" position={Position.Left} id="left" className="!bg-transparent !border-none !w-0 !h-0" style={{ left: "3%" }} />
      <Handle type="source" position={Position.Right} id="right" className="!bg-transparent !border-none !w-0 !h-0" style={{ right: "3%" }} />

      {/* SVG diamond with gradient fill */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 60"
        preserveAspectRatio="none"
        style={{ filter: selected ? "drop-shadow(0 0 8px rgba(234, 88, 12, 0.4))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}
      >
        <defs>
          <linearGradient id={`diamond-grad-${data.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={selected ? "#fed7aa" : "#fff7ed"} />
            <stop offset="100%" stopColor={selected ? "#fdba74" : "#ffedd5"} />
          </linearGradient>
        </defs>
        <polygon
          points="50,2 98,30 50,58 2,30"
          className={cn(
            "transition-colors duration-200",
            selected ? "stroke-orange-600" : "stroke-orange-400",
          )}
          fill={`url(#diamond-grad-${data.id})`}
          strokeWidth={selected ? 3 : 2}
        />
        {isIdentifying && (
          <polygon
            points="50,7 93,30 50,53 7,30"
            className="fill-transparent stroke-orange-400"
            strokeWidth={1}
          />
        )}
      </svg>

      {/* Label */}
      <div className="relative z-10 text-[10px] font-extrabold text-orange-900 tracking-wider text-center uppercase px-4 leading-tight select-none drop-shadow-sm">
        {data.name}
      </div>
    </div>
  );
}
