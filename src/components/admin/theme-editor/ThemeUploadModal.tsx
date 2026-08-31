"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Palette,
  Layers,
  ArrowRight,
  X,
  FileCode,
  Check,
  RefreshCw,
} from "lucide-react";
import type { ThemeConversionResult } from "@/lib/theme-importer/shopify-types";
import { cn } from "@/components/ui/cn";

interface ThemeUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeUploaded: (result: ThemeConversionResult) => void;
}

export function ThemeUploadModal({
  isOpen,
  onClose,
  onThemeUploaded,
}: ThemeUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [setActiveImmediately, setSetActiveImmediately] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [conversionResult, setConversionResult] = useState<ThemeConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const STEPS = [
    "Lendo e descompactando arquivo .ZIP da Shopify...",
    "Extraindo config/settings_data.json e settings_schema.json...",
    "Mapeando paleta de cores, tipografia e redes sociais...",
    "Convertendo templates/index.json e seções Liquid para React...",
    "Extraindo assets e gerando o tema no SensaShop...",
  ];

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  }

  function validateAndSetFile(selectedFile: File) {
    setErrorMsg(null);
    const name = selectedFile.name.toLowerCase();
    if (!name.endsWith(".zip") && !name.endsWith(".json")) {
      setErrorMsg("Por favor, selecione um arquivo .ZIP do tema Shopify ou um arquivo .JSON de template.");
      return;
    }
    setFile(selectedFile);
  }

  async function handleStartConversion() {
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg(null);
    setProgressStep(0);

    // Progress animation interval
    const interval = setInterval(() => {
      setProgressStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 450);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("setActive", setActiveImmediately ? "true" : "false");

      const res = await fetch("/api/theme/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);
      setProgressStep(4);

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Falha ao converter o tema Shopify.");
        setIsProcessing(false);
        return;
      }

      setConversionResult(data);
      onThemeUploaded(data);
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      setErrorMsg("Erro de conexão ao enviar o arquivo do tema.");
      setIsProcessing(false);
    }
  }

  function handleReset() {
    setFile(null);
    setIsProcessing(false);
    setConversionResult(null);
    setErrorMsg(null);
    setProgressStep(0);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Upload className="size-4.5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Upload de Tema Shopify Liquid</h3>
              <p className="text-xs text-gray-500">
                Converta automaticamente temas OS 2.0 (.zip) para os componentes nativos do SensaShop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STATE 1: SUCCESS CONVERSION REPORT */}
          {conversionResult ? (
            <div className="space-y-6 animate-fade-up">
              {/* Success Header Banner */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4.5 flex items-start gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                  <CheckCircle2 className="size-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-emerald-950">
                      {conversionResult.metadata.themeName}
                    </h4>
                    <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {conversionResult.metadata.shopifyVersion}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Tema convertido com sucesso e adicionado à sua Biblioteca de Temas!
                  </p>
                </div>
              </div>

              {/* Conversion Statistics Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">Seções</span>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {conversionResult.theme.sections.length}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">100% Modulares</span>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">Tipografia</span>
                  <div className="text-xs font-bold text-gray-900 truncate mt-1">
                    {conversionResult.theme.typography.headingFont}
                  </div>
                  <span className="text-[10px] text-gray-500">+ {conversionResult.theme.typography.bodyFont}</span>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">Assets</span>
                  <div className="text-lg font-bold text-gray-900 mt-0.5">
                    {conversionResult.metadata.assetsExtractedCount}
                  </div>
                  <span className="text-[10px] text-gray-500">Mídias salvas</span>
                </div>
              </div>

              {/* Colors preview */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                    <Palette className="size-3.5 text-gray-500" /> Paleta de Cores Extraída
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Primária: {conversionResult.theme.colors.primary}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="size-7 rounded-lg shadow-xs border border-black/10 flex items-center justify-center text-[10px] text-white font-bold"
                    style={{ backgroundColor: conversionResult.theme.colors.primary }}
                    title="Cor Primária"
                  >
                    P
                  </div>
                  <div
                    className="size-7 rounded-lg shadow-xs border border-black/10 flex items-center justify-center text-[10px] text-white font-bold"
                    style={{ backgroundColor: conversionResult.theme.colors.accent }}
                    title="Destaque / Acento"
                  >
                    A
                  </div>
                  <div
                    className="size-7 rounded-lg shadow-xs border border-black/10"
                    style={{ backgroundColor: conversionResult.theme.colors.background }}
                    title="Fundo"
                  />
                  <div
                    className="size-7 rounded-lg shadow-xs border border-black/10"
                    style={{ backgroundColor: conversionResult.theme.colors.surface }}
                    title="Superfície"
                  />
                  <div
                    className="size-7 rounded-lg shadow-xs border border-black/10"
                    style={{ backgroundColor: conversionResult.theme.colors.textMain }}
                    title="Texto Principal"
                  />
                </div>
              </div>

              {/* Converted sections list */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <Layers className="size-3.5 text-gray-500" /> Seções Convertidas ({conversionResult.convertedSections.length})
                </span>
                <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-100 divide-y divide-gray-100 bg-white">
                  {conversionResult.convertedSections.map((sec, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3.5 py-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        <span className="font-semibold text-gray-800 truncate">{sec.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({sec.originalType})</span>
                      </div>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600 shrink-0">
                        {sec.convertedType}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  Importar Outro Tema
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push(`/admin/temas/editor?preset=${conversionResult.theme.id}`);
                    }}
                    className="rounded-full bg-gray-900 px-5 py-2 text-xs font-bold text-white hover:bg-black transition cursor-pointer shadow-sm flex items-center gap-1.5"
                  >
                    Personalizar no Editor <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : isProcessing ? (
            /* STATE 2: PROCESSING ANIMATION */
            <div className="py-10 text-center space-y-6 animate-fade-in">
              <div className="relative mx-auto size-16">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-50" />
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg animate-spin">
                  <RefreshCw className="size-7" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-gray-900">Processando Tema Shopify...</h4>
                <p className="text-xs text-gray-500 font-medium">
                  {STEPS[progressStep] || "Finalizando conversão..."}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full max-w-md mx-auto bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((progressStep + 1) / STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            /* STATE 3: UPLOAD DROPZONE */
            <div className="space-y-5">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer",
                  dragActive
                    ? "border-emerald-500 bg-emerald-50/50 scale-[1.01]"
                    : "border-gray-200 bg-gray-50/50 hover:border-gray-400 hover:bg-gray-50"
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex size-14 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-xs mb-3 text-emerald-600">
                  <FileArchive className="size-7" />
                </div>

                {file ? (
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-gray-900">{file.name}</div>
                    <p className="text-xs text-emerald-600 font-medium">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • Pronto para conversão
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-gray-800">
                      Arraste seu tema Shopify (.zip) aqui
                    </div>
                    <p className="text-xs text-gray-500">
                      Ou clique para selecionar o arquivo do seu computador
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] text-gray-400">
                      <span>✓ Shopify OS 2.0 (Dawn, Sense, Craft)</span>
                      <span>•</span>
                      <span>✓ Temas Vintage (Liquid)</span>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const res = await fetch("/samples/shopify-dawn-sample.zip");
                            const blob = await res.blob();
                            const sampleFile = new File([blob], "shopify-dawn-15-sample.zip", { type: "application/zip" });
                            setFile(sampleFile);
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50/80 hover:bg-emerald-100/80 border border-emerald-200 px-3 py-1 rounded-full transition cursor-pointer"
                      >
                        <Sparkles className="size-3" /> Usar tema Shopify de demonstração (Dawn 15 .ZIP)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Set Active Checkbox */}
              <label className="flex items-center gap-2.5 px-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={setActiveImmediately}
                  onChange={(e) => setSetActiveImmediately(e.target.checked)}
                  className="size-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs text-gray-700 font-medium">
                  Ativar e publicar este tema imediatamente na loja virtual após a conversão
                </span>
              </label>

              {/* Error Alert */}
              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!file}
                  onClick={handleStartConversion}
                  className="rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer shadow-sm flex items-center gap-2"
                >
                  <Sparkles className="size-4" /> Converter e Importar Tema
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
