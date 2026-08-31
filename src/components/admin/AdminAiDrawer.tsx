"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ExternalLink,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";
import { useAdminAi } from "./AdminAiProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/components/ui/cn";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";

const ADMIN_QUICK_ACTIONS = [
  {
    label: "✨ Criar Produto",
    prompt: "Crie um novo produto chamado Jaqueta Cyberpunk Street por R$ 289,90 com 30 unidades na categoria Moda",
  },
  {
    label: "🎨 Cores do Tema",
    prompt: "Mude a cor primária do tema para verde Shopify #008060 e destaque #10b981",
  },
  {
    label: "📢 Barra de Anúncio",
    prompt: "Altere a barra de anúncio no topo para: ⚡ FRETE GRÁTIS ACIMA DE R$ 199 | PARCELE EM ATÉ 12X",
  },
  {
    label: "📊 Relatório de Vendas",
    prompt: "Mostre o faturamento total da loja, pedidos recentes e produtos mais vendidos",
  },
  {
    label: "⚡ Seção Marquee Neon",
    prompt: "Adicione uma nova seção de Marquee Neon com frases de promoção na página inicial da loja",
  },
];

function AdminCreatedProductCard({ rawData }: { rawData: string }) {
  const parts = rawData.split(",");
  const name = parts[1] || "Produto Criado";
  const price = parts[2] || "R$ 0,00";
  const stock = parts[3] || "0";

  return (
    <div className="my-2.5 overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ffffff] p-4 shadow-2xs">
      <div className="flex items-center gap-3.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#222222] text-white">
          <AdminIcon name={SOLAR_ICONS.products} size={18} />
        </div>
        <div>
          <span className="inline-flex text-[10px] font-semibold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] py-0.5 px-2.5 rounded-full">
            Catálogo Ativo
          </span>
          <h4 className="mt-1 text-xs font-bold text-[#222222] leading-snug">{name}</h4>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-[#6a6a6a]">
            <span className="font-bold text-[#222222] tabular-nums">{price}</span>
            <span className="text-[#c1c1c1]">•</span>
            <span className="tabular-nums font-normal">{stock} em estoque</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-[#ebebeb] pt-3">
        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-1 rounded-full border border-[#ebebeb] bg-white px-3.5 py-1.5 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] transition-all"
        >
          Gerenciar Produtos <ChevronRight className="size-3 stroke-[2]" />
        </Link>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 rounded-full bg-[#222222] text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-[#000000] transition-all ml-auto shadow-xs"
        >
          Ver na Loja <ExternalLink className="size-3 stroke-[2]" />
        </Link>
      </div>
    </div>
  );
}

function AdminThemeUpdatedCard({ details }: { details: string }) {
  return (
    <div className="my-2.5 overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ffffff] p-4 shadow-2xs">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#222222] text-white">
          <AdminIcon name={SOLAR_ICONS.palette} size={16} />
        </div>
        <div>
          <span className="inline-flex text-[10px] font-semibold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] py-0.5 px-2.5 rounded-full">
            Tema Atualizado
          </span>
          <p className="mt-1 text-xs font-bold text-[#222222] leading-snug">{details}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 border-t border-[#ebebeb] pt-3">
        <Link
          href="/admin/temas/editor"
          className="inline-flex items-center gap-1 rounded-full border border-[#ebebeb] bg-white px-3.5 py-1.5 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] transition-all"
        >
          Abrir Editor Visual <ChevronRight className="size-3 stroke-[2]" />
        </Link>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 rounded-full bg-[#222222] text-white px-3.5 py-1.5 text-xs font-semibold hover:bg-[#000000] transition-all ml-auto shadow-xs"
        >
          Ver Loja ao Vivo <ExternalLink className="size-3 stroke-[2]" />
        </Link>
      </div>
    </div>
  );
}

function RenderAdminMessage({ content }: { content: string }) {
  const productCreatedRegex = /\[\[ADMIN_PRODUCT_CREATED:([^\]]+)\]\]/g;
  const themeUpdatedRegex = /\[\[ADMIN_THEME_UPDATED:([^\]]+)\]\]/g;

  const productDataMatches: string[] = [];
  const themeDataMatches: string[] = [];

  let match;
  while ((match = productCreatedRegex.exec(content)) !== null) {
    if (match[1]) productDataMatches.push(match[1]);
  }
  while ((match = themeUpdatedRegex.exec(content)) !== null) {
    if (match[1]) themeDataMatches.push(match[1]);
  }

  const cleanContent = content
    .replace(productCreatedRegex, "")
    .replace(themeUpdatedRegex, "")
    .trim();

  const lines = cleanContent.split("\n");

  return (
    <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed text-[#222222]">
      {lines.map((line, idx) => {
        if (!line.trim()) return <div key={idx} className="h-1.5" />;

        const formattedLine = line
          .replace(/\*\*(.*?)\*\*/g, "<strong class='text-[#222222] font-semibold'>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/_(.*?)_/g, "<em>$1</em>")
          .replace(/`([^`]+)`/g, "<code class='bg-[#f7f7f7] px-1.5 py-0.5 rounded text-[#222222] font-mono text-[11px] border border-[#ebebeb]'>$1</code>");

        if (line.startsWith("• ") || line.startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-[#ff385c] font-bold text-sm leading-none mt-0.5">•</span>
              <span
                dangerouslySetInnerHTML={{
                  __html: formattedLine.replace(/^[•-]\s*/, ""),
                }}
              />
            </div>
          );
        }

        return (
          <p
            key={idx}
            dangerouslySetInnerHTML={{ __html: formattedLine }}
          />
        );
      })}

      {productDataMatches.map((data, i) => (
        <AdminCreatedProductCard key={i} rawData={data} />
      ))}

      {themeDataMatches.map((data, i) => (
        <AdminThemeUpdatedCard key={i} details={data} />
      ))}
    </div>
  );
}

export function AdminAiDrawer() {
  const {
    isOpen,
    openAi,
    closeAi,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    askAi,
    clearMessages,
  } = useAdminAi();

  const isMobile = useIsMobile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeAi();
        else openAi();
      }}
      swipeDirection={isMobile ? "down" : "right"}
    >
      <DrawerContent
        overlayClassName="bg-black/20 backdrop-blur-xs"
        className="w-full max-w-md sm:max-w-[460px] bg-[#ffffff] h-[85vh] sm:h-full max-h-[85vh] sm:max-h-full rounded-t-2xl sm:rounded-2xl border border-[#ebebeb] shadow-airbnb-modal overflow-hidden flex flex-col"
      >
        {isMobile && (
          <div className="mx-auto my-2.5 h-1.5 w-12 rounded-full bg-[#ebebeb] shrink-0" />
        )}

        {/* Airbnb Dark Header */}
        <div className="flex items-center justify-between border-b border-[#333333] bg-[#222222] px-6 py-4 text-white shrink-0 sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="relative flex size-9 items-center justify-center rounded-full bg-[#333333] text-white">
              <AdminIcon name={SOLAR_ICONS.sparkles} size={18} className="text-[#ff385c]" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-[#ff385c] ring-2 ring-[#222222]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DrawerTitle className="text-sm font-bold tracking-tight text-white">
                  Shopify Sidekick AI
                </DrawerTitle>
                <span className="px-2 py-0.2 text-[9px] font-bold text-white bg-[#ff385c] rounded-full">
                  Co-Pilot
                </span>
              </div>
              <DrawerDescription className="text-[11px] text-[#c1c1c1]">
                Criador de Produtos & Editor de Temas da Loja
              </DrawerDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={clearMessages}
              className="size-8 min-w-8 p-0 text-[#c1c1c1] hover:text-white flex items-center justify-center rounded-full hover:bg-[#333333] cursor-pointer transition-colors"
              aria-label="Reiniciar sessão"
            >
              <RotateCcw className="size-3.5 stroke-[1.75]" />
            </button>
            <DrawerClose
              className="rounded-full p-1.5 text-[#c1c1c1] hover:bg-[#333333] hover:text-white cursor-pointer transition-colors"
              aria-label="Fechar Sidekick"
            >
              <X className="size-4.5 stroke-[2]" />
            </DrawerClose>
          </div>
        </div>

        {/* Quick Action Suggestion Pills */}
        <div className="border-b border-[#ebebeb] bg-[#f7f7f7] px-4 py-2.5 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2 whitespace-nowrap">
            {ADMIN_QUICK_ACTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => askAi(item.prompt)}
                className="rounded-full border border-[#ebebeb] bg-white px-3.5 py-1 text-[11px] font-medium text-[#222222] shadow-2xs hover:bg-[#222222] hover:text-white hover:border-[#222222] transition-all cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages List Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#f7f7f7] custom-scrollbar">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={cn(
                  "flex gap-2.5 animate-fade-up",
                  isUser ? "justify-end" : "justify-start"
                )}
              >
                {!isUser && (
                  <div className="size-8 shrink-0 rounded-full bg-[#222222] text-white flex items-center justify-center mt-0.5">
                    <AdminIcon name={SOLAR_ICONS.sparkles} size={14} className="text-[#ff385c]" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[88%] rounded-2xl px-4 py-3 shadow-2xs",
                    isUser
                      ? "bg-[#222222] text-white rounded-br-xs"
                      : "bg-[#ffffff] text-[#222222] border border-[#ebebeb] rounded-tl-xs"
                  )}
                >
                  {isUser ? (
                    <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <RenderAdminMessage content={m.content} />
                  )}
                </div>

                {isUser && (
                  <div className="size-8 shrink-0 rounded-full bg-[#ff385c] text-white flex items-center justify-center mt-0.5">
                    <AdminIcon name={SOLAR_ICONS.user} size={14} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing animation */}
          {isLoading && (
            <div className="flex items-start gap-2.5 animate-fade-up">
              <div className="size-8 shrink-0 rounded-full bg-[#222222] text-white flex items-center justify-center mt-0.5">
                <AdminIcon name={SOLAR_ICONS.sparkles} size={14} className="text-[#ff385c]" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs border border-[#ebebeb] bg-white px-4 py-3 shadow-2xs">
                <span className="flex size-2 rounded-full bg-[#ff385c] animate-pulse" />
                <span className="text-xs text-[#6a6a6a] font-normal">Sidekick processando ação no Admin...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Footer */}
        <div className="border-t border-[#ebebeb] bg-white p-4 shrink-0 shadow-none sm:rounded-b-2xl">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Peça para criar produto, editar tema, consultar vendas..."
              disabled={isLoading}
              className="h-10.5 flex-1 rounded-full border border-[#ebebeb] bg-[#f7f7f7] px-4 text-xs sm:text-sm text-[#222222] placeholder:text-[#6a6a6a]
                         focus:border-[#222222] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all duration-150 ease-out disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="size-10 min-w-10 flex items-center justify-center rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] disabled:opacity-40 transition-all cursor-pointer shadow-xs"
              aria-label="Enviar comando"
            >
              <Send className="size-4 stroke-[2]" />
            </button>
          </form>

          <div className="mt-2.5 flex items-center justify-between px-2 text-[10px] text-[#6a6a6a] font-normal">
            <span className="flex items-center gap-1.5">
              <AdminIcon name={SOLAR_ICONS.bolt} size={13} className="text-[#ff385c]" /> Ações instantâneas na base de dados
            </span>
            <span className="text-[10px] font-semibold text-[#222222] bg-[#f7f7f7] border border-[#ebebeb] px-2 py-0.5 rounded-full">
              Airbnb Design System
            </span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
