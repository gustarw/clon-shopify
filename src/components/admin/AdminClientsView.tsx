"use client";

import React from "react";
import { money } from "@/lib/money";
import { formatDate } from "@/lib/order-status";
import { AdminPageHeader, AdminEmptyState } from "@/components/admin/blocks";
import { AdminIcon, SOLAR_ICONS } from "@/components/admin/AdminIcon";
import type { PublicUser } from "@/lib/repo/users";

export interface AdminClientsViewProps {
  users: PublicUser[];
  totalRevenue: number;
  byEmail: Record<string, { count: number; cents: number }>;
}

export function AdminClientsView({ users, totalRevenue, byEmail }: AdminClientsViewProps) {
  return (
    <div className="space-y-8 animate-fade-up">
      <AdminPageHeader
        title="Clientes"
        subtitle={`${users.length} conta(s) registrada(s) · Volume consolidado de vendas em ${money(totalRevenue)}`}
        badge="CRM"
        badgeColor="default"
      />

      {users.length === 0 ? (
        <AdminEmptyState
          icon={<AdminIcon name={SOLAR_ICONS.customers} size={24} />}
          title="Nenhum cliente cadastrado"
          description="Os clientes aparecerão aqui assim que criarem contas ou realizarem checkouts."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ffffff] shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#ebebeb] bg-[#f7f7f7] text-left text-[11px] font-semibold uppercase tracking-wider text-[#6a6a6a]">
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Perfil</th>
                  <th className="px-6 py-4">Desde</th>
                  <th className="px-6 py-4 text-right">Pedidos</th>
                  <th className="px-6 py-4 text-right">Total gasto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ebebeb]">
                {users.map((u) => {
                  const stats = byEmail[u.email.toLowerCase()] || { count: 0, cents: 0 };
                  return (
                    <tr key={u.id} className="hover:bg-[#f7f7f7] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="flex size-9 items-center justify-center rounded-full bg-[#f7f7f7] text-[#222222] border border-[#ebebeb] text-xs font-bold shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-bold text-[#222222]">{u.name}</div>
                            <div className="truncate text-xs text-[#6a6a6a]">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {u.role === "admin" ? (
                          <span className="inline-flex text-[11px] font-semibold text-[#222222] bg-[#f7f7f7] border border-[#ebebeb] py-0.5 px-3 rounded-full">
                            Administrador
                          </span>
                        ) : (
                          <span className="inline-flex text-[11px] font-normal text-[#6a6a6a] border border-[#ebebeb] bg-[#ffffff] py-0.5 px-3 rounded-full">
                            Cliente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-[#6a6a6a] font-normal">{formatDate(u.created_at)}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#222222] tabular-nums">
                        {stats.count}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-[#222222] tabular-nums">
                        {money(stats.cents)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-[#ebebeb] bg-[#ffffff] p-6 shadow-2xs">
        <h3 className="text-base font-bold text-[#222222]">Agrupamento Inteligente de Clientes</h3>
        <p className="mt-2 text-xs sm:text-[14px] leading-relaxed text-[#6a6a6a] font-normal">
          Pedidos realizados como visitante são agregados automaticamente pelo e-mail informado no
          checkout. Quando o mesmo cliente efetuar login, o histórico de compras é preservado de forma unificada.
        </p>
      </div>
    </div>
  );
}
