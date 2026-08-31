"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { THEME_PRESETS } from "@/components/admin/theme-editor/default-presets";
import { cn } from "@/components/ui/cn";
import { AdminPageHeader } from "@/components/admin/blocks";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";
import {
  Check,
  Upload,
  Download,
  Copy,
  Trash2,
} from "lucide-react";
import type { ThemeConfig } from "@/lib/repo/theme";
import { ThemeUploadModal } from "@/components/admin/theme-editor/ThemeUploadModal";
import type { ThemeConversionResult } from "@/lib/theme-importer/shopify-types";

export interface AdminThemesViewProps {
  currentTheme: ThemeConfig;
}

const visibleThemePresets = THEME_PRESETS.filter((preset) => preset.id === "farfetch");

export function AdminThemesView({ currentTheme: initialTheme }: AdminThemesViewProps) {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(initialTheme);
  const [installedThemes, setInstalledThemes] = useState<ThemeConfig[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const router = useRouter();

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }

  // Load custom installed themes from API
  async function loadInstalledThemes() {
    try {
      const res = await fetch("/api/theme/manage");
      const data = await res.json();
      if (data.success) {
        if (data.activeTheme) setCurrentTheme(data.activeTheme);
        if (Array.isArray(data.installedThemes)) {
          setInstalledThemes(data.installedThemes);
        }
      }
    } catch (err) {
      console.error("Error loading themes:", err);
    }
  }

  useEffect(() => {
    loadInstalledThemes();
  }, []);

  async function handleActivateTheme(themeId: string, customConfig?: ThemeConfig) {
    try {
      setIsActionLoading(`activate-${themeId}`);
      const res = await fetch("/api/theme/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "activate",
          themeId,
          config: customConfig,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentTheme(data.theme);
        showToast(`✓ Tema "${data.theme.name}" ativado e publicado com sucesso!`);
        router.refresh();
        await loadInstalledThemes();
      } else {
        alert("Erro ao ativar tema: " + (data.error || "Tente novamente"));
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setIsActionLoading(null);
    }
  }

  async function handleDuplicateTheme(themeId: string) {
    try {
      setIsActionLoading(`duplicate-${themeId}`);
      const res = await fetch("/api/theme/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "duplicate", themeId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Tema duplicado com sucesso!`);
        await loadInstalledThemes();
      } else {
        alert("Erro ao duplicar: " + (data.error || ""));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(null);
    }
  }

  async function handleDeleteTheme(themeId: string, themeName: string) {
    if (!confirm(`Deseja realmente excluir o tema "${themeName}"?`)) return;

    try {
      setIsActionLoading(`delete-${themeId}`);
      const res = await fetch("/api/theme/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", themeId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("✓ Tema excluído com sucesso!");
        await loadInstalledThemes();
      } else {
        alert("Erro ao excluir: " + (data.error || ""));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsActionLoading(null);
    }
  }

  function handleThemeUploaded(result: ThemeConversionResult) {
    showToast(`✓ Tema "${result.metadata.themeName}" importado e convertido com sucesso!`);
    loadInstalledThemes();
    router.refresh();
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Page Header */}
      <AdminPageHeader
        title="Temas e Loja Virtual"
        subtitle="Gerencie o visual, importe temas Liquid da Shopify e customize a experiência na arquitetura Online Store 2.0"
        badge="Shopify OS 2.0"
        badgeColor="accent"
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-[#ff385c] px-4.5 py-2.5 text-xs font-bold text-white hover:bg-[#e00b41] active:scale-[0.98] transition shadow-xs cursor-pointer"
            >
              <Upload className="size-4" /> Upload de Tema (.ZIP)
            </button>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#ebebeb] bg-[#ffffff] px-4.5 py-2.5 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] transition shadow-2xs"
            >
              <AdminIcon name={SOLAR_ICONS.eye} size={15} className="text-[#6a6a6a]" /> Ver Loja Virtual
            </Link>
            <Link
              href="/admin/temas/editor"
              className="inline-flex items-center gap-2 rounded-full bg-[#222222] text-[#ffffff] px-5 py-2.5 text-xs font-semibold hover:bg-[#000000] active:scale-[0.98] transition shadow-xs"
            >
              <AdminIcon name={SOLAR_ICONS.palette} size={15} /> Personalizar Tema
            </Link>
          </div>
        }
      />

      {/* Main Active Theme Card */}
      <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-[#ebebeb]">
          <div className="flex items-start gap-4">
            <div
              className="flex size-14 items-center justify-center rounded-xl text-white shadow-xs shrink-0"
              style={{ backgroundColor: currentTheme.colors.primary }}
            >
              <AdminIcon name={SOLAR_ICONS.themes} size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-[#222222]">{currentTheme.name}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] py-0.5 px-3 rounded-full">
                  <span className="size-1.5 rounded-full bg-[#008a05]" />
                  Tema Atual • Publicado
                </span>
              </div>
              <p className="text-xs text-[#6a6a6a] mt-1 font-normal">
                Última modificação:{" "}
                {new Date(currentTheme.updatedAt).toLocaleString("pt-BR", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs font-normal text-[#6a6a6a]">
                <span className="flex items-center gap-1">
                  <AdminIcon name={SOLAR_ICONS.orders} size={14} className="text-[#6a6a6a]" /> {currentTheme.sections.length} seções ativas
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <AdminIcon name={SOLAR_ICONS.bolt} size={14} className="text-[#ff385c]" /> Shopify OS 2.0
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  Tipografia: <strong className="text-[#222222]">{currentTheme.typography.headingFont}</strong> + {currentTheme.typography.bodyFont}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            <a
              href={`/api/theme/export?id=main-theme&format=zip`}
              download
            className="inline-flex items-center gap-1.5 rounded-full border border-[#ebebeb] bg-[#ffffff] px-4 py-2 text-xs font-semibold text-[#222222] hover:bg-[#f7f7f7] transition shadow-2xs"
            >
              <Download className="size-3.5" /> Exportar ZIP (OS 2.0)
            </a>
            <Link
              href="/admin/temas/editor"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#222222] px-5 py-2 text-xs font-bold text-white hover:bg-[#000000] transition shadow-xs"
            >
              <AdminIcon name={SOLAR_ICONS.palette} size={14} /> Personalizar
            </Link>
          </div>
        </div>

        {/* Speed & Storefront Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-[#ebebeb] bg-[#f7f7f7] p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6a6a6a]">Velocidade da Loja</span>
              <span className="text-xs font-bold text-[#222222]">98 / 100</span>
            </div>
            <div className="text-sm font-bold text-[#222222]">Desempenho Otimizado</div>
            <p className="text-xs text-[#6a6a6a]">Tempo de resposta instantâneo com suporte a Turbopack.</p>
          </div>

          <div className="rounded-xl border border-[#ebebeb] bg-[#f7f7f7] p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6a6a6a]">Seções Modulares</span>
              <span className="text-xs font-bold text-[#222222]">{currentTheme.sections.length}</span>
            </div>
            <div className="text-sm font-bold text-[#222222]">Arquit. Online Store 2.0</div>
            <p className="text-xs text-[#6a6a6a]">Total liberdade para reorganizar e criar novos blocos.</p>
          </div>

          <div className="rounded-xl border border-[#ebebeb] bg-[#f7f7f7] p-5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#6a6a6a]">Conversão Liquid</span>
              <span className="text-xs font-bold text-emerald-600">Automática</span>
            </div>
            <div className="text-sm font-bold text-[#222222]">Compatibilidade Total</div>
            <p className="text-xs text-[#6a6a6a]">Importe arquivos ZIP da Shopify com 1 clique.</p>
          </div>
        </div>
      </div>

      {/* Upload Theme Callout Banner */}
      <div className="rounded-xl border border-[#ffccd5] bg-[#fff0f3] p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#ff385c] text-white shadow-xs">
            <Upload className="size-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-gray-900">
              Possui um tema Shopify (.ZIP)?
            </h4>
            <p className="text-xs text-gray-600 mt-1 max-w-xl">
              Faça upload do arquivo ZIP do tema (Dawn, Sense, Spotlight, Warehouse ou temas customizados). Nosso sistema extrai as cores, tipografia, schemas Liquid e seções do <code>templates/index.json</code> automaticamente para nossa arquitetura.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="rounded-full bg-[#ff385c] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#e00b41] transition shadow-xs shrink-0 cursor-pointer flex items-center gap-2"
        >
          <Upload className="size-4" /> Enviar Tema Shopify (.ZIP)
        </button>
      </div>

      {/* CUSTOM IMPORTED THEMES (If any) */}
      {installedThemes.length > 0 && (
        <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#222222]">Temas Importados & Personalizados</h3>
              <p className="text-xs text-[#6a6a6a] mt-0.5">
                Temas enviados via upload Liquid ou duplicados da sua loja
              </p>
            </div>
            <span className="text-xs text-[#6a6a6a] font-medium">
              {installedThemes.length} {installedThemes.length === 1 ? "tema instalado" : "temas instalados"}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {installedThemes.map((theme) => {
              const isCurrent = currentTheme.id === theme.id || currentTheme.name === theme.name;
              const isActivating = isActionLoading === `activate-${theme.id}`;

              return (
                <div
                  key={theme.id}
                  className={cn(
                    "flex flex-col justify-between rounded-xl border bg-[#ffffff] p-4.5 space-y-3 transition-all",
                    isCurrent
                      ? "border-[#ff385c] ring-1 ring-[#ff385c]/30 shadow-xs"
                      : "border-[#ebebeb] hover:border-[#ff385c] hover:shadow-2xs"
                  )}
                >
                  <div className="space-y-3">
                    <div
                      className="h-26 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden shadow-xs"
                      style={{
                        background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`,
                      }}
                    >
                      <div className="flex items-center justify-between text-white">
                        <span className="rounded-full bg-black/45 px-2.5 py-0.5 text-[9px] font-bold">
                          Importado Liquid
                        </span>
                        <span className="text-[10px] font-bold">v{theme.version || "1.0"}</span>
                      </div>
                      <div className="text-white text-xs font-semibold drop-shadow-xs flex items-center justify-between">
                        <span>{theme.typography.headingFont}</span>
                        <span className="text-[10px] opacity-80">{theme.sections.length} seções</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-[#222222] truncate">{theme.name}</div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <span
                            className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                        </div>
                      </div>
                      <p className="text-xs text-[#6a6a6a] mt-1 font-normal line-clamp-1">
                        Atualizado em {new Date(theme.updatedAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-between gap-1.5">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] py-1 px-3 rounded-full">
                        <Check className="size-3" /> Ativo
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={Boolean(isActionLoading)}
                        onClick={() => handleActivateTheme(theme.id, theme)}
                        className="rounded-full border border-[#ebebeb] bg-[#ffffff] px-3.5 py-1.5 text-xs font-semibold text-[#222222] hover:bg-[#f7f7f7] transition cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-2xs"
                      >
                        {isActivating ? "Ativando..." : "Ativar Tema"}
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Duplicar Tema"
                        disabled={Boolean(isActionLoading)}
                        onClick={() => handleDuplicateTheme(theme.id)}
                        className="p-1.5 rounded-full text-[#9b9b9b] hover:text-[#222222] hover:bg-[#f7f7f7] transition cursor-pointer"
                      >
                        <Copy className="size-3.5" />
                      </button>

                      <a
                        href={`/api/theme/export?id=${theme.id}&format=zip`}
                        title="Exportar ZIP Shopify"
                        download
                        className="p-1.5 rounded-full text-[#9b9b9b] hover:text-[#222222] hover:bg-[#f7f7f7] transition cursor-pointer"
                      >
                        <Download className="size-3.5" />
                      </a>

                      {!isCurrent && (
                        <button
                          type="button"
                          title="Excluir Tema"
                          disabled={Boolean(isActionLoading)}
                          onClick={() => handleDeleteTheme(theme.id, theme.name)}
                          className="p-1.5 rounded-full text-[#c13515] hover:text-[#b91c1c] hover:bg-[#fef2f2] transition cursor-pointer"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}

                      <Link
                        href={`/admin/temas/editor?preset=${theme.id}`}
                        className={cn(
                          "rounded-full px-3.5 py-1.5 text-xs font-semibold transition shadow-xs",
                          isCurrent
                            ? "bg-[#222222] text-[#ffffff] hover:bg-[#000000]"
                            : "bg-[#f7f7f7] text-[#222222] hover:bg-[#ebebeb]"
                        )}
                      >
                        {isCurrent ? "Personalizar" : "Editar"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BUILT-IN SHOPIFY THEME PRESETS */}
      <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#222222]">Biblioteca de Templates Shopify</h3>
            <p className="text-xs text-[#6a6a6a] mt-0.5">Explore e instale templates modernos pré-configurados com design systems exclusivos</p>
          </div>
          <span className="text-xs text-[#6a6a6a] font-medium">
            {visibleThemePresets.length} templates disponíveis
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleThemePresets.map((preset) => {
            const isCurrent =
              currentTheme.id === preset.id ||
              currentTheme.name.toLowerCase().includes(preset.id);
            const isThisActivating = isActionLoading === `activate-${preset.id}`;

            return (
              <div
                key={preset.id}
                className={cn(
                  "flex flex-col justify-between rounded-xl border bg-[#ffffff] p-4.5 space-y-3 transition-all",
                  isCurrent
                    ? "border-[#ff385c] ring-1 ring-[#ff385c]/30 shadow-xs"
                    : "border-[#ebebeb] hover:border-[#ff385c] hover:shadow-2xs"
                )}
              >
                {/* Visual Palette Header */}
                <div className="space-y-3">
                  <div
                    className="h-26 rounded-xl p-3 flex flex-col justify-between relative overflow-hidden shadow-xs"
                    style={{
                      background: `linear-gradient(135deg, ${preset.primaryColor} 0%, ${preset.accentColor} 100%)`,
                    }}
                  >
                    <div className="flex items-center justify-between text-white">
                      <span className="rounded-full bg-black/45 px-2.5 py-0.5 text-[9px] font-bold">
                        {preset.badge}
                      </span>
                      <span className="text-[10px] font-bold">★ 4.9</span>
                    </div>
                    <div className="text-white text-xs font-semibold drop-shadow-xs flex items-center justify-between">
                      <span>{preset.config.typography.headingFont}</span>
                      <span className="text-[10px] opacity-80">{preset.config.sections.length} seções</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-[#222222]">{preset.name}</div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: preset.primaryColor }}
                        />
                        <span
                          className="size-3.5 rounded-full border border-black/10 shadow-2xs"
                          style={{ backgroundColor: preset.accentColor }}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-[#6a6a6a] leading-relaxed line-clamp-2 mt-1 font-normal">
                      {preset.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#ebebeb] flex items-center justify-between gap-2">
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] py-1 px-3 rounded-full">
                      <Check className="size-3" /> Ativo
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={Boolean(isActionLoading)}
                      onClick={() => handleActivateTheme(preset.id, preset.config)}
                      className="rounded-full border border-[#ebebeb] bg-[#ffffff] px-3.5 py-1.5 text-xs font-semibold text-[#222222] hover:bg-[#f7f7f7] transition cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-2xs"
                    >
                      {isThisActivating ? "Ativando..." : "Ativar Tema"}
                    </button>
                  )}

                  <Link
                    href={`/admin/temas/editor?preset=${preset.id}`}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-xs font-semibold transition shadow-xs",
                      isCurrent
                        ? "bg-[#222222] text-[#ffffff] hover:bg-[#000000]"
                        : "bg-[#f7f7f7] text-[#222222] hover:bg-[#ebebeb]"
                    )}
                  >
                    {isCurrent ? "Personalizar" : "Editar"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Theme Upload Modal */}
      <ThemeUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onThemeUploaded={handleThemeUploaded}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-full bg-[#222222] px-5 py-3 text-xs font-semibold text-white shadow-airbnb-modal border border-[#333333] animate-fade-up flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-[#ff385c]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
