"use client";

import { SchemaData, Attribute } from "@/lib/schemaData";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  selectedNode: { type: string; id: string; data: any } | null;
  schema: SchemaData;
}

export default function DetailsPanel({ selectedNode, schema }: Props) {
  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center space-y-4">
        <div className="p-4 bg-slate-100 rounded-full">
          <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p>Select an entity or relationship in the diagram to view detailed structural constraints.</p>
      </div>
    );
  }

  const data = selectedNode.data;
  const isHierarchy = selectedNode.type === "hierarchyNode";

  return (
    <div className="p-6 h-full overflow-y-auto bg-white border-l border-slate-200">
      {/* ── Badge + Name ── */}
      <div className="mb-6">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 uppercase tracking-widest mb-3">
          {data.type || (isHierarchy ? "Hierarchy Constraint" : "Relationship")}
        </span>
        <h2 className="text-2xl font-black text-slate-900 mb-2">
          {data.name || (isHierarchy ? data.id : "")}
        </h2>
        <div className="bg-slate-50 border-l-4 border-blue-500 p-4 rounded-r-md">
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            {data.description || "System constraint definition."}
          </p>
        </div>
      </div>

      {/* ── Attributes ── */}
      {data.attributes && data.attributes.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Attributes</h3>
          <ul className="space-y-2">
            {data.attributes.map((attr: Attribute, idx: number) => (
              <li key={idx} className="flex items-center p-3 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                <span className="flex-1 text-sm font-semibold text-slate-700">{attr.name}</span>
                <div className="flex items-center space-x-2">
                  {attr.dataType && (
                    <span className="text-xs font-mono text-slate-500 bg-slate-200 px-2 py-1 rounded">
                      {attr.dataType}
                    </span>
                  )}
                  {attr.type !== "normal" && (
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded",
                        attr.type === "PK" && "bg-amber-100 text-amber-800",
                        attr.type === "FK" && "bg-purple-100 text-purple-800",
                        attr.type === "PK-FK" && "bg-indigo-100 text-indigo-800",
                      )}
                    >
                      {attr.type}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Connections ── */}
      {data.connections && data.connections.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Connections</h3>
          <div className="space-y-3">
            {data.connections.map((conn: any, idx: number) => {
              const entity = schema.entities.find((e) => e.id === conn.entityId);
              return (
                <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-orange-900 text-sm">{entity?.name || conn.entityId}</span>
                    <span className="bg-white px-2 py-0.5 rounded text-xs font-bold text-orange-600 border border-orange-200">
                      1 : {conn.cardinality}
                    </span>
                  </div>
                  <div className="flex space-x-4 text-xs text-orange-700/80">
                    <span>Role: <strong className="text-orange-800">{conn.role}</strong></span>
                    <span>Participation: <strong className="text-orange-800 capitalize">{conn.participation}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Hierarchy details ── */}
      {isHierarchy && (
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
          <h3 className="font-bold text-indigo-900 mb-2">Hierarchy Details</h3>
          <p className="text-sm text-indigo-800 mb-2">
            Superclass: <strong>{schema.entities.find((e) => e.id === data.superclassId)?.name || data.superclassId}</strong>
          </p>
          <p className="text-sm text-indigo-800">
            Subclasses: {data.subclassIds.map((id: string) => schema.entities.find((e) => e.id === id)?.name).join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
