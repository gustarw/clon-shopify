"use client";

import type { ReactNode } from "react";
import { Chip } from "@heroui/react";
import { cn } from "./cn";


export interface BadgeProps {
  children: ReactNode;
  tone?: "gray" | "green" | "amber" | "red" | "blue" | "purple";
  className?: string;
  variant?: "primary" | "secondary" | "soft" | "tertiary" | "outline";
}

const colorMap: Record<NonNullable<BadgeProps["tone"]>, "default" | "success" | "warning" | "danger" | "accent"> = {
  gray: "default",
  green: "success",
  amber: "warning",
  red: "danger",
  blue: "accent",
  purple: "accent",
};

export function Badge({ children, tone = "gray", className, variant = "soft" }: BadgeProps) {
  const chipVariant = variant === "outline" ? "secondary" : variant;
  return (
    <Chip
      color={colorMap[tone] || "default"}
      variant={chipVariant}
      className={cn("text-[11px] font-semibold tracking-tight shadow-2xs", className)}
    >
      {children}
    </Chip>
  );
}
