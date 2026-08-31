"use client";

import { useMemo, useState } from "react";
import { money } from "@/lib/money";

interface Point {
  date: string;
  label: string;
  cents: number;
}

/** Lightweight dependency-free area chart with Airbnb Rausch coral curve. */
export function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const { path, area, points } = useMemo(() => {
    const W = 800;
    const H = 240;
    const PAD = { top: 16, right: 12, bottom: 28, left: 12 };
    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const step = data.length > 1 ? innerW / (data.length - 1) : 0;
    const max = Math.max(1, ...data.map((d) => d.cents));

    const pts = data.map((d, i) => ({
      x: PAD.left + i * step,
      y: PAD.top + innerH - (d.cents / max) * innerH,
      d,
    }));

    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
    const areaPath =
      pts.length > 1
        ? `${line} L${pts[pts.length - 1].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${pts[0].x.toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`
        : "";

    return { path: line, area: areaPath, points: pts };
  }, [data]);

  if (data.length === 0) {
    return <p className="py-16 text-center text-sm text-[#6a6a6a]">Sem dados no período.</p>;
  }

  const tickEvery = Math.max(1, Math.ceil(data.length / 6));
  const active = hover !== null ? points[hover] : null;

  return (
    <div className="relative select-none">
      <svg
        viewBox="0 0 800 240"
        className="w-full overflow-visible"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 800;
          let nearest = 0;
          let best = Infinity;
          points.forEach((p, i) => {
            const d = Math.abs(p.x - x);
            if (d < best) {
              best = d;
              nearest = i;
            }
          });
          setHover(nearest);
        }}
      >
        <defs>
          <linearGradient id="rev-fill-airbnb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff385c" stopOpacity="0.14" />
            <stop offset="90%" stopColor="#ff385c" stopOpacity="0.01" />
            <stop offset="100%" stopColor="#ff385c" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Subtle Horizontal Hairline Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((f) => {
          const y = 16 + (240 - 16 - 28) * (1 - f);
          return (
            <line key={f} x1="12" x2="788" y1={y} y2={y} stroke="#ebebeb" strokeDasharray="3 3" strokeWidth="1" />
          );
        })}

        {area && <path d={area} fill="url(#rev-fill-airbnb)" />}
        {path && <path d={path} fill="none" stroke="#ff385c" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />}

        {/* Date Labels */}
        {points.map((p, i) =>
          i % tickEvery === 0 || i === points.length - 1 ? (
            <text key={i} x={p.x} y="234" textAnchor="middle" className="fill-[#6a6a6a] font-normal" style={{ fontSize: 11 }}>
              {p.d.label}
            </text>
          ) : null
        )}

        {/* Active hover crosshair and indicator */}
        {active && (
          <g>
            <line x1={active.x} x2={active.x} y1="16" y2="212" stroke="#ebebeb" strokeDasharray="3 3" strokeWidth="1" />
            <circle cx={active.x} cy={active.y} r="5" fill="#ff385c" stroke="#ffffff" strokeWidth="2" />
          </g>
        )}
      </svg>

      {/* Tooltip Pill */}
      {active && (
        <div
          className="pointer-events-none absolute -top-2 z-20 -translate-x-1/2 rounded-full bg-[#222222] px-3.5 py-1.5 text-xs text-white shadow-airbnb-modal border border-[#333333]"
          style={
            points.length > 1
              ? { left: `${(active.x / 800) * 100}%` }
              : { left: "50%" }
          }
        >
          <span className="font-bold text-white">{money(active.d.cents)}</span>
          <span className="ml-1.5 text-[11px] font-normal text-[#c1c1c1]">({active.d.label})</span>
        </div>
      )}
    </div>
  );
}
