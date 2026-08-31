"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  HeartHandshake,
  Headphones,
  Mail,
  Play,
  Quote,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Zap,
} from "lucide-react";
import { SectionConfig, ThemeConfig } from "@/lib/repo/theme";
import { Product, Category } from "@/lib/types";
import { money } from "@/lib/money";
import { cn } from "@/components/ui/cn";

interface DynamicStorefrontRendererProps {
  theme: ThemeConfig;
  products?: Product[];
  categories?: Category[];
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
  isEditorPreview?: boolean;
}

// Fallback dummy products if none provided
const DUMMY_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Smartphone Galaxy S24 Ultra 512GB",
    slug: "smartphone-galaxy-s24-ultra",
    description: "Câmera de 200MP, inteligência artificial integrada e tela AMOLED dinâmico 2X.",
    price_cents: 649900,
    compare_at_cents: 799900,
    image: "/products/default.svg",
    stock: 15,
    category_id: 1,
    active: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Notebook Dell XPS 14 Core Ultra 7",
    slug: "notebook-dell-xps-14",
    description: "Design ultrafino com acabamento em alumínio usinado e bateria para até 18h.",
    price_cents: 1199900,
    compare_at_cents: 1349900,
    image: "/products/default.svg",
    stock: 8,
    category_id: 1,
    active: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Fone Bluetooth Noise Cancelling Pro",
    slug: "fone-bluetooth-noise-cancelling",
    description: "Cancelamento ativo de ruído inteligente, áudio espacial e autonomia de 30 horas.",
    price_cents: 89900,
    compare_at_cents: 119900,
    image: "/products/default.svg",
    stock: 22,
    category_id: 1,
    active: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Smartwatch Ultra GPS Titanium",
    slug: "smartwatch-ultra-gps-titanium",
    description: "Caixa em titânio aeroespacial, monitoramento cardíaco avançado e resistência à água.",
    price_cents: 249900,
    compare_at_cents: 299900,
    image: "/products/default.svg",
    stock: 12,
    category_id: 1,
    active: 1,
    created_at: new Date().toISOString(),
  },
];

const DUMMY_CATEGORIES: Category[] = [
  { id: 1, name: "Eletrônicos", slug: "eletronicos", description: "Smartphones, notebooks, fones e acessórios premium." },
  { id: 2, name: "Moda & Estilo", slug: "moda", description: "Roupas, calçados e peças selecionadas com design moderno." },
  { id: 3, name: "Casa & Decoração", slug: "casa-decoracao", description: "Iluminação inteligente, móveis e itens para o seu lar." },
  { id: 4, name: "Esportes", slug: "esportes", description: "Equipamentos de alta performance e vestuário esportivo." },
  { id: 5, name: "Beleza & Cuidados", slug: "beleza", description: "Skincare, perfumes e cosméticos de marcas renomadas." },
];

