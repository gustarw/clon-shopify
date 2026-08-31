import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center animate-fade-up">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-ink-100 text-ink-400">
        <Compass className="size-8" />
      </span>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink-900">Página não encontrada</h1>
      <p className="mt-2 text-sm text-ink-500">
        O endereço que você acessou não existe ou foi movido. Que tal voltar para a loja?
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Voltar ao início
      </Link>
    </div>
  );
}
