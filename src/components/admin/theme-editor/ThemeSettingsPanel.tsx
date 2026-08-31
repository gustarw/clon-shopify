"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Code,
  Globe,
  Layout,
  MessageCircle,
  Palette,
  Shield,
  Type,
} from "lucide-react";
import { ThemeConfig } from "@/lib/repo/theme";

interface ThemeSettingsPanelProps {
  theme: ThemeConfig;
  onUpdateTheme: (updated: Partial<ThemeConfig>) => void;
}

export function ThemeSettingsPanel({ theme, onUpdateTheme }: ThemeSettingsPanelProps) {
  const [openGroup, setOpenGroup] = useState<string | null>("colors");

  function toggleGroup(groupId: string) {
    setOpenGroup(openGroup === groupId ? null : groupId);
  }

  function updateColor(key: keyof ThemeConfig["colors"], value: string) {
    onUpdateTheme({
      colors: {
        ...theme.colors,
        [key]: value,
      },
    });
  }

  function updateAnnouncement(key: keyof ThemeConfig["announcement"], value: unknown) {
    onUpdateTheme({
      announcement: {
        ...theme.announcement,
        [key]: value,
      },
    });
  }

  function updateHeader(key: keyof ThemeConfig["header"], value: unknown) {
    onUpdateTheme({
      header: {
        ...theme.header,
        [key]: value,
      },
    });
  }

  function updateSocial(key: keyof ThemeConfig["social"], value: string) {
    onUpdateTheme({
      social: {
        ...theme.social,
        [key]: value,
      },
    });
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-[#ffffff] p-4 space-y-3.5 custom-scrollbar">

      {/* CORES & PALETA */}
      <div className="rounded-xl border border-[#ebebeb] overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("colors")}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Palette className="size-4 text-[#ff385c]" /> Cores & Paleta Visual
          </span>
          {openGroup === "colors" ? <ChevronDown className="size-4 text-[#6a6a6a]" /> : <ChevronRight className="size-4 text-[#6a6a6a]" />}
        </button>
        {openGroup === "colors" && (
          <div className="p-4 space-y-3.5 border-t border-[#ebebeb]">
            <div>
              <label className="block text-[11px] font-semibold text-[#6a6a6a] mb-1">Cor Primária (Botões e Destaques)</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.colors.primary}
                  onChange={(e) => updateColor("primary", e.target.value)}
                  className="size-8 rounded-full cursor-pointer border border-[#ebebeb] p-0.5 bg-white shadow-2xs"
                />
                <input
                  type="text"
                  value={theme.colors.primary}
                  onChange={(e) => updateColor("primary", e.target.value)}
                  className="flex-1 rounded-lg border border-[#ebebeb] px-3 py-1.5 text-xs font-mono text-[#222222] focus:border-[#222222] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6a6a6a] mb-1">Cor de Destaque / Acentos</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.colors.accent}
                  onChange={(e) => updateColor("accent", e.target.value)}
                  className="size-8 rounded-full cursor-pointer border border-[#ebebeb] p-0.5 bg-white shadow-2xs"
                />
                <input
                  type="text"
                  value={theme.colors.accent}
                  onChange={(e) => updateColor("accent", e.target.value)}
                  className="flex-1 rounded-lg border border-[#ebebeb] px-3 py-1.5 text-xs font-mono text-[#222222] focus:border-[#222222] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6a6a6a] mb-1">Cor de Fundo da Loja</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={theme.colors.background}
                  onChange={(e) => updateColor("background", e.target.value)}
                  className="size-8 rounded-full cursor-pointer border border-[#ebebeb] p-0.5 bg-white shadow-2xs"
                />
                <input
                  type="text"
                  value={theme.colors.background}
                  onChange={(e) => updateColor("background", e.target.value)}
                  className="flex-1 rounded-lg border border-[#ebebeb] px-3 py-1.5 text-xs font-mono text-[#222222] focus:border-[#222222] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TIPOGRAFIA */}
      <div className="rounded-xl border border-[#ebebeb] overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("typography")}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Type className="size-4 text-[#ff385c]" /> Tipografia & Fontes
          </span>
          {openGroup === "typography" ? <ChevronDown className="size-4 text-[#6a6a6a]" /> : <ChevronRight className="size-4 text-[#6a6a6a]" />}
        </button>
        {openGroup === "typography" && (
          <div className="p-4 space-y-3.5 border-t border-[#ebebeb]">
            <div>
              <label className="block text-[11px] font-semibold text-[#6a6a6a] mb-1">Fonte dos Títulos</label>
              <select
                value={theme.typography.headingFont}
                onChange={(e) =>
                  onUpdateTheme({
                    typography: {
                      ...theme.typography,
                      headingFont: e.target.value as any,
                    },
                  })
                }
                className="w-full rounded-lg border border-[#ebebeb] bg-white px-3 py-2 text-xs text-[#222222] focus:border-[#222222] focus:outline-none"
              >
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Shopify Modern)</option>
                <option value="Inter">Inter (Clean & Minimal)</option>
                <option value="Poppins">Poppins (Bold & Geometric)</option>
                <option value="Playfair Display">Playfair Display (Luxury & Editorial)</option>
                <option value="Outfit">Outfit (Tech & Contemporary)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6a6a6a] mb-1">Fonte do Corpo de Texto</label>
              <select
                value={theme.typography.bodyFont}
                onChange={(e) =>
                  onUpdateTheme({
                    typography: {
                      ...theme.typography,
                      bodyFont: e.target.value as any,
                    },
                  })
                }
                className="w-full rounded-lg border border-[#ebebeb] bg-white px-3 py-2 text-xs text-[#222222] focus:border-[#222222] focus:outline-none"
              >
                <option value="Inter">Inter</option>
                <option value="Roboto">Roboto</option>
                <option value="Open Sans">Open Sans</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* LAYOUT & BORDAS */}
      <div className="rounded-xl border border-[#ebebeb] overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("layout")}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Layout className="size-4 text-[#ff385c]" /> Layout & Cantos Arredondados
          </span>
          {openGroup === "layout" ? <ChevronDown className="size-4 text-[#6a6a6a]" /> : <ChevronRight className="size-4 text-[#6a6a6a]" />}
        </button>
        {openGroup === "layout" && (
          <div className="p-4 space-y-3.5 border-t border-[#ebebeb]">
            <div>
              <label className="block text-[11px] font-semibold text-[#6a6a6a] mb-1">Arredondamento dos Cards</label>
              <select
                value={theme.layout.borderRadius}
                onChange={(e) =>
                  onUpdateTheme({
                    layout: {
                      ...theme.layout,
                      borderRadius: e.target.value as any,
                    },
                  })
                }
                className="w-full rounded-lg border border-[#ebebeb] bg-white px-3 py-2 text-xs text-[#222222] focus:border-[#222222] focus:outline-none"
              >
                <option value="rounded-none">Reto (Sem borda arredondada)</option>
                <option value="rounded-lg">Suave (8px)</option>
                <option value="rounded-xl">Médio (12px - Airbnb)</option>
                <option value="rounded-2xl">Moderno (16px)</option>
                <option value="rounded-3xl">Ultra Arredondado (24px)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6a6a6a] mb-1">Formato dos Botões</label>
              <select
                value={theme.layout.buttonRadius}
                onChange={(e) =>
                  onUpdateTheme({
                    layout: {
                      ...theme.layout,
                      buttonRadius: e.target.value as any,
                    },
                  })
                }
                className="w-full rounded-lg border border-[#ebebeb] bg-white px-3 py-2 text-xs text-[#222222] focus:border-[#222222] focus:outline-none"
              >
                <option value="rounded-full">Pílula (Airbnb 9999px)</option>
                <option value="rounded-xl">Arredondado Médio (12px)</option>
                <option value="rounded-lg">Arredondado Leve (8px)</option>
                <option value="rounded-none">Quadrado</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* BARRA DE AVISOS NO TOPO */}
      <div className="rounded-xl border border-[#ebebeb] overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("announcement")}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Globe className="size-4 text-[#ff385c]" /> Barra de Anúncios no Topo
          </span>
          {openGroup === "announcement" ? <ChevronDown className="size-4 text-[#6a6a6a]" /> : <ChevronRight className="size-4 text-[#6a6a6a]" />}
        </button>
        {openGroup === "announcement" && (
          <div className="p-4 space-y-3.5 border-t border-[#ebebeb]">
            <label className="flex items-center gap-2.5 text-xs font-medium text-[#222222] cursor-pointer">
              <input
                type="checkbox"
                checked={theme.announcement.enabled}
                onChange={(e) => updateAnnouncement("enabled", e.target.checked)}
                className="size-4 rounded accent-[#222222]"
              />
              <span>Ativar barra de anúncios no topo</span>
            </label>

            <div>
              <label className="block text-[11px] font-semibold text-[#6a6a6a] mb-1">Texto do Anúncio</label>
              <textarea
                rows={2}
                value={theme.announcement.text}
                onChange={(e) => updateAnnouncement("text", e.target.value)}
                className="w-full rounded-lg border border-[#ebebeb] bg-white p-2.5 text-xs text-[#222222] focus:border-[#222222] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6a6a6a] mb-1">Estilo do Fundo</label>
              <select
                value={theme.announcement.bgStyle}
                onChange={(e) => updateAnnouncement("bgStyle", e.target.value)}
                className="w-full rounded-lg border border-[#ebebeb] bg-white px-3 py-2 text-xs text-[#222222] focus:border-[#222222] focus:outline-none"
              >
                <option value="dark">Preto Obsidian (#222222)</option>
                <option value="brand">Cor da Marca</option>
                <option value="gradient_emerald">Gradiente Suave</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* CABEÇALHO & LOGO */}
      <div className="rounded-xl border border-[#ebebeb] overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("header")}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Shield className="size-4 text-[#ff385c]" /> Cabeçalho & Logo
          </span>
          {openGroup === "header" ? <ChevronDown className="size-4 text-[#6a6a6a]" /> : <ChevronRight className="size-4 text-[#6a6a6a]" />}
        </button>
        {openGroup === "header" && (
          <div className="p-4 space-y-3.5 border-t border-[#ebebeb]">
            <div>
              <label className="block text-[11px] font-semibold text-[#6a6a6a] mb-1">Nome da Loja (Logo Texto)</label>
              <input
                type="text"
                value={theme.header.logoText}
                onChange={(e) => updateHeader("logoText", e.target.value)}
                className="w-full rounded-lg border border-[#ebebeb] bg-white px-3 py-2 text-xs font-bold text-[#222222] focus:border-[#222222] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6a6a6a] mb-1">Subtítulo / Tag da Logo</label>
              <input
                type="text"
                value={theme.header.logoBadge}
                onChange={(e) => updateHeader("logoBadge", e.target.value)}
                className="w-full rounded-lg border border-[#ebebeb] bg-white px-3 py-2 text-xs text-[#222222] focus:border-[#222222] focus:outline-none"
              />
            </div>

            <label className="flex items-center gap-2.5 text-xs font-medium text-[#222222] cursor-pointer">
              <input
                type="checkbox"
                checked={theme.header.sticky}
                onChange={(e) => updateHeader("sticky", e.target.checked)}
                className="size-4 rounded accent-[#222222]"
              />
              <span>Cabeçalho Fixo ao Rolar a Página (Sticky Header)</span>
            </label>
          </div>
        )}
      </div>

      {/* REDES SOCIAIS */}
      <div className="rounded-xl border border-[#ebebeb] overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("social")}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <MessageCircle className="size-4 text-[#ff385c]" /> Redes Sociais & Contato
          </span>
          {openGroup === "social" ? <ChevronDown className="size-4 text-[#6a6a6a]" /> : <ChevronRight className="size-4 text-[#6a6a6a]" />}
        </button>
        {openGroup === "social" && (
          <div className="p-4 space-y-3 border-t border-[#ebebeb]">
            <div>
              <label className="block text-[10px] font-semibold text-[#6a6a6a] mb-1">Instagram</label>
              <input
                type="text"
                placeholder="https://instagram.com/sualoja"
                value={theme.social.instagram || ""}
                onChange={(e) => updateSocial("instagram", e.target.value)}
                className="w-full rounded-lg border border-[#ebebeb] bg-white px-3 py-1.5 text-xs text-[#222222] focus:border-[#222222] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6a6a6a] mb-1">WhatsApp</label>
              <input
                type="text"
                placeholder="https://wa.me/55..."
                value={theme.social.whatsapp || ""}
                onChange={(e) => updateSocial("whatsapp", e.target.value)}
                className="w-full rounded-lg border border-[#ebebeb] bg-white px-3 py-1.5 text-xs text-[#222222] focus:border-[#222222] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6a6a6a] mb-1">TikTok</label>
              <input
                type="text"
                placeholder="https://tiktok.com/@sualoja"
                value={theme.social.tiktok || ""}
                onChange={(e) => updateSocial("tiktok", e.target.value)}
                className="w-full rounded-lg border border-[#ebebeb] bg-white px-3 py-1.5 text-xs text-[#222222] focus:border-[#222222] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* CSS CUSTOMIZADO */}
      <div className="rounded-xl border border-[#ebebeb] overflow-hidden bg-white shadow-2xs">
        <button
          type="button"
          onClick={() => toggleGroup("css")}
          className="flex w-full items-center justify-between p-3.5 text-left text-xs font-bold text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-colors cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Code className="size-4 text-[#ff385c]" /> CSS Customizado
          </span>
          {openGroup === "css" ? <ChevronDown className="size-4 text-[#6a6a6a]" /> : <ChevronRight className="size-4 text-[#6a6a6a]" />}
        </button>
        {openGroup === "css" && (
          <div className="p-4 space-y-2.5 border-t border-[#ebebeb]">
            <p className="text-[11px] text-[#6a6a6a]">
              Adicione regras CSS adicionais aplicadas em tempo real ao storefront.
            </p>
            <textarea
              rows={6}
              placeholder="/* Suas regras CSS */&#10;.btn-primary { ... }"
              value={theme.customCss || ""}
              onChange={(e) => onUpdateTheme({ customCss: e.target.value })}
              className="w-full rounded-lg border border-[#ebebeb] p-2.5 text-xs font-mono bg-[#222222] text-[#ff385c] focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
