import React from "react";
import type { ThemeConfig } from "@/lib/repo/theme";

interface StorefrontThemeStylesProps {
  theme: ThemeConfig;
  children: React.ReactNode;
}

export function StorefrontThemeStyles({ theme, children }: StorefrontThemeStylesProps) {
  const headingFontFamily = theme.typography?.headingFont
    ? `"${theme.typography.headingFont}", sans-serif`
    : `"Plus Jakarta Sans", sans-serif`;

  const bodyFontFamily = theme.typography?.bodyFont
    ? `"${theme.typography.bodyFont}", sans-serif`
    : `"Inter", sans-serif`;

  const isDarkMode =
    theme.colors.background.toLowerCase() === "#09090b" ||
    theme.colors.background.toLowerCase() === "#000000" ||
    theme.colors.background.toLowerCase() === "#18181b";

  return (
    <div
      id="storefront-root"
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.textMain,
        fontFamily: bodyFontFamily,
      }}
    >
      {/* Dynamic Theme CSS Variables & Custom CSS Injection */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-brand-50: ${theme.colors.primary}10;
              --color-brand-100: ${theme.colors.primary}20;
              --color-brand-200: ${theme.colors.primary}35;
              --color-brand-500: ${theme.colors.primary};
              --color-brand-600: ${theme.colors.primary};
              --color-brand-700: ${theme.colors.primaryHover || theme.colors.primary};
              --color-theme-primary: ${theme.colors.primary};
              --color-theme-primary-hover: ${theme.colors.primaryHover || theme.colors.primary};
              --color-theme-accent: ${theme.colors.accent};
              --color-theme-background: ${theme.colors.background};
              --color-theme-surface: ${theme.colors.surface};
              --color-theme-text-main: ${theme.colors.textMain};
              --color-theme-text-muted: ${theme.colors.textMuted};
              --color-theme-border: ${theme.colors.border};
              --font-heading: ${headingFontFamily};
              --font-body: ${bodyFontFamily};
            }
            ${isDarkMode ? `
              #storefront-root .bg-white {
                background-color: ${theme.colors.surface} !important;
                color: ${theme.colors.textMain} !important;
              }
              #storefront-root .bg-ink-50, #storefront-root .bg-ink-100 {
                background-color: rgba(255, 255, 255, 0.05) !important;
              }
              #storefront-root .border-ink-100, #storefront-root .border-ink-200, #storefront-root .border-ink-300 {
                border-color: ${theme.colors.border} !important;
              }
              #storefront-root .text-ink-900, #storefront-root .text-ink-800, #storefront-root .text-ink-700 {
                color: ${theme.colors.textMain} !important;
              }
              #storefront-root .text-ink-600, #storefront-root .text-ink-500, #storefront-root .text-ink-400 {
                color: ${theme.colors.textMuted} !important;
              }
            ` : ""}
            ${theme.customCss || ""}
          `,
        }}
      />
      {children}
    </div>
  );
}
