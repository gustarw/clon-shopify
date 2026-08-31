"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Upload, X, Loader2, Link as LinkIcon } from "lucide-react";
import { cn } from "@/components/ui/cn";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  aspectHint?: string;
}

export function ImageUploader({
  value,
  onChange,
  label = "Imagem",
  aspectHint = "Recomendado: 1920x800px (JPG, PNG, WebP)",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione um arquivo de imagem válido (JPG, PNG, WebP, SVG).");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onChange(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.onerror = reject;
        r.readAsDataURL(file);
      });

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl, name: file.name }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.url) {
          onChange(data.url);
        }
      }
    } catch (err) {
      console.warn("Upload fallback to dataUrl:", err);
    } finally {
      setIsUploading(false);
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleUrlSubmit() {
    if (urlDraft.trim()) {
      onChange(urlDraft.trim());
      setUrlDraft("");
      setShowUrlInput(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#222222]">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-[#ff385c] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <LinkIcon className="size-3" />
          {showUrlInput ? "Ocultar URL" : "Inserir por URL"}
        </button>
      </div>

      {/* URL Input Bar if opened */}
      {showUrlInput && (
        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#f7f7f7] border border-[#ebebeb]">
          <input
            type="text"
            placeholder="Cole o link da imagem (https://...)"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            className="flex-1 rounded-full border border-[#ebebeb] bg-white px-3.5 py-1.5 text-xs text-[#222222] placeholder:text-[#6a6a6a] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="rounded-full bg-[#222222] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#000000] cursor-pointer shadow-xs"
          >
            Aplicar
          </button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      {/* Image Preview or Dropzone */}
      {value ? (
        <div className="relative rounded-xl border border-[#ebebeb] bg-[#f7f7f7] overflow-hidden group shadow-2xs">
          {/* Thumbnail */}
          <div className="relative h-36 w-full overflow-hidden bg-[#f7f7f7] flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Prévia da imagem"
              className="h-full w-full object-cover object-center"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 text-white text-xs font-semibold">
                <Loader2 className="size-4 animate-spin text-[#ff385c]" />
                <span>Enviando imagem...</span>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between p-2.5 bg-white border-t border-[#ebebeb]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-full border border-[#ebebeb] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#222222] hover:bg-[#f7f7f7] transition-colors cursor-pointer shadow-2xs"
            >
              <Upload className="size-3.5 text-[#ff385c]" />
              <span>Trocar imagem</span>
            </button>

            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Remover imagem"
            >
              <X className="size-3.5" />
              <span>Remover</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center",
            isDragging
              ? "border-[#222222] bg-[#f7f7f7]"
              : "border-[#ebebeb] bg-white hover:border-[#222222] hover:bg-[#f7f7f7]/60"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-[#222222]">
              <Loader2 className="size-6 animate-spin text-[#ff385c]" />
              <span className="text-xs font-semibold">Enviando imagem...</span>
            </div>
          ) : (
            <>
              <div className="flex size-10 items-center justify-center rounded-full bg-[#f7f7f7] border border-[#ebebeb] text-[#222222] mb-2">
                <Upload className="size-5" />
              </div>
              <div className="text-xs font-bold text-[#222222]">
                Clique para selecionar ou arraste uma foto
              </div>
              <p className="text-[11px] text-[#6a6a6a] mt-1 font-normal">{aspectHint}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
