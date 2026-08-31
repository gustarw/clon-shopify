import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { RotateCcw, Star, Truck } from "lucide-react";
import { getProductBySlug } from "@/lib/repo/products";
import { getProductRating, listReviews } from "@/lib/repo/reviews";
import { listRelatedProducts } from "@/lib/repo/products";
import { money } from "@/lib/money";
import { Rating } from "@/components/storefront/Rating";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ReviewSection } from "@/components/storefront/ReviewSection";
import { AddToCart } from "@/components/storefront/AddToCart";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProductBySlug(slug);
  return { title: p ? p.name : "Produto não encontrado" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product || product.active !== 1) notFound();

  const rating = getProductRating(product.id);
  const reviews = listReviews(product.id);
  const related = listRelatedProducts(product.category_id, product.id, 4);

  const onSale = product.compare_at_cents != null && product.compare_at_cents > product.price_cents;
  const discount = onSale
    ? Math.round((1 - product.price_cents / (product.compare_at_cents as number)) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-up">
      <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-ink-500">
        <Link href="/" className="hover:text-brand-700">Início</Link>
        <span className="text-ink-300">/</span>
        <Link href="/produtos" className="hover:text-brand-700">Produtos</Link>
        {product.category && (
          <>
            <span className="text-ink-300">/</span>
            <Link href={`/produtos?categoria=${product.category.slug}`} className="hover:text-brand-700">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="text-ink-300">/</span>
        <span className="font-medium text-ink-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-ink-100 aspect-square">
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col">
          {product.category && (
            <Link
              href={`/produtos?categoria=${product.category.slug}`}
              className="text-sm font-medium uppercase tracking-wide text-brand-700 hover:text-brand-800"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {rating.count > 0 ? (
              <Link href="#avaliacoes" className="flex items-center gap-2 hover:underline">
                <Rating value={rating.average} size={16} />
                <span className="text-sm font-medium text-ink-700">{rating.average.toFixed(1)}</span>
                <span className="text-sm text-ink-400">({rating.count} avaliações)</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-ink-400">
                <Star className="size-4" /> Ainda sem avaliações
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-1">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold tracking-tight text-ink-900">
                {money(product.price_cents)}
              </span>
              {onSale && (
                <span className="text-lg text-ink-400 line-through font-medium">
                  {money(product.compare_at_cents as number)}
                </span>
              )}
              {onSale && (
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                  Economize {discount}%
                </span>
              )}
            </div>

            {/* Installment breakdown */}
            <div className="mt-2 rounded-xl bg-brand-50/70 border border-brand-200/70 p-3.5 text-xs space-y-1">
              <div className="flex items-center justify-between text-ink-900 font-semibold">
                <span>⚡ À vista no Pix (5% de desconto):</span>
                <span className="text-emerald-700 text-sm font-bold">{money(Math.round(product.price_cents * 0.95))}</span>
              </div>
              <div className="text-ink-600">
                Ou até <strong>12x de {money(Math.round(product.price_cents / 12))}</strong> sem juros no cartão de crédito
              </div>
            </div>
          </div>

          {/* Stock Status Bar */}
          <div className="mt-5 flex items-center gap-2 text-xs">
            {product.stock > 10 ? (
              <div className="flex items-center gap-2 text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 font-medium">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Em estoque ({product.stock} unidades) — Envio imediato para todo o Brasil
              </div>
            ) : product.stock > 0 ? (
              <div className="flex items-center gap-2 text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold">
                <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                Restam apenas {product.stock} unidades em estoque!
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-800 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 font-semibold">
                <span className="size-2 rounded-full bg-red-500" />
                Produto esgotado temporariamente
              </div>
            )}
          </div>

          <div className="mt-6">
            <AddToCart product={product} />
          </div>

          {/* Value props */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-xs">
              <Truck className="size-5 shrink-0 text-brand-600" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink-900 uppercase tracking-wider">Frete Grátis</div>
                <div className="text-xs text-ink-500">Em compras a partir de R$ 199</div>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-xs">
              <RotateCcw className="size-5 shrink-0 text-brand-600" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-ink-900 uppercase tracking-wider">Troca sem Custo</div>
                <div className="text-xs text-ink-500">Até 30 dias para devolução</div>
              </div>
            </div>
          </div>

          {/* Shopify PDP Accordion Details */}
          <div className="mt-8 divide-y divide-ink-200 border-y border-ink-200 text-sm">
            <details className="group py-4" open>
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink-900">
                <span>Descrição do Produto</span>
                <span className="text-ink-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-ink-600 whitespace-pre-line">
                {product.description}
              </p>
            </details>

            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink-900">
                <span>Envio, Prazos & Rastreamento</span>
                <span className="text-ink-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <div className="mt-3 text-xs leading-relaxed text-ink-600 space-y-2">
                <p>• <strong>Sudeste e Sul:</strong> 2 a 5 dias úteis</p>
                <p>• <strong>Centro-Oeste:</strong> 3 a 7 dias úteis</p>
                <p>• <strong>Nordeste e Norte:</strong> 4 a 10 dias úteis</p>
                <p className="text-ink-500">Todas as compras acompanham código de rastreamento enviado automaticamente por e-mail.</p>
              </div>
            </details>

            <details className="group py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink-900">
                <span>Garantia & Devolução</span>
                <span className="text-ink-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 text-xs leading-relaxed text-ink-600">
                Se você não ficar 100% satisfeito com o produto, você tem até 30 dias a partir da data de entrega para solicitar a troca ou reembolso total sem burocracia.
              </p>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-700">Recomendações</span>
              <h2 className="text-2xl font-bold tracking-tight text-ink-900 mt-1">Quem viu este produto, também comprou</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <div id="avaliacoes" className="mt-20 scroll-mt-24">
        <ReviewSection
          productId={product.id}
          rating={rating}
          reviews={reviews}
        />
      </div>
    </div>
  );
}
