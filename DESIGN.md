# Design System: Shopify Polaris

## 1. Visual Theme & Philosophy
- **Identity:** Authentic Shopify Admin (Polaris v12+).
- **Core Aesthetic:** Clean, utilitarian, merchant-focused, restrained high craft. High information density without visual clutter.
- **Elevation:** Flat surfaces with crisp 1px borders (`#e1e3e5` / `#d2d5d8`) and subtle 1px layered box shadows (`0 1px 2px rgba(0,0,0,0.05)`).

## 2. Color Palette & Semantic Tokens

### Official Shopify Brand Colors
- **Shopify Classic Green (Verde Característico):** `#96bf48`
- **Shopify Blue (Azul):** `#479ccf`
- **Shopify Dark Slate / Obsidian (Cinza Escuro):** `#2d3538`
- **Shopify Light Gray Canvas (Cinza Claro de Fundo):** `#f5f5f5` / `#f2f7fa`
- **Shopify Muted Ink (Cinza Escuro de Texto):** `#666666`

### Primary & Action (Polaris Admin)
- `brand-50`: `#f1f8f5` (Light tint)
- `brand-100`: `#ddf1e8`
- `brand-200`: `#bee2d4`
- `brand-classic`: `#96bf48` (Shopify Signature Light Green)
- `brand-500`: `#008060` (Official Shopify Polaris Admin Green)
- `brand-600`: `#008060`
- `brand-700`: `#006e52` (Hover)
- `brand-800`: `#005842` (Active / Pressed)
- `brand-900`: `#004c3f`
- `brand-blue`: `#479ccf`

### Surfaces & Backgrounds
- `bg-app`: `#f2f7fa` / `#f5f5f5` (Canvas gray / neutral light)
- `bg-surface`: `#ffffff` (Card & modal background)
- `bg-surface-secondary`: `#f6f6f7`
- `bg-surface-subdued`: `#fafbfb`
- `bg-sidebar`: `#ebebeb`
- `bg-topbar`: `#2d3538` / `#1a1a1a` (Shopify Dark Slate Topbar)
- `bg-topbar-search`: `#303030`

### Neutral / Ink Palette
- `ink-950`: `#0d0e0f`
- `ink-900`: `#202223` (Polaris primary text)
- `ink-800`: `#2d3538` (Dark slate)
- `ink-700`: `#4a4f54`
- `ink-600`: `#666666` (Shopify body muted gray)
- `ink-500`: `#6d7175` (Subdued / Secondary text)
- `ink-400`: `#8c9196` (Placeholder / Muted icons)
- `ink-300`: `#cfd2d6` (Borders / Dividers)
- `ink-200`: `#e1e3e5` (Card borders)
- `ink-100`: `#f2f7fa` (Light dividers)
- `ink-50`: `#f5f5f5` (Surface tint)

### Feedback / Status Tones
- **Success (Green):** bg `#e3f1df`, border `#cbe8ba`, text `#108043`
- **Attention (Amber):** bg `#fcf1cd`, border `#f9dea8`, text `#9c6f19`
- **Critical (Red):** bg `#fbeae5`, border `#f9d0c4`, text `#bf0711`
- **Info (Blue):** bg `#e0f2fe`, border `#479ccf`, text `#479ccf`
- **Neutral (Gray):** bg `#f5f5f5`, border `#e1e3e5`, text `#666666`

## 3. Typography
- Font Family: `Inter, -apple-system, BlinkMacSystemFont, "San Francisco", "Segoe UI", Roboto, sans-serif`
- Headings: `font-bold tracking-tight text-[#202223]`
- Numbers & Monetary Values: `font-semibold tabular-nums text-[#202223]`
- Subtitles & Labels: `text-xs text-[#6d7175]`
- Section Badges: `text-[10px] font-bold uppercase tracking-wider text-[#6d7175]`

## 4. Components & Interactive States
- **Top Bar:** Fixed, `#1a1a1a`, border `#242424`, white logo badge `#008060`.
- **Left Sidebar:** `#ebebeb`, border right `#d4d4d4`, active item `#ffffff` with 1px border `#e1e3e5` & shadow `0 1px 2px rgba(0,0,0,0.06)`.
- **Cards:** `#ffffff`, border `1px solid #e1e3e5`, border radius `12px` or `16px`.
- **Buttons:**
  - Primary: `#008060` with hover `#006e52`, active scale `0.98`.
  - Secondary: `#ffffff` with border `#c9cccf`, hover `#f6f6f7`.
- **Badges:** Pill shape, 20px height, text 11px font-weight 600.
