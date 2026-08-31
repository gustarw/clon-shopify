"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SectionConfig, SectionBlock } from "@/lib/repo/theme";
import { cn } from "@/components/ui/cn";
import { ImageUploader } from "./ImageUploader";

interface SectionPropertiesPanelProps {
  section: SectionConfig;
  onUpdateSection: (updated: SectionConfig) => void;
  onDeleteSection: (id: string) => void;
  onDuplicateSection: (section: SectionConfig) => void;
  onBack?: () => void;
  onClose?: () => void;
}

export function SectionPropertiesPanel({
  section,
  onUpdateSection,
  onDeleteSection,
  onDuplicateSection,
  onBack,
  onClose,
}: SectionPropertiesPanelProps) {
  const [activeBlockIndex, setActiveBlockIndex] = useState<number | null>(null);

  function updateSetting(key: string, value: any) {
    onUpdateSection({
      ...section,
      settings: {
        ...section.settings,
        [key]: value,
      },
    });
  }

  function updateBlock(blockIndex: number, newSettings: Record<string, any>) {
    const newBlocks = [...(section.blocks || [])];
    if (newBlocks[blockIndex]) {
      newBlocks[blockIndex] = {
        ...newBlocks[blockIndex],
        settings: {
          ...newBlocks[blockIndex].settings,
          ...newSettings,
        },
      };
      onUpdateSection({
        ...section,
        blocks: newBlocks,
      });
    }
  }

  function addBlock(type: string, defaultSettings: Record<string, any>) {
    const newBlock: SectionBlock = {
      id: `block-${Date.now()}`,
      type,
      settings: defaultSettings,
    };
    onUpdateSection({
      ...section,
      blocks: [...(section.blocks || []), newBlock],
    });
    setActiveBlockIndex(section.blocks?.length || 0);
  }

  function removeBlock(blockIndex: number) {
    const newBlocks = (section.blocks || []).filter((_, i) => i !== blockIndex);
    onUpdateSection({
      ...section,
      blocks: newBlocks,
    });
    setActiveBlockIndex(null);
  }

  const handleDismiss = onClose || onBack;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#ececee] px-4 py-3 bg-[#fafafa]">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-[#09090b] truncate">
            {section.name}
          </span>
          <span className="text-[10px] text-[#71717a] font-mono shrink-0 uppercase px-1.5 py-0.5 rounded bg-white border border-[#ececee]">
            {section.type}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onUpdateSection({ ...section, enabled: !section.enabled })}
            className="rounded-lg p-1.5 text-[#71717a] hover:bg-white hover:text-[#09090b] transition-colors cursor-pointer"
            title={section.enabled ? "Ocultar seção" : "Mostrar seção"}
          >
            {section.enabled ? <Eye className="size-4" /> : <EyeOff className="size-4 text-[#a1a1aa]" />}
          </button>
          <button
            type="button"
            onClick={() => onDuplicateSection(section)}
            className="rounded-lg p-1.5 text-[#71717a] hover:bg-white hover:text-[#09090b] transition-colors cursor-pointer"
            title="Duplicar seção"
          >
            <Copy className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteSection(section.id)}
            className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            title="Excluir seção"
          >
            <Trash2 className="size-4" />
          </button>
          {handleDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg p-1.5 text-[#71717a] hover:bg-white hover:text-[#09090b] transition-colors cursor-pointer ml-1"
              title="Fechar painel"
            >
              <ArrowLeft className="size-4 rotate-180" />
            </button>
          )}
        </div>
      </div>

      {/* Title & Type Renaming */}
      <div className="border-b border-[#ececee] px-4 py-2.5 bg-white">
        <label className="block text-[10px] font-semibold text-[#71717a] uppercase mb-1">
          Nome da Seção
        </label>
        <input
          type="text"
          value={section.name}
          onChange={(e) => onUpdateSection({ ...section, name: e.target.value })}
          className="w-full text-xs font-semibold text-[#09090b] rounded-lg border border-[#ececee] px-3 py-1.5 focus:border-[#09090b] focus:outline-none"
        />
      </div>

      {/* Properties Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
        {/* HERO BANNER SETTINGS */}
        {(section.type === "hero_banner" || section.type === "image_banner") && (
          <div className="space-y-4">
            {/* Imagem do Banner */}
            <div className="p-3.5 rounded-xl border border-[#ececee] bg-[#fafafa] space-y-2.5">
              <ImageUploader
                label="Imagem do Banner (Upload ou Link)"
                value={section.settings.imageUrl || ""}
                onChange={(url) => updateSetting("imageUrl", url)}
                aspectHint="Arraste sua foto ou clique para buscar no computador"
              />

              {/* Presets Rápidos de Imagem */}
              <div>
                <span className="text-[10px] font-semibold text-[#71717a] uppercase tracking-wider">Sugestões de Imagens HD:</span>
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateSetting(
                        "imageUrl",
                        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
                      )
                    }
                    className="text-[11px] text-left p-2 rounded-lg border border-[#ececee] bg-white hover:border-[#09090b] font-medium text-[#18181b] truncate cursor-pointer transition-all"
                  >
                    🛍️ Loja & Moda
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSetting(
                        "imageUrl",
                        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80"
                      )
                    }
                    className="text-[11px] text-left p-2 rounded-lg border border-[#ececee] bg-white hover:border-[#09090b] font-medium text-[#18181b] truncate cursor-pointer transition-all"
                  >
                    🌸 Beleza & Glow
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSetting(
                        "imageUrl",
                        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80"
                      )
                    }
                    className="text-[11px] text-left p-2 rounded-lg border border-[#ececee] bg-white hover:border-[#09090b] font-medium text-[#18181b] truncate cursor-pointer transition-all"
                  >
                    ⚡ Cyber & Tech
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateSetting(
                        "imageUrl",
                        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80"
                      )
                    }
                    className="text-[11px] text-left p-2 rounded-lg border border-[#ececee] bg-white hover:border-[#09090b] font-medium text-[#18181b] truncate cursor-pointer transition-all"
                  >
                    🏺 Atelier & Decor
                  </button>
                </div>
              </div>

              {/* Altura e Opacidade */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#ececee]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#52525b] mb-1">Altura do Banner</label>
                  <select
                    value={section.settings.bannerHeight || "450px"}
                    onChange={(e) => updateSetting("bannerHeight", e.target.value)}
                    className="w-full rounded-lg border border-[#ececee] bg-white px-2.5 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                  >
                    <option value="320px">Compacto (320px)</option>
                    <option value="450px">Padrão (450px)</option>
                    <option value="550px">Destaque (550px)</option>
                    <option value="650px">Tela Cheia (650px)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#52525b] mb-1">Escurecimento</label>
                  <select
                    value={section.settings.overlayOpacity !== undefined ? section.settings.overlayOpacity : "0.3"}
                    onChange={(e) => updateSetting("overlayOpacity", e.target.value)}
                    className="w-full rounded-lg border border-[#ececee] bg-white px-2.5 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                  >
                    <option value="0">0% (Sem filtro / Nítida)</option>
                    <option value="0.2">20% (Muito suave)</option>
                    <option value="0.35">35% (Equilibrado)</option>
                    <option value="0.5">50% (Médio)</option>
                    <option value="0.7">70% (Escuro)</option>
                  </select>
                </div>
              </div>

              {/* Link do Banner */}
              <div>
                <label className="block text-[11px] font-semibold text-[#52525b] mb-1">Link de Destino do Banner (Opcional)</label>
                <input
                  type="text"
                  placeholder="/produtos ou https://..."
                  value={section.settings.bannerLink || ""}
                  onChange={(e) => updateSetting("bannerLink", e.target.value)}
                  className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                />
              </div>

              {/* Toggle de Ocultar Texto */}
              <label className="flex items-center gap-2 text-xs font-semibold text-[#18181b] cursor-pointer pt-1 border-t border-[#ececee]">
                <input
                  type="checkbox"
                  checked={section.settings.hideText || false}
                  onChange={(e) => updateSetting("hideText", e.target.checked)}
                  className="size-4 rounded accent-[#09090b]"
                />
                <span>Exibir apenas imagem (sem textos ou botões)</span>
              </label>
            </div>

            {/* Configurações de Texto (Opcionais) */}
            {!section.settings.hideText && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between border-b border-[#ececee] pb-1.5">
                  <span className="text-xs font-semibold text-[#09090b]">Textos & Chamadas</span>
                  <span className="text-[10px] text-[#71717a]">Opcional</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#52525b] mb-1">Destaque Superior (Eyebrow)</label>
                  <input
                    type="text"
                    placeholder="Deixe vazio para ocultar"
                    value={section.settings.eyebrow || ""}
                    onChange={(e) => updateSetting("eyebrow", e.target.value)}
                    className="w-full rounded-lg border border-[#ececee] px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#52525b] mb-1">Título Principal</label>
                  <textarea
                    rows={2}
                    placeholder="Título do banner"
                    value={section.settings.title || ""}
                    onChange={(e) => updateSetting("title", e.target.value)}
                    className="w-full rounded-lg border border-[#ececee] p-2.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#52525b] mb-1">Palavra de Destaque (Cor Laranja/Destaque)</label>
                  <input
                    type="text"
                    value={section.settings.titleHighlight || ""}
                    onChange={(e) => updateSetting("titleHighlight", e.target.value)}
                    className="w-full rounded-lg border border-[#ececee] px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#52525b] mb-1">Subtítulo / Descrição</label>
                  <textarea
                    rows={3}
                    placeholder="Descrição secundária"
                    value={section.settings.subtitle || ""}
                    onChange={(e) => updateSetting("subtitle", e.target.value)}
                    className="w-full rounded-lg border border-[#ececee] p-2.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#52525b] mb-1">Texto Botão 1</label>
                    <input
                      type="text"
                      placeholder="Explorar"
                      value={section.settings.primaryButtonText || ""}
                      onChange={(e) => updateSetting("primaryButtonText", e.target.value)}
                      className="w-full rounded-lg border border-[#ececee] px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#52525b] mb-1">Link Botão 1</label>
                    <input
                      type="text"
                      placeholder="/produtos"
                      value={section.settings.primaryButtonUrl || ""}
                      onChange={(e) => updateSetting("primaryButtonUrl", e.target.value)}
                      className="w-full rounded-lg border border-[#ececee] px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-[#52525b] mb-1">Texto Botão 2</label>
                    <input
                      type="text"
                      placeholder="Ver Ofertas"
                      value={section.settings.secondaryButtonText || ""}
                      onChange={(e) => updateSetting("secondaryButtonText", e.target.value)}
                      className="w-full rounded-lg border border-[#ececee] px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#52525b] mb-1">Link Botão 2</label>
                    <input
                      type="text"
                      placeholder="/produtos"
                      value={section.settings.secondaryButtonUrl || ""}
                      onChange={(e) => updateSetting("secondaryButtonUrl", e.target.value)}
                      className="w-full rounded-lg border border-[#ececee] px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MARQUEE TICKER */}
        {section.type === "marquee_ticker" && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Cor de Fundo da Faixa</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={section.settings.bgColor || "#09090b"}
                  onChange={(e) => updateSetting("bgColor", e.target.value)}
                  className="size-8 rounded-lg cursor-pointer border border-[#ececee] p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={section.settings.bgColor || "#09090b"}
                  onChange={(e) => updateSetting("bgColor", e.target.value)}
                  className="flex-1 rounded-lg border border-[#ececee] px-3 py-1.5 text-xs font-mono text-[#18181b] focus:border-[#09090b] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Frases da Faixa (Uma por linha)</label>
              <textarea
                rows={5}
                value={
                  Array.isArray(section.settings.items)
                    ? section.settings.items.join("\n")
                    : "🚀 ENVIO RÁPIDO PARA TODO BRASIL\n🔒 PAGAMENTO 100% SEGURO"
                }
                onChange={(e) => updateSetting("items", e.target.value.split("\n").filter(Boolean))}
                className="w-full rounded-lg border border-[#ececee] p-2.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* FEATURES BAR */}
        {section.type === "features_bar" && (
          <div className="space-y-3">
            <div className="p-3 bg-[#fafafa] rounded-xl space-y-1.5 border border-[#ececee]">
              <span className="text-[11px] font-semibold text-[#09090b]">Destaque 1 (Frete)</span>
              <input
                placeholder="Título"
                value={section.settings.f1Title || ""}
                onChange={(e) => updateSetting("f1Title", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-2.5 py-1.5 text-xs"
              />
              <input
                placeholder="Descrição"
                value={section.settings.f1Desc || ""}
                onChange={(e) => updateSetting("f1Desc", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-2.5 py-1.5 text-xs"
              />
            </div>

            <div className="p-3 bg-[#fafafa] rounded-xl space-y-1.5 border border-[#ececee]">
              <span className="text-[11px] font-semibold text-[#09090b]">Destaque 2 (Parcelamento)</span>
              <input
                placeholder="Título"
                value={section.settings.f2Title || ""}
                onChange={(e) => updateSetting("f2Title", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-2.5 py-1.5 text-xs"
              />
              <input
                placeholder="Descrição"
                value={section.settings.f2Desc || ""}
                onChange={(e) => updateSetting("f2Desc", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-2.5 py-1.5 text-xs"
              />
            </div>

            <div className="p-3 bg-[#fafafa] rounded-xl space-y-1.5 border border-[#ececee]">
              <span className="text-[11px] font-semibold text-[#09090b]">Destaque 3 (Garantia)</span>
              <input
                placeholder="Título"
                value={section.settings.f3Title || ""}
                onChange={(e) => updateSetting("f3Title", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-2.5 py-1.5 text-xs"
              />
              <input
                placeholder="Descrição"
                value={section.settings.f3Desc || ""}
                onChange={(e) => updateSetting("f3Desc", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-2.5 py-1.5 text-xs"
              />
            </div>

            <div className="p-3 bg-[#fafafa] rounded-xl space-y-1.5 border border-[#ececee]">
              <span className="text-[11px] font-semibold text-[#09090b]">Destaque 4 (Suporte)</span>
              <input
                placeholder="Título"
                value={section.settings.f4Title || ""}
                onChange={(e) => updateSetting("f4Title", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-2.5 py-1.5 text-xs"
              />
              <input
                placeholder="Descrição"
                value={section.settings.f4Desc || ""}
                onChange={(e) => updateSetting("f4Desc", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-2.5 py-1.5 text-xs"
              />
            </div>
          </div>
        )}

        {/* FEATURED PRODUCTS */}
        {section.type === "featured_products" && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Destaque Superior (Eyebrow)</label>
              <input
                type="text"
                value={section.settings.eyebrow || ""}
                onChange={(e) => updateSetting("eyebrow", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Título da Seção</label>
              <input
                type="text"
                value={section.settings.title || ""}
                onChange={(e) => updateSetting("title", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Quantidade de Produtos</label>
              <select
                value={section.settings.limit || 8}
                onChange={(e) => updateSetting("limit", Number(e.target.value))}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              >
                <option value={4}>4 produtos (1 linha)</option>
                <option value={8}>8 produtos (2 linhas)</option>
                <option value={12}>12 produtos (3 linhas)</option>
              </select>
            </div>
          </div>
        )}

        {/* PROMO BANNER */}
        {section.type === "promo_banner" && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Badge Promocional</label>
              <input
                type="text"
                value={section.settings.badge || ""}
                onChange={(e) => updateSetting("badge", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Título do Banner</label>
              <input
                type="text"
                value={section.settings.heading || ""}
                onChange={(e) => updateSetting("heading", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Descrição</label>
              <textarea
                rows={3}
                value={section.settings.description || ""}
                onChange={(e) => updateSetting("description", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white p-2.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Código do Cupom</label>
              <input
                type="text"
                value={section.settings.couponCode || ""}
                onChange={(e) => updateSetting("couponCode", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs font-mono text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-[#52525b] mb-1">Texto Botão</label>
                <input
                  type="text"
                  value={section.settings.buttonText || ""}
                  onChange={(e) => updateSetting("buttonText", e.target.value)}
                  className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#52525b] mb-1">Link Botão</label>
                <input
                  type="text"
                  value={section.settings.buttonUrl || ""}
                  onChange={(e) => updateSetting("buttonUrl", e.target.value)}
                  className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* IMAGE WITH TEXT */}
        {section.type === "image_with_text" && (
          <div className="space-y-3.5">
            <ImageUploader
              label="Imagem da Seção (Upload ou Link)"
              value={section.settings.imageUrl || ""}
              onChange={(url) => updateSetting("imageUrl", url)}
              aspectHint="Recomendado: 800x800px (Quadrada ou Retangular)"
            />
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Badge</label>
              <input
                type="text"
                value={section.settings.badge || ""}
                onChange={(e) => updateSetting("badge", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Título</label>
              <input
                type="text"
                value={section.settings.heading || ""}
                onChange={(e) => updateSetting("heading", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Texto</label>
              <textarea
                rows={3}
                value={section.settings.bodyText || ""}
                onChange={(e) => updateSetting("bodyText", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white p-2.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Posição da Imagem</label>
              <select
                value={section.settings.imagePosition || "right"}
                onChange={(e) => updateSetting("imagePosition", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              >
                <option value="right">À Direita</option>
                <option value="left">À Esquerda</option>
              </select>
            </div>
            <div className="space-y-2 pt-2 border-t border-[#ececee]">
              <span className="text-xs font-semibold text-[#09090b]">Itens com Check</span>
              <input
                placeholder="Item 1"
                value={section.settings.item1 || ""}
                onChange={(e) => updateSetting("item1", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
              <input
                placeholder="Item 2"
                value={section.settings.item2 || ""}
                onChange={(e) => updateSetting("item2", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
              <input
                placeholder="Item 3"
                value={section.settings.item3 || ""}
                onChange={(e) => updateSetting("item3", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* TESTIMONIALS WITH BLOCKS */}
        {section.type === "testimonials" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Título da Seção</label>
              <input
                type="text"
                value={section.settings.title || ""}
                onChange={(e) => updateSetting("title", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>

            <div className="border-t border-[#ececee] pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#09090b]">Depoimentos ({section.blocks?.length || 0})</span>
                <button
                  type="button"
                  onClick={() =>
                    addBlock("testimonial_item", {
                      author: "Novo Cliente",
                      role: "Cliente Verificado",
                      rating: 5,
                      comment: "Adorei a experiência de compra!",
                    })
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ff5a00] hover:underline cursor-pointer"
                >
                  <Plus className="size-3" /> Adicionar Depoimento
                </button>
              </div>

              {section.blocks?.map((block, idx) => (
                <div key={block.id || idx} className="rounded-xl border border-[#ececee] bg-[#fafafa] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#09090b]">#{idx + 1} - {block.settings.author || "Cliente"}</span>
                    <button
                      type="button"
                      onClick={() => removeBlock(idx)}
                      className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                      title="Remover depoimento"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <input
                    placeholder="Nome do autor"
                    value={block.settings.author || ""}
                    onChange={(e) => updateBlock(idx, { author: e.target.value })}
                    className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                  />
                  <input
                    placeholder="Cidade / Cargo"
                    value={block.settings.role || ""}
                    onChange={(e) => updateBlock(idx, { role: e.target.value })}
                    className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-1.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="Comentário"
                    value={block.settings.comment || ""}
                    onChange={(e) => updateBlock(idx, { comment: e.target.value })}
                    className="w-full rounded-lg border border-[#ececee] bg-white p-2.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ ACCORDION WITH BLOCKS */}
        {section.type === "faq_accordion" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Título do FAQ</label>
              <input
                type="text"
                value={section.settings.title || ""}
                onChange={(e) => updateSetting("title", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>

            <div className="border-t border-[#ececee] pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#09090b]">Perguntas ({section.blocks?.length || 0})</span>
                <button
                  type="button"
                  onClick={() =>
                    addBlock("faq_item", {
                      question: "Nova Pergunta?",
                      answer: "Resposta para a dúvida dos clientes.",
                    })
                  }
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#ff5a00] hover:underline cursor-pointer"
                >
                  <Plus className="size-3" /> Adicionar Pergunta
                </button>
              </div>

              {section.blocks?.map((block, idx) => (
                <div key={block.id || idx} className="rounded-xl border border-[#ececee] bg-[#fafafa] p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#09090b]">Pergunta #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeBlock(idx)}
                      className="text-rose-600 hover:text-rose-700 p-1 cursor-pointer"
                      title="Remover pergunta"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                  <input
                    placeholder="Pergunta"
                    value={block.settings.question || ""}
                    onChange={(e) => updateBlock(idx, { question: e.target.value })}
                    className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-1.5 text-xs font-semibold text-[#09090b] focus:border-[#09090b] focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    placeholder="Resposta"
                    value={block.settings.answer || ""}
                    onChange={(e) => updateBlock(idx, { answer: e.target.value })}
                    className="w-full rounded-lg border border-[#ececee] bg-white p-2.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEWSLETTER */}
        {section.type === "newsletter" && (
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Título da Newsletter</label>
              <input
                type="text"
                value={section.settings.heading || ""}
                onChange={(e) => updateSetting("heading", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Subtítulo</label>
              <textarea
                rows={2}
                value={section.settings.text || ""}
                onChange={(e) => updateSetting("text", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white p-2.5 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#52525b] mb-1">Texto do Botão</label>
              <input
                type="text"
                value={section.settings.buttonText || ""}
                onChange={(e) => updateSetting("buttonText", e.target.value)}
                className="w-full rounded-lg border border-[#ececee] bg-white px-3 py-2 text-xs text-[#18181b] focus:border-[#09090b] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* CUSTOM HTML */}
        {section.type === "custom_html_liquid" && (
          <div>
            <label className="block text-xs font-semibold text-[#52525b] mb-1">Código HTML / Liquid</label>
            <textarea
              rows={8}
              value={section.settings.htmlCode || ""}
              onChange={(e) => updateSetting("htmlCode", e.target.value)}
              className="w-full rounded-lg border border-[#ececee] p-2.5 text-xs font-mono bg-[#09090b] text-[#ff5a00] focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
