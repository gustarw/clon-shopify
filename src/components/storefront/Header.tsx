"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronRight, Menu, Search, ShieldCheck, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/components/ui/cn";
import type { ThemeConfig } from "@/lib/repo/theme";

const NAV_LINKS = [
  { href: "/produtos", label: "Catálogo Geral" },
  { href: "/produtos?categoria=eletronicos", label: "Eletrônicos" },
  { href: "/produtos?categoria=moda", label: "Moda & Estilo" },
  { href: "/produtos?categoria=casa-decoracao", label: "Casa & Decoração" },
];

export function Header({ theme }: { theme?: ThemeConfig }) {
  const { count, isReady, openCart } = useCart();
  const [term, setTerm] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = term.trim();
    router.push(q ? `/produtos?q=${encodeURIComponent(q)}` : "/produtos");
  }

  const primaryColor = theme?.colors?.primary || "#008060";
  const accentColor = theme?.colors?.accent || "#10b981";
  const surfaceColor = theme?.colors?.surface || "#ffffff";
  const borderColor = theme?.colors?.border || "#e1e3e5";
  const textMain = theme?.colors?.textMain || "#1a1c1d";
  const textMuted = theme?.colors?.textMuted || "#6d7175";
  const headingFont = theme?.typography?.headingFont
    ? `"${theme.typography.headingFont}", sans-serif`
    : `"Plus Jakarta Sans", sans-serif`;

  const announcement = theme?.announcement;
  const showAnnouncement = announcement ? announcement.enabled : true;

  const headerConfig = theme?.header;
  const logoText = headerConfig?.logoText || "SensaShop";
  const logoBadge = headerConfig?.logoBadge || "Store";
  const logoImageUrl = headerConfig?.logoImageUrl;
  const searchPlaceholder = headerConfig?.searchPlaceholder || "Buscar em todos os produtos...";
  const isSticky = headerConfig ? headerConfig.sticky : true;
  const showAccountLink = headerConfig ? headerConfig.showAccountLink !== false : true;
  const showCartBadge = headerConfig ? headerConfig.showCartBadge !== false : true;
  const navLinks =
    headerConfig?.menuLinks && headerConfig.menuLinks.length > 0
      ? headerConfig.menuLinks
      : NAV_LINKS;

  return (
    <>
      {/* Shopify Top Announcement Bar */}
      {showAnnouncement && (
        <div
          className={cn(
            "text-white text-[11px] font-medium tracking-wide transition-colors",
            announcement?.bgStyle === "gradient_emerald" && "bg-gradient-to-r from-emerald-800 to-teal-900",
            announcement?.bgStyle === "sunset" && "bg-gradient-to-r from-amber-600 to-rose-600",
            (!announcement?.bgStyle || announcement?.bgStyle === "dark") && "bg-ink-950",
            announcement?.bgStyle === "brand" && ""
          )}
          style={{
            backgroundColor: announcement?.bgStyle === "brand" ? primaryColor : undefined,
          }}
        >
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span
                className="flex size-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-white/90">
                {announcement?.text ? (
                  announcement.text
                ) : (
                  <>
                    ⚡ <strong>FRETE GRÁTIS</strong> para todo o Brasil acima de R$ 199 | Parcele em até{" "}
                    <strong>12x</strong>
                  </>
                )}
              </span>
              {announcement?.badgeText && (
                <span
                  className="hidden md:inline-flex rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider text-white ml-1.5"
                  style={{ backgroundColor: `${accentColor}40`, border: `1px solid ${accentColor}80` }}
                >
                  {announcement.badgeText}
                </span>
              )}
            </div>
            <div className="hidden items-center gap-4 sm:flex text-white/80">
              {announcement?.linkText && announcement?.linkUrl && (
                <Link
                  href={announcement.linkUrl}
                  className="hover:text-white font-semibold underline underline-offset-2 transition-colors"
                >
                  {announcement.linkText} ↗
                </Link>
              )}
              {announcement?.showSecurityBadge !== false && (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="size-3.5" style={{ color: accentColor }} /> Compra 100% Protegida
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Header */}
      <header
        className={cn(
          "z-40 border-b backdrop-blur-md transition-colors",
          isSticky ? "sticky top-0" : "relative"
        )}
        style={{
          backgroundColor: surfaceColor,
          borderColor: borderColor,
        }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            className="inline-flex size-9 items-center justify-center rounded-lg hover:bg-black/5 md:hidden"
            style={{ color: textMuted }}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          {/* Logo with Shopify theme styling */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            {logoImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoImageUrl}
                alt={logoText}
                className="h-9 max-w-[160px] object-contain"
              />
            ) : (
              <>
                <span
                  className="flex size-9 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: primaryColor }}
                >
                  <ShoppingBag className="size-5" />
                </span>
                <div className="flex flex-col">
                  <span
                    className="text-lg font-bold tracking-tight leading-none"
                    style={{ color: textMain, fontFamily: headingFont }}
                  >
                    {logoText}
                  </span>
                  <span
                    className="text-[10px] font-semibold tracking-wider uppercase mt-0.5"
                    style={{ color: accentColor }}
                  >
                    {logoBadge}
                  </span>
                </div>
              </>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 md:flex ml-4">
            {navLinks.map((l) => {
              const isActive = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-all flex items-center gap-1.5",
                    isActive
                      ? "font-semibold shadow-2xs"
                      : "hover:bg-black/5"
                  )}
                  style={{
                    backgroundColor: isActive ? `${primaryColor}15` : undefined,
                    color: isActive ? primaryColor : textMuted,
                  }}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Search Input */}
          <div className="relative ml-auto hidden w-full max-w-xs sm:block lg:max-w-sm">
            <form onSubmit={submitSearch} className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
                style={{ color: textMuted }}
              />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-full border pl-10 pr-4 text-sm focus:outline-none focus:ring-2 transition-all"
                style={{
                  backgroundColor: `${surfaceColor === "#ffffff" ? "#f4f4f5" : surfaceColor}`,
                  borderColor: borderColor,
                  color: textMain,
                }}
              />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {showAccountLink && (
              <Link
                href="/login"
                className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-black/5 transition-colors"
                style={{ color: textMuted }}
                aria-label="Entrar"
                title="Entrar na conta"
              >
                <User className="size-5" />
              </Link>
            )}

            {/* Cart Trigger Button - opens drawer */}
            <button
              onClick={openCart}
              className="relative inline-flex size-10 items-center justify-center rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
              style={{ color: textMain }}
              aria-label="Abrir Carrinho"
              title="Ver Carrinho"
            >
              <ShoppingBag className="size-5" />
              {isReady && count > 0 && showCartBadge && (
                <span
                  className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white animate-fade-up"
                  style={{ backgroundColor: primaryColor }}
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="border-t px-4 py-3 md:hidden animate-fade-up"
            style={{ backgroundColor: surfaceColor, borderColor: borderColor }}
          >
            <form onSubmit={submitSearch} className="mb-3 relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: textMuted }} />
              <input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-lg border pl-10 pr-4 text-sm focus:outline-none"
                style={{
                  backgroundColor: `${surfaceColor === "#ffffff" ? "#f4f4f5" : surfaceColor}`,
                  borderColor: borderColor,
                  color: textMain,
                }}
              />
            </form>
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-black/5 flex items-center justify-between"
                  style={{ color: textMain }}
                >
                  <span>{l.label}</span>
                  <ChevronRight className="size-4" style={{ color: textMuted }} />
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
