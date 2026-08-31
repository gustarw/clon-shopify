"use client";

import React, { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export interface AdminMetricsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function AdminMetricsGrid({
  children,
  columns = 4,
  className,
}: AdminMetricsGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div className={cn("grid gap-4", gridCols, className)}>
      {children}
    </div>
  );
}
