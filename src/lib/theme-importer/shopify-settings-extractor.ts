import type {
  ThemeColors,
  ThemeTypography,
  ThemeLayout,
  ThemeAnnouncement,
  ThemeHeader,
  ThemeSocial,
  ThemeFooter,
} from "@/lib/repo/theme";
import type { ShopifySettingsData, ShopifySettingsSchemaItem } from "./shopify-types";

/**
 * Normalizes any color representation into a clean 6-digit hex (#rrggbb)
 */
export function normalizeHexColor(rawColor: any, fallback: string): string {
  if (!rawColor || typeof rawColor !== "string") return fallback;
  const str = rawColor.trim();

  // Already 6-char or 3-char hex
  if (/^#([0-9a-fA-F]{3}){1,2}$/.test(str)) {
    if (str.length === 4) {
      return `#${str[1]}${str[1]}${str[2]}${str[2]}${str[3]}${str[3]}`;
    }
    return str.toLowerCase();
  }

  // Handle rgb / rgba
  const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, "0");
    const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, "0");
    const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`.toLowerCase();
  }

  // Handle Shopify gradients (e.g. "linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(30, 30, 30, 1) 100%)")
  const gradientHexMatch = str.match(/#([0-9a-fA-F]{6})/);
  if (gradientHexMatch) {
    return `#${gradientHexMatch[1]}`.toLowerCase();
  }

  return fallback;
}

/**
 * Computes a slightly darker/lighter tone for hover states
 */
function adjustColorBrightness(hex: string, percent: number): string {
  try {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00ff) + percent;
    let b = (num & 0x0000ff) + percent;

    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}

/**
 * Extracts ThemeColors from Shopify settings_data.json
 */
export function extractThemeColors(
  settings: Record<string, any>,
  schemaList?: ShopifySettingsSchemaItem[]
): ThemeColors {
  // Check Shopify Dawn OS 2.0 colors + Vintage color tokens
  const primaryRaw =
    settings.colors_solid_button_labels ||
    settings.colors_accent_1 ||
    settings.colors_button_background ||
    settings.color_primary ||
    settings.color_btn_primary_bg ||
    settings.color_accent ||
    "#008060";

  const primary = normalizeHexColor(primaryRaw, "#008060");
  const primaryHover = adjustColorBrightness(primary, -15);

  const accentRaw =
    settings.colors_accent_2 ||
    settings.colors_accent ||
    settings.color_secondary ||
    settings.color_badge ||
    settings.color_sale_badge ||
    "#10b981";
  const accent = normalizeHexColor(accentRaw, "#10b981");

  const bgRaw =
    settings.colors_background_1 ||
    settings.color_body_bg ||
    settings.color_background ||
    settings.color_bg ||
    "#f6f6f7";
  const background = normalizeHexColor(bgRaw, "#f6f6f7");

  const surfaceRaw =
    settings.colors_background_2 ||
    settings.color_card_bg ||
    settings.color_surface ||
    settings.color_header_bg ||
    "#ffffff";
  const surface = normalizeHexColor(surfaceRaw, "#ffffff");

  const textMainRaw =
    settings.colors_text ||
    settings.color_body_text ||
    settings.color_text ||
    settings.color_heading ||
    "#1a1c1d";
  const textMain = normalizeHexColor(textMainRaw, "#1a1c1d");

  const textMutedRaw =
    settings.color_subtext ||
    settings.color_text_muted ||
    settings.colors_text_secondary;
  const textMuted = textMutedRaw
    ? normalizeHexColor(textMutedRaw, "#6d7175")
    : adjustColorBrightness(textMain, 60);

  const borderRaw =
    settings.colors_outline_button_labels ||
    settings.color_borders ||
    settings.color_border ||
    settings.color_line ||
    "#e1e3e5";
  const border = normalizeHexColor(borderRaw, "#e1e3e5");

  return {
    primary,
    primaryHover,
    accent,
    background,
    surface,
    textMain,
    textMuted,
    border,
  };
}

/**
 * Maps font string from Shopify to supported fonts
 */
export function mapShopifyFontToSupported(
  fontVal: any,
  fallback: "Plus Jakarta Sans" | "Inter" | "Poppins" | "Playfair Display" | "Outfit" | "Roboto" | "Geist"
): any {
  if (!fontVal || typeof fontVal !== "string") return fallback;
  const lower = fontVal.toLowerCase();

  if (lower.includes("jakarta")) return "Plus Jakarta Sans";
  if (lower.includes("playfair")) return "Playfair Display";
  if (lower.includes("poppins")) return "Poppins";
  if (lower.includes("outfit")) return "Outfit";
  if (lower.includes("roboto")) return "Roboto";
  if (lower.includes("open_sans") || lower.includes("open sans")) return "Open Sans";
  if (lower.includes("geist")) return "Geist";
  if (lower.includes("inter")) return "Inter";

  // Serif heuristics
  if (lower.includes("serif") || lower.includes("garamond") || lower.includes("bodoni") || lower.includes("baskerville")) {
    return "Playfair Display";
  }

  return fallback;
}

