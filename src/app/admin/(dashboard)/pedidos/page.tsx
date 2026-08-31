import type { Metadata } from "next";
import { listOrdersAsync, ORDER_STATUSES, type OrderStatus } from "@/lib/repo/orders";
import { AdminOrdersView } from "@/components/admin/AdminOrdersView";

export const metadata: Metadata = { title: "Pedidos" };
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const status = (ORDER_STATUSES as string[]).includes(sp.status || "")
    ? (sp.status as OrderStatus)
    : undefined;
  const orders = await listOrdersAsync({ status, search: sp.q?.trim() || undefined });

  return (
    <AdminOrdersView
      orders={orders}
      status={status}
      searchQuery={sp.q || ""}
      totalOrdersCount={orders.length}
    />
  );
}
