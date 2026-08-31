"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { ProductImageUploader } from "@/components/admin/ProductImageUploader";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProductAction } from "@/lib/actions";
import { money, parseMoney } from "@/lib/money";
import type { Product, Category } from "@/lib/types";

type SaveAction = (formData: FormData) => Promise<void>;

export function ProductForm({
  product,
  categories,
  action,
}: {
  product?: Product;
  categories: Category[];
  action: SaveAction;
}) {
  const [price, setPrice] = useState(product ? (product.price_cents / 100).toFixed(2).replace(".", ",") : "");
  const [compareAt, setCompareAt] = useState(
    product?.compare_at_cents != null ? (product.compare_at_cents / 100).toFixed(2).replace(".", ",") : ""
  );
  const [image, setImage] = useState(product?.image || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = new FormData(e.currentTarget);
      fd.set("price", price);
      fd.set("compareAt", compareAt);
      fd.set("image", image);
      await action(fd);
      router.push("/admin/produtos");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o produto.");
      setSaving(false);
    }
  }

  const previewSrc = image.trim() || product?.image || "/products/default.svg";
  const salePreview = parseMoney(price) > 0 && parseMoney(compareAt) > parseMoney(price);

  return (
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_340px]">
      {product && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="image" value={image} />

      <div className="space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 font-medium">
            <span className="font-semibold">Erro ao salvar: </span>{error}
          </div>
        )}

        <Field label="Nome do produto">
          <Input
            name="name"
            defaultValue={product?.name || ""}
            required
            minLength={2}
            placeholder="Ex.: Fone Bluetooth AirSound Pro"
            className="rounded-lg border border-[#ebebeb] bg-[#ffffff] text-[#222222] text-sm focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
            invalid={!!error}
          />
        </Field>

        <Field label="Descrição">
          <Textarea
            name="description"
            defaultValue={product?.description || ""}
            rows={5}
            maxLength={4000}
            placeholder="Descreva o produto, destaque benefícios e especificações..."
            className="rounded-lg border border-[#ebebeb] bg-[#ffffff] text-[#222222] text-sm focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
          />
        </Field>

        {/* Product Image Media Manager */}
        <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-5 shadow-2xs">
          <ProductImageUploader value={image} onChange={setImage} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Preço de venda (R$)">
            <Input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              placeholder="299,90"
              inputMode="decimal"
              className="rounded-lg border border-[#ebebeb] bg-[#ffffff] text-[#222222] text-sm focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
            />
          </Field>
          <Field label="Preço promocional (R$)" hint="Opcional — aparece riscado na vitrine.">
            <Input
              value={compareAt}
              onChange={(e) => setCompareAt(e.target.value)}
              placeholder="399,90"
              inputMode="decimal"
              className="rounded-lg border border-[#ebebeb] bg-[#ffffff] text-[#222222] text-sm focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
            />
          </Field>
        </div>

        {salePreview && (
          <div className="flex items-center gap-2.5 rounded-xl border border-[#ebebeb] bg-[#ffffff] p-4 text-xs shadow-2xs">
            <span className="bg-[#ff385c] text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              Promoção
            </span>
            <span className="text-[#6a6a6a]">
              Desconto de <strong className="text-[#222222] font-semibold">{Math.round((1 - parseMoney(price) / parseMoney(compareAt)) * 100)}%</strong> será exibido na loja.
            </span>
          </div>
        )}
      </div>

      <aside className="space-y-6">
        <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-5 sm:p-6 shadow-2xs">
          <h4 className="text-sm font-bold text-[#222222]">Pré-visualização</h4>
          <div className="relative mt-3.5 aspect-square overflow-hidden rounded-xl bg-[#f7f7f7] border border-[#ebebeb]">
            {/* eslint-disable-next-line @next/next/no-img-element -- URL is user-supplied */}
            <img src={previewSrc} alt="Pré-visualização" className="size-full object-cover" />
          </div>
          <div className="mt-4 text-sm flex items-center justify-between">
            <div className="font-bold text-[#222222] text-base">{money(parseMoney(price))}</div>
            {salePreview && (
              <div className="text-xs text-[#c1c1c1] line-through">{money(parseMoney(compareAt))}</div>
            )}
          </div>
        </div>

        <div className="space-y-5 rounded-xl border border-[#ebebeb] bg-[#ffffff] p-5 sm:p-6 shadow-2xs">
          <Field label="Estoque">
            <Input
              type="number"
              name="stock"
              defaultValue={product?.stock ?? 10}
              min={0}
              required
              placeholder="10"
              className="rounded-lg border border-[#ebebeb] bg-[#ffffff] text-[#222222] text-sm focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
            />
          </Field>

          <Field label="Categoria">
            <Select name="categoryId" defaultValue={product?.category_id || ""} className="rounded-lg border border-[#ebebeb] bg-[#ffffff] text-[#222222] text-sm focus:border-[#222222] focus:ring-1 focus:ring-[#222222] appearance-auto">
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[#ebebeb] px-4 py-3 hover:bg-[#f7f7f7] transition-colors">
            <span className="text-xs font-medium text-[#222222]">Visível na loja</span>
            <input
              type="checkbox"
              name="active"
              defaultChecked={product ? product.active === 1 : true}
              className="size-4 accent-[#222222] rounded"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-[#222222] text-[#ffffff] py-3 text-xs font-semibold hover:bg-[#000000] active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save className="size-4" />
            <span>{saving ? "Salvando..." : product ? "Salvar alterações" : "Criar produto"}</span>
          </button>

          {product && (
            <div className="pt-2 border-t border-[#ebebeb] space-y-2">
              <button
                type="button"
                onClick={() => router.push("/admin/produtos")}
                className="w-full rounded-full border border-[#ebebeb] bg-[#ffffff] py-2.5 text-xs font-medium text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] transition-all cursor-pointer"
              >
                Cancelar
              </button>

              <DeleteButton
                action={deleteProductAction}
                id={product.id}
                label="Excluir produto"
                itemName={product.name}
                variant="block"
                onSuccess={() => {
                  router.push("/admin/produtos");
                  router.refresh();
                }}
              />
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}
