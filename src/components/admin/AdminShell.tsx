"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Search, Globe, Bell, LogOut, ExternalLink } from "lucide-react";
import { AdminIcon, SOLAR_ICONS } from "./AdminIcon";
import { logoutAction } from "@/lib/actions";
import { AdminAiDrawer } from "./AdminAiDrawer";
import { AdminAiTrigger } from "./AdminAiTrigger";
import { cn } from "@/components/ui/cn";

interface NavItem {
  href: string;
  label: string;
  solarIcon: string;
  exact?: boolean;
}

const NAV_MAIN: NavItem[] = [
  { href: "/admin", label: "Início", solarIcon: SOLAR_ICONS.home, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", solarIcon: SOLAR_ICONS.orders },
  { href: "/admin/produtos", label: "Produtos", solarIcon: SOLAR_ICONS.products },
  { href: "/admin/categorias", label: "Coleções", solarIcon: SOLAR_ICONS.categories },
  { href: "/admin/clientes", label: "Clientes", solarIcon: SOLAR_ICONS.customers },
  { href: "/admin/temas", label: "Loja Virtual & Temas", solarIcon: SOLAR_ICONS.themes },
];

const SALES_CHANNELS = [
  { href: "/admin/temas/editor", label: "Editor de Tema", solarIcon: SOLAR_ICONS.themeEditor, isEditor: true },
  { href: "/", label: "Ver Loja Online", solarIcon: SOLAR_ICONS.storefront, external: true },
];

export function AdminShell({
  userName,
  children,
}: {
  userName: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Immersive full-screen theme visual editor
  if (pathname.startsWith("/admin/temas/editor")) {
    return (
      <>
        {children}
        <AdminAiDrawer />
        <AdminAiTrigger />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#222222] font-sans antialiased">
      {/* ========================================================= */}
      {/* 1. TOPBAR (Airbnb Signature Clean White Nav)              */}
      {/* ========================================================= */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#ebebeb] bg-[#ffffff] px-6 sm:px-8 select-none shadow-none">
        {/* Left: Mobile Toggle + Airbnb-style Brand Logo */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="size-10 min-w-10 rounded-full text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] flex items-center justify-center lg:hidden cursor-pointer transition-colors"
            aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          >
            {mobileOpen ? <X className="size-5 stroke-[2]" /> : <Menu className="size-5 stroke-[2]" />}
          </button>

          {/* Brand Logo with Rausch Coral Accent */}
          <Link
            href="/admin"
            className="flex items-center gap-3 py-1 px-1 rounded-full hover:opacity-90 active:scale-[0.98] transition-all group"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-[#ff385c] text-white shadow-sm transition-transform group-hover:scale-105">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[16px] font-bold tracking-tight text-[#222222]">
                SensaShop
              </span>
              <span className="bg-[#f7f7f7] text-[#222222] border border-[#ebebeb] text-[11px] font-semibold px-2 py-0.5 rounded-full tracking-wide">
                Admin
              </span>
            </div>
          </Link>

          {/* Store Switcher Pill */}
          <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-[#ebebeb] text-xs text-[#6a6a6a]">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#222222] bg-[#f7f7f7] border border-[#ebebeb] py-1 px-3 rounded-full">
              <span className="size-2 rounded-full bg-[#008a05]" />
              Loja Ativa
            </span>
          </div>
        </div>

        {/* Center: Airbnb Floating Capsule Search Bar */}
        <div className="relative mx-4 hidden max-w-md flex-1 md:block">
          <div className="relative flex items-center h-12 w-full rounded-full border border-[#ebebeb] bg-[#ffffff] shadow-airbnb-capsule transition-all hover:shadow-airbnb-subtle pl-4 pr-1.5">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-[#222222]">Buscar</span>
              <span className="text-xs text-[#6a6a6a]">|</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pedidos, produtos, clientes..."
                className="w-full bg-transparent text-xs text-[#222222] placeholder:text-[#6a6a6a] focus:outline-none"
              />
            </div>
            <button
              type="button"
              className="flex size-9 min-w-9 items-center justify-center rounded-full bg-[#ff385c] text-white hover:bg-[#e00b41] transition-colors cursor-pointer shadow-sm ml-2"
              aria-label="Executar busca"
            >
              <Search className="size-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Right Actions: Airbnb Circular Buttons & User Pill */}
        <div className="flex items-center gap-2.5">
          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              className="size-10 min-w-10 rounded-full text-[#222222] bg-[#f7f7f7] hover:bg-[#ebebeb] flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Notificações"
            >
              <Bell className="size-4.5 stroke-[2]" />
            </button>
            <span className="pointer-events-none absolute top-2 right-2 flex size-2">
              <span className="relative inline-flex size-2 rounded-full bg-[#ff385c]" />
            </span>
          </div>

          {/* User Menu Pill */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#ebebeb]">
            <div className="flex items-center gap-2 rounded-full border border-[#ebebeb] bg-[#ffffff] p-1 pr-3 hover:shadow-airbnb-subtle transition-all cursor-pointer">
              <div className="flex size-7.5 items-center justify-center rounded-full bg-[#222222] text-xs font-semibold text-white">
                {userName ? userName.charAt(0).toUpperCase() : "A"}
              </div>
              <span className="text-xs font-medium text-[#222222] max-w-[100px] truncate hidden md:block">
                {userName}
              </span>
            </div>

            <form action={logoutAction} className="inline">
              <button
                type="submit"
                className="size-10 min-w-10 rounded-full text-[#6a6a6a] bg-[#f7f7f7] hover:bg-rose-50 hover:text-[#c13515] flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Sair"
                title="Sair da conta"
              >
                <LogOut className="size-4 stroke-[2]" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MOBILE BACKDROP OVERLAY                                */}
      {/* ========================================================= */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* ========================================================= */}
      {/* 3. SIDEBAR (Airbnb Clean White Frame Navigation)          */}
      {/* ========================================================= */}
      <aside
        className={cn(
          "fixed top-20 bottom-0 left-0 z-40 w-[260px] min-w-[260px] flex flex-col border-r border-[#ebebeb] bg-[#ffffff] transition-transform duration-200 ease-out lg:translate-x-0",
          mobileOpen ? "translate-x-0 shadow-airbnb-modal" : "-translate-x-full"
        )}
      >
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-4.5 custom-scrollbar">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              <div className="px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#6a6a6a]">
                Menu Principal
              </div>
              {NAV_MAIN.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-full px-4 py-2.5 text-[14px] select-none transition-all duration-150 ease-out",
                      active
                        ? "bg-[#f7f7f7] text-[#222222] font-semibold shadow-2xs border border-[#ebebeb]"
                        : "text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] font-normal"
                    )}
                  >
                    <AdminIcon
                      name={item.solarIcon}
                      size={19}
                      className={cn(
                        "shrink-0 transition-colors",
                        active ? "text-[#ff385c]" : "text-[#222222]"
                      )}
                    />
                    <span className="truncate whitespace-nowrap">{item.label}</span>
                    {active && (
                      <span className="ml-auto size-2 shrink-0 rounded-full bg-[#ff385c]" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Sales Channels Section */}
            <div className="space-y-1">
              <div className="px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#6a6a6a]">
                Canais de Vendas
              </div>
              {SALES_CHANNELS.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={!item.external}
                    target={item.external ? "_blank" : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-full px-4 py-2.5 text-[14px] select-none transition-all duration-150 ease-out",
                      active
                        ? "bg-[#f7f7f7] text-[#222222] font-semibold shadow-2xs border border-[#ebebeb]"
                        : "text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] font-normal"
                    )}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <AdminIcon
                        name={item.solarIcon}
                        size={19}
                        className={cn(
                          "shrink-0",
                          active ? "text-[#ff385c]" : "text-[#222222]"
                        )}
                      />
                      <span className="truncate whitespace-nowrap">{item.label}</span>
                    </span>
                    {item.external ? (
                      <ExternalLink className="size-3.5 text-[#6a6a6a] shrink-0" />
                    ) : item.isEditor ? (
                      <span className={cn(
                        "px-2.5 py-0.5 text-[10px] font-semibold rounded-full shrink-0",
                        active ? "bg-[#ff385c] text-white" : "bg-[#f7f7f7] text-[#6a6a6a] border border-[#ebebeb]"
                      )}>
                        Editor
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Bottom Settings */}
          <div className="border-t border-[#ebebeb] pt-3 mt-4 space-y-1">
            <Link
              href="/admin/temas"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between rounded-full px-4 py-2.5 text-[14px] font-normal text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222] transition-all"
            >
              <span className="flex items-center gap-3 min-w-0">
                <AdminIcon name={SOLAR_ICONS.settings} size={19} className="text-[#222222] shrink-0" />
                <span className="truncate whitespace-nowrap">Configurações</span>
              </span>
              <span className="border border-[#ebebeb] text-[#6a6a6a] text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-[#f7f7f7] shrink-0">
                Tema
              </span>
            </Link>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 4. CONTEÚDO PRINCIPAL (Airbnb Canvas Background)          */}
      {/* ========================================================= */}
      <main className="min-h-screen pt-20 lg:pl-[260px] transition-all duration-200">
        <div className="mx-auto max-w-[1240px] p-6 sm:p-8 lg:p-10">
          {children}
        </div>
      </main>

      {/* Global AI Assistant Drawer + Clean Floating Trigger */}
      <AdminAiDrawer />
      <AdminAiTrigger />
    </div>
  );
}
