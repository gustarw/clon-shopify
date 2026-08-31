"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { registerAction } from "@/lib/actions";

export function RegisterForm() {
  const params = useSearchParams();
  const error = params.get("erro");
  const [show, setShow] = useState(false);
  const [pw, setPw] = useState("");

  function strengthOf(value: string): { label: string; color: string; pct: number } {
    if (!value) return { label: "", color: "bg-ink-200", pct: 0 };
    let score = 0;
    if (value.length >= 6) score++;
    if (value.length >= 10) score++;
    if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    const map = [
      { label: "Muito fraca", color: "bg-red-500", pct: 20 },
      { label: "Fraca", color: "bg-red-500", pct: 40 },
      { label: "Média", color: "bg-amber-500", pct: 60 },
      { label: "Boa", color: "bg-brand-500", pct: 80 },
      { label: "Forte", color: "bg-brand-600", pct: 100 },
    ];
    return map[Math.min(score, 4)];
  }

  const strength = strengthOf(pw);

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6 animate-fade-up">
      <div className="rounded-3xl border border-ink-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <UserPlus className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-ink-900">Criar conta</h1>
          <p className="mt-1.5 text-sm text-ink-500">Leva menos de um minuto</p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200">
            {error}
          </div>
        )}

        <form action={registerAction} className="mt-6 space-y-4">
          <Field label="Nome">
            <Input name="name" required placeholder="Seu nome" autoComplete="name" minLength={2} />
          </Field>

          <Field label="E-mail">
            <Input type="email" name="email" required placeholder="voce@email.com" autoComplete="email" />
          </Field>

          <Field label="Senha">
            <div className="relative">
              <Input
                type={show ? "text" : "password"}
                name="password"
                required
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                minLength={6}
                className="pr-11"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700"
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
              >
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {pw && (
              <div className="mt-2">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                  <div
                    className={`h-full rounded-full transition-all ${strength.color}`}
                    style={{ width: `${strength.pct}%` }}
                  />
                </div>
                <span className="mt-1 block text-xs text-ink-500">Força: {strength.label}</span>
              </div>
            )}
          </Field>

          <Field label="Confirmar senha">
            <Input
              type={show ? "text" : "password"}
              name="password2"
              required
              placeholder="Repita a senha"
              autoComplete="new-password"
              minLength={6}
            />
          </Field>

          <Button type="submit" size="lg" className="w-full">
            Criar minha conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-brand-700 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
