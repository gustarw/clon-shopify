import JSZip from "jszip";
import path from "node:path";
import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import type { ThemeConfig, SectionConfig } from "@/lib/repo/theme";
import type {
  ShopifySettingsData,
  ShopifySettingsSchemaItem,
  ShopifyTemplateJson,
  ThemeConversionResult,
  ConvertedSectionInfo,
} from "./shopify-types";
import {
  extractThemeColors,
  extractThemeTypography,
  extractThemeLayout,
  extractThemeAnnouncement,
  extractThemeHeader,
  extractThemeFooter,
  extractThemeSocial,
} from "./shopify-settings-extractor";
import { convertShopifySection } from "./shopify-section-mapper";

/**
 * Extracts schema JSON from liquid section content: {% schema %} ... {% endschema %}
 */
function extractSchemaFromLiquid(liquidContent: string): any | null {
  try {
    const match = liquidContent.match(/\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/i);
    if (match && match[1]) {
      return JSON.parse(match[1].trim());
    }
  } catch (e) {
    // Ignore schema json parse errors
  }
  return null;
}

/**
 * Main Shopify ZIP Importer & Converter Function
 */
export async function importShopifyThemeFromZip(
  zipBuffer: Buffer | ArrayBuffer,
  originalFilename = "shopify-theme.zip"
): Promise<ThemeConversionResult> {
  const logs: string[] = [];
  const warnings: string[] = [];
  const convertedSections: ConvertedSectionInfo[] = [];

  logs.push(`Iniciando leitura do arquivo: ${originalFilename}`);

  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipBuffer);

  const fileMap = new Map<string, JSZip.JSZipObject>();
  loadedZip.forEach((relativePath, file) => {
    if (!file.dir) {
      fileMap.set(relativePath, file);
    }
  });

  logs.push(`Total de arquivos encontrados no arquivo ZIP: ${fileMap.size}`);

  // Helper to find a file path regardless of whether theme is nested in a root folder
  function findFile(targetSubpath: string): JSZip.JSZipObject | undefined {
    const cleanTarget = targetSubpath.toLowerCase().replace(/^\//, "");
    for (const [filePath, file] of fileMap.entries()) {
      const lower = filePath.toLowerCase();
      if (lower.endsWith(cleanTarget)) {
        return file;
      }
    }
    return undefined;
  }

  // 1. Extract settings_schema.json (Metadata)
  let themeName = path.basename(originalFilename, path.extname(originalFilename)).replace(/[_-]/g, " ");
  themeName = themeName.charAt(0).toUpperCase() + themeName.slice(1);
  let themeVersion = "1.0.0";
  let themeAuthor = "Shopify Theme Designer";
  let schemaList: ShopifySettingsSchemaItem[] = [];

  const schemaFile = findFile("config/settings_schema.json");
  if (schemaFile) {
    try {
      const schemaText = await schemaFile.async("string");
      schemaList = JSON.parse(schemaText);
      if (Array.isArray(schemaList)) {
        for (const item of schemaList) {
          if (item.theme_name) themeName = item.theme_name;
          if (item.theme_version) themeVersion = item.theme_version;
          if (item.theme_author) themeAuthor = item.theme_author;
        }
      }
      logs.push(`Metadados extraídos: "${themeName}" v${themeVersion} (${themeAuthor})`);
    } catch (e: any) {
      warnings.push(`Erro ao interpretar settings_schema.json: ${e.message}`);
    }
  }

  // Generate safe theme ID & assets folder
  const themeSlug = themeName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30) || "theme";
  const themeId = `theme-${themeSlug}-${Date.now().toString().slice(-4)}`;
  const publicThemeAssetsDir = path.join(process.cwd(), "public", "uploads", "themes", themeId);

  // 2. Extract settings_data.json (Global settings)
  let rawSettings: Record<string, any> = {};
  const settingsDataFile = findFile("config/settings_data.json");
  if (settingsDataFile) {
    try {
      const dataText = await settingsDataFile.async("string");
      const parsedData: ShopifySettingsData = JSON.parse(dataText);
      rawSettings = parsedData.current || parsedData;
      logs.push("Configurações globais extraídas de config/settings_data.json");
    } catch (e: any) {
      warnings.push(`Erro ao interpretar settings_data.json: ${e.message}`);
    }
  } else {
    warnings.push("Arquivo config/settings_data.json não encontrado. Usando padrões inteligentes.");
  }

  // 3. Extract CSS Assets and build Custom CSS
  let customCss = "";
  let extractedAssetsCount = 0;

  for (const [filePath, file] of fileMap.entries()) {
    const lower = filePath.toLowerCase();
    if (lower.includes("/assets/") && lower.endsWith(".css")) {
      try {
        const cssContent = await file.async("string");
        // Clean out excessive liquid tags in css
        const cleanCss = cssContent
          .replace(/\{\{[\s\S]*?\}\}/g, "inherit")
          .replace(/\{%[\s\S]*?%\}/g, "");
        customCss += `\n/* Extracted from ${path.basename(filePath)} */\n` + cleanCss;
        logs.push(`CSS extraído de: ${path.basename(filePath)}`);
      } catch (e) {
        // Ignore CSS read error
      }
    }

    // Extract image assets to public/uploads/themes/{theme_id}/
    if (
      lower.includes("/assets/") &&
      (lower.endsWith(".png") ||
        lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".svg") ||
        lower.endsWith(".webp"))
    ) {
      try {
        if (!existsSync(publicThemeAssetsDir)) {
          await fs.mkdir(publicThemeAssetsDir, { recursive: true });
        }
        const buffer = await file.async("nodebuffer");
        const filename = path.basename(filePath);
        await fs.writeFile(path.join(publicThemeAssetsDir, filename), buffer);
        extractedAssetsCount++;
      } catch (e) {
        // Ignore asset write error
      }
    }
  }

  // 4. Extract Section Liquid files & Section Groups (header-group.json, footer-group.json)
  const sectionLiquidMap = new Map<string, { code: string; schema: any | null }>();
  let headerGroupData: Record<string, any> | undefined = undefined;
  let footerGroupData: Record<string, any> | undefined = undefined;

  const headerGroupFile = findFile("sections/header-group.json") || findFile("sections/header.json");
  if (headerGroupFile) {
    try {
      const hText = await headerGroupFile.async("string");
      headerGroupData = JSON.parse(hText);
      logs.push("Grupo de cabeçalho (header-group.json) extraído com sucesso.");
    } catch (e) {}
  }

  const footerGroupFile = findFile("sections/footer-group.json") || findFile("sections/footer.json");
  if (footerGroupFile) {
    try {
      const fText = await footerGroupFile.async("string");
      footerGroupData = JSON.parse(fText);
      logs.push("Grupo de rodapé (footer-group.json) extraído com sucesso.");
    } catch (e) {}
  }

  for (const [filePath, file] of fileMap.entries()) {
    const lower = filePath.toLowerCase();
    if (lower.includes("/sections/") && lower.endsWith(".liquid")) {
      try {
        const basename = path.basename(filePath, ".liquid").toLowerCase();
        const code = await file.async("string");
        const schema = extractSchemaFromLiquid(code);
        sectionLiquidMap.set(basename, { code, schema });
      } catch (e) {
        // Ignore section liquid read error
      }
    }
  }

  // 5. Parse templates/index.json (Shopify OS 2.0)
  const finalSections: SectionConfig[] = [];
  let shopifyVersion: "OS 2.0" | "Vintage OS 1.0" | "JSON Template" = "OS 2.0";

  const indexTemplateFile = findFile("templates/index.json");
  if (indexTemplateFile) {
    try {
      const templateText = await indexTemplateFile.async("string");
      const templateJson: ShopifyTemplateJson = JSON.parse(templateText);

      const sectionMap = templateJson.sections || {};
      const sectionOrder = templateJson.order || Object.keys(sectionMap);

      logs.push(`Encontrado templates/index.json com ${sectionOrder.length} seções na ordem.`);

      for (const sId of sectionOrder) {
        const shopifySection = sectionMap[sId];
        if (!shopifySection) continue;

        const liquidFile = sectionLiquidMap.get(shopifySection.type?.toLowerCase());
        const { section, info } = await convertShopifySection(
          sId,
          shopifySection,
          liquidFile?.code
        );

        finalSections.push(section);
        convertedSections.push(info);
      }
    } catch (e: any) {
      warnings.push(`Erro ao interpretar templates/index.json: ${e.message}`);
    }
  }

  // 6. Fallback if no templates/index.json found (Vintage OS 1.0 or Presets)
  if (finalSections.length === 0) {
    shopifyVersion = "Vintage OS 1.0";
    logs.push("Templates/index.json não encontrado. Procurando seções em settings_data.json ou sections/*.liquid...");

    // Check if settings_data has content_for_index or sections
    if (rawSettings.content_for_index && Array.isArray(rawSettings.content_for_index) && rawSettings.sections) {
      for (const sId of rawSettings.content_for_index) {
        const shopifySection = rawSettings.sections[sId];
        if (!shopifySection) continue;

        const liquidFile = sectionLiquidMap.get(shopifySection.type?.toLowerCase());
        const { section, info } = await convertShopifySection(
          sId,
          shopifySection,
          liquidFile?.code
        );

        finalSections.push(section);
        convertedSections.push(info);
      }
    } else {
      // Create sections from available liquid schemas with presets
      for (const [secType, data] of sectionLiquidMap.entries()) {
        if (data.schema && data.schema.presets && data.schema.presets.length > 0) {
          const preset = data.schema.presets[0];
          const mockShopifySection = {
            type: secType,
            settings: preset.settings || {},
            blocks: {},
            block_order: [],
          };
          const { section, info } = await convertShopifySection(
            `sec-${secType}`,
            mockShopifySection,
            data.code
          );
          finalSections.push(section);
          convertedSections.push(info);
        }
      }
    }
  }

  // 7. Safety fallback: If still empty, build high-impact standard sections with theme styles
  if (finalSections.length === 0) {
    logs.push("Criando conjunto padrão de seções com a paleta do tema...");
    const heroMock = {
      type: "image-banner",
      settings: {
        heading: `Bem-vindo à ${themeName}`,
        text: "Descubra nossa coleção exclusiva com entrega rápida e garantia total.",
        button_label_1: "Explorar Catálogo",
        button_link_1: "/produtos",
      },
    };
    const { section: s1, info: i1 } = await convertShopifySection("hero-1", heroMock);
    finalSections.push(s1);
    convertedSections.push(i1);

    const featMock = {
      type: "featured-collection",
      settings: {
        title: "Mais Vendidos",
        products_to_show: 8,
      },
    };
    const { section: s2, info: i2 } = await convertShopifySection("feat-1", featMock);
    finalSections.push(s2);
    convertedSections.push(i2);
  }

  // 8. Build final ThemeConfig
  const themeColors = extractThemeColors(rawSettings, schemaList);
  const themeTypography = extractThemeTypography(rawSettings);
  const themeLayout = extractThemeLayout(rawSettings);
  const themeAnnouncement = extractThemeAnnouncement(rawSettings, headerGroupData?.sections);
  const themeHeader = extractThemeHeader(rawSettings, themeName, headerGroupData?.sections);
  const themeSocial = extractThemeSocial(rawSettings);
  const themeFooter = extractThemeFooter(rawSettings, themeName, footerGroupData?.sections);

  const theme: ThemeConfig = {
    id: themeId,
    name: `${themeName} (Shopify Liquid)`,
    version: themeVersion,
    updatedAt: new Date().toISOString(),
    colors: themeColors,
    typography: themeTypography,
    layout: themeLayout,
    announcement: themeAnnouncement,
    header: themeHeader,
    social: themeSocial,
    footer: themeFooter,
    customCss: customCss.slice(0, 50000), // Rich custom CSS support
    sections: finalSections,
  };

  logs.push(`Conversão concluída com sucesso! ${finalSections.length} seções geradas.`);

  return {
    success: true,
    theme,
    metadata: {
      themeName,
      themeVersion,
      themeAuthor,
      shopifyVersion,
      extractedFilesCount: fileMap.size,
      sectionsConvertedCount: finalSections.length,
      assetsExtractedCount: extractedAssetsCount,
    },
    convertedSections,
    warnings,
    logs,
  };
}
