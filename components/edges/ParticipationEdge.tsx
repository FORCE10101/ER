"use client";

import { BaseEdge, getSmoothStepPath, type EdgeProps } from "@xyflow/react";

/**
 * ParticipationEdge
 * - Total participation  → two parallel lines (double line) — smooth step routing
 * - Partial participation → one single line — smooth step routing
 *
 * Custom data props:
 *   data.participation: "total" | "partial"
 *   data.lineColor:     stroke colour (optional, defaults to slate)
 */
export default function ParticipationEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  label,
  labelStyle,
  labelBgStyle,
  markerEnd,
}: EdgeProps) {
  const isTotal = data?.participation === "total";
  const color = (data?.lineColor as string) || "#64748b";

  // Use smooth step path for orthogonal routing
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 12,
  });

  if (!isTotal) {
    // ── Single line (partial participation) ──
    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          style={{ stroke: color, strokeWidth: 1.8 }}
          markerEnd={markerEnd}
        />
        {label && (
          <>
            <rect
              x={labelX - 12}
              y={labelY - 11}
              width={24}
              height={22}
              rx={6}
              fill={labelBgStyle?.fill || "#f8fafc"}
              fillOpacity={labelBgStyle?.fillOpacity || 0.92}
              stroke="#e2e8f0"
              strokeWidth={0.5}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontSize: 12,
                fontWeight: 800,
                fill: labelStyle?.fill || "#475569",
                ...(labelStyle as any),
              }}
            >
              {label as string}
            </text>
          </>
        )}
      </>
    );
  }

  // ── Double line (total participation) ──
  // Offset the path perpendicular to the line direction
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const gap = 3;

  // Two parallel straight-line paths for the double line effect
  const path1 =
    "M " + (sourceX + px * gap) + " " + (sourceY + py * gap) +
    " L " + (targetX + px * gap) + " " + (targetY + py * gap);
  const path2 =
    "M " + (sourceX - px * gap) + " " + (sourceY - py * gap) +
    " L " + (targetX - px * gap) + " " + (targetY - py * gap);

  return (
    <>
      <path
        id={id + "_1"}
        d={path1}
        style={{ stroke: color, strokeWidth: 2, fill: "none" }}
        markerEnd={markerEnd as any}
      />
      <path
        id={id + "_2"}
        d={path2}
        style={{ stroke: color, strokeWidth: 2, fill: "none" }}
        markerEnd={markerEnd as any}
      />
      {label && (
        <>
          <rect
            x={labelX - 12}
            y={labelY - 11}
            width={24}
            height={22}
            rx={6}
            fill={labelBgStyle?.fill || "#f8fafc"}
            fillOpacity={labelBgStyle?.fillOpacity || 0.92}
            stroke="#e2e8f0"
            strokeWidth={0.5}
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: 12,
              fontWeight: 800,
              fill: labelStyle?.fill || "#475569",
              ...(labelStyle as any),
            }}
          >
            {label as string}
          </text>
        </>
      )}
    </>
  );
}
