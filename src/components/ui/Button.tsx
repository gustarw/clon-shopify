"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Button as HeroButton } from "@heroui/react";
import { cn } from "./cn";


type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantMap: Record<Variant, "primary" | "secondary" | "outline" | "ghost" | "danger"> = {
  primary: "primary",
  secondary: "secondary",
  outline: "outline",
  ghost: "ghost",
  danger: "danger",
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onFocus" | "onBlur" | "onClick" | "value"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
  value?: string;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  className,
  children,
  disabled,
  type = "button",
  onClick,
  ...props
}: ButtonProps) {
  return (
    <HeroButton
      type={type}
      variant={variantMap[variant] || "primary"}
      size={size}
      isPending={loading}
      isDisabled={disabled}
      onPress={onClick}
      className={cn(
        "select-none transition-all duration-150 active:scale-[0.98]",
        variant === "primary" && "bg-brand-600 text-white hover:bg-brand-700",
        variant === "secondary" && "bg-ink-900 text-white hover:bg-ink-800",
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </HeroButton>
  );
}
