"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { updateOrderStatusAction } from "@/lib/actions";
import { STATUS_LABEL } from "@/lib/order-status";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "paid",
  paid: "shipped",
  shipped: "delivered",
};

export function OrderStatusForm({ orderId, current }: { orderId: number; current: OrderStatus }) {
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [status, setStatus] = useState<OrderStatus>(current);
  const router = useRouter();
  const next = NEXT_STATUS[current];

  async function apply(newStatus: OrderStatus) {
    if (newStatus === current) return;
    setBusy(true);
    try {
      await updateOrderStatusAction(orderId, newStatus);
      setStatus(newStatus);
      setOk(STATUS_LABEL[newStatus]);
      router.refresh();
      setTimeout(() => setOk(null), 2500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2.5">
      {ok && (
        <span className="inline-flex items-center gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] text-[#15803d] text-xs font-semibold py-1 px-3.5 rounded-full">
          <CheckCircle2 className="size-3.5 text-[#008a05]" /> Atualizado para {ok.toLowerCase()}
        </span>
      )}

      {next && (
        <button
          type="button"
          onClick={() => apply(next)}
          disabled={busy}
          className="rounded-full bg-[#222222] text-white px-4 py-2 text-xs font-semibold hover:bg-[#000000] active:scale-[0.98] transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          Marcar como {STATUS_LABEL[next].toLowerCase()}
        </button>
      )}

      <select
        value={status}
        onChange={(e) => apply(e.target.value as OrderStatus)}
        disabled={busy}
        className="h-9 cursor-pointer rounded-full border border-[#ebebeb] bg-[#ffffff] px-4 text-xs font-medium text-[#222222] focus:border-[#222222] focus:outline-none focus:ring-1 focus:ring-[#222222] shadow-2xs"
        aria-label="Alterar status do pedido"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
        ))}
      </select>
    </div>
  );
}
