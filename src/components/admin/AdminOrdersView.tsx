"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/lib/types";
import { money } from "@/lib/money";
import { STATUS_LABEL, formatDate } from "@/lib/order-status";
import { AdminPageHeader, AdminEmptyState } from "@/components/admin/blocks";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";

export interface AdminOrdersViewProps {
  orders: Order[];
  status?: OrderStatus;
  searchQuery?: string;
  totalOrdersCount: number;
}

export function AdminOrdersView({
  orders,
  status,
  searchQuery = "",
}: AdminOrdersViewProps) {
  const router = useRouter();

  return (
    <div className="space-y-8 animate-fade-up">
      <AdminPageHeader
        title="Pedidos"
        subtitle="Acompanhe o faturamento, envio e status de pagamento das vendas da loja"
        badge="Vendas"
        badgeColor="accent"
      />

      {/* Filter Tabs / Airbnb Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/pedidos"
          className={`inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold transition-all ${
            !status
              ? "bg-[#222222] text-[#ffffff] shadow-xs"
              : "border border-[#ebebeb] bg-[#ffffff] text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222]"
          }`}
        >
          Todos
        </Link>
        {ORDER_STATUSES.map((st) => (
          <Link
            key={st}
            href={`/admin/pedidos?status=${st}`}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              status === st
                ? "bg-[#222222] text-[#ffffff] shadow-xs"
                : "border border-[#ebebeb] bg-[#ffffff] text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222]"
            }`}
          >
            <span>{STATUS_LABEL[st]}</span>
            <span
              className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                status === st ? "bg-white/20 text-white" : "bg-[#f7f7f7] text-[#6a6a6a] border border-[#ebebeb]"
              }`}
            >
              {orders.filter((o) => o.status === st).length}
            </span>
          </Link>
        ))}
      </div>

      <form className="flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <AdminIcon name={SOLAR_ICONS.search} size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6a6a6a]" />
          <input
            name="q"
            defaultValue={searchQuery}
            placeholder="Buscar por e-mail, nome do cliente ou ID..."
            className="h-10.5 w-full rounded-full border border-[#ebebeb] bg-[#ffffff] pl-10 pr-4 text-xs text-[#222222] placeholder:text-[#6a6a6a] focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] transition-all shadow-2xs"
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-[#222222] text-white px-5 py-2.5 text-xs font-semibold hover:bg-[#000000] active:scale-[0.98] transition-all cursor-pointer shadow-xs"
        >
          Buscar
        </button>
      </form>

      {orders.length === 0 ? (
        <AdminEmptyState
          icon={<AdminIcon name={SOLAR_ICONS.orders} size={24} />}
          title="Nenhum pedido encontrado"
          description="Ajuste os filtros de status ou tente buscar por outros termos de pesquisa."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ffffff] shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ebebeb] bg-[#f7f7f7] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6a6a6a]">
                  <th className="px-6 py-4">Pedido</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Data</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {orders.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => router.push(`/admin/pedidos/${o.id}`)}
                    className="hover:bg-[#f7f7f7] transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#222222] group-hover:text-[#ff385c] transition-colors">
                        #{o.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#222222]">{o.shipping_name}</div>
                      <div className="text-xs text-[#6a6a6a]">{o.email}</div>
                    </td>
                    <td className="px-6 py-4 text-[#6a6a6a] font-normal">{formatDate(o.created_at)}</td>
                    <td className="px-6 py-4 font-bold text-[#222222] tabular-nums">{money(o.total_cents)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex text-[11px] font-semibold text-[#222222] bg-[#f7f7f7] border border-[#ebebeb] py-0.5 px-3 rounded-full group-hover:border-[#222222] transition-colors">
                        {STATUS_LABEL[o.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