export function DynamicStorefrontRenderer({
  theme,
  products = [],
  categories = [],
  selectedSectionId,
  onSelectSection,
  isEditorPreview = false,
}: DynamicStorefrontRendererProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const activeProducts = isEditorPreview && products.length === 0 ? DUMMY_PRODUCTS : products;
  const activeCategories = isEditorPreview && categories.length === 0 ? DUMMY_CATEGORIES : categories;

  const isDarkMode =
    theme.colors.background.toLowerCase() === "#09090b" ||
    theme.colors.background.toLowerCase() === "#000000" ||
    theme.colors.background.toLowerCase() === "#18181b";

  const headingFontFamily = theme.typography.headingFont
    ? `"${theme.typography.headingFont}", sans-serif`
    : `"Plus Jakarta Sans", sans-serif`;

  const bodyFontFamily = theme.typography.bodyFont
    ? `"${theme.typography.bodyFont}", sans-serif`
    : `"Inter", sans-serif`;

  function renderSection(section: SectionConfig) {
    if (!section.enabled && !isEditorPreview) return null;

    const isSelected = isEditorPreview && selectedSectionId === section.id;
    const { settings = {}, blocks = [] } = section;

    let content = null;

    switch (section.type) {
      case "image_banner":
      case "hero_banner": {
        const hasBgImage = Boolean(settings.imageUrl);
        const hideText =
          Boolean(settings.hideText) ||
          (!settings.title && !settings.subtitle && !settings.primaryButtonText && !settings.eyebrow);
        const bannerHeight = settings.bannerHeight || "450px";
        const overlayOpacity =
          settings.overlayOpacity !== undefined ? Number(settings.overlayOpacity) : 0.3;

        // MODO APENAS IMAGEM (SEM TEXTO)
        if (hideText && hasBgImage) {
          const pureBanner = (
            <div
              className={cn(
                "w-full relative overflow-hidden bg-cover bg-center shadow-lg transition-transform",
                theme.layout.borderRadius
              )}
              style={{
                backgroundImage: `url(${settings.imageUrl})`,
                minHeight: bannerHeight,
                height: bannerHeight,
              }}
            />
          );

          content = (
            <section className="py-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {settings.bannerLink ? (
                <Link href={settings.bannerLink} className="block group">
                  {pureBanner}
                </Link>
              ) : (
                pureBanner
              )}
            </section>
          );
          break;
        }

        // MODO COM TEXTOS & BOTÕES (COM OU SEM IMAGEM DE FUNDO)
        content = (
          <section
            className={cn(
              "relative overflow-hidden py-16 sm:py-24 bg-cover bg-center text-white",
              !hasBgImage && (
                isDarkMode
                  ? "bg-gradient-to-b from-black via-zinc-950 to-black"
                  : "bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950"
              )
            )}
            style={{
              backgroundImage: hasBgImage ? `url(${settings.imageUrl})` : undefined,
              minHeight: hasBgImage ? bannerHeight : undefined,
            }}
          >
            {/* Background Image Overlay / Dimmer */}
            {hasBgImage && (
              <div
                className="absolute inset-0 transition-opacity pointer-events-none"
                style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
              />
            )}

            {/* Glowing Accent Orbs (if gradient or low overlay) */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute -left-20 -top-20 size-96 rounded-full blur-3xl opacity-30"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div
                className="absolute -bottom-20 right-10 size-96 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: theme.colors.accent }}
              />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-7">
                  {settings.eyebrow && (
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold ring-1 backdrop-blur"
                      style={{
                        backgroundColor: `${theme.colors.primary}30`,
                        color: theme.colors.accent,
                        borderColor: `${theme.colors.primary}60`,
                      }}
                    >
                      <Sparkles className="size-3.5" />
                      <span>{settings.eyebrow}</span>
                    </div>
                  )}

                  {settings.title && (
                    <h1
                      className="mt-6 text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-md"
                      style={{ fontFamily: headingFontFamily }}
                    >
                      {settings.titleHighlight && settings.title.includes(settings.titleHighlight) ? (
                        <>
                          {settings.title.split(settings.titleHighlight)[0]}
                          <span style={{ color: theme.colors.accent }}>{settings.titleHighlight}</span>
                          {settings.title.split(settings.titleHighlight)[1]}
                        </>
                      ) : (
                        settings.title
                      )}
                    </h1>
                  )}

                  {settings.subtitle && (
                    <p
                      className="mt-5 text-base sm:text-lg leading-relaxed text-ink-100 max-w-2xl drop-shadow-xs"
                      style={{ fontFamily: bodyFontFamily }}
                    >
                      {settings.subtitle}
                    </p>
                  )}

                  {(settings.primaryButtonText || settings.secondaryButtonText) && (
                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      {settings.primaryButtonText && (
                        <Link
                          href={settings.primaryButtonUrl || "/produtos"}
                          className={cn(
                            "inline-flex h-12 sm:h-13 items-center gap-2.5 px-6 sm:px-8 text-sm font-bold text-white shadow-xl transition-all hover:opacity-95 active:scale-[0.98]",
                            theme.layout.buttonRadius
                          )}
                          style={{ backgroundColor: theme.colors.primary }}
                        >
                          {settings.primaryButtonText} <ArrowRight className="size-4" />
                        </Link>
                      )}
                      {settings.secondaryButtonText && (
                        <Link
                          href={settings.secondaryButtonUrl || "/produtos"}
                          className={cn(
                            "inline-flex h-12 sm:h-13 items-center gap-2 border border-white/30 bg-white/20 px-6 text-sm font-semibold text-white backdrop-blur transition-all hover:bg-white/30",
                            theme.layout.buttonRadius
                          )}
                        >
                          {settings.secondaryButtonText}
                        </Link>
                      )}
                    </div>
                  )}

                  {/* Prova Social / Métricas */}
                  {(settings.stat1Number || settings.stat2Number) && (
                    <div className="mt-10 pt-8 border-t border-white/20 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xl sm:text-2xl font-extrabold text-white" style={{ fontFamily: headingFontFamily }}>{settings.stat1Number || "+10k"}</div>
                        <div className="text-xs text-ink-300">{settings.stat1Label || "Pedidos Entregues"}</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-extrabold text-white" style={{ fontFamily: headingFontFamily }}>{settings.stat2Number || "4.9 ★"}</div>
                        <div className="text-xs text-ink-300">{settings.stat2Label || "Avaliação Média"}</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-extrabold text-white" style={{ fontFamily: headingFontFamily }}>{settings.stat3Number || "100%"}</div>
                        <div className="text-xs text-ink-300">{settings.stat3Label || "Checkout Seguro"}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-5 hidden lg:block">
                  <div className="rounded-3xl border border-white/20 bg-black/40 p-6 backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/15">
                      <span className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: headingFontFamily }}>
                        <TrendingUp className="size-4 text-emerald-400" /> Categorias em Alta
                      </span>
                      <Link href="/produtos" className="text-xs text-emerald-300 hover:underline">
                        Ver catálogo
                      </Link>
                    </div>
                    <div className="grid gap-2.5">
                      {activeCategories.length === 0 ? (
                        <div className="text-xs text-white/70 py-4 text-center">
                          Coleções em destaque aparecerão aqui
                        </div>
                      ) : (
                        activeCategories.slice(0, 4).map((c) => (
                          <Link
                            key={c.id}
                            href={`/produtos?categoria=${c.slug}`}
                            className="flex items-center justify-between rounded-xl bg-white/10 p-3 border border-white/10 hover:bg-white/20 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className="flex size-8 items-center justify-center rounded-lg text-white font-bold text-xs"
                                style={{ backgroundColor: `${theme.colors.primary}80` }}
                              >
                                {c.name ? c.name.charAt(0) : "C"}
                              </span>
                              <div>
                                <div className="text-xs font-semibold text-white">{c.name}</div>
                                <div className="text-[10px] text-white/70 line-clamp-1">{c.description}</div>
                              </div>
                            </div>
                            <ArrowRight className="size-3.5 text-white/70" />
                          </Link>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
        break;
      }

      case "marquee_ticker": {
        const items = Array.isArray(settings.items) ? settings.items : [
          "🚀 ENVIO RÁPIDO PARA TODO BRASIL",
          "🔒 PAGAMENTO 100% SEGURO",
          "💳 ATÉ 12X SEM JUROS",
          "⭐ MAIS DE 5.000 CLIENTES SATISFEITOS",
        ];
        content = (
          <div
            className="py-3 overflow-hidden text-xs font-bold tracking-wider uppercase border-y"
            style={{
              backgroundColor: settings.bgColor || theme.colors.primary,
              color: settings.textColor || "#ffffff",
              borderColor: "rgba(255,255,255,0.15)",
              fontFamily: headingFontFamily,
            }}
          >
            <div className="flex gap-8 whitespace-nowrap animate-marquee">
              {[...items, ...items, ...items].map((text, i) => (
                <span key={i} className="inline-flex items-center gap-3">
                  <span>{text}</span>
                  <span className="opacity-50">•</span>
                </span>
              ))}
            </div>
          </div>
        );
        break;
      }

      case "features_bar": {
        const features = [
          { icon: Truck, title: settings.f1Title || "Frete Grátis", desc: settings.f1Desc || "Em compras acima de R$ 199" },
          { icon: CreditCard, title: settings.f2Title || "Até 12x Sem Juros", desc: settings.f2Desc || "Ou 5% OFF via Pix" },
          { icon: ShieldCheck, title: settings.f3Title || "Compra Garantida", desc: settings.f3Desc || "30 dias para devolução" },
          { icon: Headphones, title: settings.f4Title || "Suporte 24/7", desc: settings.f4Desc || "Atendimento em tempo real" },
        ];
        content = (
          <section
            className="border-b py-6 transition-colors"
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }}
          >
            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3.5 p-2">
                  <span
                    className="flex size-11 shrink-0 items-center justify-center rounded-2xl ring-1"
                    style={{
                      backgroundColor: `${theme.colors.primary}15`,
                      color: theme.colors.primary,
                      borderColor: `${theme.colors.primary}30`,
                    }}
                  >
                    <f.icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>
                      {f.title}
                    </div>
                    <div className="text-xs leading-snug mt-0.5" style={{ color: theme.colors.textMuted }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
        break;
      }

      case "featured_collections": {
        const limit = settings.limit || 5;
        content = (
          <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>
                  {settings.title || "Coleções em Destaque"}
                </h2>
                <p className="mt-1 text-sm" style={{ color: theme.colors.textMuted }}>
                  {settings.subtitle || "Navegue pelas principais categorias da loja"}
                </p>
              </div>
              <Link
                href="/produtos"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold hover:underline"
                style={{ color: theme.colors.primary }}
              >
                Ver tudo <ArrowRight className="size-4" />
              </Link>
            </div>
            {activeCategories.length === 0 ? (
              <div
                className={cn("py-12 px-6 text-center border border-dashed rounded-2xl", theme.layout.borderRadius)}
                style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
              >
                <p className="text-sm font-medium" style={{ color: theme.colors.textMuted }}>
                  Nenhuma categoria cadastrada no momento. Adicione coleções pelo painel administrativo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {activeCategories.slice(0, limit).map((c) => (
                  <Link
                    key={c.id}
                    href={`/produtos?categoria=${c.slug}`}
                    className={cn(
                      "group relative flex flex-col justify-between overflow-hidden border p-5 min-h-36 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
                      theme.layout.borderRadius
                    )}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <div
                      className="flex size-10 items-center justify-center rounded-xl font-bold text-base transition-colors"
                      style={{
                        backgroundColor: `${theme.colors.primary}15`,
                        color: theme.colors.primary,
                      }}
                    >
                      {c.name ? c.name.charAt(0) : "C"}
                    </div>
                    <div>
                      <span className="text-sm font-bold transition-colors" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>
                        {c.name}
                      </span>
                      <span className="mt-1 flex items-center gap-1 text-xs font-medium" style={{ color: theme.colors.textMuted }}>
                        Explorar <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
        break;
      }

      case "featured_products": {
        const limit = settings.limit || 8;
        return (
          <section key={section.id} className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                {settings.eyebrow && (
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex size-2 rounded-full animate-pulse"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                    <span
                      className="text-xs font-bold uppercase tracking-wider"
                      style={{ color: theme.colors.primary, fontFamily: headingFontFamily }}
                    >
                      {settings.eyebrow}
                    </span>
                  </div>
                )}
                <h2
                  className="text-2xl font-bold tracking-tight mt-1"
                  style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}
                >
                  {settings.title || "Mais Vendidos da Semana"}
                </h2>
              </div>
              <Link
                href="/produtos"
                className="flex items-center gap-1 text-sm font-semibold hover:underline"
                style={{ color: theme.colors.primary }}
              >
                Ver todos <ArrowRight className="size-4" />
              </Link>
            </div>
            {activeProducts.length === 0 ? (
              <div
                className={cn("py-12 px-6 text-center border border-dashed rounded-2xl", theme.layout.borderRadius)}
                style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
              >
                <ShoppingBag className="size-8 mx-auto mb-2 opacity-30" style={{ color: theme.colors.textMuted }} />
                <p className="text-sm font-medium" style={{ color: theme.colors.textMuted }}>
                  Nenhum produto cadastrado no momento. Adicione itens pelo painel administrativo.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {activeProducts.slice(0, limit).map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "group flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-lg",
                      theme.layout.borderRadius
                    )}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <Link
                      href={`/produtos/${p.slug}`}
                      className="relative aspect-square w-full overflow-hidden block bg-[#f1f2f4]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image || "/products/default.svg"}
                        alt={p.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                      {p.compare_at_cents && (
                        <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                          OFERTA
                        </span>
                      )}
                    </Link>
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-1">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span>4.9 (48)</span>
                        </div>
                        <Link href={`/produtos/${p.slug}`} className="block">
                          <h3
                            className="text-xs sm:text-sm font-semibold line-clamp-2 leading-snug hover:opacity-80 transition-opacity"
                            style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}
                          >
                            {p.name}
                          </h3>
                        </Link>
                      </div>
                      <div
                        className="mt-4 pt-3 border-t flex items-baseline justify-between"
                        style={{ borderColor: theme.colors.border }}
                      >
                        <div>
                          <div className="text-sm sm:text-base font-extrabold" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>
                            {money(p.price_cents)}
                          </div>
                          {p.compare_at_cents && (
                            <div className="text-[11px] line-through" style={{ color: theme.colors.textMuted }}>
                              {money(p.compare_at_cents)}
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/produtos/${p.slug}`}
                          className="p-2 text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                          style={{
                            backgroundColor: theme.colors.primary,
                            borderRadius: theme.layout.buttonRadius === "rounded-full" ? "9999px" : "10px",
                          }}
                        >
                          <ShoppingBag className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      }

      case "promo_banner": {
        content = (
          <section className="py-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={cn(
                "rounded-3xl p-8 sm:p-12 overflow-hidden relative text-white shadow-xl",
                settings.themeStyle === "emerald"
                  ? "bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950"
                  : "bg-gradient-to-br from-ink-950 via-ink-900 to-ink-950"
              )}
            >
              <div
                className="absolute -right-10 -bottom-10 size-64 rounded-full blur-3xl opacity-30 pointer-events-none"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <div className="relative max-w-xl space-y-4">
                <span
                  className="rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold ring-1 ring-white/15 inline-block"
                  style={{ color: theme.colors.accent }}
                >
                  {settings.badge || "Promoção por Tempo Limitado ⚡"}
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white" style={{ fontFamily: headingFontFamily }}>
                  {settings.heading || "Até 40% OFF nos produtos mais desejados"}
                </h2>
                <p className="text-xs sm:text-sm text-ink-300 leading-relaxed" style={{ fontFamily: bodyFontFamily }}>
                  {settings.description || "Use o cupom PRIMEIRACOMPRA no checkout para garantir 10% de desconto adicional."}
                </p>
                {settings.couponCode && (
                  <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 border border-dashed border-white/30 text-xs font-mono font-bold text-white">
                    <span>Cupom:</span>
                    <span style={{ color: theme.colors.accent }}>{settings.couponCode}</span>
                  </div>
                )}
                <div className="pt-2">
                  <Link
                    href={settings.buttonUrl || "/produtos"}
                    className={cn(
                      "inline-flex h-11 items-center gap-2 bg-white px-6 text-sm font-bold text-ink-900 hover:bg-ink-100 transition-colors shadow-lg",
                      theme.layout.buttonRadius
                    )}
                  >
                    {settings.buttonText || "Aproveitar Ofertas"} <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );
        break;
      }

      case "image_with_text": {
        const isRight = settings.imagePosition !== "left";
        content = (
          <section className="py-14 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-10 items-center">
              <div className={cn("lg:col-span-6 space-y-5", isRight ? "order-1" : "order-2")}>
                {settings.badge && (
                  <span
                    className="inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                    style={{
                      backgroundColor: `${theme.colors.primary}15`,
                      color: theme.colors.primary,
                      fontFamily: headingFontFamily,
                    }}
                  >
                    {settings.badge}
                  </span>
                )}
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>
                  {settings.heading || "A melhor experiência de compra direto na sua casa"}
                </h2>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: theme.colors.textMuted, fontFamily: bodyFontFamily }}>
                  {settings.bodyText || "Nossos produtos passam por um rigoroso controle de qualidade para garantir durabilidade e sofisticação."}
                </p>

                <div className="space-y-2.5 pt-2">
                  {[settings.item1, settings.item2, settings.item3].filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs sm:text-sm font-medium" style={{ color: theme.colors.textMain }}>
                      <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3">
                  <Link
                    href={settings.buttonUrl || "/produtos"}
                    className={cn(
                      "inline-flex h-11 items-center gap-2 px-6 text-sm font-bold text-white transition-all shadow-md",
                      theme.layout.buttonRadius
                    )}
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    {settings.buttonText || "Conhecer Mais"} <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>

              <div className={cn("lg:col-span-6", isRight ? "order-2" : "order-1")}>
                {settings.imageUrl ? (
                  <div
                    className={cn(
                      "relative overflow-hidden w-full min-h-[300px] sm:min-h-[380px] bg-cover bg-center rounded-3xl shadow-xl",
                      theme.layout.borderRadius
                    )}
                    style={{ backgroundImage: `url(${settings.imageUrl})` }}
                  />
                ) : (
                  <div
                    className={cn(
                      "relative overflow-hidden p-8 sm:p-12 text-white min-h-[300px] sm:min-h-[380px] flex flex-col justify-center items-center rounded-3xl shadow-xl",
                      theme.layout.borderRadius
                    )}
                    style={{
                      background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #111827 100%)`,
                    }}
                  >
                    <div className="size-20 rounded-3xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-white mb-4">
                      <ShieldCheck className="size-10 text-emerald-400" />
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ fontFamily: headingFontFamily }}>100% Satisfação Garantida</div>
                      <div className="text-xs text-ink-300 mt-1 max-w-xs">
                        Mais de 10.000 clientes satisfeitos com suporte ativo e garantia de troca rápida.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
        break;
      }

      case "new_arrivals": {
        const limit = settings.limit || 4;
        content = (
          <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>
                  {settings.title || "Novidades Recentes"}
                </h2>
                <p className="mt-1 text-sm" style={{ color: theme.colors.textMuted }}>
                  {settings.subtitle || "Últimos lançamentos adicionados ao nosso catálogo"}
                </p>
              </div>
              <Link
                href="/produtos?ordem=recentes"
                className="flex items-center gap-1 text-sm font-semibold hover:underline"
                style={{ color: theme.colors.primary }}
              >
                Ver tudo <ArrowRight className="size-4" />
              </Link>
            </div>
            {activeProducts.length === 0 ? (
              <div
                className={cn("py-12 px-6 text-center border border-dashed rounded-2xl", theme.layout.borderRadius)}
                style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
              >
                <ShoppingBag className="size-8 mx-auto mb-2 opacity-30" style={{ color: theme.colors.textMuted }} />
                <p className="text-sm font-medium" style={{ color: theme.colors.textMuted }}>
                  Nenhum lançamento cadastrado no momento.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
                {activeProducts.slice(0, limit).map((p) => (
                  <div
                    key={p.id}
                    className={cn(
                      "group flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:shadow-lg",
                      theme.layout.borderRadius
                    )}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <Link
                      href={`/produtos/${p.slug}`}
                      className="relative aspect-square w-full overflow-hidden block bg-[#f1f2f4]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.image || "/products/default.svg"}
                        alt={p.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        NOVO
                      </span>
                    </Link>
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-1">
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                          <span>5.0 (12)</span>
                        </div>
                        <Link href={`/produtos/${p.slug}`} className="block">
                          <h3
                            className="text-xs sm:text-sm font-semibold line-clamp-2 leading-snug hover:opacity-80 transition-opacity"
                            style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}
                          >
                            {p.name}
                          </h3>
                        </Link>
                      </div>
                      <div
                        className="mt-4 pt-3 border-t flex items-baseline justify-between"
                        style={{ borderColor: theme.colors.border }}
                      >
                        <div className="text-sm sm:text-base font-extrabold" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>
                          {money(p.price_cents)}
                        </div>
                        <Link
                          href={`/produtos/${p.slug}`}
                          className="p-2 text-white shadow-xs transition-transform active:scale-95 cursor-pointer"
                          style={{
                            backgroundColor: theme.colors.primary,
                            borderRadius: theme.layout.buttonRadius === "rounded-full" ? "9999px" : "10px",
                          }}
                        >
                          <ShoppingBag className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
        break;
      }

      case "testimonials": {
        const items = blocks.length > 0 ? blocks : [
          { id: "1", settings: { author: "Mariana Silva", role: "São Paulo, SP", rating: 5, comment: "Excelente atendimento! O produto chegou em 2 dias bem embalado." } },
          { id: "2", settings: { author: "Carlos Eduardo", role: "Belo Horizonte, MG", rating: 5, comment: "Site super fluido, checkout rápido e transparência total no rastreio." } },
          { id: "3", settings: { author: "Fernanda Lima", role: "Curitiba, PR", rating: 5, comment: "Qualidade impecável dos produtos! Recomendo de olhos fechados." } },
        ];

        content = (
          <section
            className="py-14 border-y"
            style={{
              backgroundColor: isDarkMode ? "#0d0d10" : `${theme.colors.background}`,
              borderColor: theme.colors.border,
            }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>
                  {settings.title || "O que nossos clientes dizem"}
                </h2>
                <p className="mt-2 text-sm" style={{ color: theme.colors.textMuted }}>
                  {settings.subtitle || "Mais de 10.000 clientes satisfeitos em todo o Brasil"}
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((b: any, i: number) => (
                  <div
                    key={b.id || i}
                    className={cn(
                      "border p-6 shadow-xs flex flex-col justify-between space-y-4",
                      theme.layout.borderRadius
                    )}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: b.settings?.rating || 5 }).map((_, r) => (
                          <Star key={r} className="size-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-sm leading-relaxed italic" style={{ color: theme.colors.textMain, fontFamily: bodyFontFamily }}>
                        &quot;{b.settings?.comment || "Excelente experiência de compra!"}&quot;
                      </p>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
                      <span
                        className="flex size-9 items-center justify-center rounded-full font-bold text-xs text-white"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        {(b.settings?.author || "Cliente").charAt(0)}
                      </span>
                      <div>
                        <div className="text-xs font-bold" style={{ color: theme.colors.textMain }}>{b.settings?.author || "Cliente Verificado"}</div>
                        <div className="text-[11px]" style={{ color: theme.colors.textMuted }}>{b.settings?.role || "Compra Verificada"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
        break;
      }

      case "faq_accordion": {
        const items = blocks.length > 0 ? blocks : [
          { id: "1", settings: { question: "Qual o prazo de entrega?", answer: "De 2 a 7 dias úteis com rastreamento completo." } },
          { id: "2", settings: { question: "Como funciona a garantia?", answer: "Garantimos 30 dias para trocas ou devoluções gratuitas." } },
          { id: "3", settings: { question: "Quais as formas de pagamento?", answer: "Cartão em até 12x, Pix com 5% de desconto e Boleto." } },
        ];

        content = (
          <section className="py-14 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>
                {settings.title || "Dúvidas Frequentes"}
              </h2>
              <p className="mt-2 text-sm" style={{ color: theme.colors.textMuted }}>
                {settings.subtitle || "Tudo o que você precisa saber antes de comprar"}
              </p>
            </div>

            <div className="space-y-3">
              {items.map((faq: any, idx: number) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={faq.id || idx}
                    className={cn("border overflow-hidden transition-all", theme.layout.borderRadius)}
                    style={{
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    }}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-bold transition-colors"
                      style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}
                    >
                      <span>{faq.settings?.question || "Pergunta sobre a loja?"}</span>
                      <ChevronDown
                        className={cn("size-5 transition-transform duration-200 shrink-0 ml-4", isOpen && "rotate-180")}
                        style={{ color: theme.colors.textMuted }}
                      />
                    </button>
                    {isOpen && (
                      <div
                        className="px-5 pb-5 text-xs sm:text-sm leading-relaxed border-t pt-3"
                        style={{
                          borderColor: theme.colors.border,
                          color: theme.colors.textMuted,
                          backgroundColor: isDarkMode ? "#141416" : "rgba(0,0,0,0.02)",
                          fontFamily: bodyFontFamily,
                        }}
                      >
                        {faq.settings?.answer || "Resposta detalhada com orientações aos clientes."}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
        break;
      }

      case "multi_column": {
        const columns = blocks.length > 0 ? blocks : [
          { id: "1", settings: { icon: "Truck", title: "Logística Expressa", text: "Envios ágeis para todas as capitais e interior." } },
          { id: "2", settings: { icon: "Shield", title: "Garantia Total", text: "Produtos testados com nota fiscal e garantia de 90 dias." } },
          { id: "3", settings: { icon: "HeartHandshake", title: "Suporte VIP", text: "Atendimento humanizado via WhatsApp e E-mail." } },
        ];

        content = (
          <section className="py-14 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>
                {settings.title || "Por que escolher nossa loja?"}
              </h2>
              <p className="mt-2 text-sm" style={{ color: theme.colors.textMuted }}>
                {settings.subtitle || "Diferenciais exclusivos para você comprar com segurança"}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {columns.map((c: any, idx: number) => (
                <div
                  key={c.id || idx}
                  className={cn("p-6 border shadow-xs space-y-3 text-center sm:text-left", theme.layout.borderRadius)}
                  style={{
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  }}
                >
                  <span
                    className="inline-flex size-12 items-center justify-center rounded-2xl ring-1"
                    style={{
                      backgroundColor: `${theme.colors.primary}15`,
                      color: theme.colors.primary,
                      borderColor: `${theme.colors.primary}30`,
                    }}
                  >
                    <Shield className="size-6" />
                  </span>
                  <h3 className="text-base font-bold" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>
                    {c.settings?.title || "Diferencial"}
                  </h3>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: theme.colors.textMuted }}>
                    {c.settings?.text || "Descrição detalhada do benefício."}
                  </p>
                </div>
              ))}
            </div>
          </section>
        );
        break;
      }

      case "video_banner": {
        content = (
          <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={cn(
                "relative overflow-hidden bg-ink-950 text-white p-8 sm:p-16 text-center shadow-2xl flex flex-col items-center justify-center min-h-[350px]",
                theme.layout.borderRadius
              )}
            >
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: `radial-gradient(${theme.colors.primary} 1px, transparent 1px)`, backgroundSize: "20px 20px" }}
              />
              <div className="relative max-w-xl space-y-4">
                <button
                  className="size-16 rounded-full bg-white text-ink-950 flex items-center justify-center mx-auto shadow-xl hover:scale-110 transition-transform active:scale-95"
                  aria-label="Assistir vídeo"
                >
                  <Play className="size-6 fill-ink-950 ml-1" />
                </button>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: headingFontFamily }}>
                  {settings.heading || "Conheça o processo de fabricação"}
                </h2>
                <p className="text-xs sm:text-sm text-ink-300">
                  {settings.subtitle || "Veja como cuidamos de cada detalhe com rigorosos padrões."}
                </p>
                {settings.buttonText && (
                  <div className="pt-2">
                    <Link
                      href={settings.buttonUrl || "/produtos"}
                      className={cn("inline-flex h-10 items-center gap-2 px-6 text-xs font-bold text-white shadow-md", theme.layout.buttonRadius)}
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      {settings.buttonText}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </section>
        );
        break;
      }

      case "newsletter": {
        content = (
          <section className="py-12 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className={cn("overflow-hidden px-6 py-14 text-center sm:px-12 text-white shadow-xl", theme.layout.borderRadius)}
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, #002e25 100%)`,
              }}
            >
              <h2 className="text-2xl font-extrabold sm:text-3xl" style={{ fontFamily: headingFontFamily }}>
                {settings.heading || "Fique por dentro das ofertas exclusivas"}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-xs sm:text-sm text-white/80" style={{ fontFamily: bodyFontFamily }}>
                {settings.text || "Cadastre seu e-mail e receba cupons de desconto VIP e lançamentos em primeira mão."}
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder={settings.placeholder || "Digite seu melhor e-mail..."}
                  className="h-11 sm:h-12 flex-1 rounded-xl border border-white/30 bg-white/10 px-4 text-xs sm:text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button
                  type="button"
                  className={cn(
                    "h-11 sm:h-12 shrink-0 bg-white px-6 text-xs sm:text-sm font-bold transition-all hover:bg-ink-50 active:scale-95 shadow-md",
                    theme.layout.buttonRadius
                  )}
                  style={{ color: theme.colors.primary }}
                >
                  {settings.buttonText || "Cadastrar"}
                </button>
              </form>
            </div>
          </section>
        );
        break;
      }

      case "custom_html_liquid": {
        content = (
          <section className="py-8 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              dangerouslySetInnerHTML={{
                __html:
                  settings.htmlCode ||
                  "<div class='p-6 text-center bg-gray-50 border rounded-2xl'>Bloco HTML Personalizado</div>",
              }}
            />
          </section>
        );
        break;
      }

      default:
        content = null;
    }

    if (isEditorPreview) {
      return (
        <div
          key={section.id}
          onClick={() => onSelectSection?.(section.id)}
          className={cn(
            "relative group cursor-pointer transition-all border-2",
            isSelected
              ? "border-blue-500 ring-4 ring-blue-500/20 z-20"
              : "border-transparent hover:border-blue-300 hover:ring-2 hover:ring-blue-300/30"
          )}
        >
          {/* Shopify Section Toolbar Tag */}
          <div
            className={cn(
              "absolute left-4 top-2 z-30 flex items-center gap-1.5 rounded bg-blue-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-md transition-opacity",
              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <span>{section.name}</span>
            <span className="text-[10px] opacity-75">• Clique para editar</span>
          </div>

          {!section.enabled && (
            <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-xs flex items-center justify-center z-20 text-white text-xs font-bold">
              Seção Oculta (Não visível no storefront)
            </div>
          )}

          {content}
        </div>
      );
    }

    return <div key={section.id}>{content}</div>;
  }

  if (!isEditorPreview) {
    return (
      <div
        className="min-h-screen font-sans"
        style={{
          backgroundColor: theme.colors.background,
          color: theme.colors.textMain,
          fontFamily: bodyFontFamily,
        }}
      >
        <main>
          {theme.sections.map((sec) => renderSection(sec))}
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textMain,
        fontFamily: bodyFontFamily,
      }}
    >
      {/* Announcement Bar */}
      {theme.announcement.enabled && (
        <div
          className={cn(
            "text-white text-[11px] font-medium tracking-wide py-2 px-4 transition-colors",
            theme.announcement.bgStyle === "brand"
              ? "bg-brand-700"
              : theme.announcement.bgStyle === "gradient_emerald"
                ? "bg-gradient-to-r from-emerald-800 to-teal-900"
                : "bg-ink-950"
          )}
          style={{
            backgroundColor: theme.announcement.bgStyle === "brand" ? theme.colors.primary : undefined,
          }}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex size-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.colors.accent }} />
              <span>{theme.announcement.text}</span>
            </div>
            {theme.announcement.linkText && (
              <span className="hidden sm:inline font-bold underline underline-offset-2 hover:opacity-90">
                {theme.announcement.linkText}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <header
        className={cn(
          "border-b backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3.5 transition-colors",
          theme.header.sticky && "sticky top-0 z-30"
        )}
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span
              className="flex size-9 items-center justify-center rounded-xl text-white shadow-sm font-bold"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <ShoppingBag className="size-5" />
            </span>
            <div className="flex flex-col">
              <span
                className="text-lg font-bold tracking-tight leading-none"
                style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}
              >
                {theme.header.logoText || "SensaShop"}
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: theme.colors.accent }}>
                {theme.header.logoBadge || "Store"}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold" style={{ color: theme.colors.textMuted }}>
            <span style={{ color: theme.colors.primary }}>Início</span>
            <span>Produtos</span>
            <span>Coleções</span>
            <span>Novidades</span>
            <span>Contato</span>
          </div>

          <div className="flex items-center gap-2" style={{ color: theme.colors.textMain }}>
            <span className="rounded-lg p-2 hover:bg-white/10"><ShoppingBag className="size-4.5" /></span>
          </div>
        </div>
      </header>

      {/* Sections List */}
      <main>
        {theme.sections.map((sec) => renderSection(sec))}
      </main>

      {/* Footer */}
      <footer
        className="border-t mt-12 py-12 text-xs transition-colors"
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          color: theme.colors.textMuted,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-8 border-b" style={{ borderColor: theme.colors.border }}>
            <div className="space-y-3">
              <div className="text-base font-bold" style={{ color: theme.colors.textMain, fontFamily: headingFontFamily }}>{theme.header.logoText}</div>
              <p className="text-xs leading-relaxed" style={{ color: theme.colors.textMuted }}>{theme.footer.tagline}</p>
            </div>
            {theme.footer.columns.map((col) => (
              <div key={col.id} className="space-y-2">
                <div className="font-bold text-xs uppercase tracking-wider" style={{ color: theme.colors.textMain }}>{col.title}</div>
                <ul className="space-y-1.5" style={{ color: theme.colors.textMuted }}>
                  {col.links.map((l, i) => (
                    <li key={i} className="hover:opacity-80 cursor-pointer">{l.label}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]" style={{ color: theme.colors.textMuted }}>
            <div>{theme.footer.copyright}</div>
            {theme.footer.showPaymentBadges && (
              <div className="flex items-center gap-2">
                <span className="border rounded px-1.5 py-0.5 font-bold" style={{ borderColor: theme.colors.border }}>VISA</span>
                <span className="border rounded px-1.5 py-0.5 font-bold" style={{ borderColor: theme.colors.border }}>MASTERCARD</span>
                <span className="border rounded px-1.5 py-0.5 font-bold" style={{ borderColor: theme.colors.border }}>PIX</span>
                <span className="border rounded px-1.5 py-0.5 font-bold" style={{ borderColor: theme.colors.border }}>BOLETO</span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
