"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { money } from "@/lib/money";
import { ProductForm } from "@/components/admin/ProductForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProductAction, saveProductAction } from "@/lib/actions";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";
import { AdminPageHeader, AdminEmptyState } from "@/components/admin/blocks";
import type { Product, Category } from "@/lib/types";

export interface AdminProductsViewProps {
  products: Product[];
  total: number;
  categories: Category[];
  page: number;
  totalPages: number;
  editing?: Product;
  searchQuery?: string;
}

export function AdminProductsView({
  products,
  total,
  categories,
  page,
  totalPages,
  editing,
  searchQuery = "",
}: AdminProductsViewProps) {
  return (
    <div className="space-y-8 animate-fade-up">
      <AdminPageHeader
        title="Produtos"
        subtitle={`${total} produto(s) cadastrado(s) no catálogo da loja`}
        badge="Catálogo"
        badgeColor="default"
        actions={
          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 rounded-full bg-[#222222] text-[#ffffff] px-5 py-2.5 text-xs font-semibold hover:bg-[#000000] active:scale-[0.98] transition-all shadow-xs"
          >
            <AdminIcon name={SOLAR_ICONS.add} size={16} />
            <span>Novo produto</span>
          </Link>
        }
      />

      {editing ? (
        <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs">
          <h3 className="mb-6 text-lg font-bold text-[#222222]">Editar: {editing.name}</h3>
          <ProductForm
            key={editing.id}
            product={editing}
            categories={categories}
            action={saveProductAction}
          />
        </div>
      ) : (
        <>
          <form className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <AdminIcon name={SOLAR_ICONS.search} size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6a6a6a]" />
              <input
                name="q"
                defaultValue={searchQuery}
                placeholder="Buscar por nome do produto..."
                className="h-10.5 w-full rounded-full border border-[#ebebeb] bg-[#ffffff] pl-10 pr-4 text-xs text-[#222222] placeholder:text-[#6a6a6a] focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-[#222222] text-white px-5 py-2.5 text-xs font-semibold hover:bg-[#000000] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
            >
              Buscar
            </button>
            {searchQuery && (
              <Link
                href="/admin/produtos"
                className="inline-flex items-center rounded-full border border-[#ebebeb] bg-[#ffffff] px-4 py-2 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] transition-all shadow-2xs"
              >
                Limpar
              </Link>
            )}
          </form>

          {products.length === 0 ? (
            <AdminEmptyState
              icon={<AdminIcon name={SOLAR_ICONS.products} size={24} />}
              title="Nenhum produto encontrado"
              description="Tente refazer a busca com outros termos ou adicione um novo produto ao catálogo."
              actionText="Criar novo produto"
              actionHref="/admin/produtos/novo"
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ffffff] shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#ebebeb] bg-[#f7f7f7] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6a6a6a]">
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4">Categoria</th>
                      <th className="px-6 py-4">Preço</th>
                      <th className="px-6 py-4">Estoque</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebebeb]">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-[#f7f7f7] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-[#f7f7f7] border border-[#ebebeb]">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={p.image || "/products/default.svg"} alt={p.name} className="size-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <Link href={`/produtos/${p.slug}`} className="block truncate font-semibold text-[#222222] hover:text-[#ff385c] transition-colors">
                                {p.name}
                              </Link>
                              <div className="text-xs text-[#6a6a6a]">ID #{p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-[#6a6a6a] font-normal">
                          {p.category ? p.category.name : <span className="text-[#c1c1c1]">—</span>}
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#222222] tabular-nums">{money(p.price_cents)}</td>
                        <td className="px-6 py-4">
                          <span className={p.stock === 0 ? "font-semibold text-[#c13515]" : p.stock <= 5 ? "font-semibold text-[#ff385c]" : "font-normal text-[#222222]"}>
                            {p.stock} un.
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {p.active === 1 ? (
                            <span className="inline-flex text-[11px] font-semibold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] py-0.5 px-2.5 rounded-full">
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex text-[11px] font-normal text-[#6a6a6a] border border-[#ebebeb] bg-[#f7f7f7] py-0.5 px-2.5 rounded-full">
                              Inativo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/produtos?editing=${p.id}`}
                              className="flex size-8.5 items-center justify-center rounded-full text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] transition-all"
                              aria-label="Editar"
                            >
                              <AdminIcon name={SOLAR_ICONS.edit} size={16} />
                            </Link>
                            <DeleteButton
                              action={deleteProductAction}
                              id={p.id}
                              label="Excluir produto"
                              itemName={p.name}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[#6a6a6a] font-normal pt-2">
              <span>
                Página <strong className="text-[#222222] font-semibold">{page}</strong> de <strong className="text-[#222222] font-semibold">{totalPages}</strong>
              </span>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link
                    href={`/admin/produtos?q=${searchQuery}&p=${page - 1}`}
                    className="inline-flex items-center rounded-full border border-[#ebebeb] bg-[#ffffff] px-4 py-2 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] transition-all shadow-2xs"
                  >
                    Anterior
                  </Link>
                )}
                {page < totalPages && (
                  <Link
                    href={`/admin/produtos?q=${searchQuery}&p=${page + 1}`}
                    className="inline-flex items-center rounded-full border border-[#ebebeb] bg-[#ffffff] px-4 py-2 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] transition-all shadow-2xs"
                  >
                    Próxima
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
