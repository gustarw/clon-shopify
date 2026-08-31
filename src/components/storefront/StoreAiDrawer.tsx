"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Check,
  ChevronRight,
  Plus,
  RotateCcw,
  Send,
  Sparkles,
  Truck,
  User,
  X,
} from "lucide-react";
import { useStoreAi } from "./StoreAiProvider";
import { useCart } from "@/components/cart/CartProvider";
import { useIsMobile } from "@/hooks/use-mobile";
import { money } from "@/lib/money";
import { cn } from "@/components/ui/cn";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";

interface ProductCardData {
  id: number;
  name: string;
  slug: string;
  price_cents: number;
  compare_at_cents: number | null;
  image: string;
  stock: number;
  category?: { name: string; slug: string };
}

function ChatProductCard({ slug }: { slug: string }) {
  const [product, setProduct] = useState<ProductCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const { closeAi } = useStoreAi();

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/products/lookup?slug=${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.product) {
          setProduct(data.product);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="my-2.5 flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-3.5 shadow-2xs animate-pulse">
        <div className="size-16 rounded-xl bg-ink-200" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-3/4 rounded-md bg-ink-200" />
          <div className="h-3 w-1/2 rounded-md bg-ink-200" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.image,
        priceCents: product.price_cents,
        stock: product.stock,
        categoryName: product.category?.name,
      },
      1,
      false
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  const discountPercent =
    product.compare_at_cents && product.compare_at_cents > product.price_cents
      ? Math.round(((product.compare_at_cents - product.price_cents) / product.compare_at_cents) * 100)
      : null;

  return (
    <div className="my-2.5 overflow-hidden rounded-2xl border border-brand-200/80 bg-white p-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] hover:border-brand-300 hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-150 ease-out">
      <div className="flex gap-3.5">
        <Link
          href={`/produtos/${product.slug}`}
          onClick={closeAi}
          className="relative size-18 shrink-0 overflow-hidden rounded-xl border border-ink-100 bg-ink-50 outline-1 outline-black/10 group"
        >
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="72px"
          />
          {discountPercent && (
            <span className="absolute left-1 top-1 rounded-md bg-red-600 px-1 py-0.5 text-[9px] font-bold text-white shadow-2xs">
              -{discountPercent}%
            </span>
          )}
        </Link>

        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            {product.category?.name && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">
                {product.category.name}
              </span>
            )}
            <Link
              href={`/produtos/${product.slug}`}
              onClick={closeAi}
              className="block truncate text-xs font-bold text-ink-900 hover:text-brand-600 transition-colors"
              title={product.name}
            >
              {product.name}
            </Link>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xs font-extrabold text-ink-900">
                {money(product.price_cents)}
              </span>
              {product.compare_at_cents && (
                <span className="text-[10px] text-ink-400 line-through">
                  {money(product.compare_at_cents)}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <Link
              href={`/produtos/${product.slug}`}
              onClick={closeAi}
              className="text-[11px] font-semibold text-ink-600 hover:text-brand-600 flex items-center gap-0.5"
            >
              Ver detalhes <ChevronRight className="size-3.5 stroke-[2]" />
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold shadow-2xs active:scale-[0.96] transition-transform duration-150 ease-out",
                added
                  ? "bg-emerald-600 text-white"
                  : product.stock > 0
                  ? "bg-brand-600 text-white hover:bg-brand-700"
                  : "bg-ink-100 text-ink-400 cursor-not-allowed"
              )}
            >
              {added ? (
                <>
                  <Check className="size-3.5 stroke-[2]" /> Adicionado!
                </>
              ) : product.stock > 0 ? (
                <>
                  <Plus className="size-3.5 stroke-[2]" /> Adicionar
                </>
              ) : (
                "Esgotado"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RenderMessageContent({ content }: { content: string }) {
  const productTagRegex = /\[\[PRODUCT:([a-zA-Z0-9_-]+)\]\]/g;
  const productSlugs: string[] = [];
  let match;

  while ((match = productTagRegex.exec(content)) !== null) {
    if (match[1] && !productSlugs.includes(match[1])) {
      productSlugs.push(match[1]);
    }
  }

  const cleanContent = content.replace(productTagRegex, "").trim();
  const lines = cleanContent.split("\n");

  return (
    <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed text-ink-800">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        const formattedLine = line
          .replace(/\*\*(.*?)\*\*/g, "<strong class='text-ink-950 font-bold'>$1</strong>")
          .replace(/\*(.*?)\*/g, "<em>$1</em>")
          .replace(/_(.*?)_/g, "<em>$1</em>")
          .replace(/`([^`]+)`/g, "<code class='bg-ink-100 px-1.5 py-0.5 rounded-md text-brand-700 font-mono text-[11px] border border-ink-200/60'>$1</code>");

        if (line.startsWith("• ") || line.startsWith("- ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="text-brand-500 font-bold text-sm leading-none mt-0.5">•</span>
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

      {productSlugs.length > 0 && (
        <div className="mt-2 space-y-2">
          {productSlugs.map((slug) => (
            <ChatProductCard key={slug} slug={slug} />
          ))}
        </div>
      )}
    </div>
  );
}

const QUICK_SUGGESTIONS = [
  { label: "🔥 Mais Vendidos", prompt: "Quais são os produtos mais vendidos e destaques da loja?" },
  { label: "🚚 Frete Grátis", prompt: "Como funciona a política de frete grátis da loja?" },
  { label: "💳 Pagamentos & Parcelas", prompt: "Quais são as opções de pagamento e parcelamento?" },
  { label: "🎧 Eletrônicos", prompt: "Quais produtos de tecnologia e eletrônicos você recomenda?" },
  { label: "📦 Rastrear Pedido", prompt: "Como faço para consultar o status do meu pedido?" },
];

export function StoreAiDrawer() {
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
  } = useStoreAi();

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
      <DrawerContent className="w-full max-w-md sm:max-w-lg bg-white h-full flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.25)] border-l border-ink-200">
        {isMobile && (
          <div className="mx-auto my-2.5 h-1.5 w-12 rounded-full bg-ink-300 shrink-0" />
        )}

        {/* Header with Shopify AI Agent style */}
        <div className="flex items-center justify-between border-b border-ink-200 bg-gradient-to-r from-brand-900 via-brand-800 to-ink-950 px-5 py-4 text-white shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex size-9.5 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-500 text-white shadow-md shadow-brand-500/40 outline-1 outline-white/10">
              <Sparkles className="size-4.5 stroke-[2] animate-pulse" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-400 ring-2 ring-brand-950" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <DrawerTitle className="text-sm font-bold tracking-tight text-white">
                  Shopify AI Sidekick
                </DrawerTitle>
                <span className="rounded-md bg-brand-500/30 px-1.5 py-0.5 text-[9px] font-bold text-brand-200 border border-brand-400/30">
                  AI Agent 2.0
                </span>
              </div>
              <DrawerDescription className="text-[11px] text-brand-200/80">
                Assistente de Compras & Catálogo Inteligente
              </DrawerDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={clearMessages}
              title="Reiniciar conversa"
              className="rounded-lg p-1.5 text-brand-200 hover:bg-white/10 hover:text-white active:scale-[0.96] transition-transform duration-150 ease-out"
              aria-label="Reiniciar conversa"
            >
              <RotateCcw className="size-4 stroke-[1.75]" />
            </button>
            <DrawerClose
              className="rounded-lg p-1.5 text-brand-200 hover:bg-white/10 hover:text-white active:scale-[0.96] transition-transform duration-150 ease-out"
              aria-label="Fechar assistente IA"
            >
              <X className="size-5 stroke-[1.75]" />
            </DrawerClose>
          </div>
        </div>

        {/* Quick Suggestions Horizontal Pills */}
        <div className="border-b border-ink-100 bg-ink-50/70 px-4 py-2.5 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2 whitespace-nowrap">
            {QUICK_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => askAi(item.prompt)}
                className="rounded-full border border-ink-200/90 bg-white px-3 py-1.5 text-[11px] font-semibold text-ink-700 shadow-2xs hover:border-brand-500 hover:bg-brand-50 hover:text-brand-700 active:scale-[0.96] transition-all duration-150 ease-out"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa] custom-scrollbar">
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
                  <div className="flex size-7.5 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs mt-0.5 outline-1 outline-black/10">
                    <Bot className="size-4 stroke-[2]" />
                  </div>
                )}

                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
                    isUser
                      ? "bg-brand-600 text-white rounded-br-sm"
                      : "bg-white text-ink-900 border border-ink-200/80 rounded-tl-sm"
                  )}
                >
                  {isUser ? (
                    <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">{m.content}</p>
                  ) : (
                    <RenderMessageContent content={m.content} />
                  )}
                </div>

                {isUser && (
                  <div className="flex size-7.5 shrink-0 items-center justify-center rounded-xl bg-ink-200 text-ink-700 shadow-xs mt-0.5 outline-1 outline-black/10">
                    <User className="size-4 stroke-[2]" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing animation when AI is generating */}
          {isLoading && (
            <div className="flex items-start gap-2.5 animate-fade-up">
              <div className="flex size-7.5 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs mt-0.5 outline-1 outline-black/10">
                <Bot className="size-4 stroke-[2]" />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-ink-200/80 bg-white px-4 py-3 shadow-2xs">
                <span className="size-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:-0.3s]" />
                <span className="size-1.5 rounded-full bg-brand-600 animate-bounce [animation-delay:-0.15s]" />
                <span className="size-1.5 rounded-full bg-brand-600 animate-bounce" />
                <span className="ml-1 text-xs text-ink-500 font-semibold">Sidekick pensando...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form Footer */}
        <div className="border-t border-ink-200 bg-white p-3.5 sm:p-4 shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Pergunte ao Shopify Sidekick sobre a loja..."
              disabled={isLoading}
              className="h-11 flex-1 rounded-xl border border-ink-200 bg-ink-50 px-4 pr-10 text-xs sm:text-sm text-ink-900 placeholder:text-ink-400
                         focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-600/20 transition-all duration-150 ease-out disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.96] transition-transform duration-150 ease-out"
              aria-label="Enviar mensagem"
            >
              <Send className="size-4.5 stroke-[2]" />
            </button>
          </form>

          <div className="mt-2.5 flex items-center justify-between px-1 text-[10px] text-ink-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Truck className="size-3 text-emerald-500 stroke-[2]" /> Frete Grátis acima de R$ 199
            </span>
            <span className="font-semibold text-ink-500">Base UI Drawer • AI SDK</span>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
