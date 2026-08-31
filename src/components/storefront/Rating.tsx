import { Star } from "lucide-react";
import { cn } from "@/components/ui/cn";

/** Renders a row of 5 stars, filled up to `value` (0–5, fractional supported). */
export function Rating({
  value,
  size = 16,
  className,
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className={cn("flex items-center gap-0.5", className)} aria-label={`${v.toFixed(1)} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, v - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star style={{ width: size, height: size }} className="text-ink-200" fill="currentColor" strokeWidth={0} />
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star style={{ width: size, height: size }} className="text-amber-400" fill="currentColor" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </div>
  );
}
