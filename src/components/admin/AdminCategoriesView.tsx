"use client";

import React from "react";
import Link from "next/link";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteCategoryAction, saveCategoryAction } from "@/lib/actions";
import { AdminPageHeader } from "@/components/admin/blocks";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";
import type { Category, Product } from "@/lib/types";

export interface AdminCategoriesViewProps {
  categories: Category[];
  products: Product[];
  editing?: Category;
  error?: string;
}

export function AdminCategoriesView({
  categories,
  products,
  editing,
  error,
}: AdminCategoriesViewProps) {
  return (
    <div className="space-y-8 animate-fade-up">
      <AdminPageHeader
        title="Coleções e Categorias"
        subtitle={`${categories.length} coleção(ões) configuradas para organizar a vitrine`}
        badge="Coleções"
        badgeColor="default"
        actions={
          !editing ? (
            <a
              href="#nova"
              className="inline-flex items-center gap-2 rounded-full bg-[#222222] text-[#ffffff] px-5 py-2.5 text-xs font-semibold hover:bg-[#000000] active:scale-[0.98] transition-all shadow-xs"
            >
              <AdminIcon name={SOLAR_ICONS.add} size={16} /> Nova categoria
            </a>
          ) : undefined
        }
      />

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
          <span className="font-semibold">Erro na operação: </span>{error}
        </div>
      )}

      {editing ? (
        <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs">
          <h3 className="mb-6 text-lg font-bold text-[#222222]">Editar: {editing.name}</h3>
          <CategoryForm key={editing.id} category={editing} action={saveCategoryAction} />
        </div>
      ) : (
        <div id="nova" className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs">
          <h3 className="mb-6 text-lg font-bold text-[#222222]">Nova categoria</h3>
          <CategoryForm action={saveCategoryAction} />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ffffff] shadow-2xs">
        <div className="border-b border-[#ebebeb] bg-[#f7f7f7] px-6 py-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-[#222222]">
            <AdminIcon name={SOLAR_ICONS.categories} size={18} className="text-[#222222]" /> Todas as categorias
          </h3>
        </div>
        <div>
          <ul className="divide-y divide-[#ebebeb]">
            {categories.map((c) => {
              const count = products.filter((p) => p.category_id === c.id).length;
              return (
                <li key={c.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#f7f7f7] transition-colors">
                  <div className="min-w-0">
                    <div className="font-bold text-[#222222]">{c.name}</div>
                    {c.description && (
                      <p className="mt-0.5 truncate text-xs text-[#6a6a6a]">{c.description}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="inline-flex text-[11px] font-medium text-[#222222] bg-[#f7f7f7] border border-[#ebebeb] py-0.5 px-3 rounded-full">
                      {count} produto{count === 1 ? "" : "s"}
                    </span>
                    <Link
                      href={`/admin/categorias?editar=${c.id}`}
                      className="flex size-8.5 items-center justify-center rounded-full text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-all"
                      aria-label="Editar categoria"
                    >
                      <AdminIcon name={SOLAR_ICONS.edit} size={16} />
                    </Link>
                    <DeleteButton action={deleteCategoryAction} id={c.id} label="Excluir categoria" itemName={c.name} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