/**
 * Extracts Typography settings
 */
export function extractThemeTypography(settings: Record<string, any>): ThemeTypography {
  const headerFontRaw =
    settings.type_header_font ||
    settings.type_header_font_family ||
    settings.heading_font ||
    settings.font_heading;

  const bodyFontRaw =
    settings.type_body_font ||
    settings.type_body_font_family ||
    settings.body_font ||
    settings.font_body;

  const headingFont = mapShopifyFontToSupported(headerFontRaw, "Plus Jakarta Sans");
  const bodyFont = mapShopifyFontToSupported(bodyFontRaw, "Inter") as any;

  let baseFontSize: "14px" | "15px" | "16px" = "16px";
  const sizeRaw = Number(settings.type_body_base_size || settings.body_font_size || 16);
  if (sizeRaw <= 14) baseFontSize = "14px";
  else if (sizeRaw === 15) baseFontSize = "15px";
  else baseFontSize = "16px";

  return {
    headingFont,
    bodyFont,
    baseFontSize,
  };
}

/**
 * Extracts Layout settings
 */
export function extractThemeLayout(settings: Record<string, any>): ThemeLayout {
  // Page Width
  let containerWidth: "1280px" | "1400px" | "1536px" | "100%" = "1280px";
  const widthRaw = Number(settings.page_width || 1280);
  if (widthRaw >= 1500) containerWidth = "1536px";
  else if (widthRaw >= 1350) containerWidth = "1400px";
  else if (widthRaw === 0 || settings.full_width === true) containerWidth = "100%";
  else containerWidth = "1280px";

  // Border Radius
  let borderRadius: "rounded-none" | "rounded-lg" | "rounded-xl" | "rounded-2xl" | "rounded-3xl" = "rounded-2xl";
  const radiusVal = Number(settings.badge_corner_radius ?? settings.card_corner_radius ?? settings.corner_radius ?? 16);
  if (radiusVal <= 2) borderRadius = "rounded-none";
  else if (radiusVal <= 8) borderRadius = "rounded-lg";
  else if (radiusVal <= 14) borderRadius = "rounded-xl";
  else if (radiusVal <= 22) borderRadius = "rounded-2xl";
  else borderRadius = "rounded-3xl";

  // Button Radius
  let buttonRadius: "rounded-none" | "rounded-lg" | "rounded-xl" | "rounded-full" = "rounded-xl";
  const btnVal = Number(settings.buttons_radius ?? settings.button_border_radius ?? 12);
  if (btnVal <= 2) buttonRadius = "rounded-none";
  else if (btnVal <= 8) buttonRadius = "rounded-lg";
  else if (btnVal >= 28 || settings.button_pill === true) buttonRadius = "rounded-full";
  else buttonRadius = "rounded-xl";

  // Card Shadow
  let cardShadow: "none" | "subtle" | "medium" | "glow" = "subtle";
  const shadowVal = settings.card_shadow_opacity ?? settings.shadow_type ?? "subtle";
  if (Number(shadowVal) === 0 || shadowVal === "none") cardShadow = "none";
  else if (Number(shadowVal) > 25 || shadowVal === "heavy" || shadowVal === "glow") cardShadow = "glow";
  else if (Number(shadowVal) > 10 || shadowVal === "medium") cardShadow = "medium";

  return {
    containerWidth,
    borderRadius,
    buttonRadius,
    cardShadow,
  };
}


/**
 * Extracts Announcement bar configuration from global settings or header group sections
 */
