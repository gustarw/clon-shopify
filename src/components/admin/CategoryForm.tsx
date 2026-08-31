"use client";

import { useRouter } from "next/navigation";
import { Field, Input } from "@/components/ui/Field";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";
import type { Category } from "@/lib/types";

type SaveAction = (formData: FormData) => Promise<void>;

export function CategoryForm({
  category,
  action,
}: {
  category?: Category;
  action: SaveAction;
}) {
  const router = useRouter();

  return (
    <form
      action={async (fd) => {
        await action(fd);
        router.refresh();
      }}
      className="grid gap-5 sm:grid-cols-[1fr_1fr_auto]"
    >
      {category && <input type="hidden" name="id" value={category.id} />}

      <Field label="Nome">
        <Input
          name="name"
          defaultValue={category?.name || ""}
          required
          minLength={2}
          maxLength={60}
          placeholder="Ex.: Eletrônicos"
          className="rounded-lg border border-[#ebebeb] bg-[#ffffff] text-[#222222] text-sm focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
        />
      </Field>

      <Field label="Descrição" hint="Opcional">
        <Input
          name="description"
          defaultValue={category?.description || ""}
          maxLength={200}
          placeholder="Curta descrição da categoria"
          className="rounded-lg border border-[#ebebeb] bg-[#ffffff] text-[#222222] text-sm focus:border-[#222222] focus:ring-1 focus:ring-[#222222]"
        />
      </Field>

      <div className="flex items-end">
        <button
          type="submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#222222] text-[#ffffff] px-5 py-2.5 text-xs font-semibold hover:bg-[#000000] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          <AdminIcon name={SOLAR_ICONS.check} size={15} />
          <span>{category ? "Salvar" : "Criar categoria"}</span>
        </button>
      </div>

      {category && (
        <div className="sm:col-span-3">
          <button
            type="button"
            onClick={() => router.push("/admin/categorias")}
            className="text-xs font-medium text-[#6a6a6a] hover:text-[#222222] transition-colors cursor-pointer"
          >
            ← Cancelar edição
          </button>
        </div>
      )}
    </form>
  );
}
