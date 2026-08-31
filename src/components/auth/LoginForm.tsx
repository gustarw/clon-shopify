"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, ShieldAlert, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { loginAction } from "@/lib/actions";

export function LoginForm() {
  const params = useSearchParams();
  const error = params.get("erro");
  const [show, setShow] = useState(false);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 animate-fade-up">
      <div className="rounded-3xl border border-ink-200 bg-white p-8 shadow-sm transition-all">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
            <ShoppingBag className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900">Entrar na sua conta</h1>
          <p className="mt-1.5 text-sm text-ink-500">Acesse para acompanhar seus pedidos e compras</p>
        </div>

        {error && (
          <div className="mt-6 rounded-xl bg-red-50 p-3.5 text-sm font-medium text-red-700 ring-1 ring-red-200 flex items-center gap-2">
            <ShieldAlert className="size-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        <form action={loginAction} className="mt-6 space-y-4">
          <Field label="E-mail">
            <Input
              type="email"
              name="email"
              required
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </Field>

          <Field label="Senha">
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                name="password"
                required
                placeholder="Sua senha"
                autoComplete="current-password"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </Field>

          <Button type="submit" size="lg" className="w-full shadow-sm hover:shadow transition-all">
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Não tem conta?{" "}
          <Link href="/registrar" className="font-semibold text-brand-700 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
