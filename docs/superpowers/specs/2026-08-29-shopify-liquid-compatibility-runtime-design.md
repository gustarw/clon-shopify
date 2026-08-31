# Shopify Liquid Compatibility Runtime Design

**Date:** 2026-08-29
**Status:** Approved architecture, pending implementation plan
**Project:** SensaShop (`clon-shopify`)

## 1. Purpose

Replace the current lossy Shopify theme converter with a compatibility runtime that preserves and renders an imported Shopify theme's original Liquid, JSON templates, section schemas, snippets, locales, CSS, JavaScript, fonts, and bundled media against SensaShop commerce data.

The primary reference theme is **Tema Vision Nichada 5.0** by Marcos & Sabino. The implementation must be generic enough to support other Shopify Online Store 2.0 themes and must retain the existing React-native SensaShop themes as a legacy renderer mode.

## 2. Audit Baseline

The Vision ZIP and extracted directory contain 186 byte-identical files:

- 48 assets
- 2 configuration files
- 1 Liquid layout
- 12 locales
- 62 Liquid sections
- 36 Liquid snippets
- 25 template files, including 24 JSON templates

The current importer processes only the 14 section instances in `templates/index.json`. It imports no assets, no CSS, and no Liquid section source because its path checks require `"/assets/"` and `"/sections/"` while standard Shopify archives contain root-relative paths such as `assets/theme.min.css` and `sections/slideshow.liquid`.

The current conversion also:

- collapses arbitrary Shopify sections into 15 SensaShop section types;
- substitutes invented copy, images, menu items, colors, and contact details;
- renders unknown Liquid with mock data and strips Liquid syntax after failures;
- ignores non-home templates;
- truncates concatenated CSS to 50,000 characters;
- does not resolve snippets or Shopify section tags from the imported bundle;
- does not provide the Shopify AJAX APIs required by the original JavaScript;
- stores only the reduced `ThemeConfig`, losing the original source bundle.

These behaviors are incompatible with source fidelity and will not be extended as the primary import strategy.

## 3. Goals

### 3.1 Source fidelity

- Preserve every accepted source file from the uploaded ZIP without rewriting its stored canonical copy.
- Preserve JSON object ordering where it affects template and block rendering.
- Render the original layout, template, section, snippet, and locale graph.
- Serve original CSS, JavaScript, fonts, and bundled images from theme-scoped URLs.
- Preserve enabled/disabled section and block state.
- Preserve global and per-section settings, including unknown settings.

### 3.2 Commerce integration

- Supply Shopify-compatible Liquid objects backed by SensaShop products, collections, cart, customer, page, blog, search, and shop data.
- Provide browser endpoints compatible with the subset of Shopify AJAX APIs used by the active theme.
- Keep cart state consistent between Liquid-rendered markup, original theme JavaScript, React components, checkout, and server-side requests.
- Resolve Shopify routes to existing SensaShop routes without exposing Shopify URLs to shoppers.

### 3.3 Safety and operability

- Treat uploaded themes as untrusted code.
- Reject path traversal, oversized archives, symlinks, unsupported executable payloads, and resource-exhaustion archives.
- Block known licensing callbacks, anti-debugging scripts, right-click blockers, content-selection blockers, and unapproved third-party scripts.
- Produce actionable diagnostics instead of silently inventing fallback content.
- Work with local filesystem storage during development and Supabase-backed persistent storage in deployed environments.

### 3.4 Backward compatibility

- Keep existing React-native themes functional.
- Allow a merchant to activate, deactivate, duplicate, and delete either renderer mode through the same theme library.
- Do not require existing stores to migrate their active theme.

## 4. Non-goals

- Emulating Shopify checkout. SensaShop checkout remains authoritative.
- Emulating Shopify Admin APIs, app blocks, or arbitrary installed Shopify apps.
- Guaranteeing execution of every third-party script embedded by any theme.
- Downloading private Shopify CDN assets without authorization.
- Compiling arbitrary Liquid into React source code.
- Making theme source editable as free-form code in the first release.

