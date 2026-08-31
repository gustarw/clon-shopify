"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, UserCheck, ArrowRight } from "lucide-react";
import { money } from "@/lib/money";
import { formatDate } from "@/lib/order-status";
import { cn } from "@/components/ui/cn";

export interface ActivityFeedItem {
  id: string | number;
  type: "order" | "user" | "theme" | "product";
  title: string;
  subtitle: string;
  amountCents?: number;
  timestamp: string | Date;
  status?: string;
  href?: string;
}

export interface AdminActivityFeedProps {
  items: ActivityFeedItem[];
  title?: string;
  viewAllHref?: string;
  className?: string;
}

export function AdminActivityFeed({
  items,
  title = "Atividades Recentes na Loja",
  viewAllHref = "/admin/pedidos",
  className,
}: AdminActivityFeedProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ffffff] shadow-2xs", className)}>
      <div className="p-4 sm:p-5 flex flex-row items-center justify-between border-b border-[#ebebeb] bg-[#ffffff]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#222222]">{title}</h3>
          <p className="text-xs text-[#6a6a6a]">
            Atualizações em tempo real
          </p>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#222222] hover:underline underline-offset-4 transition-colors"
          >
            <span>Ver tudo</span>
            <ArrowRight className="size-3.5 stroke-[2]" />
          </Link>
        )}
      </div>

      <div className="p-0 divide-y divide-[#ebebeb]">
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#6a6a6a]">
            Nenhuma atividade registrada no momento.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3.5 p-3.5 sm:px-5 hover:bg-[#f7f7f7] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 shrink-0 rounded-full bg-[#f7f7f7] border border-[#ebebeb] text-[#222222] flex items-center justify-center">
                  {item.type === "order" ? (
                    <ShoppingBag className="size-4 stroke-[2]" />
                  ) : (
                    <UserCheck className="size-4 stroke-[2]" />
                  )}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs sm:text-sm font-semibold text-[#222222] truncate">
                      {item.title}
                    </span>
                    {item.status && (
                      <span className="inline-flex items-center text-[10px] font-semibold py-0.5 px-2 rounded-full bg-[#f0fdf4] text-[#15803d] border border-[#bbf7d0]">
                        {item.status}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-[#6a6a6a] truncate">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex flex-col items-end shrink-0 pl-2">
                {item.amountCents != null && (
                  <span className="text-xs sm:text-sm font-bold text-[#222222] tabular-nums">
                    {money(item.amountCents)}
                  </span>
                )}
                <span className="text-[11px] text-[#6a6a6a]">
                  {typeof item.timestamp === "string" ? item.timestamp : formatDate(item.timestamp.toISOString())}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
