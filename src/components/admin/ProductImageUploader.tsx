"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/components/ui/cn";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";

const PRESET_IMAGES = [
  { id: "p01", path: "/products/p01.svg", label: "Eletrônico 1" },
  { id: "p02", path: "/products/p02.svg", label: "Eletrônico 2" },
  { id: "p03", path: "/products/p03.svg", label: "Acessório 1" },
  { id: "p04", path: "/products/p04.svg", label: "Acessório 2" },
  { id: "p05", path: "/products/p05.svg", label: "Smart 1" },
  { id: "p06", path: "/products/p06.svg", label: "Smart 2" },
  { id: "p07", path: "/products/p07.svg", label: "Gadget 1" },
  { id: "p08", path: "/products/p08.svg", label: "Gadget 2" },
  { id: "p09", path: "/products/p09.svg", label: "Tech 1" },
  { id: "p10", path: "/products/p10.svg", label: "Tech 2" },
  { id: "p11", path: "/products/p11.svg", label: "Moda 1" },
  { id: "p12", path: "/products/p12.svg", label: "Moda 2" },
];

interface ProductImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

export function ProductImageUploader({ value, onChange }: ProductImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "presets" | "url">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor, selecione um arquivo de imagem válido (PNG, JPG, WEBP, SVG).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("A imagem deve ter no máximo 10MB.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      onChange(dataUrl);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dataUrl,
            name: file.name,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data.url) {
            onChange(data.url);
          }
        }
      } catch {
        // Non-blocking fallback
      }
    } catch {
      setUploadError("Não foi possível carregar o arquivo selecionado.");
    } finally {
      setIsUploading(false);
    }
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }

  const hasImage = Boolean(value && value.trim() && value !== "/products/default.svg");

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#222222]">
          Imagens e Mídia do Produto
        </label>
        <span className="text-[11px] text-[#6a6a6a] font-normal">
          PNG, JPG, WEBP ou SVG (até 10MB)
        </span>
      </div>

      {/* Pill Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-full bg-[#f7f7f7] border border-[#ebebeb]">
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs transition-all cursor-pointer",
            activeTab === "upload"
              ? "bg-white text-[#222222] shadow-2xs font-semibold"
              : "text-[#6a6a6a] hover:text-[#222222]"
          )}
        >
          <Upload className="size-3.5" />
          <span>Fazer Upload</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("presets")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs transition-all cursor-pointer",
            activeTab === "presets"
              ? "bg-white text-[#222222] shadow-2xs font-semibold"
              : "text-[#6a6a6a] hover:text-[#222222]"
          )}
        >
          <ImageIcon className="size-3.5" />
          <span>Galeria ({PRESET_IMAGES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("url")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-1.5 px-3 rounded-full text-xs transition-all cursor-pointer",
            activeTab === "url"
              ? "bg-white text-[#222222] shadow-2xs font-semibold"
              : "text-[#6a6a6a] hover:text-[#222222]"
          )}
        >
          <LinkIcon className="size-3.5" />
          <span>Link / URL</span>
        </button>
      </div>

      {/* Tab 1: Upload */}
      {activeTab === "upload" && (
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
            onChange={onFileInputChange}
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer",
              isDragging
                ? "border-[#222222] bg-[#f7f7f7]"
                : "border-[#ebebeb] bg-[#ffffff] hover:border-[#222222] hover:bg-[#f7f7f7]/50",
              isUploading && "pointer-events-none opacity-60"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="size-8 animate-spin text-[#ff385c]" />
                <span className="text-xs font-semibold text-[#222222]">Enviando imagem para a loja...</span>
                <span className="text-[11px] text-[#6a6a6a]">Aguarde um instante</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex size-11 items-center justify-center rounded-full bg-[#f7f7f7] text-[#222222] border border-[#ebebeb]">
                  <Upload className="size-5" />
                </div>
                <div className="mt-1 text-xs font-bold text-[#222222]">
                  Clique para selecionar ou arraste sua foto aqui
                </div>
                <p className="text-[11px] text-[#6a6a6a] max-w-xs font-normal">
                  Suporta fotos nítidas PNG, JPG, WebP ou SVG com alta resolução para a vitrine.
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[#ebebeb] bg-white px-4 py-1.5 text-xs font-medium text-[#222222] shadow-2xs hover:bg-[#f7f7f7]">
                  <AdminIcon name={SOLAR_ICONS.add} size={14} /> Selecionar do dispositivo
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Presets Gallery */}
      {activeTab === "presets" && (
        <div className="space-y-3 rounded-xl border border-[#ebebeb] bg-[#ffffff] p-3.5">
          <div className="text-xs text-[#6a6a6a] font-normal">
            Escolha uma imagem de catálogo padrão para o produto:
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-56 overflow-y-auto custom-scrollbar p-1">
            {PRESET_IMAGES.map((preset) => {
              const isSelected = value === preset.path;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange(preset.path)}
                  className={cn(
                    "group relative aspect-square rounded-xl border bg-[#f7f7f7] p-2 flex flex-col items-center justify-center transition-all cursor-pointer",
                    isSelected
                      ? "border-[#222222] ring-2 ring-[#222222] bg-white"
                      : "border-[#ebebeb] hover:border-[#222222] hover:bg-white"
                  )}
                  title={preset.label}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preset.path}
                    alt={preset.label}
                    className="size-full object-contain transition-transform group-hover:scale-105"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 flex size-4.5 items-center justify-center rounded-full bg-[#ff385c] text-white">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: URL Direct Input */}
      {activeTab === "url" && (
        <div className="space-y-2 rounded-xl border border-[#ebebeb] bg-[#ffffff] p-4">
          <label className="text-xs font-bold text-[#222222]">
            URL ou Caminho da Imagem
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://exemplo.com/imagem-do-produto.jpg ou /products/p01.svg"
            className="h-10 w-full rounded-lg border border-[#ebebeb] bg-white px-3.5 text-xs text-[#222222] placeholder:text-[#6a6a6a] focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222]"
          />
          <p className="text-[11px] text-[#6a6a6a]">
            Cole links diretos de fotos hospedadas na web ou no CDN da loja.
          </p>
        </div>
      )}

      {/* Upload Error Message */}
      {uploadError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 font-medium">
          {uploadError}
        </div>
      )}

      {/* Current Active Image Card */}
      {hasImage && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[#ebebeb] bg-[#f7f7f7] p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-[#ebebeb] bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Imagem selecionada" className="size-full object-cover" />
            </div>
            <div className="min-w-0 truncate">
              <div className="text-xs font-bold text-[#222222] truncate">{value}</div>
              <div className="text-[11px] text-[#15803d] font-semibold flex items-center gap-1 mt-0.5">
                <span className="size-1.5 rounded-full bg-[#008a05]" />
                Imagem ativa no catálogo
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex size-8.5 items-center justify-center rounded-full border border-[#ebebeb] bg-white text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] transition-colors cursor-pointer"
              title="Trocar imagem"
            >
              <RefreshCw className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange("/products/default.svg")}
              className="flex size-8.5 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Remover imagem (usar padrão)"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
