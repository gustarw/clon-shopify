import type { SectionConfig, SectionBlock, SectionType } from "@/lib/repo/theme";
import type {
  ShopifySectionJson,
  ShopifyBlockJson,
  ConvertedSectionInfo,
} from "./shopify-types";
import { renderLiquidSafe } from "./liquid-engine";

/**
 * Clean up HTML tags or Liquid tags if needed
 */
function cleanText(raw: any, fallback = ""): string {
  if (raw === undefined || raw === null) return fallback;
  if (typeof raw !== "string") return String(raw);
  return raw
    .replace(/<[^>]*>?/gm, "")
    .replace(/\{%[\s\S]*?%\}/g, "")
    .replace(/\{\{[\s\S]*?\}\}/g, "")
    .trim() || fallback;
}

/**
 * Normalizes an image url from Shopify scheme (shopify://shop_images/...) or asset path
 */
export function normalizeShopifyImageUrl(
  imageVal: any,
  fallback = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80"
): string {
  if (!imageVal) return fallback;
  if (typeof imageVal === "object" && imageVal.src) return imageVal.src;
  const str = String(imageVal).trim();
  if (str.startsWith("http://") || str.startsWith("https://") || str.startsWith("/")) {
    return str;
  }
  if (str.startsWith("shopify://shop_images/")) {
    const filename = str.replace("shopify://shop_images/", "");
    return `/uploads/themes/assets/${filename}`;
  }
  return `/uploads/themes/assets/${str}`;
}

/**
 * Maps Shopify Section JSON into SensaShop native SectionConfig
 */
