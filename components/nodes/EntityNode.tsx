"use client";

import { Handle, Position } from "@xyflow/react";
import { useState } from "react";
import { ChevronDown, ChevronRight, Key, Link2 } from "lucide-react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ── Color config per tier/type ── */
const tierColors: Record<number, { header: string; accent: string; ring: string }> = {
  1: { header: "from-cyan-500 to-cyan-600", accent: "bg-cyan-50 border-cyan-200", ring: "ring-cyan-400" },
  2: { header: "from-violet-500 to-violet-600", accent: "bg-violet-50 border-violet-200", ring: "ring-violet-400" },
  3: { header: "from-emerald-500 to-emerald-600", accent: "bg-emerald-50 border-emerald-200", ring: "ring-emerald-400" },
  4: { header: "from-amber-500 to-amber-600", accent: "bg-amber-50 border-amber-200", ring: "ring-amber-400" },
  5: { header: "from-rose-500 to-rose-600", accent: "bg-rose-50 border-rose-200", ring: "ring-rose-400" },
};

export default function EntityNode({ data, selected }: any) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isAssoc = data.type === "Associative Entity";
  const isWeak = data.type === "Weak Entity";
  const tier = data.tier || 3;
  const colors = tierColors[tier] || tierColors[3];
  const attrCount = data.attributes?.length || 0;

  return (
    <div
      className={cn(
        "bg-white rounded-xl w-[260px] overflow-hidden transition-all duration-300 font-sans node-animate-in",
        "shadow-lg shadow-slate-200/60",
        (isWeak || isAssoc) && "ring-2 ring-indigo-300 ring-offset-1",
        selected && `ring-2 ${colors.ring} ring-offset-2 node-selected-glow`,
        !selected && "hover:shadow-xl hover:-translate-y-0.5",
      )}
    >
      {/* Connection handles – all 4 sides */}
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2.5 !h-2.5 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2.5 !h-2.5 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} id="left" className="!bg-slate-400 !w-2.5 !h-2.5 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} id="right" className="!bg-slate-400 !w-2.5 !h-2.5 !border-2 !border-white" />

      {/* ── Gradient header bar ── */}
      <div
        className={cn(
          "px-4 py-3 cursor-pointer flex items-center justify-between bg-gradient-to-r",
          colors.header,
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-extrabold text-white text-[13px] tracking-wide truncate drop-shadow-sm">
            {data.name}
          </span>
          {isAssoc && (
            <span className="text-[9px] font-bold bg-white/25 text-white px-1.5 py-0.5 rounded-full whitespace-nowrap">
              M:N
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {!isExpanded && (
            <span className="text-[10px] font-bold bg-white/25 text-white px-1.5 py-0.5 rounded-full">
              {attrCount}
            </span>
          )}
          <button className="text-white/80 hover:text-white p-0.5 rounded transition-colors">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>
      </div>

      {/* ── Tier badge ── */}
      <div className="px-4 pt-2 pb-1 flex items-center gap-2 border-b border-slate-100 bg-slate-50/50">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
          Tier {tier}
        </span>
        <span className="text-[9px] text-slate-300">•</span>
        <span className="text-[9px] font-semibold text-slate-400 capitalize">
          {data.tierLabel}
        </span>
      </div>

      {/* ── Collapsible attribute list ── */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out bg-white",
          isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 overflow-hidden",
        )}
      >
        <div className="py-2 flex flex-col gap-0.5 max-h-[280px] overflow-y-auto">
          {data.attributes?.map((attr: any, i: number) => (
            <div
              key={i}
              className={cn(
                "flex flex-row items-center px-4 py-1.5 text-xs transition-colors",
                "hover:bg-slate-50 border-l-[3px]",
                attr.type === "PK" && "border-l-amber-400",
                attr.type === "FK" && "border-l-purple-400",
                attr.type === "PK-FK" && "border-l-indigo-400",
                attr.type === "normal" && "border-l-transparent",
              )}
            >
              {/* Icon */}
              <div className="w-4 mr-2 flex justify-center flex-shrink-0">
                {(attr.type === "PK" || attr.type === "PK-FK") && <Key size={10} className="text-amber-500" />}
                {attr.type === "FK" && <Link2 size={10} className="text-purple-500" />}
              </div>

              {/* Name */}
              <span
                className={cn(
                  "flex-1 truncate font-mono text-[11px]",
                  (attr.type === "PK" || attr.type === "PK-FK")
                    ? "font-bold text-slate-800 underline decoration-slate-300 underline-offset-2"
                    : attr.type === "FK"
                      ? "font-medium text-purple-700"
                      : "text-slate-600",
                )}
              >
                {attr.name}
              </span>

              {/* Badge */}
              {attr.type !== "normal" && (
                <span
                  className={cn(
                    "text-[8px] font-extrabold px-1.5 py-0.5 rounded-full ml-2 whitespace-nowrap",
                    attr.type === "PK" && "bg-amber-100 text-amber-700 ring-1 ring-amber-200",
                    attr.type === "FK" && "bg-purple-100 text-purple-700 ring-1 ring-purple-200",
                    attr.type === "PK-FK" && "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200",
                  )}
                >
                  {attr.type}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
