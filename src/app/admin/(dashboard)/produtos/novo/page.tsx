import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listCategories } from "@/lib/repo/categories";
import { ProductForm } from "@/components/admin/ProductForm";
import { saveProductAction } from "@/lib/actions";

export const metadata: Metadata = { title: "Novo produto" };
export const dynamic = "force-dynamic";

export default function NewProductPage() {
  const categories = listCategories();

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <Link
          href="/admin/produtos"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#52525b] hover:bg-[#ffffff] hover:text-[#09090b] transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Voltar aos produtos
        </Link>
        <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-[#09090b] leading-[1.28]">Novo produto</h1>
        <p className="mt-1 text-[15px] text-[#52525b] font-normal">Adicione um novo item ao catálogo da sua loja</p>
      </div>

      <div className="rounded-2xl border border-[#ececee] bg-[#ffffff] p-6 shadow-none">
        <ProductForm categories={categories} action={saveProductAction} />
      </div>
    </div>
  );
}
