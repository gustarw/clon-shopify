import type { Metadata } from "next";
import Link from "next/link";
import { getOrder, getOrderAsync } from "@/lib/repo/orders";
import { AdminOrderDetailView } from "@/components/admin/AdminOrderDetailView";

export const metadata: Metadata = { title: "Detalhe do pedido | SensaShop" };
export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = (await getOrderAsync(Number(id))) || getOrder(Number(id));

  if (!order) {
    return (
      <div className="border border-[#ebebeb] rounded-xl bg-white p-12 text-center shadow-xs">
        <h3 className="text-lg font-bold text-[#222222]">Pedido não encontrado</h3>
        <p className="mt-2 text-sm text-[#6a6a6a]">
          O pedido solicitado não foi encontrado no banco de dados.
        </p>
        <div className="mt-4">
          <Link
            href="/admin/pedidos"
            className="inline-flex items-center rounded-full bg-[#222222] px-5 py-2.5 text-xs font-semibold text-white hover:bg-black shadow-xs active:scale-[0.98] transition-all"
          >
            Voltar aos pedidos
          </Link>
        </div>
      </div>
    );
  }

  return <AdminOrderDetailView order={order} />;
}