export function extractThemeAnnouncement(
  settings: Record<string, any>,
  headerSectionData?: Record<string, any>
): ThemeAnnouncement {
  const annSettings = headerSectionData?.announcementSection?.settings || headerSectionData?.settings || {};
  const annBlocks = headerSectionData?.announcementSection?.blocks || {};
  const firstBlock = Object.values(annBlocks)[0] as any;

  const enabled =
    annSettings.show_announcement ??
    settings.show_announcement ??
    settings.announcement_bar_enabled ??
    settings.enable_announcement ??
    true;

  const text =
    firstBlock?.settings?.text ??
    annSettings.text ??
    settings.announcement_text ??
    settings.announcement_bar_text ??
    settings.announcement_message ??
    "⚡ FRETE GRÁTIS para todo o Brasil acima de R$ 199 | Parcele em até 12x";

  const badgeText =
    annSettings.badge ??
    settings.announcement_badge ??
    settings.announcement_label ??
    "NOVIDADE";

  const linkText =
    annSettings.link_text ??
    settings.announcement_link_text ??
    settings.announcement_button_label ??
    "Aproveitar Agora";

  const linkUrl =
    firstBlock?.settings?.link ??
    annSettings.link ??
    settings.announcement_link ??
    settings.announcement_url ??
    "/produtos";

  const bgStyle =
    settings.announcement_bg_style === "brand"
      ? "brand"
      : settings.announcement_bg_style === "sunset"
      ? "sunset"
      : settings.announcement_bg_style === "gradient_emerald"
      ? "gradient_emerald"
      : "dark";

  return {
    enabled: Boolean(enabled),
    text: String(text).replace(/<[^>]*>?/gm, ""), // strip HTML
    badgeText: String(badgeText),
    linkText: String(linkText),
    linkUrl: String(linkUrl),
    bgStyle,
    showSecurityBadge: settings.announcement_show_security ?? true,
  };
}

/**
 * Extracts Header configuration and navigation menu links from theme settings and header section/group
 */
export function extractThemeHeader(
  settings: Record<string, any>,
  themeName: string,
  headerSectionData?: Record<string, any>
): ThemeHeader {
  const hSettings = headerSectionData?.headerSection?.settings || headerSectionData?.settings || {};

  const sticky =
    hSettings.sticky_header_type !== "none" &&
    (hSettings.sticky_header_type !== undefined ||
      Boolean(settings.header_sticky ?? settings.enable_sticky_header ?? true));

  const logoText =
    hSettings.logo_text ??
    settings.logo_text ??
    settings.shop_name ??
    (themeName ? themeName.split(" ")[0] : "SensaShop");

  const logoBadge =
    hSettings.logo_badge ??
    settings.logo_badge ??
    "Store";

  const logoImageUrl =
    hSettings.logo ||
    hSettings.logo_image ||
    settings.logo_image ||
    settings.logo ||
    undefined;

  const searchPlaceholder =
    hSettings.search_placeholder ??
    settings.search_placeholder ??
    "Buscar em todos os produtos...";

  // Extract menu links if specified in header settings or blocks
  let menuLinks: Array<{ label: string; href: string }> | undefined = undefined;

  if (Array.isArray(hSettings.menu_links)) {
    menuLinks = hSettings.menu_links;
  } else if (headerSectionData?.headerSection?.blocks) {
    const rawBlocks = Object.values(headerSectionData.headerSection.blocks) as any[];
    const extractedLinks = rawBlocks
      .filter((b) => b.type === "menu_item" || b.type === "link" || b.type === "navigation")
      .map((b) => ({
        label: b.settings?.title || b.settings?.label || "Link",
        href: b.settings?.url || b.settings?.link || "/produtos",
      }));
    if (extractedLinks.length > 0) menuLinks = extractedLinks;
  }

  if (!menuLinks || menuLinks.length === 0) {
    menuLinks = [
      { label: "Catálogo Geral", href: "/produtos" },
      { label: "Eletrônicos", href: "/produtos?categoria=eletronicos" },
      { label: "Moda & Estilo", href: "/produtos?categoria=moda" },
      { label: "Casa & Decoração", href: "/produtos?categoria=casa-decoracao" },
    ];
  }

  return {
    sticky: Boolean(sticky),
    logoText: String(logoText),
    logoBadge: String(logoBadge),
    logoImageUrl: typeof logoImageUrl === "string" ? logoImageUrl : undefined,
    searchPlaceholder: String(searchPlaceholder),
    showCartBadge: true,
    showAccountLink: true,
    menuLinks,
  };
}

/**
 * Extracts Social links
 */
export function extractThemeSocial(settings: Record<string, any>): ThemeSocial {
  return {
    instagram: settings.social_instagram_link || "https://instagram.com",
    whatsapp: settings.social_whatsapp_link || settings.whatsapp_link || "https://whatsapp.com",
    tiktok: settings.social_tiktok_link || "https://tiktok.com",
    facebook: settings.social_facebook_link || "https://facebook.com",
    youtube: settings.social_youtube_link || "https://youtube.com",
    twitter: settings.social_twitter_link || settings.social_x_link || "https://twitter.com",
  };
}

/**
 * Extracts Footer configuration, contact info, and columns from theme settings and footer section/group
 */
