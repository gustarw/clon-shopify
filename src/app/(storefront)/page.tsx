import { listCategories } from "@/lib/repo/categories";
import { listProducts } from "@/lib/repo/products";
import { getThemeConfig } from "@/lib/repo/theme";
import { DynamicStorefrontRenderer } from "@/components/admin/theme-editor/DynamicStorefrontRenderer";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const theme = getThemeConfig();
  const categories = listCategories();
  const { products } = listProducts({ perPage: 20 });

  return (
    <div className="animate-fade-up">
      {/* Dynamic Sections configured in Shopify Theme Customizer */}
      <DynamicStorefrontRenderer
        theme={theme}
        products={products}
        categories={categories}
        isEditorPreview={false}
      />
    </div>
  );
}
