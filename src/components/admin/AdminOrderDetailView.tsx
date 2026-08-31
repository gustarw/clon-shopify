"use client";

import React from "react";
import Link from "next/link";
import { money } from "@/lib/money";
import { STATUS_LABEL, formatDate } from "@/lib/order-status";
import { OrderStatusForm } from "@/components/admin/OrderStatusForm";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";
import type { OrderWithItems } from "@/lib/types";

export function AdminOrderDetailView({ order }: { order: OrderWithItems }) {
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-[#6a6a6a] bg-[#ffffff] border border-[#ebebeb] hover:bg-[#f7f7f7] hover:text-[#222222] transition-colors shadow-2xs"
        >
          <AdminIcon name={SOLAR_ICONS.arrowLeft} size={16} /> Voltar aos Pedidos
        </Link>
        <OrderStatusForm orderId={order.id} current={order.status} />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ffffff] shadow-2xs">
            <div className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-[#ebebeb] bg-[#f7f7f7] px-6 py-4">
              <h2 className="text-xl font-bold text-[#222222]">Pedido #{order.id}</h2>
              <span className="inline-flex text-[11px] font-semibold text-[#222222] bg-[#ffffff] border border-[#ebebeb] py-0.5 px-3 rounded-full shadow-2xs">
                {STATUS_LABEL[order.status]}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#ebebeb] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6a6a6a] bg-[#f7f7f7]/60">
                    <th className="px-6 py-4">Produto</th>
                    <th className="px-6 py-4">Preço unit.</th>
                    <th className="px-6 py-4">Qtd.</th>
                    <th className="px-6 py-4 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebebeb]">
                  {order.items.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f7f7f7] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#222222]">{item.name}</div>
                        {item.product_id && (
                          <Link
                            href={`/produtos?categoria=&q=${encodeURIComponent(item.name.split(" ")[0])}`}
                            className="text-xs text-[#6a6a6a] hover:text-[#222222] transition-colors"
                          >
                            Produto #{item.product_id}
                          </Link>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#6a6a6a] font-normal">{money(item.price_cents)}</td>
                      <td className="px-6 py-4 text-[#6a6a6a] font-normal">{item.quantity}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#222222]">
                        {money(item.price_cents * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[#ebebeb] bg-[#f7f7f7]">
                    <td className="px-6 py-4 text-sm font-bold text-[#222222]" colSpan={3}>
                      Total ({itemCount} item{itemCount === 1 ? "" : "ns"})
                    </td>
                    <td className="px-6 py-4 text-right text-lg font-bold text-[#222222] tabular-nums">
                      {money(order.total_cents)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6a6a6a]">
              <AdminIcon name={SOLAR_ICONS.mail} size={16} className="text-[#222222]" /> Cliente
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="font-bold text-[#222222]">{order.shipping_name}</div>
              <div className="text-xs text-[#6a6a6a]">{order.email}</div>
              <div className="text-xs text-[#6a6a6a]">Data: {formatDate(order.created_at)}</div>
            </div>
          </div>

          <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6a6a6a]">
              <AdminIcon name={SOLAR_ICONS.location} size={16} className="text-[#222222]" /> Endereço de Entrega
            </h3>
            <address className="space-y-1 text-xs not-italic text-[#6a6a6a]">
              <div className="font-bold text-[#222222] text-sm">{order.shipping_address}</div>
              <div>
                {order.shipping_city} — CEP {order.shipping_zip}
              </div>
              <div>{order.shipping_country}</div>
            </address>
          </div>

          <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6a6a6a]">
              <AdminIcon name={SOLAR_ICONS.orders} size={16} className="text-[#222222]" /> Resumo Financeiro
            </h3>
            <dl className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <dt className="text-[#6a6a6a]">Itens</dt>
                <dd className="font-semibold text-[#222222]">{itemCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6a6a6a]">Tipo de checkout</dt>
                <dd className="font-semibold text-[#222222]">
                  {order.user_id ? "Conta vinculada" : "Visitante"}
                </dd>
              </div>
              <div className="flex justify-between border-t border-[#ebebeb] pt-3">
                <dt className="font-bold text-[#222222] text-sm">Total Geral</dt>
                <dd className="font-bold text-[#222222] text-base tabular-nums">{money(order.total_cents)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
