import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Package, LogOut } from "lucide-react";
import { getSession } from "@/lib/auth";
import { listCustomerOrders } from "@/lib/repo/orders";
import { STATUS_LABEL, STATUS_TONE, formatDate } from "@/lib/order-status";
import { money } from "@/lib/money";
import { Badge } from "@/components/ui/Badge";
import { logoutAction } from "@/lib/actions";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "Login / Minha Conta | SensaShop" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const session = await getSession();

  // If user is authenticated as customer, show their account details & orders right here
  if (session && session.role === "customer") {
    const orders = listCustomerOrders(session.id);

    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-600 text-xl font-bold text-white">
              {session.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-ink-900">{session.name}</h1>
              <p className="text-sm text-ink-500">{session.email}</p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-ink-300 bg-white px-4 text-sm font-medium text-ink-700 hover:bg-ink-50 hover:text-red-600 cursor-pointer"
            >
              <LogOut className="size-4" /> Sair da conta
            </button>
          </form>
        </div>

        <div className="mt-10">
          <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
            <Package className="size-5 text-brand-600" /> Meus pedidos
          </h2>

          {orders.length === 0 ? (
            <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-ink-300 bg-white py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
                <Package className="size-7" />
              </span>
              <p className="mt-4 text-sm font-medium text-ink-900">Você ainda não fez nenhum pedido</p>
              <p className="mt-1 text-sm text-ink-500">Que tal começar agora?</p>
              <Link
                href="/produtos"
                className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand-600 px-5 text-sm font-medium text-white hover:bg-brand-700"
              >
                Ver produtos
              </Link>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 bg-ink-50 px-5 py-3.5">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-bold text-ink-900">Pedido Nº {order.id}</span>
                      <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
                      <span className="text-xs text-ink-400">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold text-ink-900">{money(order.total_cents)}</span>
                      <Link
                        href={`/pedido/${order.id}`}
                        className="inline-flex items-center rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 shadow-2xs hover:border-brand-600 hover:text-brand-700 transition-colors"
                      >
                        Ver detalhes
                      </Link>
                    </div>
                  </div>
                  <ul className="divide-y divide-ink-100">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-4 px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex size-6 items-center justify-center rounded-md bg-ink-100 text-xs font-bold text-ink-600">
                            {item.quantity}
                          </span>
                          <span className="text-sm text-ink-700">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium text-ink-900">
                          {money(item.price_cents * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink-100 bg-ink-50/50 px-5 py-2.5 text-xs text-ink-500">
                    <span>Entrega para: <strong className="text-ink-700">{order.shipping_city}, {order.shipping_country}</strong> ({order.shipping_address})</span>
                    <Link href={`/pedido/${order.id}`} className="font-semibold text-brand-700 hover:underline">
                      Rastrear pedido →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise, render clean single login form
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
