import "server-only";
import { get, run } from "@/lib/db";
import { getSupabaseAdmin } from "@/lib/supabase";

export type SectionType =
  | "hero_banner"
  | "image_banner"
  | "features_bar"
  | "featured_collections"
  | "featured_products"
  | "promo_banner"
  | "image_with_text"
  | "new_arrivals"
  | "testimonials"
  | "faq_accordion"
  | "marquee_ticker"
  | "multi_column"
  | "newsletter"
  | "video_banner"
  | "custom_html_liquid";

export interface SectionBlock {
  id: string;
  type: string;
  settings: Record<string, any>;
}

export interface SectionConfig {
  id: string;
  type: SectionType;
  name: string;
  enabled: boolean;
  settings: Record<string, any>;
  blocks?: SectionBlock[];
}

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  accent: string;
  background: string;
  surface: string;
  textMain: string;
  textMuted: string;
  border: string;
}

export interface ThemeTypography {
  headingFont: "Inter" | "Plus Jakarta Sans" | "Poppins" | "Playfair Display" | "Outfit" | "Geist";
  bodyFont: "Inter" | "Roboto" | "Open Sans" | "Geist";
  baseFontSize: "14px" | "15px" | "16px";
}

export interface ThemeLayout {
  containerWidth: "1280px" | "1400px" | "1536px" | "100%";
  borderRadius: "rounded-none" | "rounded-lg" | "rounded-xl" | "rounded-2xl" | "rounded-3xl";
  buttonRadius: "rounded-none" | "rounded-lg" | "rounded-xl" | "rounded-full";
  cardShadow: "none" | "subtle" | "medium" | "glow";
}

export interface ThemeAnnouncement {
  enabled: boolean;
  text: string;
  badgeText: string;
  linkText: string;
  linkUrl: string;
  bgStyle: "dark" | "brand" | "gradient_emerald" | "sunset";
  showSecurityBadge: boolean;
}

export interface ThemeHeader {
  sticky: boolean;
  logoText: string;
  logoBadge: string;
  logoImageUrl?: string;
  searchPlaceholder: string;
  showCartBadge: boolean;
  showAccountLink: boolean;
  menuLinks?: Array<{ label: string; href: string }>;
}

export interface ThemeSocial {
  whatsapp?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  youtube?: string;
  twitter?: string;
}

export interface ThemeFooterColumn {
  id: string;
  title: string;
  links: Array<{ label: string; href: string }>;
}

export interface ThemeFooter {
  copyright: string;
  tagline: string;
  showPaymentBadges: boolean;
  showNewsletter: boolean;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  showAssuranceBanner?: boolean;
  columns: ThemeFooterColumn[];
}

