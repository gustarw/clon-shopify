"use client";

import React from "react";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";
import { useAdminAi } from "./AdminAiProvider";
import { cn } from "@/components/ui/cn";

export function AdminAiTrigger() {
  const { openAi, isOpen } = useAdminAi();

  if (isOpen) return null;

  return (
    <aside
      aria-label="Shopify Sidekick Co-Pilot"
      className="fixed bottom-6 right-6 z-40 flex flex-col items-end pointer-events-none"
    >
      <button
        type="button"
        onClick={openAi}
        className={cn(
          "pointer-events-auto group relative flex items-center gap-2.5 rounded-full bg-[#222222] text-white px-5 py-3 shadow-airbnb-modal",
          "hover:bg-[#000000] active:scale-[0.96] transition-all duration-150 ease-out cursor-pointer"
        )}
        aria-label="Abrir Shopify Sidekick AI"
      >
        <span className="relative flex size-4.5 items-center justify-center">
          <AdminIcon
            name={SOLAR_ICONS.sparkles}
            size={16}
            className="text-[#ff385c] group-hover:rotate-12 transition-transform duration-200"
          />
        </span>
        <span className="text-xs font-bold tracking-wide">
          Sidekick IA
        </span>
        <span className="flex size-2 rounded-full bg-[#ff385c]" />
      </button>
    </aside>
  );
}
