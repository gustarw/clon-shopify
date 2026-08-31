import type { Metadata } from "next";
import { listProducts } from "@/lib/repo/products";
import { listCategories } from "@/lib/repo/categories";
import { AdminProductsView } from "@/components/admin/AdminProductsView";

export const metadata: Metadata = { title: "Produtos" };
export const dynamic = "force-dynamic";

const PER_PAGE = 10;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; p?: string; editing?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.p) || 1);
  const { products, total } = listProducts({
    search: sp.q?.trim() || undefined,
    includeInactive: true,
    perPage: PER_PAGE,
    page,
  });
  const categories = listCategories();
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const editing = sp.editing ? products.find((p) => p.id === Number(sp.editing)) : undefined;

  return (
    <AdminProductsView
      products={products}
      total={total}
      categories={categories}
      page={page}
      totalPages={totalPages}
      editing={editing}
      searchQuery={sp.q || ""}
    />
  );
}