export interface ThemeConfig {
  id: string;
  name: string;
  version: string;
  updatedAt: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  announcement: ThemeAnnouncement;
  header: ThemeHeader;
  social: ThemeSocial;
  footer: ThemeFooter;
  customCss: string;
  sections: SectionConfig[];
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  id: "main-theme",
  name: "Dawn 15.0 - SensaShop",
  version: "15.0.0",
  updatedAt: new Date().toISOString(),
  colors: {
    primary: "#008060",
    primaryHover: "#006e52",
    accent: "#10b981",
    background: "#f6f6f7",
    surface: "#ffffff",
    textMain: "#1a1c1d",
    textMuted: "#6d7175",
    border: "#e1e3e5",
  },
  typography: {
    headingFont: "Plus Jakarta Sans",
    bodyFont: "Inter",
    baseFontSize: "16px",
  },
  layout: {
    containerWidth: "1280px",
    borderRadius: "rounded-2xl",
    buttonRadius: "rounded-xl",
    cardShadow: "subtle",
  },
  announcement: {
    enabled: true,
    text: "⚡ FRETE GRÁTIS para todo o Brasil acima de R$ 199 | Parcele em até 12x",
    badgeText: "NOVIDADE",
    linkText: "Aproveitar Agora",
    linkUrl: "/produtos",
    bgStyle: "dark",
    showSecurityBadge: true,
  },
  header: {
    sticky: true,
    logoText: "SensaShop",
    logoBadge: "Store",
    searchPlaceholder: "Buscar em todos os produtos...",
    showCartBadge: true,
    showAccountLink: true,
    menuLinks: [
      { label: "Catálogo Geral", href: "/produtos" },
      { label: "Eletrônicos", href: "/produtos?categoria=eletronicos" },
      { label: "Moda & Estilo", href: "/produtos?categoria=moda" },
      { label: "Casa & Decoração", href: "/produtos?categoria=casa-decoracao" },
    ],
  },
  social: {
    instagram: "https://instagram.com",
    whatsapp: "https://whatsapp.com",
    tiktok: "https://tiktok.com",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
  },
  footer: {
    copyright: "© 2026 SensaShop. Todos os direitos reservados.",
    tagline: "A sua experiência de compras completa inspirada no ecossistema Shopify.",
    showPaymentBadges: true,
    showNewsletter: true,
    contactEmail: "suporte@sensashop.com.br",
    contactPhone: "+55 11 4002-8922",
    contactAddress: "Av. Paulista, 1000 — São Paulo, SP",
    showAssuranceBanner: true,
    columns: [
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
    ],
  },
  customCss: "",
  sections: [
    {
      id: "sec-hero-1",
      type: "hero_banner",
      name: "Banner Principal (Hero)",
      enabled: true,
      settings: {
        eyebrow: "✨ Nova Coleção 2026 • Shopify Experience",
        title: "Os melhores produtos com a qualidade que você confia.",
        titleHighlight: "confia",
        subtitle:
          "Explore milhares de itens selecionados a dedo com entrega rápida, garantia total de 30 dias e parcelamento facilitado em até 12x.",
        primaryButtonText: "Explorar Catálogo",
        primaryButtonUrl: "/produtos",
        secondaryButtonText: "Ver Novidades",
        secondaryButtonUrl: "/produtos?ordem=recentes",
        styleVariant: "dark_glow",
        stat1Number: "+10k",
        stat1Label: "Pedidos Entregues",
        stat2Number: "4.9 ★",
        stat2Label: "Avaliação Média",
        stat3Number: "100%",
        stat3Label: "Checkout Seguro",
      },
    },
    {
      id: "sec-marquee-1",
      type: "marquee_ticker",
      name: "Faixa de Destaques (Marquee)",
      enabled: true,
      settings: {
        speed: "normal",
        bgColor: "#008060",
        textColor: "#ffffff",
        items: [
          "🚀 ENVIO RÁPIDO PARA TODO BRASIL",
          "🔒 PAGAMENTO 100% SEGURO",
          "💳 ATÉ 12X SEM JUROS",
          "⭐ MAIS DE 5.000 CLIENTES SATISFEITOS",
          "🎁 DESCONTO NO PRIMEIRO PEDIDO: PRIMEIRACOMPRA",
        ],
      },
    },
    {
      id: "sec-features-1",
      type: "features_bar",
      name: "Diferenciais da Loja",
      enabled: true,
      settings: {
        f1Title: "Frete Grátis",
        f1Desc: "Em compras acima de R$ 199 para todo o Brasil",
        f2Title: "Até 12x Sem Juros",
        f2Desc: "Ou 5% de desconto à vista via Pix",
        f3Title: "Compra Garantida",
        f3Desc: "30 dias para trocas e devoluções grátis",
        f4Title: "Suporte 24/7",
        f4Desc: "Atendimento humanizado em tempo real",
      },
    },
    {
      id: "sec-collections-1",
      type: "featured_collections",
      name: "Coleções em Destaque",
      enabled: true,
      settings: {
        title: "Coleções em Destaque",
        subtitle: "Navegue pelas principais categorias da loja",
        limit: 5,
        layout: "grid",
      },
    },
    {
      id: "sec-featured-products-1",
      type: "featured_products",
      name: "Produtos em Destaque",
      enabled: true,
      settings: {
        eyebrow: "Destaques da Loja",
        title: "Mais Vendidos da Semana",
        limit: 8,
        sort: "price_desc",
        categorySlug: "all",
      },
    },
    {
      id: "sec-promo-1",
      type: "promo_banner",
      name: "Banner Promocional",
      enabled: true,
      settings: {
        badge: "Promoção por Tempo Limitado ⚡",
        heading: "Até 40% OFF nos produtos mais desejados",
        description:
          "Use o cupom PRIMEIRACOMPRA no checkout para garantir 10% de desconto adicional no seu primeiro pedido.",
        couponCode: "PRIMEIRACOMPRA",
        buttonText: "Aproveitar Ofertas",
        buttonUrl: "/produtos",
        themeStyle: "dark",
      },
    },
    {
      id: "sec-image-with-text-1",
      type: "image_with_text",
      name: "Imagem com Texto",
      enabled: true,
      settings: {
        badge: "Qualidade Garantida",
        heading: "A melhor experiência de compra direto na sua casa",
        bodyText:
          "Nossos produtos passam por um rigoroso controle de qualidade para garantir durabilidade, sofisticação e conforto no seu dia a dia.",
        buttonText: "Conhecer Nossa História",
        buttonUrl: "/produtos",
        imagePosition: "right",
        item1: "Produtos 100% originais com nota fiscal",
        item2: "Embalagem premium reforçada e discreta",
        item3: "Rastreamento em tempo real via WhatsApp e E-mail",
      },
    },
    {
      id: "sec-new-arrivals-1",
      type: "new_arrivals",
      name: "Novidades Recentes",
      enabled: true,
      settings: {
        title: "Novidades Recentes",
        subtitle: "Últimos lançamentos adicionados ao nosso catálogo",
        limit: 4,
      },
    },
    {
      id: "sec-testimonials-1",
      type: "testimonials",
      name: "Depoimentos de Clientes",
      enabled: true,
      settings: {
        title: "O que nossos clientes dizem",
        subtitle: "Mais de 10.000 clientes satisfeitos em todo o Brasil",
      },
      blocks: [
        {
          id: "t-1",
          type: "testimonial_item",
          settings: {
            author: "Mariana Silva",
            role: "São Paulo, SP",
            rating: 5,
            comment:
              "Excelente atendimento! O produto chegou em 2 dias bem embalado e superou minhas expectativas. Recomendo demais!",
          },
        },
        {
          id: "t-2",
          type: "testimonial_item",
          settings: {
            author: "Carlos Eduardo",
            role: "Belo Horizonte, MG",
            rating: 5,
            comment:
              "Site super fluido, checkout rápido e transparência total no rastreio. Com certeza comprarei mais vezes.",
          },
        },
        {
          id: "t-3",
          type: "testimonial_item",
          settings: {
            author: "Fernanda Lima",
            role: "Curitiba, PR",
            rating: 5,
            comment:
              "Qualidade impecável dos produtos! Amei a atenção da equipe pelo suporte do WhatsApp.",
          },
        },
      ],
    },
    {
      id: "sec-faq-1",
      type: "faq_accordion",
      name: "Perguntas Frequentes (FAQ)",
      enabled: true,
      settings: {
        title: "Dúvidas Frequentes",
        subtitle: "Tudo o que você precisa saber antes de comprar",
      },
      blocks: [
        {
          id: "faq-1",
          type: "faq_item",
          settings: {
            question: "Qual o prazo de entrega dos pedidos?",
            answer:
              "O prazo varia de 2 a 7 dias úteis dependendo da sua região. Você pode calcular o prazo exato no carrinho inserindo seu CEP.",
          },
        },
        {
          id: "faq-2",
          type: "faq_item",
          settings: {
            question: "Como funciona a política de trocas e devoluções?",
            answer:
              "Você tem até 30 dias corridos após o recebimento para solicitar troca ou devolução gratuita através do nosso suporte.",
          },
        },
        {
          id: "faq-3",
          type: "faq_item",
          settings: {
            question: "Quais são as formas de pagamento aceitas?",
            answer:
              "Aceitamos Cartão de Crédito em até 12x (sem juros), Pix com 5% de desconto imediato e Boleto Bancário.",
          },
        },
        {
          id: "faq-4",
          type: "faq_item",
          settings: {
            question: "Os produtos possuem garantia?",
            answer:
              "Sim! Todos os nossos produtos possuem garantia legal de 90 dias contra defeitos de fabricação, além da garantia de satisfação de 30 dias.",
          },
        },
      ],
    },
    {
      id: "sec-newsletter-1",
      type: "newsletter",
      name: "Captura de E-mails (Newsletter)",
      enabled: true,
      settings: {
        heading: "Fique por dentro das ofertas exclusivas",
        text: "Cadastre seu e-mail e receba cupons de desconto VIP, lançamentos em primeira mão e frete grátis.",
        placeholder: "Digite seu melhor e-mail...",
        buttonText: "Cadastrar",
      },
    },
  ],
};

