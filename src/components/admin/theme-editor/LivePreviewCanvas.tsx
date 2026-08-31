"use client";

import { ThemeConfig } from "@/lib/repo/theme";
import { Product, Category } from "@/lib/types";
import { ViewportMode } from "./ThemeEditorTopBar";
import { DynamicStorefrontRenderer } from "./DynamicStorefrontRenderer";
import { cn } from "@/components/ui/cn";

interface LivePreviewCanvasProps {
  theme: ThemeConfig;
  products?: Product[];
  categories?: Category[];
  viewportMode: ViewportMode;
  selectedSectionId: string | null;
  onSelectSection: (id: string) => void;
}

export function LivePreviewCanvas({
  theme,
  products,
  categories,
  viewportMode,
  selectedSectionId,
  onSelectSection,
}: LivePreviewCanvasProps) {
  return (
    <div className="relative flex-1 overflow-y-auto bg-[#f4f4f5] p-4 lg:p-6 flex justify-center items-start custom-scrollbar">
      {/* Live Custom CSS Injector - Strictly Scoped to Preview Canvas */}
      {theme.customCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: `@scope (#storefront-preview-canvas) { ${theme.customCss} }`,
          }}
        />
      )}

      {/* Frame Container */}
      <div
        id="storefront-preview-canvas"
        className={cn(
          "transition-all duration-300 ease-out origin-top",
          viewportMode === "desktop" && "w-full shadow-sm rounded-xl overflow-hidden bg-white border border-[#ececee]",
          viewportMode === "tablet" && "w-[768px] shadow-xl rounded-2xl overflow-hidden bg-white border-[6px] border-[#18181b]",
          viewportMode === "mobile" && "w-[390px] shadow-2xl rounded-[32px] overflow-hidden bg-white border-[10px] border-[#18181b] ring-1 ring-black/10"
        )}
      >
        {/* Mobile Device Top Notch/Speaker */}
        {viewportMode === "mobile" && (
          <div className="h-6 w-full bg-[#18181b] flex items-center justify-center">
            <div className="h-3.5 w-24 bg-[#09090b] rounded-full flex items-center justify-end px-2">
              <div className="size-1.5 rounded-full bg-[#27272a]" />
            </div>
          </div>
        )}

        {/* Storefront Content (DynamicStorefrontRenderer - unchanged) */}
        <div className="min-h-screen bg-white">
          <DynamicStorefrontRenderer
            theme={theme}
            products={products}
            categories={categories}
            selectedSectionId={selectedSectionId}
            onSelectSection={onSelectSection}
            isEditorPreview={true}
          />
        </div>

        {/* Mobile Device Bottom Bar */}
        {viewportMode === "mobile" && (
          <div className="h-5 w-full bg-[#18181b] flex items-center justify-center">
            <div className="h-1 w-28 bg-white/20 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );
}
