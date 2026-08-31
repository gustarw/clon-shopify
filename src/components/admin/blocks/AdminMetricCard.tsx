"use client";

import React, { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/components/ui/cn";

export interface AdminMetricCardProps {
  label: string;
  value: string;
  previousValue?: string;
  trendPercentage?: number;
  trendLabel?: string;
  icon?: ReactNode;
  hint?: string;
  sparklineData?: number[];
  className?: string;
}

export function AdminMetricCard({
  label,
  value,
  previousValue,
  trendPercentage,
  trendLabel = "vs período anterior",
  icon,
  hint,
  className,
}: AdminMetricCardProps) {
  const isPositive = trendPercentage != null && trendPercentage >= 0;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-[#ebebeb] bg-[#ffffff] p-5 sm:p-6 transition-all duration-200 shadow-2xs hover:border-[#dddddd]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 pb-3">
        <span className="text-[14px] font-medium text-[#6a6a6a] truncate">{label}</span>
        {icon && (
          <div className="flex size-9 items-center justify-center rounded-full bg-[#f7f7f7] text-[#222222] shrink-0 border border-[#ebebeb]">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[28px] sm:text-[32px] font-bold tracking-tight text-[#222222] tabular-nums leading-tight">
            {value}
          </span>
          {trendPercentage != null && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-semibold py-0.5 px-2.5 rounded-full border",
                isPositive
                  ? "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]"
                  : "bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]"
              )}
            >
              {isPositive ? (
                <ArrowUpRight className="size-3 stroke-[2.5]" />
              ) : (
                <ArrowDownRight className="size-3 stroke-[2.5]" />
              )}
              <span>{Math.abs(trendPercentage)}%</span>
            </span>
          )}
        </div>

        {(previousValue || hint) && (
          <div className="flex items-center gap-1.5 text-[12px] text-[#6a6a6a] font-normal">
            {previousValue && (
              <span>
                Era <strong className="text-[#222222] font-semibold">{previousValue}</strong> {trendLabel}
              </span>
            )}
            {hint && <span>{hint}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
