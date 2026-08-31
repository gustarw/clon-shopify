import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/components/ui/cn";

type Params = Record<string, string | undefined>;

function buildHref(base: string, page: number, params: Params): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  sp.set("pagina", String(page));
  return `${base}?${sp.toString()}`;
}

/** Page windows of 1 with ellipsis so long ranges stay compact. */
function range(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "...")[] = [1];
  const lo = Math.max(2, current - 1);
  const hi = Math.min(total - 1, current + 1);
  if (lo > 2) out.push("...");
  for (let i = lo; i <= hi; i++) out.push(i);
  if (hi < total - 1) out.push("...");
  out.push(total);
  return out;
}

export function Pagination({
  current,
  total,
  base,
  params,
}: {
  current: number;
  total: number;
  base: string;
  params: Params;
}) {
  const pages = range(current, total);
  const linkBase =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors";

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Paginação">
      {current > 1 ? (
        <Link
          href={buildHref(base, current - 1, params)}
          className={cn(linkBase, "border border-ink-300 bg-white text-ink-600 hover:bg-ink-50")}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span
          className={cn(linkBase, "border border-ink-200 bg-white text-ink-300")}
          aria-hidden
          style={{ pointerEvents: "none" }}
        >
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`e${i}`} className="inline-flex h-10 items-center px-1 text-sm text-ink-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(base, p, params)}
            aria-current={p === current ? "page" : undefined}
            className={cn(
              linkBase,
              p === current
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-ink-300 bg-white text-ink-600 hover:bg-ink-50"
            )}
          >
            {p}
          </Link>
        )
      )}

      {current < total ? (
        <Link
          href={buildHref(base, current + 1, params)}
          className={cn(linkBase, "border border-ink-300 bg-white text-ink-600 hover:bg-ink-50")}
          aria-label="Próxima página"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span
          className={cn(linkBase, "border border-ink-200 bg-white text-ink-300")}
          aria-hidden
          style={{ pointerEvents: "none" }}
        >
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
