"use client";

import Link from "next/link";
import {
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import type { ThemeConfig } from "@/lib/repo/theme";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <polygon points="10 15 15 12 10 9 10 15" />
    </svg>
  );
}

const PAYMENT_METHODS = [
  "PIX (5% OFF)",
  "Cartão de Crédito (12x)",
  "Boleto Bancário",
  "Mastercard",
  "Visa",
  "Elo",
  "Hipercard",
  "Apple Pay",
];

const DEFAULT_COLUMNS = [
  {
    id: "col-1",
    title: "Navegação",
    links: [
      { label: "Catálogo Completo", href: "/produtos" },
      { label: "Eletrônicos", href: "/produtos?categoria=eletronicos" },
      { label: "Moda & Acessórios", href: "/produtos?categoria=moda" },
      { label: "Casa & Decoração", href: "/produtos?categoria=casa-decoracao" },
      { label: "Meu Carrinho", href: "/carrinho" },
    ],
  },
  {
    id: "col-2",
    title: "Atendimento & Ajuda",
    links: [
      { label: "Login / Entrar", href: "/login" },
      { label: "Central de Ajuda & FAQ", href: "/produtos" },
    ],
  },
];

export function Footer({ theme }: { theme?: ThemeConfig }) {
  const primaryColor = theme?.colors?.primary || "#008060";
  const surfaceColor = theme?.colors?.surface || "#ffffff";
  const borderColor = theme?.colors?.border || "#e1e3e5";
  const textMain = theme?.colors?.textMain || "#1a1c1d";
  const textMuted = theme?.colors?.textMuted || "#6d7175";
  const headingFont = theme?.typography?.headingFont
    ? `"${theme.typography.headingFont}", sans-serif`
    : `"Plus Jakarta Sans", sans-serif`;

  const logoText = theme?.header?.logoText || "SensaShop";
  const tagline =
    theme?.footer?.tagline ||
    "Plataforma de ecommerce completa inspirada na Shopify — com storefront reativo, carrinho em drawer e checkout seguro.";
  const copyright =
    theme?.footer?.copyright ||
    `© ${new Date().getFullYear()} ${logoText}. Todos os direitos reservados.`;

  const columns =
    theme?.footer?.columns && theme.footer.columns.length > 0
      ? theme.footer.columns
      : DEFAULT_COLUMNS;

  const showPaymentBadges = theme?.footer ? theme.footer.showPaymentBadges !== false : true;
  const showAssurance = theme?.footer ? theme.footer.showAssuranceBanner !== false : true;
  const contactEmail = theme?.footer?.contactEmail || `suporte@${logoText.toLowerCase().replace(/\s+/g, "")}.com`;
  const contactPhone = theme?.footer?.contactPhone || "+55 11 4002-8922";
  const contactAddress = theme?.footer?.contactAddress || "Av. Paulista, 1000 — São Paulo, SP";
  const social = theme?.social;

  return (
    <footer
      className="mt-20 border-t transition-colors"
      style={{
        backgroundColor: surfaceColor,
        borderColor: borderColor,
        color: textMain,
      }}
    >
      {/* Top Value Assurance Banner */}
      {showAssurance && (
        <div
          className="border-b py-8"
          style={{
            backgroundColor: `${primaryColor}08`,
            borderColor: borderColor,
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span
                className="flex size-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <ShieldCheck className="size-5" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: textMain }}>
                  Garantia Incondicional
                </div>
                <div className="text-xs" style={{ color: textMuted }}>
                  30 dias para devolução sem custo
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span
                className="flex size-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <Lock className="size-5" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: textMain }}>
                  Segurança Bancária
                </div>
                <div className="text-xs" style={{ color: textMuted }}>
                  Criptografia SSL de ponta a ponta
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <span
                className="flex size-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
              >
                <Truck className="size-5" />
              </span>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: textMain }}>
                  Rastreio em Tempo Real
                </div>
                <div className="text-xs" style={{ color: textMuted }}>
                  Código de envio enviado por e-mail
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                className="flex size-9 items-center justify-center rounded-xl text-white shadow-sm"
                style={{ backgroundColor: primaryColor }}
              >
                <ShoppingBag className="size-5" />
              </span>
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: textMain, fontFamily: headingFont }}
              >
                {logoText}
              </span>
            </Link>
            <p className="text-xs leading-relaxed" style={{ color: textMuted }}>
              {tagline}
            </p>

            {/* Social icons if provided */}
            {social && (
              <div className="flex items-center gap-2 pt-1">
                {social.instagram && (
                  <a
                    href={social.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="flex size-8 items-center justify-center rounded-lg border hover:opacity-80 transition-opacity"
                    style={{ borderColor: borderColor, color: textMuted }}
                  >
                    <InstagramIcon className="size-4" />
                  </a>
                )}
                {social.facebook && (
                  <a
                    href={social.facebook}
                    target="_blank"
                    rel="noreferrer"
                    className="flex size-8 items-center justify-center rounded-lg border hover:opacity-80 transition-opacity"
                    style={{ borderColor: borderColor, color: textMuted }}
                  >
                    <FacebookIcon className="size-4" />
                  </a>
                )}
                {social.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="flex size-8 items-center justify-center rounded-lg border hover:opacity-80 transition-opacity"
                    style={{ borderColor: borderColor, color: textMuted }}
                  >
                    <YoutubeIcon className="size-4" />
                  </a>
                )}
                {social.twitter && (
                  <a
                    href={social.twitter}
                    target="_blank"
                    rel="noreferrer"
                    className="flex size-8 items-center justify-center rounded-lg border hover:opacity-80 transition-opacity"
                    style={{ borderColor: borderColor, color: textMuted }}
                  >
                    <TwitterIcon className="size-4" />
                  </a>
                )}
              </div>
            )}

            <div
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold border"
              style={{
                backgroundColor: `${primaryColor}10`,
                borderColor: `${primaryColor}30`,
                color: primaryColor,
              }}
            >
              <span className="size-1.5 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              {theme?.name || "Shopify Dawn Experience"}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.id || col.title}>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: textMain }}>
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-xs hover:underline transition-colors"
                      style={{ color: textMuted }}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: textMain }}>
              Fale Conosco
            </h3>
            <ul className="mt-4 space-y-3 text-xs" style={{ color: textMuted }}>
              <li className="flex items-center gap-2.5">
                <Mail className="size-4 shrink-0" style={{ color: primaryColor }} /> {contactEmail}
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0" style={{ color: primaryColor }} /> {contactPhone}
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="size-4 shrink-0" style={{ color: primaryColor }} />
                <span>{contactAddress}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment badges & Copyright */}
        <div
          className="mt-12 pt-8 border-t flex flex-col items-center justify-between gap-6 sm:flex-row"
          style={{ borderColor: borderColor }}
        >
          {showPaymentBadges && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PAYMENT_METHODS.map((method) => (
                <span
                  key={method}
                  className="rounded-md border px-2.5 py-1 text-[10px] font-semibold"
                  style={{
                    backgroundColor: `${primaryColor}08`,
                    borderColor: borderColor,
                    color: textMuted,
                  }}
                >
                  {method}
                </span>
              ))}
            </div>
          )}

          <div className="text-center sm:text-right space-y-1">
            <p className="text-xs" style={{ color: textMuted }}>
              {copyright}
            </p>
            <p className="text-[11px] font-medium" style={{ color: textMuted }}>
              Powered by <span className="font-bold" style={{ color: primaryColor }}>Shopify Clone</span> (Next.js 15)
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