## 5. Architecture Decision

Use two renderer modes behind a shared theme registry:

1. `react_native`: the existing `ThemeConfig` and `DynamicStorefrontRenderer` path.
2. `shopify_liquid`: a preserved theme bundle rendered by a Shopify compatibility runtime.

An imported Shopify ZIP creates a `shopify_liquid` theme. The importer does not convert its sections into React components. It creates a validated bundle, a searchable manifest, normalized configuration overlays, security decisions, and diagnostics.

The original source remains immutable. Merchant edits are stored separately as overlays so an import can be audited, reprocessed by a newer compatibility engine, or restored to its original state.

## 6. Major Components

### 6.1 Safe archive reader

Responsibilities:

- validate extension, MIME signature, compressed size, expanded size, file count, and per-file size;
- normalize paths to POSIX separators;
- reject absolute paths, `..` traversal, null bytes, symlinks, and duplicate normalized paths;
- detect a single optional root directory and strip it consistently;
- require a recognizable Shopify theme structure;
- compute SHA-256 for the archive and every file;
- classify files by role without relying on a leading slash;
- return structured validation errors.

Initial limits:

- ZIP upload: 50 MiB compressed;
- expanded bundle: 250 MiB;
- individual file: 25 MiB;
- file count: 5,000;
- Liquid recursion depth at render time: 50;
- rendered HTML per request: 5 MiB.

Limits are centralized configuration values and are enforced before persistence.

### 6.2 Theme bundle storage

Define a `ThemeBundleStorage` interface with local and Supabase implementations.

Logical key layout:

```text
themes/{themeId}/
  source/theme.zip
  files/{canonicalShopifyPath}
  manifest.json
  diagnostics.json
```

The local adapter stores files outside source-controlled directories and exposes them through an authenticated theme-asset route during development. The Supabase adapter stores private source and manifests in a private bucket and public runtime assets in a public or signed delivery path, according to asset type.

Asset URLs are always theme-scoped:

```text
/theme-assets/{themeId}/{assetPath}
```

No imported asset is written to the shared `/uploads/themes/assets/` namespace.

### 6.3 Theme registry

The registry stores metadata separately from bundle files.

```ts
type ThemeRendererMode = "react_native" | "shopify_liquid";

interface InstalledThemeRecord {
  id: string;
  name: string;
  version: string;
  author: string;
  rendererMode: ThemeRendererMode;
  status: "processing" | "ready" | "ready_with_warnings" | "invalid";
  sourceSha256?: string;
  storageKey?: string;
  compatibilityVersion?: string;
  configurationOverlay: Record<string, unknown>;
  diagnosticsSummary: ThemeDiagnosticsSummary;
  createdAt: string;
  updatedAt: string;
}
```

Only a `ready` or `ready_with_warnings` theme can become active. Theme activation is transactional: bundle availability and manifest compatibility are checked before the active theme pointer changes.

### 6.4 Bundle manifest

The importer parses and indexes:

- theme metadata from `settings_schema.json`;
- global settings and static sections from `settings_data.json`;
- all JSON and Liquid templates;
- all Liquid sections and embedded `{% schema %}` JSON;
- section groups where present;
- all snippets and their static render/include dependencies;
- all locales with fallback to `en.default.json`;
- all asset references;
- all `shopify://` references;
- external script and stylesheet origins;
- Shopify objects, tags, filters, and AJAX endpoints observed in source.

The manifest records dependency edges and unresolved references. A missing required file is an error. A missing merchant-content image or unsupported optional integration is a warning.

### 6.5 Liquid runtime

Build on LiquidJS with a bundle-backed filesystem loader and a compatibility extension set.

The loader resolves:

