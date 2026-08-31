import type { ThemeConfig, SectionConfig, SectionType } from "@/lib/repo/theme";

/**
 * Shopify OS 2.0 & Vintage Settings Data JSON Schema
 */
export interface ShopifySettingsData {
  current?: Record<string, any>;
  presets?: Record<string, Record<string, any>>;
  sections?: Record<string, ShopifySectionJson>;
  content_for_index?: string[];
  [key: string]: any;
}

/**
 * Shopify settings_schema.json block
 */
export interface ShopifySettingsSchemaItem {
  name?: string;
  theme_name?: string;
  theme_version?: string;
  theme_author?: string;
  theme_documentation_url?: string;
  theme_support_url?: string;
  settings?: Array<{
    type: string;
    id: string;
    label?: string;
    default?: any;
    options?: Array<{ value: string; label: string }>;
    [key: string]: any;
  }>;
  [key: string]: any;
}

/**
 * Shopify Section JSON structure (inside templates/index.json or settings_data.json)
 */
export interface ShopifySectionJson {
  type: string;
  disabled?: boolean;
  settings?: Record<string, any>;
  blocks?: Record<string, ShopifyBlockJson>;
  block_order?: string[];
  custom_css?: string[];
  [key: string]: any;
}

/**
 * Shopify Block JSON structure
 */
export interface ShopifyBlockJson {
  type: string;
  disabled?: boolean;
  settings?: Record<string, any>;
  [key: string]: any;
}

/**
 * Shopify OS 2.0 Template JSON (e.g. templates/index.json)
 */
export interface ShopifyTemplateJson {
  name?: string;
  wrapper?: string;
  sections: Record<string, ShopifySectionJson>;
  order: string[];
  [key: string]: any;
}

/**
 * Parsed Liquid Section Schema ({% schema %} ... {% endschema %})
 */
export interface ShopifyLiquidSchema {
  name?: string;
  tag?: string;
  class?: string;
  settings?: Array<{
    type: string;
    id: string;
    label?: string;
    default?: any;
    [key: string]: any;
  }>;
  blocks?: Array<{
    type: string;
    name?: string;
    limit?: number;
    settings?: Array<{
      type: string;
      id: string;
      label?: string;
      default?: any;
      [key: string]: any;
    }>;
  }>;
  presets?: Array<{
    name: string;
    settings?: Record<string, any>;
    blocks?: Array<{ type: string; settings?: Record<string, any> }>;
  }>;
  max_blocks?: number;
  [key: string]: any;
}

/**
 * Summary of a single converted section
 */
export interface ConvertedSectionInfo {
  originalId: string;
  originalType: string;
  convertedType: SectionType;
  name: string;
  blockCount: number;
  status: "success" | "mapped_fallback" | "custom_liquid";
  details?: string;
}

/**
 * Conversion Result returned by the theme importer
 */
export interface ThemeConversionResult {
  success: boolean;
  theme: ThemeConfig;
  metadata: {
    themeName: string;
    themeVersion: string;
    themeAuthor: string;
    shopifyVersion: "OS 2.0" | "Vintage OS 1.0" | "JSON Template";
    extractedFilesCount: number;
    sectionsConvertedCount: number;
    assetsExtractedCount: number;
  };
  convertedSections: ConvertedSectionInfo[];
  warnings: string[];
  logs: string[];
}
