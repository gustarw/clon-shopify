"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CreditCard, Lock, Truck } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { checkoutAction } from "@/lib/actions";
import { money } from "@/lib/money";

export default function CheckoutPage() {
  const { items, subtotalCents, clear, isReady } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    shippingName: "",
    shippingAddress: "",
    shippingCity: "",
    shippingZip: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
  });

  const shippingCents = subtotalCents >= 19900 ? 0 : 1990;
  const total = subtotalCents + shippingCents;

  if (!isReady) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="h-8 w-56 animate-pulse rounded-lg bg-ink-200" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center sm:px-6">
        <h1 className="text-2xl font-bold text-ink-900">Nada para finalizar</h1>
        <p className="mt-2 text-sm text-ink-500">Seu carrinho está vazio.</p>
        <Link
          href="/produtos"
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function placeOrder() {
    setError("");
    if (!form.email.trim() || !form.shippingName.trim() || !form.shippingAddress.trim() || !form.shippingCity.trim() || !form.shippingZip.trim()) {
      setError("Preencha todos os campos de entrega.");
      return;
    }
    setPlacing(true);
    const result = await checkoutAction({
      lines: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        priceCents: i.priceCents,
        quantity: i.quantity,
      })),
      email: form.email,
      shippingName: form.shippingName,
      shippingAddress: form.shippingAddress,
      shippingCity: form.shippingCity,
      shippingZip: form.shippingZip,
      shippingCountry: "Brasil",
    });
    setPlacing(false);
    if (!result.ok) {
      setError(result.error);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    clear();
    window.location.href = `/pedido/${result.orderId}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 animate-fade-up">
      <Link href="/carrinho" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-700">
        ← Voltar ao carrinho
      </Link>
      <h1 className="text-3xl font-bold tracking-tight text-ink-900">Finalizar compra</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-ink-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
              <Truck className="size-5 text-brand-600" /> Dados de entrega
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="E-mail" className="sm:col-span-2">
                <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="seu@email.com" required />
              </Field>
              <Field label="Nome completo" className="sm:col-span-2">
                <Input value={form.shippingName} onChange={(e) => set("shippingName", e.target.value)} placeholder="Seu nome" required />
              </Field>
              <Field label="Endereço" className="sm:col-span-2">
                <Input value={form.shippingAddress} onChange={(e) => set("shippingAddress", e.target.value)} placeholder="Rua, número, complemento" required />
              </Field>
              <Field label="Cidade">
                <Input value={form.shippingCity} onChange={(e) => set("shippingCity", e.target.value)} placeholder="São Paulo" required />
              </Field>
              <Field label="CEP">
                <Input value={form.shippingZip} onChange={(e) => set("shippingZip", e.target.value)} placeholder="01310-100" required />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-ink-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink-900">
              <CreditCard className="size-5 text-brand-600" /> Pagamento
            </h2>
            <p className="mt-1 text-xs text-ink-400">
              Ambiente de demonstração — nenhum valor real será cobrado.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-4">
              <Field label="Número do cartão" className="sm:col-span-4">
                <Input value={form.cardNumber} onChange={(e) => set("cardNumber", e.target.value)} placeholder="0000 0000 0000 0000" inputMode="numeric" />
              </Field>
              <Field label="Validade" className="sm:col-span-2">
                <Input value={form.cardExpiry} onChange={(e) => set("cardExpiry", e.target.value)} placeholder="MM/AA" />
              </Field>
              <Field label="CVV" className="sm:col-span-2">
                <Input value={form.cardCvv} onChange={(e) => set("cardCvv", e.target.value)} placeholder="123" inputMode="numeric" />
              </Field>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-ink-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-bold text-ink-900">Seu pedido</h2>
          <ul className="mt-5 space-y-4">
            {items.map((item) => (
              <li key={item.productId} className="flex gap-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-ink-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image || "/products/default.svg"} alt={item.name} className="size-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/produtos/${item.slug}`} className="truncate text-sm font-medium text-ink-900 hover:text-brand-700" />
                  </div>
                  <div className="text-xs text-ink-500">Qty: {item.quantity}</div>
                </div>
                <div className="text-sm font-semibold text-ink-900">
                  {money(item.priceCents * item.quantity)}
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2.5 border-t border-ink-200 pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="font-medium">{money(subtotalCents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Frete</dt>
              <dd className="font-medium">{shippingCents === 0 ? <span className="text-brand-700">Grátis</span> : money(shippingCents)}</dd>
            </div>
            <div className="flex justify-between border-t border-ink-200 pt-3 text-base">
              <dt className="font-semibold">Total</dt>
              <dd className="font-bold">{money(total)}</dd>
            </div>
          </dl>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
              {error}
            </div>
          )}

          <Button
            onClick={placeOrder}
            loading={placing}
            size="lg"
            className="mt-5 w-full"
            icon={<Lock className="size-4" />}
          >
            {placing ? "Processando..." : `Pagar ${money(total)}`}
          </Button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-400">
            <Lock className="size-3" /> Pagamento seguro e criptografado
          </p>
        </aside>
      </div>
    </div>
  );
}