- `render` and legacy `include` from `snippets/`;
- `section` from `sections/`;
- JSON template section types from `sections/`;
- `layout` and `content_for_layout`;
- `content_for_header` from a controlled SensaShop-generated fragment;
- `{% schema %}`, `{% stylesheet %}`, and `{% javascript %}` without emitting schema JSON into HTML;
- locale lookups through the selected locale and default locale.

Compatibility extensions are implemented from observed theme requirements and reusable Shopify behavior. Unsupported tags or filters generate named diagnostics containing file, line, construct, and request template. They do not trigger silent Liquid stripping or invented markup.

The runtime caches parsed templates by `themeId`, compatibility version, canonical file path, and file SHA-256. Request data is never cached in parsed templates.

### 6.6 Rendering pipeline

For every storefront request:

1. Load the active theme registry record.
2. Select `react_native` or `shopify_liquid` rendering.
3. Resolve the Shopify template name from the SensaShop route and resource.
4. Load the JSON or Liquid template.
5. Merge source settings with the merchant configuration overlay.
6. Build a request-scoped Shopify-compatible context.
7. Render ordered, enabled sections and blocks.
8. Insert rendered template content into the selected layout.
9. rewrite internal Shopify routes and approved asset references;
10. return HTML with diagnostics correlation and cache metadata.

The first implementation supports these mappings:

| SensaShop request | Shopify template |
| --- | --- |
| `/` | `index` |
| `/produtos/[slug]` | product-selected alternate or `product` |
| `/produtos` and category/collection views | `collection` or `list-collections` |
| `/carrinho` | `cart` |
| search requests | `search` |
| content pages | selected `page.*` or `page` |
| `/conta` and order routes | matching `customers/*` template |
| missing route | `404` |

If a requested alternate template does not exist, resolution falls back to the base resource template. It never falls back to the home template.

### 6.7 Shopify object adapters

Adapters expose stable, serialization-safe Liquid drops rather than raw database rows.

Required initial objects:

- `shop`, `request`, `routes`, `settings`, `localization`;
- `product`, variants, options, media, featured media, availability, prices, URLs, vendor, and tags;
- `collection`, products, filters, sorting, pagination, and image;
- `cart`, line items, totals, note, attributes, discounts, and item count;
- `customer`, addresses, orders, authentication state, and default address;
- `page`, `blog`, `article`, `search`, and pagination;
- common globals such as `page_title`, `page_description`, `canonical_url`, `template`, and `content_for_layout`.

Money values use integer minor units internally. Liquid money filters apply the store currency and locale consistently. Adapter URLs use SensaShop routes.

Unknown Shopify properties evaluate according to Liquid semantics but are counted in request diagnostics during development and compatibility tests.

### 6.8 Shopify-compatible browser APIs

The original Vision JavaScript requires at least:

- cart read;
- cart add;
- cart change;
- cart update;
- section fragment rendering;
- product JSON by handle;
- variant availability fragments;
- predictive search;
- product recommendations;
- search section rendering;
- shipping-rate requests where supported.

Compatibility routes accept and return the shapes used by Shopify themes while delegating to SensaShop domain services. They are not separate sources of truth.

The existing localStorage-only React cart is replaced by a shared cart service with a stable cart identifier. React `CartProvider`, Liquid requests, AJAX compatibility routes, cart page, and checkout all use this service. Client-side optimistic updates are permitted, but the server response is authoritative.

Shopify route names in `window.themeVariables.routes` point to these compatibility routes. The original theme event contract, including `cart:refresh`, `cart:updated`, `variant:changed`, and `variant:added`, is preserved where used.

### 6.9 Asset and content reference handling

`asset_url`, `stylesheet_tag`, `script_tag`, and related filters resolve only against the active theme bundle and include the theme ID.

`shopify://shop_images/...` represents store content rather than theme assets. Resolution order:

1. explicit merchant overlay mapping;
2. imported supplemental media pack;
3. authorized source-store/CDN import;
4. visible diagnostic placeholder with the missing filename.

