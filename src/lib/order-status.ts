import type { OrderStatus } from "./repo/orders";
import type { BadgeProps } from "@/components/ui/Badge";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pendente",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const STATUS_TONE: Record<OrderStatus, NonNullable<BadgeProps["tone"]>> = {
  pending: "amber",
  paid: "blue",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
};

export function formatDate(iso: string, withTime = false): string {
  const normalized = iso.endsWith("Z") ? iso : iso + "Z";
  try {
    const d = new Date(normalized);
    return d.toLocaleString("pt-BR", withTime
      ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
      : { day: "2-digit", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}
