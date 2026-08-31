"use client";

import React from "react";
import Link from "next/link";
import { money, moneyCompact } from "@/lib/money";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { STATUS_LABEL, formatDate } from "@/lib/order-status";
import type { DashboardStats } from "@/lib/repo/stats";
import {
  AdminPageHeader,
  AdminMetricsGrid,
  AdminMetricCard,
} from "@/components/admin/blocks";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";

export function AdminDashboardView({ stats: s }: { stats: DashboardStats }) {
  const maxCategory = s.revenueByCategory.reduce((m, c) => Math.max(m, c.cents), 0) || 1;
  const maxSold = s.topProducts.reduce((m, p) => Math.max(m, p.sold), 0) || 1;
  const totalPeriodRevenue = s.revenueByDay.reduce((sum, d) => sum + d.cents, 0);

  return (
    <div className="space-y-8 animate-fade-up">
      {/* 1. Header do Painel */}
      <AdminPageHeader
        title="Painel Geral"
        subtitle="Visão consolidada de vendas, métricas de crescimento e catálogo da loja"
        actions={
          <>
            <Link
              href="/admin/produtos/novo"
              className="inline-flex items-center gap-2 rounded-full bg-[#222222] text-[#ffffff] px-4.5 py-2.5 text-xs font-semibold hover:bg-[#000000] active:scale-[0.98] transition-all shadow-xs"
            >
              <AdminIcon name={SOLAR_ICONS.plus} size={16} />
              <span>Adicionar Produto</span>
            </Link>
            <Link
              href="/admin/pedidos"
              className="inline-flex items-center gap-2 rounded-full border border-[#ebebeb] bg-[#ffffff] px-4.5 py-2.5 text-xs font-medium text-[#222222] hover:bg-[#f7f7f7] active:scale-[0.98] transition-all shadow-2xs"
            >
              <AdminIcon name={SOLAR_ICONS.orders} size={16} className="text-[#6a6a6a]" />
              <span>Ver Pedidos</span>
            </Link>
          </>
        }
      />

      {/* 2. Alerta de Estoque Baixo */}
      {s.lowStockCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border border-[#ebebeb] bg-[#ffffff] p-5 sm:p-6 gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#fff0f3] text-[#ff385c] border border-[#ffd1dc] shrink-0">
              <AdminIcon name={SOLAR_ICONS.bolt} size={18} />
            </span>
            <div>
              <h4 className="text-[14px] font-bold text-[#222222]">
                {s.lowStockCount} produto(s) com estoque baixo
              </h4>
              <p className="text-[13px] text-[#6a6a6a] font-normal mt-0.5">
                Reponha os itens em estoque para não perder pedidos na loja.
              </p>
            </div>
          </div>
          <Link
            href="/admin/produtos"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#222222] text-white px-4 py-2 text-xs font-semibold hover:bg-[#000000] shrink-0 transition-all"
          >
            <span>Gerenciar estoque</span>
            <AdminIcon name={SOLAR_ICONS.arrowRight} size={14} />
          </Link>
        </div>
      )}

      {/* 4. Métricas Principais (Airbnb Style Metric Cards) */}
      <AdminMetricsGrid columns={4}>
        <AdminMetricCard
          label="Vendas Totais"
          value={money(s.revenueCents)}
          trendPercentage={s.revenueDeltaPct != null ? Math.round(s.revenueDeltaPct) : undefined}
          trendLabel="vs mês anterior"
          icon={<AdminIcon name={SOLAR_ICONS.money} size={18} className="text-[#ff385c]" />}
          hint={`${s.ordersCount} pedidos confirmados`}
        />
        <AdminMetricCard
          label="Ticket Médio"
          value={money(s.avgOrderCents)}
          icon={<AdminIcon name={SOLAR_ICONS.ticket} size={18} className="text-[#222222]" />}
          hint="Valor médio por pedido"
        />
        <AdminMetricCard
          label="Catálogo de Produtos"
          value={String(s.productsCount)}
          icon={<AdminIcon name={SOLAR_ICONS.products} size={18} className="text-[#222222]" />}
          hint={`${s.activeProductsCount} produtos ativos na loja`}
        />
        <AdminMetricCard
          label="Total de Clientes"
          value={String(s.customersCount)}
          icon={<AdminIcon name={SOLAR_ICONS.customers} size={18} className="text-[#222222]" />}
          hint={s.lowStockCount > 0 ? `${s.lowStockCount} com estoque baixo` : "Estoque 100% regular"}
        />
      </AdminMetricsGrid>

      {/* 5. Gráfico de Receita + Categorias */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 xl:col-span-2 shadow-2xs">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#ebebeb] pb-5">
            <div>
              <h3 className="text-base font-bold text-[#222222]">
                Receita dos últimos 30 dias
              </h3>
              <p className="text-[13px] text-[#6a6a6a] font-normal mt-0.5">
                Histórico de transações confirmadas na plataforma
              </p>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-xl font-bold text-[#222222] tabular-nums">
                {money(totalPeriodRevenue)}
              </div>
              {s.revenueDeltaPct != null && (
                <span className="inline-flex text-[11px] font-semibold text-[#15803d] bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 rounded-full mt-1">
                  {s.revenueDeltaPct >= 0 ? `+${s.revenueDeltaPct}%` : `${s.revenueDeltaPct}%`}
                </span>
              )}
            </div>
          </div>
          <div className="mt-6">
            <RevenueChart data={s.revenueByDay} />
          </div>
        </div>

        <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="border-b border-[#ebebeb] pb-5">
              <h3 className="text-base font-bold text-[#222222]">
                Receita por Coleção
              </h3>
              <p className="text-[13px] text-[#6a6a6a] font-normal mt-0.5">
                Distribuição do faturamento por categoria
              </p>
            </div>
            <div className="mt-5 space-y-4">
              {s.revenueByCategory.length === 0 && (
                <p className="py-8 text-center text-sm text-[#6a6a6a]">Sem vendas no período.</p>
              )}
              {s.revenueByCategory.map((c) => {
                const pct = Math.round((c.cents / maxCategory) * 100);
                return (
                  <div key={c.name} className="group">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#222222] truncate">{c.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#6a6a6a]">({c.count} ped.)</span>
                        <span className="font-bold text-[#222222] tabular-nums">
                          {moneyCompact(c.cents)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#f7f7f7]">
                      <div
                        className="h-full rounded-full bg-[#222222] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-[#ebebeb]">
            <Link
              href="/admin/categorias"
              className="text-xs font-semibold text-[#222222] hover:underline underline-offset-4 inline-flex items-center gap-1.5"
            >
              <span>Gerenciar coleções</span>
              <AdminIcon name={SOLAR_ICONS.arrowRight} size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 6. Pedidos Recentes + Produtos Mais Vendidos */}
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] xl:col-span-2 shadow-2xs overflow-hidden">
          <div className="flex flex-row items-center justify-between border-b border-[#ebebeb] p-5 sm:px-6 sm:py-4">
            <div>
              <h3 className="text-base font-bold text-[#222222]">
                Pedidos Recentes
              </h3>
              <p className="text-[13px] text-[#6a6a6a] font-normal mt-0.5">
                Últimas vendas processadas na loja
              </p>
            </div>
            <Link
              href="/admin/pedidos"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#222222] hover:underline underline-offset-4"
            >
              <span>Ver todos</span>
              <AdminIcon name={SOLAR_ICONS.arrowRight} size={14} />
            </Link>
          </div>
          <div className="divide-y divide-[#ebebeb]">
            {s.recentOrders.length === 0 && (
              <div className="px-6 py-10 text-center text-sm text-[#6a6a6a]">
                Nenhum pedido registrado ainda.
              </div>
            )}
            {s.recentOrders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/pedidos/${o.id}`}
                className="flex items-center justify-between gap-4 p-4 sm:px-6 hover:bg-[#f7f7f7] transition-colors group"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#222222] group-hover:text-[#ff385c] transition-colors">
                      Pedido #{o.id}
                    </span>
                    <span className="text-[11px] text-[#6a6a6a]">
                      • {formatDate(o.created_at)}
                    </span>
                  </div>
                  <div className="truncate text-xs text-[#6a6a6a] mt-0.5">{o.email}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="inline-flex text-[11px] font-medium text-[#222222] bg-[#f7f7f7] border border-[#ebebeb] py-0.5 px-2.5 rounded-full">
                    {(STATUS_LABEL as Record<string, string>)[o.status] || o.status}
                  </span>
                  <span className="text-xs font-bold text-[#222222] tabular-nums">
                    {money(o.total_cents)}
                  </span>
                  <AdminIcon name={SOLAR_ICONS.arrowRight} size={14} className="text-[#c1c1c1] group-hover:text-[#222222] transition-colors hidden sm:block" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="border-b border-[#ebebeb] pb-5">
              <h3 className="text-base font-bold text-[#222222]">
                Mais Vendidos
              </h3>
              <p className="text-[13px] text-[#6a6a6a] font-normal mt-0.5">
                Ranking de produtos por volume
              </p>
            </div>
            <div className="mt-5">
              <ul className="space-y-4">
                {s.topProducts.length === 0 && (
                  <p className="py-8 text-center text-sm text-[#6a6a6a]">Nenhum produto vendido ainda.</p>
                )}
                {s.topProducts.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#f7f7f7] border border-[#ebebeb] text-[10px] font-bold text-[#222222]">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-[#222222]">{p.name}</div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#f7f7f7]">
                        <div
                          className="h-full rounded-full bg-[#ff385c]"
                          style={{ width: `${(p.sold / maxSold) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-[#6a6a6a] tabular-nums">
                      {p.sold} un.
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-[#ebebeb]">
            <Link
              href="/admin/produtos"
              className="text-xs font-semibold text-[#222222] hover:underline underline-offset-4 inline-flex items-center gap-1.5"
            >
              <span>Ver catálogo completo</span>
              <AdminIcon name={SOLAR_ICONS.arrowRight} size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
