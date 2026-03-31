"use client";

import { Handle, Position } from "@xyflow/react";
import { useState } from "react";
import { ChevronDown, ChevronRight, Key, Link2 } from "lucide-react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function EntityNode({ data, selected }: any) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isAssoc = data.type === "Associative Entity";
  const isWeak = data.type === "Weak Entity";

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-xl shadow-slate-200/50 w-64 overflow-hidden transition-all duration-200 font-sans",
        (isWeak || isAssoc) ? "border-2 border-double border-indigo-400" : "border border-slate-200",
        selected && "ring-2 ring-blue-500 border-transparent shadow-blue-100",
      )}
    >
      <Handle type="target" position={Position.Top} className="bg-slate-300 w-3 h-3" />
      <Handle type="source" position={Position.Bottom} className="bg-slate-300 w-3 h-3" />
      <Handle type="target" position={Position.Left} id="left" className="bg-slate-300 w-3 h-3" />
      <Handle type="source" position={Position.Right} id="right" className="bg-slate-300 w-3 h-3" />

      {/* ── Header (click to collapse/expand attributes) ── */}
      <div
        className={cn(
          "px-4 py-3 cursor-pointer flex items-center justify-between",
          isAssoc ? "bg-indigo-50 border-b border-indigo-100" : "bg-slate-50 border-b border-slate-100",
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 font-bold text-slate-800 tracking-wide text-sm whitespace-nowrap overflow-hidden text-ellipsis">
          {data.name}
        </div>
        <button className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-200/50 transition-colors">
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      {/* ── Collapsible attribute list ── */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out bg-white",
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden",
        )}
      >
        <div className="py-2 flex flex-col gap-0.5 max-h-64 overflow-y-auto">
          {data.attributes?.map((attr: any, i: number) => (
            <div
              key={i}
              className={cn(
                "flex flex-row items-center px-4 py-1.5 text-xs hover:bg-slate-50 border-l-2",
                attr.type === "PK" && "border-amber-400",
                attr.type === "FK" && "border-purple-400",
                attr.type === "PK-FK" && "border-indigo-400",
                attr.type === "normal" && "border-transparent",
              )}
            >
              <div className="w-4 mr-1.5 flex justify-center text-slate-400">
                {(attr.type === "PK" || attr.type === "PK-FK") && <Key size={10} className="text-amber-500" />}
                {attr.type === "FK" && <Link2 size={10} className="text-purple-500" />}
              </div>
              <span
                className={cn(
                  "flex-1 truncate",
                  (attr.type === "PK" || attr.type === "PK-FK")
                    ? "font-bold text-slate-800 underline decoration-slate-300 underline-offset-2"
                    : attr.type === "FK"
                      ? "font-medium italic text-slate-700"
                      : "text-slate-600",
                )}
              >
                {attr.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