export function extractThemeFooter(
  settings: Record<string, any>,
  themeName: string,
  footerSectionData?: Record<string, any>
): ThemeFooter {
  const fSettings = footerSectionData?.footerSection?.settings || footerSectionData?.settings || {};
  const fBlocks = footerSectionData?.footerSection?.blocks || footerSectionData?.blocks || {};

  const copyright =
    fSettings.copyright ||
    settings.footer_copyright ||
    `© ${new Date().getFullYear()} ${settings.shop_name || themeName.split(" ")[0] || "SensaShop"}. Todos os direitos reservados.`;

  const tagline =
    fSettings.tagline ||
    fSettings.subtext ||
    settings.footer_tagline ||
    settings.footer_text ||
    `A sua experiência de compras completa inspirada no design ${themeName}.`;

  const contactEmail =
    fSettings.contact_email ||
    settings.contact_email ||
    settings.email ||
    `suporte@${themeName.toLowerCase().replace(/[^a-z0-9]/g, "") || "sensashop"}.com.br`;

  const contactPhone =
    fSettings.contact_phone ||
    settings.contact_phone ||
    settings.phone ||
    "+55 11 4002-8922";

  const contactAddress =
    fSettings.contact_address ||
    settings.contact_address ||
    settings.address ||
    "Av. Paulista, 1000 — São Paulo, SP";

  const showAssuranceBanner =
    fSettings.show_assurance ??
    settings.show_assurance_banner ??
    true;

  // Extract columns from blocks in footer-group.json or footer.liquid
  let columns: Array<{ id: string; title: string; links: Array<{ label: string; href: string }> }> = [];

  const rawBlocksList = Object.values(fBlocks) as any[];
  for (let i = 0; i < rawBlocksList.length; i++) {
    const b = rawBlocksList[i];
    const heading = b.settings?.heading || b.settings?.title;
    if (heading) {
      // Build links based on block settings or standard links for that category
      let links: Array<{ label: string; href: string }> = [];
      if (Array.isArray(b.settings?.links)) {
        links = b.settings.links;
      } else if (heading.toLowerCase().includes("cat") || heading.toLowerCase().includes("prod") || heading.toLowerCase().includes("coleç")) {
        links = [
          { label: "Eletrônicos", href: "/produtos?categoria=eletronicos" },
          { label: "Moda & Estilo", href: "/produtos?categoria=moda" },
          { label: "Casa & Decoração", href: "/produtos?categoria=casa-decoracao" },
          { label: "Esportes", href: "/produtos?categoria=esportes" },
        ];
      } else if (heading.toLowerCase().includes("inst") || heading.toLowerCase().includes("sobre") || heading.toLowerCase().includes("empresa")) {
        links = [
          { label: "Sobre Nós", href: "#" },
          { label: "Política de Privacidade", href: "#" },
          { label: "Termos de Serviço", href: "#" },
          { label: "Trabalhe Conosco", href: "#" },
        ];
      } else {
        links = [
          { label: "Central de Ajuda", href: "#" },
          { label: "Rastrear Pedido", href: "/conta" },
          { label: "Trocas e Devoluções", href: "#" },
          { label: "Fale Conosco", href: "#" },
        ];
      }

      columns.push({
        id: `col-${i + 1}`,
        title: heading,
        links,
      });
    }
  }

  // Fallback columns if none defined in blocks
  if (columns.length === 0) {
    columns = [
      {
        id: "col-1",
        title: "Categorias",
        links: [
          { label: "Eletrônicos", href: "/produtos?categoria=eletronicos" },
          { label: "Moda & Estilo", href: "/produtos?categoria=moda" },
          { label: "Casa & Decoração", href: "/produtos?categoria=casa-decoracao" },
          { label: "Esportes", href: "/produtos?categoria=esportes" },
        ],
      },
      {
        id: "col-2",
        title: "Institucional",
        links: [
          { label: "Sobre Nós", href: "#" },
          { label: "Política de Privacidade", href: "#" },
          { label: "Termos de Serviço", href: "#" },
          { label: "Trabalhe Conosco", href: "#" },
        ],
      },
      {
        id: "col-3",
        title: "Atendimento",
        links: [
          { label: "Central de Ajuda", href: "#" },
          { label: "Rastrear Pedido", href: "/conta" },
          { label: "Trocas e Devoluções", href: "#" },
          { label: "Fale Conosco", href: "#" },
        ],
      },
    ];
  }

  return {
    copyright,
    tagline,
    showPaymentBadges: fSettings.payment_enable ?? settings.show_payment_icons ?? true,
    showNewsletter: fSettings.newsletter_enable ?? settings.footer_show_newsletter ?? true,
    contactEmail,
    contactPhone,
    contactAddress,
    showAssuranceBanner,
    columns,
  };
}