The Vision reference bundle has eight unresolved store images. Import succeeds with warnings, lists each filename, and does not substitute unrelated stock photography.

### 6.10 Script and style security policy

Original theme CSS is served without concatenation or truncation. CSS Liquid assets are rendered with theme settings before delivery and cached by settings-overlay hash.

Bundled JavaScript is classified before activation:

- first-party theme behavior is allowed;
- external origins require an allowlist decision;
- licensing/verification callbacks are blocked;
- anti-debugging, right-click blocking, keyboard blocking, and content-selection blocking are removed from the executable delivery copy;
- the immutable source copy remains untouched for audit;
- inline code is protected by a per-response Content Security Policy nonce;
- uploaded themes cannot execute server-side JavaScript or access server filesystem APIs.

For Vision 5, the callback to the Sabino verification endpoint is blocked. jQuery, Ionicons, Font Awesome, and other external dependencies are either served from reviewed bundled/local copies or explicitly approved origins.

Sanitization decisions are recorded in the manifest with rule ID, source file, source span when available, and disposition.

### 6.11 Schema-driven theme editor

The editor reads `settings_schema.json` and section schemas directly. It supports all setting types observed in Vision:

- checkbox, text, textarea, richtext, liquid, HTML;
- color, range, select, radio;
- image picker, URL, video URL;
- product, collection, page, blog, and link list pickers;
- headers and paragraphs;
- font picker;
- blocks, block order, disabled state, limits, presets, and app-block placeholders.

Unsupported schema controls are rendered read-only with an explicit compatibility warning; their raw values remain preserved.

Editor changes update the configuration overlay, not the immutable source. Preview requests use a draft overlay scoped to the authenticated merchant session. Publishing updates the active overlay atomically.

### 6.12 Diagnostics

Diagnostics have severity `info`, `warning`, or `error` and stable codes. Every diagnostic includes the theme ID, canonical file when applicable, human-readable explanation, and remediation.

Required diagnostic categories:

- archive validation;
- malformed JSON or schema;
- missing dependencies;
- missing merchant media;
- unsupported Liquid constructs;
- unsupported Shopify objects or properties;
- blocked scripts or external origins;
- unsupported app blocks;
- render timeouts, output limits, and recursion limits;
- compatibility API mismatch.

The upload modal shows actual counts for preserved files, templates, sections, snippets, assets, warnings, and errors. It must not claim complete success when required runtime constructs failed.

## 7. Data Flow

### 7.1 Import

```text
Upload ZIP
  -> validate archive
  -> canonicalize paths
  -> hash source and files
  -> persist immutable bundle
  -> parse manifest and schemas
  -> classify scripts and references
  -> run compatibility preflight
  -> persist registry record and diagnostics
  -> allow activation only when renderable
```

### 7.2 Request rendering

```text
Storefront request
  -> resolve active theme and resource template
  -> load parsed Liquid graph
  -> load SensaShop resource data
  -> create Shopify-compatible drops
  -> merge settings overlay
  -> render sections and layout
  -> apply route and security rewrites
  -> return original-theme markup and assets
```

### 7.3 Browser interaction

```text
Original theme JavaScript
  -> Shopify-compatible AJAX endpoint
  -> SensaShop domain service
  -> authoritative state update
  -> Shopify-shaped response or section HTML
  -> original theme event and DOM update
```

## 8. Failure Behavior

- Invalid ZIP: reject before persistence and report all safely detectable validation errors.
- Malformed required configuration or template: mark the theme `invalid`; do not activate it.
- Unsupported optional construct: import with warnings and identify affected templates.
- Missing merchant image: render a labeled placeholder and retain the original reference.
- Liquid render failure: show a safe storefront error boundary with correlation ID; do not emit stripped or partially invented source.
- Compatibility API failure: return a Shopify-shaped error response and keep previous cart state.
- Bundle storage unavailable: retain the currently active theme and abort activation.
- New theme activation failure: atomically roll back to the previous active theme.

