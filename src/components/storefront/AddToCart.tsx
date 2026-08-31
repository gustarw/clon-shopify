"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { money } from "@/lib/money";
import type { Product } from "@/lib/repo/products";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function submit() {
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
      qty
    );
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-3">
        <div className="flex h-12 items-center rounded-xl border border-ink-300 bg-white">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={outOfStock || qty <= 1}
            className="flex size-12 items-center justify-center text-ink-600 hover:text-ink-900 disabled:opacity-30"
            aria-label="Diminuir quantidade"
          >
            <Minus className="size-4" />
          </button>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={qty}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              setQty(Number.isFinite(v) ? Math.min(product.stock, Math.max(1, v)) : 1);
            }}
            className="w-12 border-x border-ink-200 bg-transparent text-center text-sm font-semibold text-ink-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            aria-label="Quantidade"
          />
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            disabled={outOfStock || qty >= product.stock}
            className="flex size-12 items-center justify-center text-ink-600 hover:text-ink-900 disabled:opacity-30"
            aria-label="Aumentar quantidade"
          >
            <Plus className="size-4" />
          </button>
        </div>

        <Button
          onClick={submit}
          disabled={outOfStock}
          size="lg"
          className="flex-1"
          variant={added ? "secondary" : "primary"}
          icon={
            added ? (
              <span className="text-sm font-semibold">✓ No carrinho!</span>
            ) : (
              <ShoppingBag className="size-5" />
            )
          }
        >
          {outOfStock ? "Esgotado" : added ? "Adicionado!" : `Adicionar — ${money(product.price_cents * qty)}`}
        </Button>
      </div>

      {!outOfStock && (
        <p className="text-xs text-ink-400">
          {qty >= product.stock
            ? "Você atingiu o estoque máximo disponível."
            : `${product.stock} unidade${product.stock === 1 ? "" : "s"} disponível${product.stock === 1 ? "" : "es"}`}
        </p>
      )}
    </div>
  );
}
