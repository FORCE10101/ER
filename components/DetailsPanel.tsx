"use client";

import { useState } from "react";
import { SchemaData, Attribute } from "@/lib/schemaData";
import { ChevronDown, ChevronRight, Shield, AlertTriangle, Database, Link2 } from "lucide-react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

/* ── Accordion Section ── */
function AccordionSection({
  title,
  icon,
  defaultOpen = false,
  children,
  count,
}: {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
  count?: number;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-slate-700/50 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-700/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-slate-400">{icon}</span>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
            {title}
          </span>
          {count !== undefined && (
            <span className="text-[9px] font-bold bg-slate-600 text-slate-300 px-1.5 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        <span className="text-slate-500">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      {open && <div className="px-5 pb-4 accordion-content">{children}</div>}
    </div>
  );
}

interface Props {
  selectedNode: { type: string; id: string; data: any } | null;
  schema: SchemaData;
}

export default function DetailsPanel({ selectedNode, schema }: Props) {
  if (!selectedNode) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-slate-500 p-8 text-center space-y-4">
        <div className="p-5 bg-slate-800 rounded-2xl shadow-inner">
          <Database size={28} className="text-slate-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-400 mb-1">No Entity Selected</p>
          <p className="text-xs text-slate-600 leading-relaxed max-w-[240px]">
            Click any entity or relationship node in the diagram to view its structural details and constraints.
          </p>
        </div>
      </div>
    );
  }

  const data = selectedNode.data;
  const isHierarchy = selectedNode.type === "hierarchyNode";
  const isEntity = selectedNode.type === "entityNode";
  const isRelationship = selectedNode.type === "relationshipNode";
  const isCustomer = data.id === "customer";

  // Find related relationships for the selected entity
  const relatedRelationships = isEntity
    ? schema.relationships.filter((r) =>
        r.connections.some((c) => c.entityId === data.id)
      )
    : [];

  return (
    <div className="h-full overflow-y-auto bg-slate-900 details-scroll">
      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-5 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-700/50">
        {/* Type badge */}
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest mb-3",
            isEntity && "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30",
            isRelationship && "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30",
            isHierarchy && "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30",
          )}
        >
          {data.type || (isHierarchy ? "Hierarchy Constraint" : "Relationship")}
        </span>

        {/* Entity name */}
        <h2 className="text-xl font-black text-white mb-1 tracking-tight">
          {data.name || (isHierarchy ? data.id?.toUpperCase() : "")}
        </h2>

        {/* Tier indicator */}
        {data.tier && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded ring-1 ring-slate-700">
              Tier {data.tier}
            </span>
            <span className="text-[10px] font-semibold text-slate-500 capitalize">
              {data.tierLabel}
            </span>
          </div>
        )}
      </div>

      {/* ── Secure View Warning (CUSTOMER only) ── */}
      {isCustomer && (
        <div className="mx-4 mt-4 p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-2.5">
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wide mb-1">
                ⚠️ Secure View Restriction
              </p>
              <p className="text-[11px] text-amber-200/80 leading-relaxed">
                This role&apos;s read-access is <strong className="text-amber-300">strictly limited</strong> to
                the <code className="bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-mono text-[10px]">
                  vw_customer_journey
                </code> secure database view. No direct table access is permitted.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Accordion: Description ── */}
      <div className="mt-2">
        <AccordionSection
          title="Description"
          icon={<Database size={13} />}
          defaultOpen={true}
        >
          <p className="text-[12px] text-slate-400 leading-relaxed bg-slate-800 p-3.5 rounded-lg border border-slate-700/50">
            {data.description || "System constraint definition."}
          </p>
        </AccordionSection>

        {/* ── Accordion: Attributes ── */}
        {data.attributes && data.attributes.length > 0 && (
          <AccordionSection
            title="Attributes"
            icon={<Shield size={13} />}
            defaultOpen={true}
            count={data.attributes.length}
          >
            <div className="space-y-1.5">
              {data.attributes.map((attr: Attribute, idx: number) => (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center p-2.5 rounded-lg border transition-colors",
                    attr.type === "PK" && "bg-amber-500/5 border-amber-500/20",
                    attr.type === "FK" && "bg-purple-500/5 border-purple-500/20",
                    attr.type === "PK-FK" && "bg-indigo-500/5 border-indigo-500/20",
                    attr.type === "normal" && "bg-slate-800/50 border-slate-700/30",
                  )}
                >
                  <span className="flex-1 text-[12px] font-mono font-semibold text-slate-300 truncate">
                    {attr.name}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {attr.dataType && (
                      <span className="text-[9px] font-mono text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded">
                        {attr.dataType}
                      </span>
                    )}
                    {attr.type !== "normal" && (
                      <span
                        className={cn(
                          "text-[9px] font-extrabold px-2 py-0.5 rounded-full",
                          attr.type === "PK" && "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30",
                          attr.type === "FK" && "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/30",
                          attr.type === "PK-FK" && "bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30",
                        )}
                      >
                        {attr.type}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>
        )}

        {/* ── Accordion: Connections (Relationship nodes) ── */}
        {data.connections && data.connections.length > 0 && (
          <AccordionSection
            title="Connections"
            icon={<Link2 size={13} />}
            defaultOpen={true}
            count={data.connections.length}
          >
            <div className="space-y-2">
              {data.connections.map((conn: any, idx: number) => {
                const entity = schema.entities.find((e) => e.id === conn.entityId);
                return (
                  <div key={idx} className="p-3 bg-orange-500/5 rounded-lg border border-orange-500/20">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-bold text-orange-300 text-[12px]">
                        {entity?.name || conn.entityId}
                      </span>
                      <span className="bg-orange-500/15 px-2 py-0.5 rounded text-[10px] font-extrabold text-orange-400 ring-1 ring-orange-500/20">
                        1 : {conn.cardinality}
                      </span>
                    </div>
                    <div className="flex gap-4 text-[10px] text-orange-400/70">
                      <span>
                        Role: <strong className="text-orange-300">{conn.role}</strong>
                      </span>
                      <span>
                        Participation:{" "}
                        <strong className={cn(
                          "capitalize",
                          conn.participation === "total" ? "text-orange-300" : "text-orange-400/60",
                        )}>
                          {conn.participation}
                        </strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </AccordionSection>
        )}

        {/* ── Accordion: Related Relationships (Entity nodes) ── */}
        {isEntity && relatedRelationships.length > 0 && (
          <AccordionSection
            title="Relationships"
            icon={<Link2 size={13} />}
            defaultOpen={false}
            count={relatedRelationships.length}
          >
            <div className="space-y-2">
              {relatedRelationships.map((rel) => {
                const conn = rel.connections.find((c) => c.entityId === data.id);
                const otherConns = rel.connections.filter((c) => c.entityId !== data.id);
                return (
                  <div key={rel.id} className="p-3 bg-slate-800 rounded-lg border border-slate-700/50">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-blue-400 text-[11px] uppercase tracking-wide">
                        {rel.name}
                      </span>
                      {conn && (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-700 px-1.5 py-0.5 rounded">
                          {conn.cardinality} · {conn.participation}
                        </span>
                      )}
                    </div>
                    {otherConns.map((oc, i) => {
                      const target = schema.entities.find((e) => e.id === oc.entityId);
                      return (
                        <div key={i} className="text-[10px] text-slate-400 mt-1">
                          → <strong className="text-slate-300">{target?.name || oc.entityId}</strong>
                          <span className="text-slate-500 ml-2">({oc.cardinality}, {oc.participation})</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </AccordionSection>
        )}

        {/* ── Accordion: Hierarchy details ── */}
        {isHierarchy && (
          <AccordionSection
            title="Hierarchy Details"
            icon={<Shield size={13} />}
            defaultOpen={true}
          >
            <div className="p-3.5 bg-amber-500/5 rounded-lg border border-amber-500/20">
              <p className="text-[11px] text-amber-300 mb-2">
                <strong>Type:</strong>{" "}
                <span className="capitalize">{data.type}</span>
              </p>
              <p className="text-[11px] text-amber-300 mb-2">
                <strong>Participation:</strong>{" "}
                <span className="capitalize">{data.participation}</span>
              </p>
              <p className="text-[11px] text-amber-300 mb-2">
                <strong>Superclass:</strong>{" "}
                {schema.entities.find((e) => e.id === data.superclassId)?.name || data.superclassId}
              </p>
              <p className="text-[11px] text-amber-300">
                <strong>Subclasses:</strong>{" "}
                {data.subclassIds
                  ?.map((id: string) => schema.entities.find((e) => e.id === id)?.name || id)
                  .join(", ")}
              </p>
            </div>
          </AccordionSection>
        )}
      </div>
    </div>
  );
}