## 9. Testing Strategy

### 9.1 Unit tests

- archive normalization, root-folder stripping, traversal rejection, limits, and hashes;
- manifest parsing and dependency graphs;
- settings and schema overlay merging;
- locale fallback;
- Liquid tags, filters, drops, and error diagnostics;
- route and template resolution;
- asset URL scoping;
- script policy classification;
- Shopify-shaped cart and product serialization.

### 9.2 Integration tests

- import a compact representative OS 2.0 fixture with layout, snippets, JSON templates, CSS, JavaScript, fonts, and images;
- render home, product, collection, cart, search, page, account, and 404 templates;
- add/change/remove cart items through compatibility APIs and verify React checkout sees the same state;
- update settings and section order through an overlay and verify preview versus published output;
- verify activation rollback when storage or preflight fails.

### 9.3 Vision acceptance fixture

The locally supplied Vision 5 bundle is used as a non-public acceptance fixture. The test runner reports:

- 186 files discovered and preserved;
- 62 sections indexed;
- 36 snippets indexed;
- all templates indexed;
- 48 bundled assets indexed;
- eight missing merchant images reported by filename;
- no shared or unscoped asset URLs;
- blocked verification and anti-interaction scripts reported;
- successful rendering of the selected home, product, collection, cart, search, page, and account templates using SensaShop data.

### 9.4 Visual regression

Use deterministic fixture data and browser screenshots at desktop and mobile widths. Compare source-theme reference captures, where legally and operationally available, against SensaShop rendering. Differences are triaged into data differences, missing merchant media, unsupported Shopify behavior, security-policy differences, or renderer defects.

Visual acceptance prioritizes DOM structure, typography, spacing, colors, component behavior, responsive layout, and bundled media. Security-policy removals and SensaShop checkout are intentional differences.

## 10. Migration and Rollout

1. Introduce the theme registry renderer mode without changing the active legacy theme.
2. Add bundle storage and safe import behind a feature flag.
3. Add Liquid rendering for home and shared layout, then resource templates.
4. Add shared cart service and Shopify AJAX compatibility routes.
5. Add schema-driven editing and draft overlays.
6. Run Vision preflight and acceptance tests without activation.
7. Enable merchant preview.
8. Activate Vision only after required templates pass preflight and visual review.
9. Keep one-click rollback to the prior React-native theme.

The old heuristic importer remains available only for previously installed reduced themes during migration. New Shopify ZIP imports use `shopify_liquid` mode.

## 11. Acceptance Criteria

The feature is complete when:

- a standard root-level Shopify ZIP and a ZIP wrapped in one root directory import correctly;
- the Vision bundle preserves and indexes every source file;
- the runtime renders all required Vision templates from their original Liquid sources;
- original theme CSS is delivered completely and original approved JavaScript behaviors operate;
- header, announcement, footer, home, product, collection, cart, search, page, and customer views use source settings and source section order;
- products, collections, prices, variants, inventory, cart, customer, and search content come from SensaShop;
- React and Liquid experiences share authoritative cart state;
- missing images and unsupported features are visible diagnostics rather than fabricated content;
- theme assets cannot collide across themes;
- unsafe archive paths and disallowed scripts are rejected or neutralized;
- existing React-native themes and theme management continue working;
- automated unit, integration, Vision acceptance, and visual-regression checks pass;
- activation can roll back without data loss.

## 12. Design Consequences

This design requires more work than adding section mappings, but the complexity is concentrated in reusable compatibility boundaries. Once the runtime, object adapters, and browser APIs exist, importing another conventional Shopify theme becomes a compatibility assessment rather than a manual React rewrite.

Exact storefront fidelity remains bounded by data available in the theme bundle and by deliberate security differences. The system will state those limits precisely instead of presenting an approximate conversion as exact.
