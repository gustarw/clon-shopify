"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpDown } from "lucide-react";

const OPTIONS = [
  { value: "recentes", label: "Mais recentes" },
  { value: "preco-asc", label: "Menor preço" },
  { value: "preco-desc", label: "Maior preço" },
  { value: "nome", label: "Nome (A–Z)" },
];

export function SortSelect({ value }: { value: string }) {
  const [selected, setSelected] = useState(value);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => setSelected(value), [value]);

  function onChange(next: string) {
    setSelected(next);
    const sp = new URLSearchParams(searchParams.toString());
    if (next === "recentes") sp.delete("ordem");
    else sp.set("ordem", next);
    sp.delete("pagina");
    router.replace(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="relative inline-flex items-center">
      <ArrowUpDown className="pointer-events-none absolute left-3 size-4 text-ink-400" />
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 cursor-pointer appearance-none rounded-lg border border-ink-300 bg-white pl-9 pr-8 text-sm font-medium text-ink-700 hover:border-ink-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
        aria-label="Ordenar por"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
