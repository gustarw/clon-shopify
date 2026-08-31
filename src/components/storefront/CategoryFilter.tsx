import Link from "next/link";
import { cn } from "@/components/ui/cn";
import type { Category } from "@/lib/repo/categories";

export function CategoryFilter({
  categories,
  activeId,
}: {
  categories: Category[];
  activeId?: number;
}) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-900">
        Categorias
      </h2>
      <ul className="space-y-1">
        <li>
          <Link
            href="/produtos"
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
              !activeId
                ? "bg-brand-50 font-semibold text-brand-700"
                : "text-ink-600 hover:bg-ink-100"
            )}
          >
            Todas
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.id}>
            <Link
              href={`/produtos?categoria=${c.slug}`}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                activeId === c.id
                  ? "bg-brand-50 font-semibold text-brand-700"
                  : "text-ink-600 hover:bg-ink-100"
              )}
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
