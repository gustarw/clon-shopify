"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { money } from "@/lib/money";

export default function CartPage() {
  const { items, count, subtotalCents, setQuantity, remove, clear, isReady } = useCart();

  if (!isReady) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-ink-200" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 animate-fade-up">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <span className="flex size-20 items-center justify-center rounded-3xl bg-brand-50 text-brand-600">
            <ShoppingBag className="size-10" />
          </span>
          <h1 className="mt-6 text-2xl font-bold text-ink-900">Seu carrinho está vazio</h1>
          <p className="mt-2 text-sm text-ink-500">
            Explore nosso catálogo e adicione produtos para começar sua compra.
          </p>
          <Link
            href="/produtos"
            className="mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700"
          >
            Ver produtos <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-up">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink-900">Carrinho</h1>
          <p className="mt-1 text-sm text-ink-500">
            {count} item{count === 1 ? "" : "s"} no carrinho
          </p>
        </div>
        <button
          onClick={clear}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-ink-500 hover:bg-ink-100 hover:text-red-600"
        >
          <Trash2 className="size-4" /> Limpar carrinho
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex gap-4 rounded-2xl border border-ink-200 bg-white p-4 sm:gap-5 sm:p-5"
            >
              <Link
                href={`/produtos/${item.slug}`}
                className="relative block size-20 shrink-0 overflow-hidden rounded-xl bg-ink-100 sm:size-24"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/products/default.svg"}
                  alt={item.name}
                  className="size-full object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {item.categoryName && (
                      <span className="text-xs font-medium uppercase tracking-wide text-ink-400">
                        {item.categoryName}
                      </span>
                    )}
                    <Link
                      href={`/produtos/${item.slug}`}
                      className="mt-0.5 block truncate text-sm font-semibold text-ink-900 hover:text-brand-700"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-1 text-sm text-ink-500">{money(item.priceCents)} cada</div>
                  </div>
                  <button
                    onClick={() => remove(item.productId)}
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-red-50 hover:text-red-600"
                    aria-label={`Remover ${item.name}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <div className="flex h-9 items-center rounded-lg border border-ink-300">
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="flex size-9 items-center justify-center text-ink-600 hover:text-ink-900"
                      aria-label="Diminuir"
                    >
                      −
                    </button>
                    <span className="w-9 text-center text-sm font-semibold text-ink-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="flex size-9 items-center justify-center text-ink-600 hover:text-ink-900 disabled:opacity-30"
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-base font-bold text-ink-900">
                    {money(item.priceCents * item.quantity)}
                  </div>
                </div>
                {item.quantity >= item.stock && (
                  <p className="mt-1.5 text-xs text-amber-600">
                    Quantidade máxima disponível atingida.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-ink-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-ink-900">Resumo do pedido</h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="font-medium text-ink-900">{money(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Frete</dt>
              <dd className="font-medium text-brand-700">
                {subtotalCents >= 19900 ? "Grátis" : money(1990)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Desconto</dt>
              <dd className="font-medium text-ink-900">—</dd>
            </div>
            <div className="flex justify-between border-t border-ink-200 pt-3 text-base">
              <dt className="font-semibold text-ink-900">Total</dt>
              <dd className="font-bold text-ink-900">
                {money(subtotalCents + (subtotalCents >= 19900 ? 0 : 1990))}
              </dd>
            </div>
          </dl>

          <Link
            href="/checkout"
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-brand-700 active:scale-[0.99]"
          >
            Finalizar compra <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/produtos"
            className="mt-3 flex h-10 w-full items-center justify-center rounded-xl border border-ink-300 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Continuar comprando
          </Link>
        </aside>
      </div>
    </div>
  );
}
