"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: "default" | "success" | "warning" | "danger" | "accent";
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children?: ReactNode;
}

export function AdminPageHeader({
  title,
  subtitle,
  badge,
  badgeColor = "accent",
  breadcrumbs,
  actions,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-xs text-[#6a6a6a] font-normal pb-1">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={idx}>
                  {crumb.href && !isLast ? (
                    <Link
                      href={crumb.href}
                      className="hover:text-[#222222] transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className={isLast ? "text-[#222222] font-medium" : ""}>
                      {crumb.label}
                    </span>
                  )}
                  {!isLast && <ChevronRight className="size-3 text-[#c1c1c1] stroke-[2]" />}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <h1 className="text-[26px] sm:text-[28px] font-bold tracking-tight text-[#222222] leading-tight">
            {title}
          </h1>
          {badge && (
            badgeColor === "accent" || badgeColor === "success" ? (
              <span className="bg-[#ff385c] text-white text-[11px] font-semibold py-0.5 px-3 rounded-full tracking-wide">
                {badge}
              </span>
            ) : (
              <span className="bg-[#ffffff] text-[#222222] border border-[#ebebeb] text-[11px] font-medium py-0.5 px-3 rounded-full shadow-2xs">
                {badge}
              </span>
            )
          )}
        </div>

        {subtitle && (
          <p className="text-[14px] text-[#6a6a6a] font-normal leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
        </div>
      )}

      {children}
    </div>
  );
}
