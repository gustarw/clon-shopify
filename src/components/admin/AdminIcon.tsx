"use client";

import React from "react";
import { Icon, IconProps } from "@iconify/react";
import { cn } from "@/components/ui/cn";
import { SOLAR_ICONS } from "@/lib/solar-icons";

export { SOLAR_ICONS };

export interface AdminIconProps extends Omit<IconProps, "icon"> {
  name?: string;
  className?: string;
  size?: number | string;
}

/**
 * Solar Icon wrapper for Shopify Admin Panel - Linear / Outline (Sem fundo/preenchimento)
 */
export function AdminIcon({ name, className, size = 18, ...props }: AdminIconProps) {
  if (!name || typeof name !== "string") {
    return null;
  }

  const iconName = name.startsWith("solar:") ? name : `solar:${name}`;

  return (
    <Icon
      icon={iconName}
      width={size}
      height={size}
      className={cn("inline-block shrink-0", className)}
      {...props}
    />
  );
}
