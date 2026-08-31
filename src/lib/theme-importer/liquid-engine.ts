import { Liquid } from "liquidjs";

/**
 * Initialize Liquid engine with standard Shopify filters & helpers
 */
export function createShopifyLiquidEngine() {
  const engine = new Liquid({
    strictFilters: false,
    strictVariables: false,
    trimTagRight: false,
    trimTagLeft: false,
  });

  // Shopify Filters
  engine.registerFilter("asset_url", (v: string) => {
    if (!v) return "/products/default.svg";
    if (v.startsWith("http") || v.startsWith("/")) return v;
    return `/uploads/themes/assets/${v}`;
  });

  engine.registerFilter("image_url", (v: string, width?: number) => {
    if (!v) return "/products/default.svg";
    if (typeof v === "object" && v !== null && (v as any).src) return (v as any).src;
    return String(v);
  });

  engine.registerFilter("img_url", (v: string) => {
    if (!v) return "/products/default.svg";
    return String(v);
  });

  engine.registerFilter("money", (v: number | string) => {
    const num = Number(v) || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num > 1000 ? num / 100 : num);
  });

  engine.registerFilter("money_with_currency", (v: number | string) => {
    const num = Number(v) || 0;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num > 1000 ? num / 100 : num);
  });

  engine.registerFilter("t", (key: string) => {
    if (!key) return "";
    const parts = key.split(".");
    return parts[parts.length - 1].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  });

  engine.registerFilter("default_pagination", () => "");

  engine.registerFilter("stylesheet_tag", (url: string) => {
    return `<link rel="stylesheet" href="${url}" />`;
  });

  engine.registerFilter("script_tag", (url: string) => {
    return `<script src="${url}"></script>`;
  });

  engine.registerFilter("escape", (val: string) => {
    if (!val) return "";
    return String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  });

  // Mock global tags like form, paginate, schema, javascript, style
  engine.registerTag("schema", {
    parse(tagToken, remainTokens) {
      this.tokens = [];
      const stream = this.liquid.parser.parseStream(remainTokens);
      stream.on("tag:endschema", () => stream.stop());
      stream.on("template", (tpl) => this.tokens.push(tpl));
      stream.start();
    },
    render() {
      return "";
    },
  });

  engine.registerTag("javascript", {
    parse(tagToken, remainTokens) {
      this.tokens = [];
      const stream = this.liquid.parser.parseStream(remainTokens);
      stream.on("tag:endjavascript", () => stream.stop());
      stream.on("template", (tpl) => this.tokens.push(tpl));
      stream.start();
    },
    render() {
      return "";
    },
  });

  engine.registerTag("style", {
    parse(tagToken, remainTokens) {
      this.tokens = [];
      const stream = this.liquid.parser.parseStream(remainTokens);
      stream.on("tag:endstyle", () => stream.stop());
      stream.on("template", (tpl) => this.tokens.push(tpl));
      stream.start();
    },
    render() {
      return "";
    },
  });

  engine.registerTag("form", {
    parse(tagToken, remainTokens) {
      this.tokens = [];
      const stream = this.liquid.parser.parseStream(remainTokens);
      stream.on("tag:endform", () => stream.stop());
      stream.on("template", (tpl) => this.tokens.push(tpl));
      stream.start();
    },
    async render(ctx, emitter) {
      emitter.write(`<form class="shopify-form space-y-4">`);
      for (const tpl of this.tokens) {
        await this.liquid.renderer.renderTemplates([tpl], ctx, emitter);
      }
      emitter.write(`</form>`);
    },
  });

  return engine;
}

/**
 * Standard Mock Store Context for Liquid Rendering
 */
export function getMockShopifyContext(extraSettings: Record<string, any> = {}) {
  return {
    shop: {
      name: "SensaShop Store",
      description: "A melhor loja com experiência Shopify no Brasil",
      currency: "BRL",
      money_format: "R$ {{amount}}",
      domain: "sensashop.com.br",
      url: "/",
    },
    settings: {
      ...extraSettings,
    },
    page_title: "SensaShop - Loja Virtual",
    canonical_url: "/",
    request: {
      path: "/",
      page_type: "index",
    },
    collections: [
      {
        title: "Eletrônicos",
        handle: "eletronicos",
        url: "/produtos?categoria=eletronicos",
        products_count: 12,
        image: { src: "/products/default.svg" },
      },
      {
        title: "Moda & Estilo",
        handle: "moda",
        url: "/produtos?categoria=moda",
        products_count: 8,
        image: { src: "/products/default.svg" },
      },
      {
        title: "Casa & Decoração",
        handle: "casa-decoracao",
        url: "/produtos?categoria=casa-decoracao",
        products_count: 15,
        image: { src: "/products/default.svg" },
      },
    ],
    all_products: {
      count: 24,
    },
  };
}

/**
 * Render Liquid template string safely with fallbacks
 */
export async function renderLiquidSafe(
  templateString: string,
  context: Record<string, any> = {}
): Promise<string> {
  try {
    const engine = createShopifyLiquidEngine();
    const fullContext = {
      ...getMockShopifyContext(context.settings || {}),
      ...context,
    };
    return await engine.parseAndRender(templateString, fullContext);
  } catch (err: any) {
    console.warn("Liquid render warning:", err?.message);
    // Strip liquid tags as a clean fallback
    return templateString
      .replace(/\{%[\s\S]*?%\}/g, "")
      .replace(/\{\{[\s\S]*?\}\}/g, "");
  }
}
