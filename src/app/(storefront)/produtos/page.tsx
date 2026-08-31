import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, X } from "lucide-react";
import { listCategories, getCategoryBySlug } from "@/lib/repo/categories";
import { getProductRating } from "@/lib/repo/reviews";
import { listProducts, type ProductFilters } from "@/lib/repo/products";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Pagination } from "@/components/storefront/Pagination";
import { CategoryFilter } from "@/components/storefront/CategoryFilter";
import { SortSelect } from "@/components/storefront/SortSelect";

export const metadata: Metadata = { title: "Produtos" };
export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categoria?: string; ordem?: string; pagina?: string }>;
}) {
  const sp = await searchParams;

  const allCategories = listCategories();
  const activeCategory = sp.categoria ? getCategoryBySlug(sp.categoria) : undefined;

  const sortMap: Record<string, NonNullable<ProductFilters["sort"]>> = {
    recentes: "newest",
    "preco-asc": "price_asc",
    "preco-desc": "price_desc",
    nome: "name",
  };
  const sort: NonNullable<ProductFilters["sort"]> = sortMap[sp.ordem || ""] || "newest";
  const page = Math.max(1, Number(sp.pagina) || 1);
  const perPage = 12;

  const { products, total, page: currentPage } = listProducts({
    search: sp.q?.trim() || undefined,
    categoryId: activeCategory?.id,
    sort,
    page,
    perPage,
  });

  const withRatings = products.map((p) => ({ product: p, rating: getProductRating(p.id) }));
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink-900">
          {activeCategory ? activeCategory.name : "Todos os produtos"}
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          {sp.q ? (
            <>
              {total} resultado{total === 1 ? "" : "s"} para{" "}
              <span className="font-medium text-ink-700">&ldquo;{sp.q}&rdquo;</span>
            </>
          ) : (
            `${total} produto${total === 1 ? "" : "s"} disponível${total === 1 ? "" : "es"}`
          )}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-8">
          <CategoryFilter
            categories={allCategories}
            activeId={activeCategory?.id}
          />
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {activeCategory && (
                <Link
                  href="/produtos"
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 ring-1 ring-brand-200 hover:bg-brand-100"
                >
                  {activeCategory.name} <X className="size-3" />
                </Link>
              )}
              {sp.q && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-100 px-3 py-1.5 text-xs font-medium text-ink-600">
                  Busca: {sp.q}
                </span>
              )}
            </div>
            <SortSelect value={sp.ordem || "recentes"} />
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-ink-300 bg-white py-20 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
                <PackageSearch className="size-8" />
              </span>
              <h2 className="mt-5 text-lg font-semibold text-ink-900">Nenhum produto encontrado</h2>
              <p className="mt-2 max-w-sm text-sm text-ink-500">
                Tente ajustar sua busca ou remover os filtros para ver mais resultados.
              </p>
              <Link
                href="/produtos"
                className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Limpar filtros
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-3">
              {withRatings.map(({ product, rating }) => (
                <ProductCard key={product.id} product={product} rating={rating} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              current={currentPage}
              total={totalPages}
              base="/produtos"
              params={{
                q: sp.q,
                categoria: sp.categoria,
                ordem: sp.ordem,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
