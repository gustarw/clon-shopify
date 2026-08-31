"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { ArrowRight, Check, Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { useCart } from "./CartProvider";
import { money } from "@/lib/money";

const FREE_SHIPPING_THRESHOLD_CENTS = 19900; // R$ 199,00

export function CartDrawer() {
  const { items, count, subtotalCents, isOpen, closeCart, setQuantity, remove } = useCart();

  // Close on Escape key press
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents);
  const freeShippingProgress = Math.min(100, (subtotalCents / FREE_SHIPPING_THRESHOLD_CENTS) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <aside className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink-200 px-6 py-4">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <ShoppingBag className="size-4" />
              </span>
              <h2 className="text-base font-bold text-ink-900">
                Carrinho de Compras <span className="text-xs font-normal text-ink-500">({count} {count === 1 ? "item" : "itens"})</span>
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
              aria-label="Fechar carrinho"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Free shipping progress bar */}
          <div className="border-b border-ink-100 bg-brand-50/50 px-6 py-3">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-800">
              <Truck className="size-4 text-brand-600 shrink-0" />
              {remainingForFreeShipping === 0 ? (
                <span className="text-brand-700 font-semibold flex items-center gap-1">
                  <Check className="size-3.5" /> Parabéns! Você ganhou <strong>Frete Grátis</strong>!
                </span>
              ) : (
                <span>
                  Faltam <strong>{money(remainingForFreeShipping)}</strong> para ganhar <strong>Frete Grátis</strong>
                </span>
              )}
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-200">
              <div
                className="h-full bg-brand-600 transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Body / Items list */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center py-12">
                <div className="flex size-16 items-center justify-center rounded-full bg-ink-100 text-ink-400 mb-4">
                  <ShoppingBag className="size-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold text-ink-900">Seu carrinho está vazio</h3>
                <p className="mt-1 text-sm text-ink-500 max-w-xs">
                  Adicione produtos ao seu carrinho para aproveitar nossas ofertas especiais.
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
                >
                  Explorar Catálogo <ArrowRight className="size-4" />
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-ink-100">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-ink-200 bg-ink-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || "/products/default.svg"}
                        alt={item.name}
                        className="size-full object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        {item.categoryName && (
                          <span className="text-[11px] uppercase tracking-wider text-ink-400 font-medium">
                            {item.categoryName}
                          </span>
                        )}
                        <Link
                          href={`/produtos/${item.slug}`}
                          onClick={closeCart}
                          className="line-clamp-1 text-sm font-semibold text-ink-900 hover:text-brand-700 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <div className="mt-0.5 text-xs text-ink-500">
                          {money(item.priceCents)} cada
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Stepper */}
                        <div className="flex items-center rounded-lg border border-ink-200 bg-white">
                          <button
                            onClick={() => setQuantity(item.productId, item.quantity - 1)}
                            className="flex size-7 items-center justify-center text-ink-500 hover:text-ink-900 transition-colors"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-ink-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="flex size-7 items-center justify-center text-ink-500 hover:text-ink-900 transition-colors disabled:opacity-40"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-ink-900">
                            {money(item.priceCents * item.quantity)}
                          </span>
                          <button
                            onClick={() => remove(item.productId)}
                            className="text-ink-400 hover:text-red-600 transition-colors p-1"
                            aria-label="Remover item"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-ink-200 bg-ink-50/70 p-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm text-ink-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink-900">{money(subtotalCents)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-ink-500">
                  <span>Frete</span>
                  <span>{remainingForFreeShipping === 0 ? <strong className="text-brand-700 uppercase">Grátis</strong> : "Calculado no checkout"}</span>
                </div>
              </div>

              <div className="border-t border-ink-200 pt-3">
                <div className="flex items-center justify-between text-base font-bold text-ink-900">
                  <span>Total estimado</span>
                  <span>{money(subtotalCents)}</span>
                </div>
                <p className="mt-1 text-[11px] text-ink-500">
                  Taxas e opções de envio calculadas na próxima etapa.
                </p>
              </div>

              <div className="grid gap-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 transition-all active:scale-[0.99]"
                >
                  Finalizar Compra <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/carrinho"
                  onClick={closeCart}
                  className="flex h-10 w-full items-center justify-center rounded-xl border border-ink-300 bg-white text-xs font-semibold text-ink-700 hover:bg-ink-100 transition-colors"
                >
                  Ver carrinho completo
                </Link>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-ink-400 pt-1">
                <span>🔒 Pagamento Seguro & Criptografia 256-bit</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
