/* Generates SVG product images into public/products/ */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "public", "products");
fs.mkdirSync(OUT, { recursive: true });

interface Palette { from: string; to: string; accent: string; }

const palettes: Palette[] = [
  { from: "#6366f1", to: "#8b5cf6", accent: "#c4b5fd" },
  { from: "#0ea5e9", to: "#06b6d4", accent: "#67e8f9" },
  { from: "#10b981", to: "#14b8a6", accent: "#6ee7b7" },
  { from: "#f59e0b", to: "#f97316", accent: "#fde68a" },
  { from: "#ef4444", to: "#ec4899", accent: "#fbcfe8" },
  { from: "#8b5cf6", to: "#d946ef", accent: "#e9d5ff" },
  { from: "#14b8a6", to: "#0ea5e9", accent: "#99f6e4" },
  { from: "#f43f5e", to: "#f59e0b", accent: "#fecdd3" },
  { from: "#06b6d4", to: "#3b82f6", accent: "#a5f3fc" },
  { from: "#22c55e", to: "#84cc16", accent: "#bbf7d0" },
  { from: "#a855f7", to: "#6366f1", accent: "#d8b4fe" },
  { from: "#f97316", to: "#ef4444", accent: "#fed7aa" },
  { from: "#3b82f6", to: "#8b5cf6", accent: "#bfdbfe" },
  { from: "#ec4899", to: "#f43f5e", accent: "#fbcfe8" },
  { from: "#10b981", to: "#0ea5e9", accent: "#6ee7b7" },
  { from: "#f59e0b", to: "#ef4444", accent: "#fde68a" },
  { from: "#8b5cf6", to: "#0ea5e9", accent: "#c4b5fd" },
  { from: "#06b6d4", to: "#10b981", accent: "#a5f3fc" },
  { from: "#6366f1", to: "#ec4899", accent: "#c7d2fe" },
  { from: "#14b8a6", to: "#f59e0b", accent: "#99f6e4" },
];

// Simple line-art glyph drawn per product index.
function glyph(i: number, accent: string): string {
  const s = `stroke="${accent}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  switch (i % 8) {
    case 0: // headphones
      return `<path d="M150 200 a100 100 0 0 1 200 0" ${s}/><rect x="130" y="195" width="46" height="72" rx="16" fill="${accent}"/><rect x="324" y="195" width="46" height="72" rx="16" fill="${accent}"/>`;
    case 1: // watch
      return `<rect x="185" y="160" width="130" height="120" rx="26" ${s}/><path d="M215 160 l10 -60 h50 l10 60 M215 280 l10 60 h50 l10 -60" ${s}/><path d="M250 205 v30 h28" ${s}/>`;
    case 2: // speaker
      return `<rect x="180" y="140" width="140" height="180" rx="28" ${s}/><circle cx="250" cy="195" r="18" fill="${accent}"/><circle cx="250" cy="262" r="34" ${s}/>`;
    case 3: // laptop
      return `<rect x="150" y="150" width="200" height="128" rx="12" ${s}/><path d="M120 300 h260 l-18 -22 h-224 z" fill="${accent}"/>`;
    case 4: // t-shirt
      return `<path d="M165 165 l50 -35 35 26 35 -26 50 35 -30 42 -25 -14 v120 h-110 v-120 l-25 14 z" ${s}/>`;
    case 5: // shoe
      return `<path d="M130 275 q5 -70 70 -78 l40 -6 q22 -4 38 16 l26 32 q30 8 30 30 v6 z" ${s}/><path d="M210 197 l18 22 M240 190 l18 26" ${s}/>`;
    case 6: // lamp
      return `<path d="M195 130 h110 l34 70 h-178 z" ${s}/><path d="M250 200 v80" ${s}/><path d="M205 300 h90" ${s}/>`;
    default: // box/package
      return `<path d="M145 200 l105 -55 105 55 v110 l-105 55 -105 -55 z" ${s}/><path d="M145 200 l105 55 105 -55 M250 255 v110" ${s}/>`;
  }
}

function build(i: number): string {
  const p = palettes[i % palettes.length];
  const id = `g${i}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${p.from}"/>
      <stop offset="1" stop-color="${p.to}"/>
    </linearGradient>
    <radialGradient id="${id}h" cx="0.3" cy="0.2" r="0.9">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#${id})"/>
  <rect width="600" height="600" fill="url(#${id}h)"/>
  <circle cx="520" cy="80" r="130" fill="#ffffff" opacity="0.06"/>
  <circle cx="60" cy="540" r="170" fill="#000000" opacity="0.06"/>
  <g transform="translate(-30 -40)">
    ${glyph(i, p.accent)}
  </g>
</svg>
`;
}

let count = 0;
for (let i = 0; i < 20; i++) {
  const file = path.join(OUT, `p${String(i + 1).padStart(2, "0")}.svg`);
  fs.writeFileSync(file, build(i));
  count++;
}

const def = palettes[0];
fs.writeFileSync(
  path.join(OUT, "default.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
  <defs><linearGradient id="d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${def.from}"/><stop offset="1" stop-color="${def.to}"/></linearGradient></defs>
  <rect width="600" height="600" fill="url(#d)"/>
  <g transform="translate(-30 -40)">${glyph(7, def.accent)}</g>
</svg>`
);

console.log(`Gerados ${count + 1} SVGs em public/products/`);
