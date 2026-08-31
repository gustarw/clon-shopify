"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Rating } from "./Rating";
import { cn } from "@/components/ui/cn";
import { submitReviewAction } from "@/lib/actions";
import type { ProductRating, Review } from "@/lib/repo/reviews";

const TONOS: Record<number, string> = {
  5: "Excelente",
  4: "Muito bom",
  3: "Bom",
  2: "Regular",
  1: "Ruim",
};

function formatDate(iso: string): string {
  try {
    return new Date(iso + (iso.endsWith("Z") ? "" : "Z")).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function ReviewSection({
  productId,
  rating,
  reviews,
}: {
  productId: number;
  rating: ProductRating;
  reviews: Review[];
}) {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [stars, setStars] = useState(5);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!comment.trim()) {
      setError("Conte o que achou do produto.");
      return;
    }
    setSending(true);
    try {
      const result = await submitReviewAction({
        productId,
        authorName: name,
        rating: stars,
        comment,
      });
      if (!result.ok) {
        setError(result.error || "Não foi possível enviar sua avaliação.");
        return;
      }
      setComment("");
      setName("");
      setStars(5);
      window.location.reload();
    } catch {
      setError("Não foi possível enviar sua avaliação. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  const total = rating.count || 0;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-ink-900">Avaliações dos clientes</h2>

        {total > 0 ? (
          <div className="mt-5 flex items-center gap-6 rounded-2xl border border-ink-200 bg-white p-6">
            <div className="text-center">
              <div className="text-5xl font-extrabold text-ink-900">{rating.average.toFixed(1)}</div>
              <Rating value={rating.average} size={14} className="mt-2 justify-center" />
              <div className="mt-1.5 text-xs text-ink-500">{total} avaliações</div>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((s) => {
                const count = rating.histogram[s - 1];
                const pct = total ? (count / total) * 100 : 0;
                return (
                  <div key={s} className="flex items-center gap-3 text-xs">
                    <span className="flex w-8 items-center gap-1 text-ink-600">
                      {s} <Star className="size-3 text-amber-400" fill="currentColor" strokeWidth={0} />
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-ink-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-5">
          {reviews.length === 0 && (
            <div className="rounded-2xl border border-dashed border-ink-300 bg-white p-10 text-center">
              <p className="text-sm text-ink-500">
                Ainda não há avaliações. Seja a primeira pessoa a compartilhar sua opinião!
              </p>
            </div>
          )}
          {reviews.map((r) => (
            <article key={r.id} className="rounded-2xl border border-ink-200 bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                      {r.author_name.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-ink-900">{r.author_name}</div>
                      <div className="text-xs text-ink-400">{formatDate(r.created_at)}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Rating value={r.rating} size={13} />
                    <span className="text-xs font-medium text-ink-500">{TONOS[r.rating]}</span>
                  </div>
                </div>
              </div>
              {r.comment && (
                <p className="mt-3 text-sm leading-relaxed text-ink-600 whitespace-pre-line">
                  {r.comment}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-ink-200 bg-white p-6 lg:sticky lg:top-24">
        <h3 className="text-lg font-bold text-ink-900">Deixe sua avaliação</h3>
        <p className="mt-1 text-sm text-ink-500">Compartilhe sua experiência com outros compradores.</p>

        <form onSubmit={submit} className="mt-5 space-y-4">
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-700">Sua nota</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStars(s)}
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  className="p-0.5"
                  aria-label={`${s} estrela${s > 1 ? "s" : ""}`}
                >
                  <Star
                    className={cn(
                      "size-7 transition-colors",
                      (hover || stars) >= s ? "text-amber-400" : "text-ink-200"
                    )}
                    fill="currentColor"
                    strokeWidth={0}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-medium text-ink-500">{TONOS[hover || stars]}</span>
            </div>
          </div>

          <Field label="Seu nome">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como deseja ser chamado"
              maxLength={60}
            />
          </Field>

          <Field label="Comentário" error={error || undefined}>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte como foi sua experiência com o produto..."
              rows={4}
              maxLength={600}
              invalid={!!error}
            />
          </Field>

          <Button type="submit" loading={sending} className="w-full">
            {sending ? "Enviando..." : "Enviar avaliação"}
          </Button>
        </form>
      </aside>
    </div>
  );
}
