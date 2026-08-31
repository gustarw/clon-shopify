"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { cn } from "@/components/ui/cn";

export interface AdminEmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export function AdminEmptyState({
  icon,
  title,
  description,
  actionText,
  actionHref,
  className,
}: AdminEmptyStateProps) {
  return (
    <div className={cn("overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ffffff] py-16 px-6 text-center shadow-2xs", className)}>
      <div className="flex flex-col items-center max-w-sm mx-auto">
        <span className="flex size-14 items-center justify-center rounded-full bg-[#f7f7f7] border border-[#ebebeb] text-[#222222]">
          {icon || <Package className="size-6 stroke-[1.75]" />}
        </span>
        <h3 className="mt-4 text-base sm:text-lg font-bold text-[#222222]">{title}</h3>

        <p className="mt-1 text-[14px] text-[#6a6a6a] leading-relaxed">
          {description}
        </p>

        {actionText && actionHref && (
          <div className="mt-5">
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center rounded-full bg-[#222222] text-[#ffffff] px-5 py-2.5 text-xs font-semibold hover:bg-[#000000] active:scale-[0.98] transition-all shadow-xs"
            >
              {actionText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