const THEME_ROW_ID = "main-theme";

export function getThemeConfig(): ThemeConfig {
  try {
    const row = get<{ id: string; name: string; config_json: string }>(
      "SELECT * FROM theme_settings WHERE id = ?",
      [THEME_ROW_ID]
    );

    if (!row) {
      // Seed default theme
      const initialJson = JSON.stringify(DEFAULT_THEME_CONFIG);
      run(
        "INSERT INTO theme_settings (id, name, config_json, updated_at) VALUES (?, ?, ?, datetime('now'))",
        [THEME_ROW_ID, DEFAULT_THEME_CONFIG.name, initialJson]
      );
      return DEFAULT_THEME_CONFIG;
    }

    const parsed = JSON.parse(row.config_json);
    return {
      ...DEFAULT_THEME_CONFIG,
      ...parsed,
      colors: { ...DEFAULT_THEME_CONFIG.colors, ...(parsed.colors || {}) },
      typography: { ...DEFAULT_THEME_CONFIG.typography, ...(parsed.typography || {}) },
      layout: { ...DEFAULT_THEME_CONFIG.layout, ...(parsed.layout || {}) },
      announcement: { ...DEFAULT_THEME_CONFIG.announcement, ...(parsed.announcement || {}) },
      header: { ...DEFAULT_THEME_CONFIG.header, ...(parsed.header || {}) },
      social: { ...DEFAULT_THEME_CONFIG.social, ...(parsed.social || {}) },
      footer: { ...DEFAULT_THEME_CONFIG.footer, ...(parsed.footer || {}) },
      sections: Array.isArray(parsed.sections) ? parsed.sections : DEFAULT_THEME_CONFIG.sections,
    };
  } catch (err) {
    console.error("Error reading theme config from DB:", err);
    return DEFAULT_THEME_CONFIG;
  }
}

