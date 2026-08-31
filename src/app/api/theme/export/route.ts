import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getThemeById, getThemeConfig, ThemeConfig } from "@/lib/repo/theme";
import JSZip from "jszip";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const themeId = searchParams.get("id") || "main-theme";
    const format = searchParams.get("format") || "zip";

    let theme: ThemeConfig | null = null;
    if (themeId === "main-theme") {
      theme = getThemeConfig();
    } else {
      theme = getThemeById(themeId);
    }

    if (!theme) {
      return NextResponse.json(
        { success: false, error: "Tema não encontrado." },
        { status: 404 }
      );
    }

    const safeSlug = theme.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30);

    if (format === "json") {
      const jsonStr = JSON.stringify(theme, null, 2);
      return new NextResponse(jsonStr, {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${safeSlug}-theme.json"`,
        },
      });
    }

    // Assemble Shopify OS 2.0 ZIP package
    const zip = new JSZip();

    // 1. config/settings_schema.json
    const settingsSchema = [
      {
        name: "theme_info",
        theme_name: theme.name,
        theme_version: theme.version || "1.0.0",
        theme_author: "SensaShop Shopify Converter",
        theme_documentation_url: "https://sensashop.com.br",
        theme_support_url: "https://sensashop.com.br/suporte",
      },
      {
        name: "Cores e Visual",
        settings: [
          { type: "color", id: "colors_solid_button_labels", label: "Cor Primária", default: theme.colors.primary },
          { type: "color", id: "colors_accent_1", label: "Destaque 1", default: theme.colors.accent },
          { type: "color", id: "colors_background_1", label: "Fundo", default: theme.colors.background },
          { type: "color", id: "colors_text", label: "Texto Principal", default: theme.colors.textMain },
        ],
      },
    ];
    zip.file("config/settings_schema.json", JSON.stringify(settingsSchema, null, 2));

    // 2. config/settings_data.json
    const settingsData = {
      current: {
        colors_solid_button_labels: theme.colors.primary,
        colors_accent_1: theme.colors.accent,
        colors_background_1: theme.colors.background,
        colors_background_2: theme.colors.surface,
        colors_text: theme.colors.textMain,
        colors_outline_button_labels: theme.colors.border,
        type_header_font: theme.typography.headingFont,
        type_body_font: theme.typography.bodyFont,
        type_body_base_size: parseInt(theme.typography.baseFontSize) || 16,
        page_width: theme.layout.containerWidth === "1536px" ? 1600 : 1280,
        social_instagram_link: theme.social.instagram,
        social_whatsapp_link: theme.social.whatsapp,
        social_tiktok_link: theme.social.tiktok,
        social_facebook_link: theme.social.facebook,
        social_youtube_link: theme.social.youtube,
        social_twitter_link: theme.social.twitter,
        announcement_text: theme.announcement.text,
        announcement_bar_enabled: theme.announcement.enabled,
        logo_text: theme.header.logoText,
      },
    };
    zip.file("config/settings_data.json", JSON.stringify(settingsData, null, 2));

    // 3. templates/index.json (OS 2.0 sections)
    const indexSections: Record<string, any> = {};
    const sectionOrder: string[] = [];

    theme.sections.forEach((sec, idx) => {
      const sId = `section_${idx + 1}_${sec.type.replace(/_/g, "-")}`;
      sectionOrder.push(sId);

      const blocksObj: Record<string, any> = {};
      const blockOrder: string[] = [];

      if (sec.blocks && sec.blocks.length > 0) {
        sec.blocks.forEach((b, bIdx) => {
          const bId = `block_${bIdx + 1}`;
          blockOrder.push(bId);
          blocksObj[bId] = {
            type: b.type,
            settings: b.settings,
          };
        });
      }

      indexSections[sId] = {
        type: sec.type.replace(/_/g, "-"),
        disabled: !sec.enabled,
        settings: sec.settings,
        blocks: Object.keys(blocksObj).length > 0 ? blocksObj : undefined,
        block_order: blockOrder.length > 0 ? blockOrder : undefined,
      };

      // Also create a sample .liquid section file
      const liquidFilename = `sections/${sec.type.replace(/_/g, "-")}.liquid`;
      if (!zip.file(liquidFilename)) {
        const sampleLiquid = `{% comment %} Section: ${sec.name} {% endcomment %}
<div class="shopify-section shopify-section--${sec.type}">
  <div class="container">
    <h2>{{ section.settings.title | default: section.settings.heading }}</h2>
    <p>{{ section.settings.subtitle | default: section.settings.text }}</p>
  </div>
</div>

{% schema %}
{
  "name": ${JSON.stringify(sec.name)},
  "tag": "section",
  "class": "section",
  "settings": []
}
{% endschema %}`;
        zip.file(liquidFilename, sampleLiquid);
      }
    });

    const indexTemplate = {
      sections: indexSections,
      order: sectionOrder,
    };
    zip.file("templates/index.json", JSON.stringify(indexTemplate, null, 2));

    // 4. assets/base.css
    zip.file("assets/base.css", theme.customCss || "/* SensaShop Custom Theme Styles */\n");

    // 5. layout/theme.liquid
    const themeLiquid = `<!doctype html>
<html class="no-js" lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>{{ page_title }}</title>
    {{ content_for_header }}
    {{ 'base.css' | asset_url | stylesheet_tag }}
  </head>
  <body class="gradient">
    <main id="MainContent" class="content-for-layout focus-none" role="main" tabindex="-1">
      {{ content_for_layout }}
    </main>
  </body>
</html>`;
    zip.file("layout/theme.liquid", themeLiquid);

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });

    return new NextResponse(zipBuffer as any, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${safeSlug}-shopify-os2.zip"`,
      },
    });
  } catch (error: any) {
    console.error("Erro ao exportar tema:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erro ao gerar arquivo do tema." },
      { status: 500 }
    );
  }
}
