"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";
import { useStoreAi } from "./StoreAiProvider";
import { cn } from "@/components/ui/cn";

export function StoreAiTrigger() {
  const { openAi, isOpen } = useStoreAi();
  const [showBubble, setShowBubble] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowBubble(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (isOpen) return null;

  return (
    <aside
      aria-label="Assistente Virtual"
      className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 pointer-events-none"
    >
      {/* Floating Prompt Bubble */}
      {showBubble && (
        <div className="pointer-events-auto relative flex items-center gap-2.5 rounded-2xl border border-brand-200/90 bg-white/95 px-4 py-2.5 text-xs font-medium text-ink-800 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-md outline-1 outline-black/5 animate-fade-up">
          <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[12px] text-ink-700">
            Precisa de ajuda ou recomendações? <strong className="text-ink-950 font-bold">Fale com a IA!</strong>
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBubble(false);
            }}
            className="text-ink-400 hover:text-ink-700 p-1 rounded-md active:scale-[0.96] transition-transform duration-150 ease-out"
            aria-label="Fechar dica"
          >
            <X className="size-3.5 stroke-[2]" />
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={openAi}
        className={cn(
          "pointer-events-auto group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-700 px-4.5 py-3 text-white shadow-[0_4px_16px_rgba(37,99,235,0.35),0_1px_3px_rgba(0,0,0,0.1)]",
          "outline-1 outline-white/20 hover:shadow-[0_6px_24px_rgba(37,99,235,0.5)] active:scale-[0.96] transition-all duration-150 ease-out"
        )}
        aria-label="Abrir assistente de inteligência artificial"
      >
        <span className="relative flex size-5 items-center justify-center">
          <Sparkles className="size-4.5 stroke-[2] text-amber-300 group-hover:rotate-12 transition-transform duration-200" />
        </span>
        <span className="text-xs font-bold tracking-wide uppercase">
          Assistente IA
        </span>
        <span className="flex size-2 rounded-full bg-emerald-400 ring-2 ring-brand-900 animate-pulse" />
      </button>
    </aside>
  );
}
