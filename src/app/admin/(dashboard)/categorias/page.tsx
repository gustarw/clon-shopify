import type { Metadata } from "next";
import { listCategoriesAsync } from "@/lib/repo/categories";
import { listProductsAsync } from "@/lib/repo/products";
import { AdminCategoriesView } from "@/components/admin/AdminCategoriesView";

export const metadata: Metadata = { title: "Categorias" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string; erro?: string }>;
}) {
  const sp = await searchParams;
  const editingId = sp.editar ? Number(sp.editar) : null;
  const error = sp.erro;

  const categories = await listCategoriesAsync();
  const { products } = await listProductsAsync({ perPage: 1000, includeInactive: true });
  const editing = editingId ? categories.find((c) => c.id === editingId) : undefined;

  return (
    <AdminCategoriesView
      categories={categories}
      products={products}
      editing={editing}
      error={error}
    />
  );
}