export function saveThemeConfig(config: Partial<ThemeConfig>): ThemeConfig {
  const current = getThemeConfig();
  const updated: ThemeConfig = {
    ...current,
    ...config,
    updatedAt: new Date().toISOString(),
  };

  const jsonStr = JSON.stringify(updated);

  run(
    `INSERT INTO theme_settings (id, name, config_json, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       config_json = excluded.config_json,
       updated_at = datetime('now')`,
    [THEME_ROW_ID, updated.name || current.name, jsonStr]
  );

  // If theme has a specific ID other than main-theme, update its custom row too
  if (updated.id && updated.id !== THEME_ROW_ID) {
    run(
      `INSERT INTO theme_settings (id, name, config_json, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         config_json = excluded.config_json,
         updated_at = datetime('now')`,
      [updated.id, updated.name, jsonStr]
    );
  }

  // Asynchronously sync to Supabase
  try {
    const supabase = getSupabaseAdmin();
    supabase
      .from("theme_settings")
      .upsert({
        id: THEME_ROW_ID,
        name: updated.name || current.name,
        config_json: updated,
        updated_at: new Date().toISOString(),
      })
      .then(({ error }) => {
        if (error) console.warn("Supabase theme sync error:", error.message);
      });
  } catch (err) {
    console.warn("Supabase theme save error:", err);
  }

  return updated;
}

export function resetThemeConfig(): ThemeConfig {
  const initialJson = JSON.stringify(DEFAULT_THEME_CONFIG);
  run(
    `INSERT INTO theme_settings (id, name, config_json, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       config_json = excluded.config_json,
       updated_at = datetime('now')`,
    [THEME_ROW_ID, DEFAULT_THEME_CONFIG.name, initialJson]
  );

  try {
    const supabase = getSupabaseAdmin();
    supabase
      .from("theme_settings")
      .upsert({
        id: THEME_ROW_ID,
        name: DEFAULT_THEME_CONFIG.name,
        config_json: DEFAULT_THEME_CONFIG,
        updated_at: new Date().toISOString(),
      })
      .then();
  } catch {}

  return DEFAULT_THEME_CONFIG;
}

