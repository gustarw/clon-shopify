"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { money } from "@/lib/money";
import { Rating } from "./Rating";
import type { Product } from "@/lib/repo/products";

export function ProductCard({
  product,
  rating,
}: {
  product: Product;
  rating?: { average: number; count: number };
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;
  const onSale = product.compare_at_cents != null && product.compare_at_cents > product.price_cents;
  const discount = onSale
    ? Math.round((1 - product.price_cents / (product.compare_at_cents as number)) * 100)
    : 0;

  const installmentValue = Math.round(product.price_cents / 12);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    if (outOfStock) return;
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
      true
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-ink-900/5">
      {/* Product Image Container */}
      <Link
        href={`/produtos/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-ink-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image || "/products/default.svg"}
          alt={product.name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
        />

        {/* Quick add hover overlay on desktop */}
        {!outOfStock && (
          <div className="absolute inset-x-3 bottom-3 z-10 hidden sm:block opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
            <button
              onClick={handleAdd}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-ink-900/90 backdrop-blur-md px-3 text-xs font-semibold text-white shadow-md hover:bg-brand-700 transition-colors"
            >
              {added ? (
                <>
                  <Check className="size-4 text-emerald-400" /> Adicionado!
                </>
              ) : (
                <>
                  <ShoppingBag className="size-4" /> Adicionar Rápido
                </>
              )}
            </button>
          </div>
        )}
      </Link>

      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {onSale && (
          <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow-sm uppercase tracking-wide">
            -{discount}% OFF
          </span>
        )}
        {outOfStock && (
          <span className="rounded-full bg-ink-900/85 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur uppercase">
            Esgotado
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-400">
            {product.category.name}
          </span>
        )}
        <Link
          href={`/produtos/${product.slug}`}
          className="mt-1 line-clamp-2 text-sm font-semibold text-ink-900 hover:text-brand-700 transition-colors"
        >
          {product.name}
        </Link>

        {rating && rating.count > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <Rating value={rating.average} size={12} />
            <span className="text-[11px] text-ink-400">({rating.count})</span>
          </div>
        )}

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-ink-900">
              {money(product.price_cents)}
            </span>
            {onSale && (
              <span className="text-xs text-ink-400 line-through">
                {money(product.compare_at_cents as number)}
              </span>
            )}
          </div>
          <p className="text-[11px] text-brand-700 font-medium mt-0.5">
            12x de {money(installmentValue)} sem juros
          </p>
        </div>

        {/* Mobile Add to Cart button */}
        <div className="mt-3 sm:hidden pt-2 border-t border-ink-100">
          <button
            disabled={outOfStock}
            onClick={handleAdd}
            className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-brand-600 text-xs font-semibold text-white transition-all active:scale-95 disabled:bg-ink-200 disabled:text-ink-400"
          >
            {added ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
            {added ? "Adicionado" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
