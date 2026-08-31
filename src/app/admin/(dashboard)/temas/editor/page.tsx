import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getThemeConfig } from "@/lib/repo/theme";
import { listProducts } from "@/lib/repo/products";
import { listCategories } from "@/lib/repo/categories";
import { ThemeEditorShell } from "@/components/admin/theme-editor/ThemeEditorShell";

import { THEME_PRESETS } from "@/components/admin/theme-editor/default-presets";

export const dynamic = "force-dynamic";

export default async function ThemeEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  const { preset } = await searchParams;
  let theme = getThemeConfig();

  if (preset) {
    const foundPreset = THEME_PRESETS.find((p) => p.id === preset);
    if (foundPreset) {
      theme = foundPreset.config;
    } else {
      const customTheme = (await import("@/lib/repo/theme")).getThemeById(preset);
      if (customTheme) {
        theme = customTheme;
      }
    }
  }

  const { products } = listProducts({ perPage: 20 });
  const categories = listCategories();

  return (
    <ThemeEditorShell
      initialTheme={theme}
      products={products}
      categories={categories}
    />
  );
}
