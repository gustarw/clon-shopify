"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Download,
  ExternalLink,
  Laptop,
  MoreHorizontal,
  Redo2,
  RefreshCw,
  Save,
  Smartphone,
  Tablet,
  Undo2,
  Upload,
} from "lucide-react";
import { cn } from "@/components/ui/cn";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";
import { THEME_PRESETS, ThemePresetDefinition } from "./default-presets";

export type ViewportMode = "desktop" | "tablet" | "mobile";

interface ThemeEditorTopBarProps {
  currentThemeName?: string;
  onSelectThemePreset?: (preset: ThemePresetDefinition) => void;
  currentPage: string;
  onChangePage: (page: string) => void;
  viewportMode: ViewportMode;
  onChangeViewport: (mode: ViewportMode) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onViewLiveStore?: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (json: string) => void;
}

export function ThemeEditorTopBar({
  currentThemeName = "Dawn 15.0",
  onSelectThemePreset,
  currentPage,
  onChangePage,
  viewportMode,
  onChangeViewport,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isDirty,
  isSaving,
  onSave,
  onViewLiveStore,
  onReset,
  onExport,
  onImport,
}: ThemeEditorTopBarProps) {
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);

  const PAGES = [
    { id: "home", label: "Página Inicial (Home)", path: "/" },
    { id: "products", label: "Catálogo de Produtos", path: "/produtos" },
    { id: "cart", label: "Carrinho de Compras", path: "/carrinho" },
    { id: "account", label: "Minha Conta & Pedidos", path: "/conta" },
  ];

  const currentPageObj = PAGES.find((p) => p.id === currentPage) || PAGES[0];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#ebebeb] bg-[#ffffff] px-4 sm:px-6 text-[#222222]">
      {/* Left: Exit + Theme Switcher Dropdown */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/temas"
          className="flex size-9 items-center justify-center rounded-full border border-[#ebebeb] text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-all cursor-pointer"
          aria-label="Voltar para a lista de temas"
          title="Voltar ao Painel de Temas"
        >
          <ArrowLeft className="size-4 stroke-[2]" />
        </Link>

        {/* Theme Preset Switcher Dropdown */}
        <div className="relative border-l border-[#ebebeb] pl-3">
          <button
            type="button"
            onClick={() => {
              setThemeDropdownOpen((v) => !v);
              setPageDropdownOpen(false);
              setActionsMenuOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-full py-1.5 px-3 hover:bg-[#f7f7f7] text-[#222222] transition-colors cursor-pointer border border-transparent hover:border-[#ebebeb]"
          >
            <span className="flex size-7.5 items-center justify-center rounded-full bg-[#222222] text-white shadow-2xs">
              <AdminIcon name={SOLAR_ICONS.themes} size={15} />
            </span>
            <div className="hidden sm:flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#222222] leading-tight">
                  {currentThemeName}
                </span>
                <ChevronDown className="size-3 text-[#6a6a6a]" />
              </div>
              <span className="text-[10px] text-[#ff385c] font-semibold mt-0.5">Trocar Modelo</span>
            </div>
          </button>

          {themeDropdownOpen && (
            <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-[#ebebeb] bg-[#ffffff] p-3 shadow-airbnb-modal z-50 animate-fade-up">
              <div className="px-2 py-1 text-[11px] font-semibold text-[#6a6a6a] uppercase tracking-wider border-b border-[#ebebeb] pb-2 mb-2 flex items-center justify-between">
                <span>Biblioteca de Temas</span>
                <span className="inline-flex text-[10px] font-semibold text-[#222222] bg-[#f7f7f7] border border-[#ebebeb] py-0.5 px-2 rounded-full">
                  Shopify OS 2.0
                </span>
              </div>
              <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar p-0.5">
                {THEME_PRESETS.slice(0, 3).map((preset) => {
                  const isActive = currentThemeName.toLowerCase().includes(preset.id);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onSelectThemePreset?.(preset);
                        setThemeDropdownOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl p-2.5 text-left transition-all cursor-pointer",
                        isActive
                          ? "bg-[#222222] text-[#ffffff] shadow-xs"
                          : "text-[#222222] hover:bg-[#f7f7f7]"
                      )}
                    >
                      <div
                        className="size-4.5 rounded-full mt-0.5 shrink-0 border border-black/10 shadow-2xs"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={cn("text-xs font-bold", isActive ? "text-white" : "text-[#222222]")}>
                            {preset.name}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-0.5 text-[9px] font-semibold rounded-full",
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-[#f7f7f7] text-[#6a6a6a] border border-[#ebebeb]"
                            )}
                          >
                            {preset.badge}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "text-[11px] line-clamp-1 mt-0.5 font-normal",
                            isActive ? "text-[#c1c1c1]" : "text-[#6a6a6a]"
                          )}
                        >
                          {preset.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center: Page Selector + Viewport Switcher */}
      <div className="flex items-center gap-2.5">
        {/* Page Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setPageDropdownOpen((v) => !v)}
            className="h-9 rounded-full border border-[#ebebeb] bg-[#ffffff] px-4 text-xs font-semibold text-[#222222] hover:bg-[#f7f7f7] transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <span>{currentPageObj.label}</span>
            <ChevronDown className="size-3 text-[#6a6a6a]" />
          </button>

          {pageDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 rounded-2xl border border-[#ebebeb] bg-[#ffffff] p-2 shadow-airbnb-modal z-50 animate-fade-up">
              <div className="px-2.5 py-1 text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider">
                Páginas da Loja
              </div>
              {PAGES.map((page) => (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => {
                    onChangePage(page.id);
                    setPageDropdownOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-full px-3 py-2 text-xs text-left transition-colors cursor-pointer",
                    currentPage === page.id
                      ? "bg-[#222222] text-[#ffffff] font-bold"
                      : "text-[#222222] hover:bg-[#f7f7f7]"
                  )}
                >
                  <span>{page.label}</span>
                  {currentPage === page.id && <Check className="size-3.5" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Viewport Modes (Desktop / Tablet / Mobile) */}
        <div className="hidden md:flex items-center rounded-full border border-[#ebebeb] bg-[#f7f7f7] p-1 gap-1">
          <button
            type="button"
            onClick={() => onChangeViewport("desktop")}
            className={cn(
              "size-7.5 min-w-7.5 rounded-full flex items-center justify-center transition-all cursor-pointer",
              viewportMode === "desktop"
                ? "bg-[#ffffff] text-[#222222] shadow-2xs font-bold"
                : "text-[#6a6a6a] hover:text-[#222222]"
            )}
            title="Visualização Desktop"
          >
            <Laptop className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onChangeViewport("tablet")}
            className={cn(
              "size-7.5 min-w-7.5 rounded-full flex items-center justify-center transition-all cursor-pointer",
              viewportMode === "tablet"
                ? "bg-[#ffffff] text-[#222222] shadow-2xs font-bold"
                : "text-[#6a6a6a] hover:text-[#222222]"
            )}
            title="Visualização Tablet (768px)"
          >
            <Tablet className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onChangeViewport("mobile")}
            className={cn(
              "size-7.5 min-w-7.5 rounded-full flex items-center justify-center transition-all cursor-pointer",
              viewportMode === "mobile"
                ? "bg-[#ffffff] text-[#222222] shadow-2xs font-bold"
                : "text-[#6a6a6a] hover:text-[#222222]"
            )}
            title="Visualização Mobile (390px)"
          >
            <Smartphone className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Right: Undo/Redo + Status + Ver Loja + Actions + Save Button */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="hidden lg:flex items-center gap-1 border-r border-[#ebebeb] pr-2">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="size-8.5 min-w-8.5 rounded-full border border-[#ebebeb] text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
            title="Desfazer (⌘Z)"
          >
            <Undo2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="size-8.5 min-w-8.5 rounded-full border border-[#ebebeb] text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-all cursor-pointer"
            title="Refazer (⌘Y)"
          >
            <Redo2 className="size-3.5" />
          </button>
        </div>

        {/* Live Status indicator */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs text-[#6a6a6a] pr-1">
          {isDirty ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#b45309] bg-[#fffbeb] border border-[#fde68a] py-0.5 px-3 rounded-full">
              <span className="size-1.5 rounded-full bg-[#ff385c] animate-pulse" />
              Não salvo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] py-0.5 px-3 rounded-full">
              <span className="size-1.5 rounded-full bg-[#008a05]" />
              Salvo
            </span>
          )}
        </div>

        {/* Live Store Quick Trigger */}
        <button
          type="button"
          onClick={() => {
            if (onViewLiveStore) {
              onViewLiveStore();
            } else {
              window.open("/", "_blank");
            }
          }}
          className="h-9 hidden sm:flex items-center gap-1.5 rounded-full border border-[#ebebeb] bg-[#ffffff] px-4 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] transition-all cursor-pointer shadow-2xs"
          title="Salvar e visualizar loja ao vivo"
        >
          <ExternalLink className="size-3.5 text-[#ff385c]" />
          <span>Ver Loja</span>
        </button>

        {/* Actions Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setActionsMenuOpen((v) => !v)}
            className="size-9 min-w-9 rounded-full border border-[#ebebeb] bg-[#ffffff] text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            title="Mais ações do tema"
          >
            <MoreHorizontal className="size-4" />
          </button>

          {actionsMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-[#ebebeb] bg-[#ffffff] p-2 shadow-airbnb-modal z-50 animate-fade-up">
              <button
                type="button"
                onClick={() => {
                  setActionsMenuOpen(false);
                  if (onViewLiveStore) {
                    onViewLiveStore();
                  } else {
                    window.open("/", "_blank");
                  }
                }}
                className="flex w-full items-center justify-between rounded-full px-3 py-2 text-xs text-[#222222] hover:bg-[#f7f7f7] transition-colors cursor-pointer font-medium"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="size-3.5 text-[#ff385c]" /> Ver loja ao vivo
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExport();
                  setActionsMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-full px-3 py-2 text-xs text-[#222222] hover:bg-[#f7f7f7] transition-colors cursor-pointer font-medium"
              >
                <span className="flex items-center gap-2">
                  <Download className="size-3.5 text-[#6a6a6a]" /> Exportar tema (JSON)
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const json = prompt("Cole o JSON de configuração do tema para importar:");
                  if (json) onImport(json);
                  setActionsMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-full px-3 py-2 text-xs text-[#222222] hover:bg-[#f7f7f7] transition-colors cursor-pointer font-medium"
              >
                <span className="flex items-center gap-2">
                  <Upload className="size-3.5 text-[#6a6a6a]" /> Importar tema
                </span>
              </button>
              <div className="my-1 border-t border-[#ebebeb]" />
              <button
                type="button"
                onClick={() => {
                  if (confirm("Tem certeza que deseja restaurar as configurações padrão do tema?")) {
                    onReset();
                  }
                  setActionsMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-full px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer font-medium"
              >
                <RefreshCw className="size-3.5" /> Redefinir para o padrão
              </button>
            </div>
          )}
        </div>

        {/* Primary Save Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="h-9 flex items-center justify-center gap-2 rounded-full bg-[#ff385c] text-[#ffffff] hover:bg-[#e00b41] px-5 text-xs font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
        >
          <Save className="size-3.5" />
          <span>{isSaving ? "Salvando..." : "Salvar"}</span>
          <span className="hidden lg:inline text-[10px] text-white/80 ml-0.5 font-mono">⌘S</span>
        </button>
      </div>
    </header>
  );
}
