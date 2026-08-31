import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowLeft,
  Clock,
  Check,
  XCircle,
  MapPin,
  Mail,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import { getOrder } from "@/lib/repo/orders";
import { money } from "@/lib/money";
import { STATUS_LABEL, STATUS_TONE, formatDate } from "@/lib/order-status";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Detalhes do Pedido" };
export const dynamic = "force-dynamic";

const STEPS = [
  { key: "pending", label: "Aguardando Pagamento", desc: "Pedido criado" },
  { key: "paid", label: "Pagamento Confirmado", desc: "Preparando envio" },
  { key: "shipped", label: "Em Transporte", desc: "A caminho" },
  { key: "delivered", label: "Entregue", desc: "Pedido recebido" },
];

function getStepIndex(status: string) {
  switch (status) {
    case "pending":
      return 0;
    case "paid":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    case "cancelled":
      return -1;
    default:
      return 1;
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrder(Number(id));

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center animate-fade-up">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
          <Package className="size-8" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-ink-900">Pedido não encontrado</h1>
        <p className="mt-2 text-sm text-ink-500">
          Não conseguimos localizar as informações do pedido Nº {id}.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/conta"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Meus pedidos
          </Link>
          <Link
            href="/produtos"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-ink-300 bg-white px-6 text-sm font-medium text-ink-700 hover:bg-ink-50"
          >
            Ir para a loja
          </Link>
        </div>
      </div>
    );
  }

  const totalItems = order.items.reduce((n, i) => n + i.quantity, 0);
  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-up space-y-8">
      {/* Top Nav & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/conta"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-brand-700 transition-colors"
        >
          <ArrowLeft className="size-4" /> Voltar para Minha Conta
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-400">Realizado em {formatDate(order.created_at, true)}</span>
        </div>
      </div>

      {/* Main Status Header Card */}
      <div className="rounded-3xl border border-ink-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink-100">
          <div className="flex items-start gap-4">
            <span
              className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${
                isCancelled
                  ? "bg-red-50 text-red-600"
                  : order.status === "delivered"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-brand-50 text-brand-600"
              }`}
            >
              {isCancelled ? (
                <XCircle className="size-7" />
              ) : order.status === "delivered" ? (
                <Check className="size-7" />
              ) : (
                <CheckCircle2 className="size-7" />
              )}
            </span>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-ink-900">
                  Pedido Nº {order.id}
                </h1>
                <Badge tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Badge>
              </div>
              <p className="mt-1 text-sm text-ink-500">
                Cliente: <strong className="text-ink-800">{order.shipping_name}</strong> •{" "}
                <span>{order.email}</span>
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">Valor Total</div>
            <div className="text-2xl font-extrabold text-ink-900">{money(order.total_cents)}</div>
          </div>
        </div>

        {/* Status Tracker / Stepper */}
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-6">
            Acompanhamento do Pedido
          </h2>
          {isCancelled ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-3">
              <XCircle className="size-5 shrink-0 text-red-600" />
              <span>Este pedido foi cancelado. Para dúvidas ou estorno, entre em contato com o suporte.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              {STEPS.map((step, idx) => {
                const isPassed = currentStep > idx;
                const isCurrent = currentStep === idx;
                return (
                  <div
                    key={step.key}
                    className={`relative flex sm:flex-col items-center sm:items-center text-left sm:text-center p-3 rounded-2xl transition-all ${
                      isCurrent
                        ? "bg-brand-50/80 border border-brand-200"
                        : isPassed
                        ? "bg-ink-50/50"
                        : "opacity-60"
                    }`}
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                        isPassed
                          ? "bg-emerald-600 text-white"
                          : isCurrent
                          ? "bg-brand-600 text-white animate-pulse"
                          : "bg-ink-200 text-ink-600"
                      }`}
                    >
                      {isPassed ? <Check className="size-4" /> : idx + 1}
                    </span>
                    <div className="ml-3 sm:ml-0 sm:mt-2.5">
                      <div className="text-xs font-bold text-ink-900">{step.label}</div>
                      <div className="text-[11px] text-ink-500">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Items and Shipping Info */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items list (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white shadow-xs">
            <div className="border-b border-ink-100 bg-ink-50/80 px-6 py-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink-600 flex items-center gap-2">
                <ShoppingBag className="size-4 text-brand-600" /> Itens Comprados ({totalItems})
              </h2>
            </div>
            <ul className="divide-y divide-ink-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 p-6 hover:bg-ink-50/40 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-sm font-bold text-ink-700 border border-ink-200">
                      {item.quantity}x
                    </span>
                    <div>
                      <div className="text-sm font-bold text-ink-900">{item.name}</div>
                      <div className="text-xs text-ink-500 mt-0.5">
                        Preço unitário: {money(item.price_cents)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-ink-900">
                      {money(item.price_cents * item.quantity)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Financial Summary */}
            <div className="border-t border-ink-100 bg-ink-50/50 p-6 space-y-2 text-sm">
              <div className="flex justify-between text-ink-600">
                <span>Subtotal ({totalItems} itens)</span>
                <span>{money(order.total_cents)}</span>
              </div>
              <div className="flex justify-between text-ink-600">
                <span>Frete & Envio</span>
                <span className="text-emerald-700 font-semibold">Grátis</span>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-3 text-base font-extrabold text-ink-900">
                <span>Total Pago</span>
                <span className="text-brand-700">{money(order.total_cents)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info (1 col) */}
        <div className="space-y-6">
          {/* Shipping Address */}
          <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-2">
              <MapPin className="size-4 text-brand-600" /> Endereço de Entrega
            </h3>
            <div className="mt-4 text-sm text-ink-700 space-y-1">
              <div className="font-bold text-ink-900">{order.shipping_name}</div>
              <div>{order.shipping_address}</div>
              <div>
                {order.shipping_city} — CEP {order.shipping_zip}
              </div>
              <div className="text-xs text-ink-500">{order.shipping_country}</div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-3xl border border-ink-200 bg-white p-6 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-500 flex items-center gap-2">
              <Mail className="size-4 text-brand-600" /> Contato
            </h3>
            <div className="mt-4 text-sm text-ink-700 space-y-1">
              <div className="font-semibold text-ink-900">{order.email}</div>
              <p className="text-xs text-ink-500 pt-1">
                As notificações de status e rastreamento são enviadas para este e-mail.
              </p>
            </div>
          </div>

          {/* Guarantee card */}
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 text-xs text-emerald-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-800">
              <ShieldCheck className="size-4 text-emerald-600" /> Compra 100% Protegida
            </div>
            <p className="leading-relaxed text-emerald-800/90">
              Seu pedido está coberto por garantia de entrega e suporte dedicado da loja.
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href="/conta"
          className="inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-xl border border-ink-300 bg-white px-6 text-sm font-semibold text-ink-700 shadow-2xs hover:bg-ink-50 transition-colors"
        >
          Ver Todos os Meus Pedidos
        </Link>
        <Link
          href="/produtos"
          className="inline-flex h-11 w-full sm:w-auto items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors"
        >
          Continuar Comprando
        </Link>
      </div>
    </div>
  );
}
