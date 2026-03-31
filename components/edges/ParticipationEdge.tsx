"use client";

import { BaseEdge, getStraightPath, type EdgeProps } from "@xyflow/react";

/**
 * ParticipationEdge
 * - Total participation  → two parallel lines (double line)
 * - Partial participation → one single line
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
  data,
  label,
  labelStyle,
  labelBgStyle,
  markerEnd,
}: EdgeProps) {
  const isTotal = data?.participation === "total";
  const color = (data?.lineColor as string) || "#64748b";

  // Compute straight path between source and target
  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
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
              x={labelX - 10}
              y={labelY - 10}
              width={20}
              height={20}
              rx={4}
              fill={labelBgStyle?.fill || "#f8fafc"}
              fillOpacity={labelBgStyle?.fillOpacity || 0.9}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fontSize: 13,
                fontWeight: 700,
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
  // We offset the path perpendicular to the line direction
  const dx = targetX - sourceX;
  const dy = targetY - sourceY;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  // Perpendicular unit vector
  const px = -dy / len;
  const py = dx / len;
  const gap = 3; // half-gap between the two lines

  const path1 = "M " + (sourceX + px * gap) + " " + (sourceY + py * gap) +
    " L " + (targetX + px * gap) + " " + (targetY + py * gap);
  const path2 = "M " + (sourceX - px * gap) + " " + (sourceY - py * gap) +
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
            x={labelX - 10}
            y={labelY - 10}
            width={20}
            height={20}
            rx={4}
            fill={labelBgStyle?.fill || "#f8fafc"}
            fillOpacity={labelBgStyle?.fillOpacity || 0.9}
          />
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="central"
            style={{
              fontSize: 13,
              fontWeight: 700,
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