/**
 * Gets list of all installed themes (DB custom themes + active theme)
 */
export function getAllInstalledThemes(): ThemeConfig[] {
  try {
    const rows = get<{ id: string; name: string; config_json: string }[]>(
      "SELECT id, name, config_json, updated_at FROM theme_settings ORDER BY updated_at DESC"
    ) as any;

    if (!Array.isArray(rows) || rows.length === 0) {
      return [getThemeConfig()];
    }

    const themes: ThemeConfig[] = [];
    const seenIds = new Set<string>();

    for (const row of rows) {
      if (row.id === THEME_ROW_ID) continue; // main-theme will be handled
      try {
        const parsed = JSON.parse(row.config_json);
        if (parsed && parsed.id && !seenIds.has(parsed.id)) {
          seenIds.add(parsed.id);
          themes.push({
            ...DEFAULT_THEME_CONFIG,
            ...parsed,
            id: row.id,
            name: row.name || parsed.name,
          });
        }
      } catch {}
    }

    return themes;
  } catch (err) {
    console.error("Error reading all themes from DB:", err);
    return [];
  }
}

/**
 * Gets a specific theme by ID
 */
export function getThemeById(id: string): ThemeConfig | null {
  try {
    if (id === THEME_ROW_ID) return getThemeConfig();

    const row = get<{ id: string; name: string; config_json: string }>(
      "SELECT * FROM theme_settings WHERE id = ?",
      [id]
    );

    if (!row) return null;
    const parsed = JSON.parse(row.config_json);
    return {
      ...DEFAULT_THEME_CONFIG,
      ...parsed,
      id: row.id,
      name: row.name || parsed.name,
    };
  } catch (err) {
    console.error("Error getting theme by id:", err);
    return null;
  }
}

/**
 * Installs a newly imported theme
 */
export function installTheme(theme: ThemeConfig, setActive = false): ThemeConfig {
  const jsonStr = JSON.stringify(theme);

  // Save the custom theme entry
  run(
    `INSERT INTO theme_settings (id, name, config_json, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       config_json = excluded.config_json,
       updated_at = datetime('now')`,
    [theme.id, theme.name, jsonStr]
  );

  // If requested, make it the active storefront theme
  if (setActive) {
    run(
      `INSERT INTO theme_settings (id, name, config_json, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         config_json = excluded.config_json,
         updated_at = datetime('now')`,
      [THEME_ROW_ID, theme.name, jsonStr]
    );
  }

  return theme;
}

/**
 * Sets a specific installed theme as the active storefront theme
 */
export function setActiveTheme(themeId: string, customConfig?: ThemeConfig): ThemeConfig | null {
  let themeToActivate: ThemeConfig | null = customConfig || null;

  if (!themeToActivate) {
    themeToActivate = getThemeById(themeId);
  }

  if (!themeToActivate) return null;

  const jsonStr = JSON.stringify(themeToActivate);
  run(
    `INSERT INTO theme_settings (id, name, config_json, updated_at)
     VALUES (?, ?, ?, datetime('now'))
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       config_json = excluded.config_json,
       updated_at = datetime('now')`,
    [THEME_ROW_ID, themeToActivate.name, jsonStr]
  );

  return themeToActivate;
}

/**
 * Deletes an installed theme (cannot delete active theme)
 */
export function deleteTheme(themeId: string): boolean {
  if (themeId === THEME_ROW_ID) return false;
  try {
    run("DELETE FROM theme_settings WHERE id = ?", [themeId]);
    return true;
  } catch (err) {
    console.error("Error deleting theme:", err);
    return false;
  }
}

/**
 * Duplicates an existing theme
 */
export function duplicateTheme(themeId: string): ThemeConfig | null {
  const original = getThemeById(themeId);
  if (!original) return null;

  const newId = `theme-clone-${Date.now().toString().slice(-6)}`;
  const cloned: ThemeConfig = {
    ...original,
    id: newId,
    name: `${original.name} (Cópia)`,
    updatedAt: new Date().toISOString(),
  };

  return installTheme(cloned, false);
}
