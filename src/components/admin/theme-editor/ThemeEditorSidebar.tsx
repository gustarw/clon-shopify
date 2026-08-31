"use client";

import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  GripVertical,
  Layers,
  Plus,
  Settings,
  ChevronRight,
} from "lucide-react";
import { ThemeConfig } from "@/lib/repo/theme";
import { cn } from "@/components/ui/cn";

interface ThemeEditorSidebarProps {
  theme: ThemeConfig;
  selectedSectionId: string | null;
  activeRightTab: "section" | "theme_settings" | null;
  onSelectSection: (id: string | null) => void;
  onOpenThemeSettings: () => void;
  onUpdateTheme: (updated: Partial<ThemeConfig>) => void;
  onOpenAddModal: () => void;
}

export function ThemeEditorSidebar({
  theme,
  selectedSectionId,
  activeRightTab,
  onSelectSection,
  onOpenThemeSettings,
  onUpdateTheme,
  onOpenAddModal,
}: ThemeEditorSidebarProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function handleReorder(fromIndex: number, toIndex: number) {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= theme.sections.length ||
      toIndex >= theme.sections.length
    )
      return;
    const newSections = [...theme.sections];
    const [moved] = newSections.splice(fromIndex, 1);
    newSections.splice(toIndex, 0, moved);
    onUpdateTheme({ sections: newSections });
  }

  function moveSection(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= theme.sections.length) return;
    handleReorder(index, targetIndex);
  }

  function toggleSectionVisibility(index: number, e: React.MouseEvent) {
    e.stopPropagation();
    const newSections = [...theme.sections];
    newSections[index] = {
      ...newSections[index],
      enabled: !newSections[index].enabled,
    };
    onUpdateTheme({ sections: newSections });
  }

  return (
    <div className="flex h-full flex-col bg-[#ffffff]">
      {/* Top Tab Switcher - Pill Container */}
      <div className="p-3 border-b border-[#ebebeb] bg-[#ffffff] shrink-0">
        <div className="flex p-1 rounded-full bg-[#f7f7f7] border border-[#ebebeb] gap-1">
          <button
            type="button"
            onClick={() => {
              if (!selectedSectionId && theme.sections[0]) {
                onSelectSection(theme.sections[0].id);
              } else if (selectedSectionId) {
                onSelectSection(selectedSectionId);
              }
            }}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full py-1.5 text-xs font-medium transition-all cursor-pointer",
              activeRightTab === "section" || (!activeRightTab && selectedSectionId)
                ? "bg-[#ffffff] text-[#222222] shadow-2xs font-bold"
                : "text-[#6a6a6a] hover:text-[#222222]"
            )}
          >
            <Layers className="size-3.5 text-[#ff385c]" />
            <span>Seções ({theme.sections.length})</span>
          </button>

          <button
            type="button"
            onClick={onOpenThemeSettings}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-full py-1.5 text-xs font-medium transition-all cursor-pointer",
              activeRightTab === "theme_settings"
                ? "bg-[#ffffff] text-[#222222] shadow-2xs font-bold"
                : "text-[#6a6a6a] hover:text-[#222222]"
            )}
          >
            <Settings className="size-3.5 text-[#6a6a6a]" />
            <span>Configurações</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Left Section Tree */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-5">
        {/* Header Group */}
        <div className="space-y-1.5">
          <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-[#6a6a6a]">
            Cabeçalho
          </div>
          <div className="rounded-xl border border-[#ebebeb] bg-[#f7f7f7] p-2 space-y-1 text-xs font-medium text-[#222222]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#ebebeb]">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#ff385c]" />
                <span className="font-bold text-[#222222]">Barra de Anúncios</span>
              </div>
              <span className="text-[10px] text-[#6a6a6a] font-normal">Global</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#ebebeb]">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#ff385c]" />
                <span className="font-bold text-[#222222]">Cabeçalho Principal</span>
              </div>
              <span className="text-[10px] text-[#6a6a6a] font-normal">Fixo</span>
            </div>
          </div>
        </div>

        {/* Template Sections List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6a6a6a]">
              Template da Página ({theme.sections.length})
            </span>
            <span className="inline-flex text-[10px] font-semibold text-[#222222] bg-[#f7f7f7] border border-[#ebebeb] py-0.5 px-2 rounded-full">
              OS 2.0
            </span>
          </div>

          <div className="space-y-1.5">
            {theme.sections.map((sec, idx) => {
              const isDragging = draggedIndex === idx;
              const isDragOver = dragOverIndex === idx && draggedIndex !== idx;
              const isSelected = selectedSectionId === sec.id && activeRightTab === "section";

              return (
                <div
                  key={sec.id}
                  draggable={true}
                  onDragStart={(e) => {
                    setDraggedIndex(idx);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", `${idx}`);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverIndex !== idx) setDragOverIndex(idx);
                  }}
                  onDragLeave={() => {
                    if (dragOverIndex === idx) setDragOverIndex(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIndex !== null && draggedIndex !== idx) {
                      handleReorder(draggedIndex, idx);
                    }
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  onClick={() => onSelectSection(sec.id)}
                  className={cn(
                    "group flex items-center justify-between rounded-xl border p-2.5 text-xs transition-all select-none cursor-pointer",
                    isDragging && "opacity-35 border-dashed border-[#222222] bg-[#f7f7f7] scale-[0.98]",
                    isDragOver && "border-[#222222] ring-2 ring-[#222222] bg-[#ffffff] shadow-md",
                    isSelected && "bg-[#222222] text-[#ffffff] shadow-xs",
                    !isSelected && !isDragging && !isDragOver && (
                      !sec.enabled
                        ? "border-[#ebebeb] bg-[#f7f7f7] opacity-60 text-[#6a6a6a]"
                        : "border-[#ebebeb] bg-[#ffffff] hover:border-[#222222] text-[#222222]"
                    )
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "cursor-grab active:cursor-grabbing p-1 rounded hover:bg-black/10 transition-colors",
                        isSelected ? "text-white/60 group-hover:text-white" : "text-[#c1c1c1] group-hover:text-[#222222]"
                      )}
                      title="Arrastar para reordenar"
                    >
                      <GripVertical className="size-3.5 shrink-0" />
                    </span>
                    <div className="truncate">
                      <div className={cn("truncate font-bold", isSelected ? "text-white" : "text-[#222222]")}>
                        {sec.name}
                      </div>
                      <div className={cn("text-[10px] font-normal font-mono mt-0.5", isSelected ? "text-[#c1c1c1]" : "text-[#6a6a6a]")}>
                        {sec.type}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(idx, "up");
                      }}
                      disabled={idx === 0}
                      className={cn(
                        "rounded p-1 disabled:opacity-20 cursor-pointer transition-colors",
                        isSelected ? "text-white/70 hover:bg-white/20 hover:text-white" : "text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222]"
                      )}
                      title="Mover para cima"
                    >
                      <ArrowUp className="size-3" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(idx, "down");
                      }}
                      disabled={idx === theme.sections.length - 1}
                      className={cn(
                        "rounded p-1 disabled:opacity-20 cursor-pointer transition-colors",
                        isSelected ? "text-white/70 hover:bg-white/20 hover:text-white" : "text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222]"
                      )}
                      title="Mover para baixo"
                    >
                      <ArrowDown className="size-3" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => toggleSectionVisibility(idx, e)}
                      className={cn(
                        "rounded p-1 cursor-pointer transition-colors",
                        isSelected ? "text-white/70 hover:bg-white/20 hover:text-white" : "text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222]"
                      )}
                      title={sec.enabled ? "Ocultar" : "Mostrar"}
                    >
                      {sec.enabled ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5 text-rose-500" />}
                    </button>

                    <ChevronRight className={cn("size-3.5 ml-1", isSelected ? "text-white/70" : "text-[#c1c1c1]")} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Section Button */}
          <button
            type="button"
            onClick={onOpenAddModal}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-2 border-dashed border-[#ebebeb] bg-[#ffffff] py-2.5 text-xs font-bold text-[#222222] hover:border-[#222222] hover:bg-[#f7f7f7] transition-all cursor-pointer"
          >
            <Plus className="size-4 text-[#ff385c]" />
            <span>Adicionar Seção</span>
          </button>
        </div>

        {/* Footer Group */}
        <div className="space-y-1.5 pt-3 border-t border-[#ebebeb]">
          <div className="px-2 text-[11px] font-bold uppercase tracking-wider text-[#6a6a6a]">
            Rodapé
          </div>
          <div className="rounded-xl border border-[#ebebeb] bg-[#f7f7f7] p-2 text-xs font-medium text-[#222222]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-[#ebebeb]">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#ff385c]" />
                <span className="font-bold text-[#222222]">Rodapé e Pagamentos</span>
              </div>
              <span className="text-[10px] text-[#6a6a6a] font-normal">Global</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
