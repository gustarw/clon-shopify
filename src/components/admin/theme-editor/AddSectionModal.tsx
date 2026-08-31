"use client";

import { useState } from "react";
import {
  Code,
  Columns,
  Grid,
  HelpCircle,
  Image,
  LayoutTemplate,
  LucideIcon,
  Mail,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tag,
  Video,
  X,
  Zap,
} from "lucide-react";
import { SECTION_TEMPLATES } from "./default-presets";
import { SectionConfig } from "@/lib/repo/theme";
import { cn } from "@/components/ui/cn";

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (section: SectionConfig) => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutTemplate,
  Zap,
  ShieldCheck,
  ShoppingBag,
  Grid,
  Sparkles,
  Tag,
  Image,
  Video,
  MessageSquare,
  HelpCircle,
  Columns,
  Mail,
  Code,
};

const CATEGORIES = [
  "Todos",
  "Destaques",
  "Produtos & Coleções",
  "Mídia & Imagem",
  "Texto & Prova Social",
  "Avançado",
] as const;

export function AddSectionModal({ isOpen, onClose, onAddSection }: AddSectionModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const filteredTemplates = SECTION_TEMPLATES.filter((tpl) => {
    const matchesCat = selectedCategory === "Todos" || tpl.category === selectedCategory;
    const matchesSearch =
      tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/25 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      <div className="relative z-10 flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-airbnb-modal border border-[#ebebeb] overflow-hidden animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ebebeb] px-6 py-4 bg-white">
          <div>
            <h2 className="text-base font-bold text-[#222222]">Adicionar Nova Seção ao Tema</h2>
            <p className="text-xs text-[#6a6a6a] mt-0.5">Escolha uma seção modular compatível com Shopify OS 2.0</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8.5 rounded-full text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="size-4.5 stroke-[2]" />
          </button>
        </div>

        {/* Search & Categories */}
        <div className="border-b border-[#ebebeb] p-4 space-y-3 bg-[#f7f7f7]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6a6a6a]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar seção por nome ou descrição..."
              className="h-10 w-full rounded-full border border-[#ebebeb] bg-white pl-10 pr-4 text-xs text-[#222222] placeholder:text-[#6a6a6a] focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                  selectedCategory === cat
                    ? "bg-[#222222] text-[#ffffff] shadow-xs"
                    : "bg-white text-[#6a6a6a] border border-[#ebebeb] hover:bg-[#f7f7f7] hover:text-[#222222]"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sections Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white">
          <div className="grid gap-3.5 sm:grid-cols-2">
            {filteredTemplates.map((tpl) => {
              const IconComp = ICON_MAP[tpl.iconName] || LayoutTemplate;
              return (
                <div
                  key={tpl.type}
                  className="group relative flex flex-col justify-between rounded-xl border border-[#ebebeb] bg-white p-4 transition-all hover:border-[#222222] hover:shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-xl bg-[#f7f7f7] text-[#222222] border border-[#ebebeb] group-hover:bg-[#222222] group-hover:text-white transition-colors">
                        <IconComp className="size-4.5" />
                      </span>
                      <div>
                        <div className="text-xs font-bold text-[#222222] group-hover:text-[#222222] transition-colors">
                          {tpl.name}
                        </div>
                        <span className="inline-flex text-[10px] text-[#6a6a6a] font-normal mt-0.5">
                          {tpl.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#6a6a6a] line-clamp-2 leading-relaxed font-normal">
                      {tpl.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#ebebeb] flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const newSec = tpl.createDefault();
                        onAddSection(newSec);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#222222] text-[#ffffff] px-4 py-1.5 text-xs font-semibold shadow-xs hover:bg-[#000000] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <Plus className="size-3.5 text-[#ff385c]" />
                      <span>Adicionar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="py-12 text-center text-xs text-[#6a6a6a]">
              Nenhuma seção encontrada com os termos buscados.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#ebebeb] bg-[#f7f7f7] px-6 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#ebebeb] bg-white px-4 py-2 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] transition-all cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
