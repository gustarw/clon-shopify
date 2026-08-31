import type { Metadata } from "next";
import Link from "next/link";
import { adminLoginAction } from "@/lib/actions";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";
import { Lock, Mail, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "Login Administrativo | SensaShop",
  description: "Acesse o painel administrativo da SensaShop",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <div className="rounded-2xl border border-[#ebebeb] bg-[#ffffff] p-8 sm:p-10 shadow-airbnb-subtle">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[#fff0f3] text-[#ff385c] border border-[#ffd1dc]">
          <AdminIcon name={SOLAR_ICONS.home} size={22} />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#222222]">
          Acesso Administrativo
        </h1>
        <p className="mt-1.5 text-xs text-[#6a6a6a]">
          Entre com suas credenciais de administrador
        </p>
      </div>

      {/* Error Alert */}
      {erro && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-[#c13515]">
          <ShieldAlert className="size-4 shrink-0 text-[#ff385c]" />
          <span>{erro}</span>
        </div>
      )}

      {/* Login Form */}
      <form action={adminLoginAction} className="space-y-4.5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#222222]" htmlFor="email">
            E-mail
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6a6a6a]" />
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@sensashop.com"
              className="h-11 w-full rounded-xl border border-[#ebebeb] bg-[#ffffff] pl-10 pr-4 text-xs text-[#222222] placeholder:text-[#c1c1c1] focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#222222]" htmlFor="password">
            Senha
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6a6a6a]" />
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-[#ebebeb] bg-[#ffffff] pl-10 pr-4 text-xs text-[#222222] placeholder:text-[#c1c1c1] focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="mt-2 flex h-11 w-full items-center justify-center rounded-full bg-[#222222] text-xs font-bold text-white shadow-xs hover:bg-[#000000] active:scale-[0.99] transition-all cursor-pointer"
        >
          Entrar no Painel
        </button>
      </form>

      {/* Switch to Register */}
      <div className="mt-8 border-t border-[#ebebeb] pt-6 text-center">
        <p className="text-xs text-[#6a6a6a]">
          Ainda não tem conta de administrador?{" "}
          <Link
            href="/admin/registrar"
            className="font-bold text-[#222222] hover:text-[#ff385c] hover:underline transition-colors"
          >
            Cadastre-se aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