export async function convertShopifySection(
  sectionId: string,
  shopifySection: ShopifySectionJson,
  rawLiquidTemplate?: string
): Promise<{ section: SectionConfig; info: ConvertedSectionInfo }> {
  const typeKey = (shopifySection.type || "custom_liquid").toLowerCase().replace(/_/g, "-");
  const settings = shopifySection.settings || {};
  const rawBlocks = shopifySection.blocks || {};
  const blockOrder = shopifySection.block_order || Object.keys(rawBlocks);

  const blocksList: ShopifyBlockJson[] = blockOrder
    .map((bid) => rawBlocks[bid])
    .filter(Boolean);

  let convertedType: SectionType = "custom_html_liquid";
  let sectionName = `Seção ${typeKey}`;
  let finalSettings: Record<string, any> = {};
  let finalBlocks: SectionBlock[] | undefined = undefined;
  let status: "success" | "mapped_fallback" | "custom_liquid" = "success";
  let details = "";

  // 1. HERO / BANNER / SLIDESHOW
  if (
    typeKey.includes("image-banner") ||
    typeKey.includes("hero") ||
    typeKey.includes("slideshow") ||
    typeKey.includes("main-banner") ||
    typeKey.includes("banner")
  ) {
    // Extract heading, subtitle, buttons from blocks if present
    let title = settings.heading || settings.title || "Novidades Exclusivas 2026";
    let subtitle = settings.text || settings.subheading || settings.subtitle || "Os melhores produtos com a qualidade que você confia.";
    let primaryButtonText = settings.button_label_1 || settings.button_label || "Explorar Catálogo";
    let primaryButtonUrl = settings.button_link_1 || settings.button_link || "/produtos";
    let secondaryButtonText = settings.button_label_2 || "Ver Ofertas";
    let secondaryButtonUrl = settings.button_link_2 || "/produtos";

    for (const b of blocksList) {
      const bType = (b.type || "").toLowerCase();
      if (bType.includes("heading")) {
        title = b.settings?.heading || title;
      } else if (bType.includes("text") || bType.includes("subheading")) {
        subtitle = b.settings?.text || subtitle;
      } else if (bType.includes("button")) {
        primaryButtonText = b.settings?.button_label_1 || b.settings?.button_label || primaryButtonText;
        primaryButtonUrl = b.settings?.button_link_1 || b.settings?.button_link || primaryButtonUrl;
        secondaryButtonText = b.settings?.button_label_2 || secondaryButtonText;
        secondaryButtonUrl = b.settings?.button_link_2 || secondaryButtonUrl;
      }
    }

    convertedType = "hero_banner";
    sectionName = "Banner Principal (Hero)";
    finalSettings = {
      eyebrow: cleanText(settings.eyebrow || "✨ Nova Coleção • Shopify Experience"),
      title: cleanText(title),
      titleHighlight: "",
      subtitle: cleanText(subtitle),
      primaryButtonText: cleanText(primaryButtonText, "Explorar Catálogo"),
      primaryButtonUrl: String(primaryButtonUrl || "/produtos").replace("shopify://collections/all", "/produtos"),
      secondaryButtonText: cleanText(secondaryButtonText, "Ver Ofertas"),
      secondaryButtonUrl: String(secondaryButtonUrl || "/produtos"),
      styleVariant: "dark_glow",
      imageUrl: normalizeShopifyImageUrl(settings.image || settings.image_1),
      bannerHeight: settings.image_height === "large" ? "580px" : "500px",
      overlayOpacity: settings.image_overlay_opacity ? String(Number(settings.image_overlay_opacity) / 100) : "0.3",
      stat1Number: "+10k",
      stat1Label: "Pedidos Entregues",
      stat2Number: "4.9 ★",
      stat2Label: "Avaliação Média",
      stat3Number: "100%",
      stat3Label: "Checkout Seguro",
    };
    details = "Convertido de Shopify Image Banner / Hero";
  }

  // 2. FEATURED COLLECTION / PRODUCTS
  else if (
    typeKey.includes("featured-collection") ||
    typeKey.includes("featured_collection") ||
    typeKey.includes("featured-products") ||
    typeKey.includes("product-grid") ||
    typeKey.includes("collection-grid")
  ) {
    convertedType = "featured_products";
    sectionName = "Produtos em Destaque";
    finalSettings = {
      eyebrow: "Destaques da Loja",
      title: cleanText(settings.title || settings.heading || "Produtos em Destaque"),
      limit: Number(settings.products_to_show || settings.limit || 8),
      sort: "price_desc",
      categorySlug: settings.collection || "all",
    };
    details = `Convertido com ${finalSettings.limit} produtos exibidos`;
  }

  // 3. COLLECTION LIST / FEATURED COLLECTIONS
  else if (
    typeKey.includes("collection-list") ||
    typeKey.includes("list-collections") ||
    typeKey.includes("featured-collections") ||
    typeKey.includes("collections")
  ) {
    convertedType = "featured_collections";
    sectionName = "Coleções em Destaque";
    finalSettings = {
      title: cleanText(settings.title || settings.heading || "Coleções em Destaque"),
      subtitle: cleanText(settings.subtitle || "Navegue pelas principais categorias da loja"),
      limit: Number(settings.collections_to_show || blocksList.length || 5),
      layout: "grid",
    };
    details = "Convertido de Shopify Collection List";
  }

  // 4. MULTICOLUMN / GUARANTEES / FEATURES
  else if (
    typeKey.includes("multicolumn") ||
    typeKey.includes("multi-column") ||
    typeKey.includes("text-columns") ||
    typeKey.includes("guarantees") ||
    typeKey.includes("features") ||
    typeKey.includes("diferenciais")
  ) {
    // Check if blocks represent store guarantees (frete, cartao, garantia, suporte)
    const isFeaturesBar =
      blocksList.length >= 3 &&
      blocksList.some((b) => {
        const t = (b.settings?.title || b.settings?.heading || "").toLowerCase();
        return (
          t.includes("frete") ||
          t.includes("juros") ||
          t.includes("garantia") ||
          t.includes("suporte") ||
          t.includes("shipping") ||
          t.includes("return") ||
          t.includes("payment")
        );
      });

    if (isFeaturesBar || blocksList.length === 4) {
      convertedType = "features_bar";
      sectionName = "Diferenciais da Loja";
      finalSettings = {
        f1Title: cleanText(blocksList[0]?.settings?.title || blocksList[0]?.settings?.heading || "Frete Grátis"),
        f1Desc: cleanText(blocksList[0]?.settings?.text || "Em compras acima de R$ 199 para todo o Brasil"),
        f2Title: cleanText(blocksList[1]?.settings?.title || blocksList[1]?.settings?.heading || "Até 12x Sem Juros"),
        f2Desc: cleanText(blocksList[1]?.settings?.text || "Ou 5% de desconto à vista via Pix"),
        f3Title: cleanText(blocksList[2]?.settings?.title || blocksList[2]?.settings?.heading || "Compra Garantida"),
        f3Desc: cleanText(blocksList[2]?.settings?.text || "30 dias para trocas e devoluções grátis"),
        f4Title: cleanText(blocksList[3]?.settings?.title || blocksList[3]?.settings?.heading || "Suporte 24/7"),
        f4Desc: cleanText(blocksList[3]?.settings?.text || "Atendimento humanizado em tempo real"),
      };
      details = "Convertido para barra de 4 diferenciais";
    } else {
      convertedType = "multi_column";
      sectionName = cleanText(settings.title || settings.heading || "Vantagens da Loja");
      finalSettings = {
        title: cleanText(settings.title || settings.heading || "Vantagens"),
        subtitle: cleanText(settings.subtitle || settings.text || ""),
        columns: Number(settings.columns_desktop || 3),
      };
      finalBlocks = blocksList.map((b, idx) => ({
        id: `mcol-${idx + 1}`,
        type: "column_item",
        settings: {
          title: cleanText(b.settings?.title || b.settings?.heading || `Coluna ${idx + 1}`),
          text: cleanText(b.settings?.text || ""),
          imageUrl: normalizeShopifyImageUrl(b.settings?.image),
          linkUrl: b.settings?.link || "/produtos",
          linkText: cleanText(b.settings?.link_label || "Saiba mais"),
        },
      }));
      details = `Convertido para multicolumn com ${finalBlocks.length} colunas`;
    }
  }

  // 5. IMAGE WITH TEXT / RICH TEXT / PROMO BANNER
  else if (
    typeKey.includes("image-with-text") ||
    typeKey.includes("image_with_text") ||
    typeKey.includes("rich-text") ||
    typeKey.includes("rich_text") ||
    typeKey.includes("promo")
  ) {
    let heading = settings.heading || settings.title || "Qualidade Garantida";
    let bodyText = settings.text || settings.description || "Nossos produtos passam por um rigoroso controle de qualidade para garantir durabilidade e conforto.";
    let buttonText = settings.button_label || "Conhecer Mais";
    let buttonUrl = settings.button_link || "/produtos";

    for (const b of blocksList) {
      if (b.type?.includes("heading")) heading = b.settings?.heading || heading;
      if (b.type?.includes("text")) bodyText = b.settings?.text || bodyText;
      if (b.type?.includes("button")) {
        buttonText = b.settings?.button_label || buttonText;
        buttonUrl = b.settings?.button_link || buttonUrl;
      }
    }

    convertedType = "image_with_text";
    sectionName = "Imagem com Texto";
    finalSettings = {
      badge: "Qualidade Garantida",
      heading: cleanText(heading),
      bodyText: cleanText(bodyText),
      buttonText: cleanText(buttonText),
      buttonUrl: String(buttonUrl),
      imagePosition: settings.layout === "image_first" || settings.image_position === "left" ? "left" : "right",
      imageUrl: normalizeShopifyImageUrl(settings.image),
      item1: "Produtos 100% originais com nota fiscal",
      item2: "Embalagem premium reforçada e discreta",
      item3: "Rastreamento em tempo real via WhatsApp e E-mail",
    };
    details = "Convertido de Shopify Image with Text / Rich Text";
  }

  // 6. MARQUEE / TICKER / ANNOUNCEMENT
  else if (
    typeKey.includes("marquee") ||
    typeKey.includes("ticker") ||
    typeKey.includes("scrolling-text") ||
    typeKey.includes("announcement-bar")
  ) {
    convertedType = "marquee_ticker";
    sectionName = "Faixa de Destaques (Marquee)";
    const items = blocksList.length > 0
      ? blocksList.map((b) => cleanText(b.settings?.text || b.settings?.heading || "⚡ FRETE GRÁTIS")).filter(Boolean)
      : [
          "🚀 ENVIO RÁPIDO PARA TODO BRASIL",
          "🔒 PAGAMENTO 100% SEGURO",
          "💳 ATÉ 12X SEM JUROS",
          "⭐ MAIS DE 5.000 CLIENTES SATISFEITOS",
        ];

    finalSettings = {
      speed: "normal",
      bgColor: "#008060",
      textColor: "#ffffff",
      items,
    };
    details = `Convertido com ${items.length} frases em rotação`;
  }

  // 7. TESTIMONIALS / REVIEWS
  else if (
    typeKey.includes("testimonial") ||
    typeKey.includes("review") ||
    typeKey.includes("depoimento") ||
    typeKey.includes("quotes")
  ) {
    convertedType = "testimonials";
    sectionName = "Depoimentos de Clientes";
    finalSettings = {
      title: cleanText(settings.title || settings.heading || "O que nossos clientes dizem"),
      subtitle: cleanText(settings.subtitle || "Mais de 10.000 clientes satisfeitos em todo o Brasil"),
    };
    finalBlocks = (blocksList.length > 0 ? blocksList : [1, 2, 3]).map((b: any, idx: number) => ({
      id: `t-${idx + 1}`,
      type: "testimonial_item",
      settings: {
        author: cleanText(b.settings?.author || b.settings?.name || `Cliente Satisfeito ${idx + 1}`),
        role: cleanText(b.settings?.location || b.settings?.city || "São Paulo, SP"),
        rating: Number(b.settings?.rating || 5),
        comment: cleanText(
          b.settings?.text ||
          b.settings?.quote ||
          b.settings?.comment ||
          "Excelente produto! Chegou antes do prazo e com qualidade impecável. Recomendo!"
        ),
      },
    }));
    details = `Convertido com ${finalBlocks.length} depoimentos`;
  }

  // 8. FAQ / ACCORDION / COLLAPSIBLE CONTENT
  else if (
    typeKey.includes("faq") ||
    typeKey.includes("accordion") ||
    typeKey.includes("collapsible") ||
    typeKey.includes("perguntas") ||
    typeKey.includes("duvidas")
  ) {
    convertedType = "faq_accordion";
    sectionName = "Perguntas Frequentes (FAQ)";
    finalSettings = {
      title: cleanText(settings.title || settings.heading || "Dúvidas Frequentes"),
      subtitle: cleanText(settings.subtitle || "Tudo o que você precisa saber antes de comprar"),
    };
    finalBlocks = (blocksList.length > 0 ? blocksList : [1, 2, 3]).map((b: any, idx: number) => ({
      id: `faq-${idx + 1}`,
      type: "faq_item",
      settings: {
        question: cleanText(
          b.settings?.heading || b.settings?.title || b.settings?.question || `Dúvida Frequente ${idx + 1}?`
        ),
        answer: cleanText(
          b.settings?.row_content ||
          b.settings?.content ||
          b.settings?.answer ||
          "O prazo de entrega varia de 2 a 7 dias úteis com rastreamento completo via WhatsApp."
        ),
      },
    }));
    details = `Convertido com ${finalBlocks.length} perguntas`;
  }

  // 9. NEWSLETTER
  else if (
    typeKey.includes("newsletter") ||
    typeKey.includes("subscribe") ||
    typeKey.includes("email-signup")
  ) {
    convertedType = "newsletter";
    sectionName = "Captura de E-mails (Newsletter)";
    finalSettings = {
      heading: cleanText(settings.heading || "Fique por dentro das ofertas exclusivas"),
      text: cleanText(settings.text || "Cadastre seu e-mail e receba cupons de desconto VIP e lançamentos."),
      placeholder: "Digite seu melhor e-mail...",
      buttonText: cleanText(settings.button_label || "Cadastrar"),
    };
    details = "Convertido de Shopify Newsletter";
  }

  // 10. VIDEO BANNER
  else if (typeKey.includes("video")) {
    convertedType = "video_banner";
    sectionName = "Vídeo Promocional";
    finalSettings = {
      title: cleanText(settings.heading || "Assista ao Nosso Vídeo Institucional"),
      subtitle: cleanText(settings.description || "Conheça os detalhes e bastidores da nossa marca"),
      videoUrl: settings.video_url || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      coverImageUrl: normalizeShopifyImageUrl(settings.cover_image),
    };
    details = "Convertido de Shopify Video Section";
  }

  // 11. CUSTOM LIQUID / HTML / UNMATCHED SECTIONS
  else {
    convertedType = "custom_html_liquid";
    sectionName = `Seção Personalizada (${shopifySection.type || "Liquid"})`;
    status = "custom_liquid";

    let renderedHtml = "";
    if (settings.custom_liquid || settings.liquid || settings.html) {
      const liquidCode = settings.custom_liquid || settings.liquid || settings.html;
      renderedHtml = await renderLiquidSafe(liquidCode, { settings });
    } else if (rawLiquidTemplate) {
      renderedHtml = await renderLiquidSafe(rawLiquidTemplate, {
        section: {
          id: sectionId,
          settings,
          blocks: blocksList,
        },
      });
    }

    if (!renderedHtml.trim()) {
      renderedHtml = `<div class="py-12 px-6 text-center bg-gray-50 border rounded-2xl">
        <h3 class="text-lg font-bold text-gray-900 mb-2">${cleanText(settings.heading || settings.title || sectionName)}</h3>
        <p class="text-sm text-gray-600">${cleanText(settings.text || settings.description || "Conteúdo convertido do tema Shopify.")}</p>
      </div>`;
    }

    finalSettings = {
      htmlCode: renderedHtml,
    };
    details = "Renderizado através do motor LiquidJS com contexto dinâmico";
  }

  const section: SectionConfig = {
    id: `sec-${sectionId}-${Date.now().toString().slice(-4)}`,
    type: convertedType,
    name: sectionName,
    enabled: !shopifySection.disabled,
    settings: finalSettings,
    blocks: finalBlocks,
  };

  const info: ConvertedSectionInfo = {
    originalId: sectionId,
    originalType: shopifySection.type || "custom_liquid",
    convertedType,
    name: sectionName,
    blockCount: finalBlocks ? finalBlocks.length : blocksList.length,
    status,
    details,
  };

  return { section, info };
}
