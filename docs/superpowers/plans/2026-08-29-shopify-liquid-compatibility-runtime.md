# Shopify Liquid Compatibility Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import and render complete Shopify Online Store 2.0 themes, including Vision 5, from their original Liquid/CSS/JavaScript bundle against SensaShop commerce data without reducing them to approximate React sections.

**Architecture:** Add a second `shopify_liquid` renderer mode backed by immutable theme bundles, a validated manifest, a LiquidJS compatibility runtime, Shopify-shaped data drops and AJAX endpoints, and schema-driven configuration overlays. Existing `react_native` themes remain supported and route components select the renderer through a shared theme registry.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, LiquidJS, JSZip, better-sqlite3, Supabase, Vitest, parse5, Zod.

**Spec:** `docs/superpowers/specs/2026-08-29-shopify-liquid-compatibility-runtime-design.md`

## Global Constraints

- ZIP upload limit is 50 MiB compressed.
- Expanded bundle limit is 250 MiB.
- Individual file limit is 25 MiB.
- File-count limit is 5,000.
- Liquid recursion limit is 50.
- Rendered HTML limit is 5 MiB.
- Imported source files are immutable; merchant changes are stored as overlays.
- Theme assets are always scoped by theme ID.
- Unsafe paths, licensing callbacks, anti-debugging scripts, right-click blockers, keyboard blockers, and content-selection blockers are rejected or neutralized.
- Shopify checkout is not emulated; SensaShop checkout remains authoritative.
- Existing `react_native` themes must continue working without migration.
- Missing merchant media must produce diagnostics and named placeholders, never unrelated stock content.

---

## File Structure

New runtime code is grouped by responsibility under `src/lib/shopify-theme/`:

```text
src/lib/shopify-theme/
  config.ts                 central limits and compatibility version
  types.ts                  registry, manifest, diagnostics, render contracts
  archive-reader.ts         safe ZIP validation and canonical file extraction
  manifest-builder.ts       schemas, templates, dependencies and preflight index
  storage.ts                ThemeBundleStorage contract and local adapter
  storage-supabase.ts       Supabase Storage adapter
  registry.ts               installed/active theme persistence
  importer.ts               import orchestration
  liquid-engine.ts          bundle-backed LiquidJS engine and compatibility tags
  liquid-filters.ts         Shopify-compatible filters
  locales.ts                translation lookup and fallback
  drops.ts                  Shopify-compatible Liquid data adapters
  route-resolver.ts         SensaShop request to Shopify template mapping
  renderer.ts               section/template/layout rendering pipeline
  document.ts               rendered head/body extraction and security rewrites
  security.ts               script/origin classification and sanitization
  settings-overlay.ts       immutable source plus draft/published overlays
  cart-service.ts           authoritative cart state
  ajax-serializers.ts       Shopify-shaped browser response payloads
```

Route handlers are grouped under Shopify-compatible paths in `src/app/`, while React route pages call one shared `ShopifyThemePage` component. Legacy importer files remain until activation and migration tests pass, then are no longer used for new ZIP imports.

---

### Task 1: Test Harness and Runtime Contracts

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `src/lib/shopify-theme/config.ts`
- Create: `src/lib/shopify-theme/types.ts`
- Create: `src/lib/shopify-theme/__tests__/types.test.ts`

**Interfaces:**
- Produces: `THEME_RUNTIME_LIMITS`, `SHOPIFY_COMPATIBILITY_VERSION`, `InstalledThemeRecord`, `ThemeManifest`, `ThemeDiagnostic`, `ThemeImportResult`, `ShopifyRenderRequest`, and `ShopifyRenderResult`.
- Consumes: no earlier task interfaces.

- [ ] **Step 1: Install the test and document parser dependencies**

Run:

```bash
npm install parse5 zod
npm install --save-dev vitest
```

Expected: `package.json` contains `parse5`, `zod`, and `vitest`, and `package-lock.json` is updated.

- [ ] **Step 2: Add deterministic test scripts and Vitest alias configuration**

Add these scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts`:

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    clearMocks: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

- [ ] **Step 3: Write the failing runtime-contract test**

Create `src/lib/shopify-theme/__tests__/types.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { SHOPIFY_COMPATIBILITY_VERSION, THEME_RUNTIME_LIMITS } from "../config";

describe("theme runtime contracts", () => {
  it("locks the validated resource limits", () => {
    expect(THEME_RUNTIME_LIMITS).toEqual({
      compressedBytes: 50 * 1024 * 1024,
      expandedBytes: 250 * 1024 * 1024,
      fileBytes: 25 * 1024 * 1024,
      fileCount: 5_000,
      liquidRecursionDepth: 50,
      renderedHtmlBytes: 5 * 1024 * 1024,
    });
    expect(SHOPIFY_COMPATIBILITY_VERSION).toMatch(/^1\./);
  });
});
```

- [ ] **Step 4: Run the test and verify it fails**

Run: `npm test -- src/lib/shopify-theme/__tests__/types.test.ts`

Expected: FAIL because `../config` does not exist.

- [ ] **Step 5: Add the config and exact domain contracts**

Create `src/lib/shopify-theme/config.ts` with the values asserted above and `SHOPIFY_COMPATIBILITY_VERSION = "1.0.0"`.

Create `src/lib/shopify-theme/types.ts` with these required discriminants:

```ts
export type ThemeRendererMode = "react_native" | "shopify_liquid";
export type ThemeStatus = "processing" | "ready" | "ready_with_warnings" | "invalid";
export type DiagnosticSeverity = "info" | "warning" | "error";

export interface ThemeDiagnostic {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  remediation: string;
  file?: string;
  line?: number;
}

export interface InstalledThemeRecord {
  id: string;
  name: string;
  version: string;
  author: string;
  rendererMode: ThemeRendererMode;
  status: ThemeStatus;
  sourceSha256?: string;
  storageKey?: string;
  compatibilityVersion?: string;
  configurationOverlay: Record<string, unknown>;
  diagnosticsSummary: { info: number; warnings: number; errors: number };
  createdAt: string;
  updatedAt: string;
}
```

Add explicit manifest maps for files, templates, sections, snippets, locales, assets, dependencies, unresolved references, and security decisions. Add import and render result types that carry diagnostics instead of string logs.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/types.test.ts && npm run typecheck`

Expected: PASS.

```bash
git add package.json package-lock.json vitest.config.ts src/lib/shopify-theme/config.ts src/lib/shopify-theme/types.ts src/lib/shopify-theme/__tests__/types.test.ts
git commit -m "test: establish Shopify theme runtime contracts"
```

---

### Task 2: Safe Shopify ZIP Reader

**Files:**
- Create: `src/lib/shopify-theme/archive-reader.ts`
- Create: `src/lib/shopify-theme/__tests__/archive-reader.test.ts`

**Interfaces:**
- Consumes: `THEME_RUNTIME_LIMITS`, `ThemeDiagnostic`.
- Produces: `readShopifyArchive(buffer: Buffer): Promise<ValidatedThemeArchive>` where `ValidatedThemeArchive.files` is a `Map<string, Buffer>` keyed by canonical Shopify path.

- [ ] **Step 1: Write failing archive normalization and safety tests**

Build test ZIPs in memory with JSZip and assert:

```ts
expect([...archive.files.keys()]).toEqual([
  "assets/theme.css",
  "config/settings_schema.json",
  "layout/theme.liquid",
  "templates/index.json",
]);
```

Cover a root-wrapped archive, `../escape.liquid`, `/absolute.liquid`, duplicate paths after normalization, null bytes, 5,001 files, and an individual file over 25 MiB. Assert each rejection uses a stable diagnostic code such as `ARCHIVE_PATH_TRAVERSAL` or `ARCHIVE_FILE_LIMIT`.

- [ ] **Step 2: Run the focused test and verify failure**

Run: `npm test -- src/lib/shopify-theme/__tests__/archive-reader.test.ts`

Expected: FAIL because `readShopifyArchive` is missing.

- [ ] **Step 3: Implement canonical validation**

Implement:

```ts
export interface ValidatedThemeArchive {
  sourceSha256: string;
  compressedBytes: number;
  expandedBytes: number;
  rootPrefix: string | null;
  files: Map<string, Buffer>;
  fileSha256: Map<string, string>;
}

export async function readShopifyArchive(buffer: Buffer): Promise<ValidatedThemeArchive>;
```

Use `path.posix.normalize`, explicitly reject absolute/traversal paths before and after normalization, detect exactly one shared root prefix only when required Shopify directories exist beneath it, and validate expanded bytes while reading file buffers. A recognizable archive must contain `layout/` or `templates/`, plus `config/` or `sections/`.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/archive-reader.test.ts`

Expected: PASS with no writes outside the test process.

```bash
git add src/lib/shopify-theme/archive-reader.ts src/lib/shopify-theme/__tests__/archive-reader.test.ts
git commit -m "feat: validate Shopify theme archives safely"
```

---

### Task 3: Complete Theme Manifest and Vision Preflight

**Files:**
- Create: `src/lib/shopify-theme/manifest-builder.ts`
- Create: `src/lib/shopify-theme/security.ts`
- Create: `src/lib/shopify-theme/__tests__/manifest-builder.test.ts`
- Create: `scripts/audit-shopify-theme.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `ValidatedThemeArchive`, `ThemeManifest`, `ThemeDiagnostic`.
- Produces: `buildThemeManifest(archive): ThemeManifest` and `classifyThemeSource(path, source): SecurityDecision[]`.

- [ ] **Step 1: Write the failing manifest test**

Create an in-memory fixture containing settings metadata, two templates, two sections with schemas, one snippet dependency, two locales, CSS, JavaScript, and an unresolved `shopify://shop_images/banner.png`. Assert exact counts, section order, metadata, dependency edge, missing image diagnostic, and blocked external verification decision.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/lib/shopify-theme/__tests__/manifest-builder.test.ts`

Expected: FAIL because the manifest builder is missing.

- [ ] **Step 3: Implement parsing and dependency indexing**

Parse JSON with file-specific diagnostics. Extract section schema using the `{% schema %}` bounds. Index static `render`, `include`, `section`, `asset_url`, `shopify://`, external script/style origins, observed Liquid tags/filters, and AJAX route usage. Preserve raw unknown schema properties.

Security decisions must include:

```ts
type SecurityDisposition = "allow" | "block" | "sanitize" | "review";

interface SecurityDecision {
  ruleId: string;
  file: string;
  disposition: SecurityDisposition;
  detail: string;
}
```

Block `app.sabinovisdsacsion.com.br/api/theme/verify`, classify document-level mouse/keyboard/selection blockers as `sanitize`, and mark unknown external origins as `review`.

- [ ] **Step 4: Add the local acceptance audit command**

Add script:

```json
"theme:audit": "tsx scripts/audit-shopify-theme.ts"
```

`scripts/audit-shopify-theme.ts` accepts a ZIP path, calls the archive reader and manifest builder, prints JSON counts and diagnostics, and exits nonzero only when error diagnostics exist.

- [ ] **Step 5: Verify Vision counts and commit**

Run:

```bash
npm test -- src/lib/shopify-theme/__tests__/manifest-builder.test.ts
npm run theme:audit -- sabino_v5_nichado-1.zip
```

Expected Vision output includes `files: 186`, `sections: 62`, `snippets: 36`, `assets: 48`, and the eight named missing merchant images.

```bash
git add package.json src/lib/shopify-theme/manifest-builder.ts src/lib/shopify-theme/security.ts src/lib/shopify-theme/__tests__/manifest-builder.test.ts scripts/audit-shopify-theme.ts
git commit -m "feat: index complete Shopify theme manifests"
```

---

### Task 4: Immutable Bundle Storage

**Files:**
- Create: `src/lib/shopify-theme/storage.ts`
- Create: `src/lib/shopify-theme/storage-supabase.ts`
- Create: `src/lib/shopify-theme/__tests__/storage.test.ts`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: `ValidatedThemeArchive`, `ThemeManifest`.
- Produces: `ThemeBundleStorage` with `putBundle`, `readFile`, `readManifest`, `hasBundle`, `deleteBundle`, and `publicAssetUrl`.

- [ ] **Step 1: Write the failing local storage test**

Use a test-owned temporary directory. Persist a bundle, verify byte-identical reads, verify the source archive is retained, assert `/theme-assets/{themeId}/assets/theme.css`, and reject writes outside `themes/{themeId}`.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/lib/shopify-theme/__tests__/storage.test.ts`

Expected: FAIL because `LocalThemeBundleStorage` is missing.

- [ ] **Step 3: Implement the storage contract and adapters**

Use this contract:

```ts
export interface ThemeBundleStorage {
  putBundle(input: {
    themeId: string;
    sourceZip: Buffer;
    archive: ValidatedThemeArchive;
    manifest: ThemeManifest;
    diagnostics: ThemeDiagnostic[];
  }): Promise<void>;
  readFile(themeId: string, canonicalPath: string): Promise<Buffer | null>;
  readManifest(themeId: string): Promise<ThemeManifest | null>;
  hasBundle(themeId: string): Promise<boolean>;
  deleteBundle(themeId: string): Promise<void>;
  publicAssetUrl(themeId: string, canonicalPath: string): string;
}
```

Local storage root defaults to `data/theme-bundles`; add that directory to `.gitignore`. Supabase uses bucket names from `SHOPIFY_THEME_SOURCE_BUCKET` and `SHOPIFY_THEME_ASSET_BUCKET`, with source private and runtime assets public.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/storage.test.ts`

Expected: PASS.

```bash
git add .gitignore src/lib/shopify-theme/storage.ts src/lib/shopify-theme/storage-supabase.ts src/lib/shopify-theme/__tests__/storage.test.ts
git commit -m "feat: persist immutable Shopify theme bundles"
```

---

### Task 5: Theme Registry and Atomic Activation

**Files:**
- Modify: `src/lib/db.ts`
- Modify: `supabase/schema.sql`
- Create: `src/lib/shopify-theme/registry.ts`
- Create: `src/lib/shopify-theme/__tests__/registry.test.ts`
- Modify: `src/lib/repo/theme.ts`

**Interfaces:**
- Consumes: `InstalledThemeRecord`, `ThemeBundleStorage`.
- Produces: `installThemeRecord`, `getInstalledThemeRecord`, `listInstalledThemeRecords`, `getActiveThemeRecord`, `activateThemeRecord`, `deleteThemeRecord`, and `getActiveRendererMode`.

- [ ] **Step 1: Write failing registry tests against an isolated SQLite database**

Assert installation, listing, diagnostics persistence, rejection of `processing` and `invalid` activation, successful `ready_with_warnings` activation, and rollback when `storage.hasBundle(themeId)` is false.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/lib/shopify-theme/__tests__/registry.test.ts`

Expected: FAIL because registry tables and functions do not exist.

- [ ] **Step 3: Add backward-compatible schema**

Add `installed_themes` and `active_theme` tables to SQLite and Supabase. Keep `theme_settings` unchanged for legacy rows. Store `configuration_overlay_json` and `diagnostics_summary_json` as JSON text in SQLite and JSONB in Supabase.

Provide a test-only database injection in `src/lib/db.ts`:

```ts
export function setDbForTests(next: Database.Database | null): void;
```

It must throw outside `NODE_ENV === "test"`.

- [ ] **Step 4: Implement atomic activation and legacy projection**

`getActiveRendererMode()` returns `react_native` when no registry row exists. Legacy `installTheme`, `getThemeConfig`, and `setActiveTheme` continue to work and create/read `react_native` registry projections without changing existing JSON.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/registry.test.ts && npm run typecheck`

Expected: PASS.

```bash
git add src/lib/db.ts supabase/schema.sql src/lib/shopify-theme/registry.ts src/lib/shopify-theme/__tests__/registry.test.ts src/lib/repo/theme.ts
git commit -m "feat: register and activate dual-mode themes"
```

---

### Task 6: Import Orchestration and Honest Upload Reporting

**Files:**
- Create: `src/lib/shopify-theme/importer.ts`
- Create: `src/lib/shopify-theme/__tests__/importer.test.ts`
- Modify: `src/app/api/theme/upload/route.ts`
- Modify: `src/components/admin/theme-editor/ThemeUploadModal.tsx`
- Modify: `src/components/admin/AdminThemesView.tsx`

**Interfaces:**
- Consumes: archive reader, manifest builder, storage, registry.
- Produces: `importShopifyTheme(input): Promise<ThemeImportResult>` and upload JSON with `record`, `manifestSummary`, and `diagnostics`.

- [ ] **Step 1: Write the failing import orchestration test**

Inject in-memory storage and registry doubles. Assert `processing` is persisted first, `ready_with_warnings` is final for missing merchant media, storage failure produces `invalid`, and `setActive` activates only after bundle persistence and preflight.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/lib/shopify-theme/__tests__/importer.test.ts`

Expected: FAIL because `importShopifyTheme` is missing.

- [ ] **Step 3: Implement the importer and replace the upload API call**

Use:

```ts
export async function importShopifyTheme(input: {
  buffer: Buffer;
  originalFilename: string;
  setActive: boolean;
  storage?: ThemeBundleStorage;
}): Promise<ThemeImportResult>;
```

Reject `.json` uploads on this endpoint with a clear message; the complete runtime import format is ZIP. Generate a stable theme ID from source hash plus normalized theme name, not `Date.now()` suffixes.

- [ ] **Step 4: Update the upload UI language and result model**

Replace “Convertendo para React” with stages for validation, preservation, manifest indexing, compatibility preflight, and installation. Display preserved counts for files/templates/sections/snippets/assets; group diagnostics by severity; remove “100% Modulares”; and disable immediate activation when errors exist.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/importer.test.ts && npm run typecheck`

Expected: PASS.

```bash
git add src/lib/shopify-theme/importer.ts src/lib/shopify-theme/__tests__/importer.test.ts src/app/api/theme/upload/route.ts src/components/admin/theme-editor/ThemeUploadModal.tsx src/components/admin/AdminThemesView.tsx
git commit -m "feat: import complete Shopify bundles with diagnostics"
```

---

### Task 7: Bundle-backed Liquid Engine, Locales, and Core Filters

**Files:**
- Create: `src/lib/shopify-theme/liquid-engine.ts`
- Create: `src/lib/shopify-theme/liquid-filters.ts`
- Create: `src/lib/shopify-theme/locales.ts`
- Create: `src/lib/shopify-theme/__tests__/liquid-engine.test.ts`

**Interfaces:**
- Consumes: `ThemeBundleStorage`, `ThemeManifest`, configuration overlay.
- Produces: `createThemeLiquidEngine(input): Liquid`, `renderThemeFile(path, context)`, and `createTranslationFilter(locales, locale)`.

- [ ] **Step 1: Write failing graph-rendering tests**

Create a stored fixture where a template renders a section, the section renders a snippet with named arguments, the snippet translates a key and resolves an asset. Assert exact HTML and a theme-scoped asset URL. Cover legacy `include`, `schema`, `stylesheet`, `javascript`, missing snippet diagnostics, and locale fallback.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/lib/shopify-theme/__tests__/liquid-engine.test.ts`

Expected: FAIL because the bundle-backed engine is missing.

- [ ] **Step 3: Implement the bundle filesystem and tags**

Create a LiquidJS filesystem adapter that resolves only canonical paths in the active bundle. Register `section`, no-output `schema`, captured `stylesheet`, captured `javascript`, and compatibility behavior for `form` and `paginate`. Enforce recursion depth and abort rendering over the configured output limit.

- [ ] **Step 4: Implement observed Shopify filters**

Implement deterministic filters required by Vision, including `asset_url`, `image_url`, `img_url`, `money`, `money_with_currency`, `money_without_currency`, `t`, `json`, `handleize`, `within`, `highlight`, `url_for_type`, `url_for_vendor`, `payment_type_svg_tag`, `stylesheet_tag`, and `script_tag`. Filters preserve Liquid safety semantics and never return the shared `/uploads/themes/assets/` path.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/liquid-engine.test.ts`

Expected: PASS.

```bash
git add src/lib/shopify-theme/liquid-engine.ts src/lib/shopify-theme/liquid-filters.ts src/lib/shopify-theme/locales.ts src/lib/shopify-theme/__tests__/liquid-engine.test.ts
git commit -m "feat: render imported Shopify Liquid graphs"
```

---

### Task 8: Shopify Data Drops and Template Resolution

**Files:**
- Create: `src/lib/shopify-theme/drops.ts`
- Create: `src/lib/shopify-theme/route-resolver.ts`
- Create: `src/lib/shopify-theme/__tests__/drops.test.ts`
- Create: `src/lib/shopify-theme/__tests__/route-resolver.test.ts`
- Create: `src/lib/repo/content.ts`
- Modify: `src/lib/db.ts`
- Modify: `supabase/schema.sql`
- Modify: `src/lib/repo/products.ts`
- Modify: `src/lib/repo/categories.ts`

**Interfaces:**
- Consumes: SensaShop `Product`, `Category`, `ContentPage`, `Blog`, `Article`, session, search params, cart snapshot.
- Produces: `buildShopifyContext(request): Promise<ShopifyContext>` and `resolveShopifyTemplate(request, manifest): ResolvedTemplate`.

- [ ] **Step 1: Write failing product, collection, request, routes, and settings drop tests**

Assert integer minor-unit prices, availability, selected variant, media, collection product pagination, route mappings, `request.page_type`, locale, canonical URL, and overlay precedence. Use concrete SensaShop fixture rows.

- [ ] **Step 2: Write failing route-resolution tests**

Cover home, product alternate template, product fallback, collection, list collections, cart, search, page alternate, customer routes, and 404. Assert a missing alternate falls back to the resource base and never to `index`.

- [ ] **Step 3: Verify failures**

Run: `npm test -- src/lib/shopify-theme/__tests__/drops.test.ts src/lib/shopify-theme/__tests__/route-resolver.test.ts`

Expected: FAIL because drops and resolver are missing.

- [ ] **Step 4: Add content persistence and repository queries needed by drops**

Add `content_pages`, `blogs`, `articles`, and `customer_addresses` tables to SQLite and Supabase. Create `content.ts` with `getContentPageByHandle`, `getBlogByHandle`, `getArticleByHandle`, `listBlogArticles`, and customer-address lookups. Add category product listing by slug, stable product-handle lookup, related products, and paginated search without exposing database rows. Keep current public repository functions compatible.

- [ ] **Step 5: Implement drops as plain serialization-safe objects**

Every drop exposes documented Shopify-style property names and SensaShop URLs. Record unknown-property accesses in development through a diagnostic collector without throwing in production.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/drops.test.ts src/lib/shopify-theme/__tests__/route-resolver.test.ts && npm run typecheck`

Expected: PASS.

```bash
git add src/lib/shopify-theme/drops.ts src/lib/shopify-theme/route-resolver.ts src/lib/shopify-theme/__tests__/drops.test.ts src/lib/shopify-theme/__tests__/route-resolver.test.ts src/lib/repo/content.ts src/lib/db.ts supabase/schema.sql src/lib/repo/products.ts src/lib/repo/categories.ts
git commit -m "feat: adapt SensaShop data to Shopify Liquid"
```

---

### Task 9: Full Template/Layout Renderer and Storefront Branching

**Files:**
- Create: `src/lib/shopify-theme/renderer.ts`
- Create: `src/lib/shopify-theme/document.ts`
- Create: `src/lib/shopify-theme/__tests__/renderer.test.ts`
- Create: `src/components/storefront/ShopifyThemePage.tsx`
- Create: `src/components/storefront/ShopifyThemeShell.tsx`
- Create: `src/components/storefront/legacy/LegacyCartPage.tsx`
- Modify: `src/app/(storefront)/layout.tsx`
- Modify: `src/app/(storefront)/page.tsx`
- Modify: `src/app/(storefront)/produtos/page.tsx`
- Modify: `src/app/(storefront)/produtos/[slug]/page.tsx`
- Modify: `src/app/(storefront)/carrinho/page.tsx`
- Modify: `src/app/(storefront)/conta/page.tsx`
- Modify: `src/app/(storefront)/login/page.tsx`
- Modify: `src/app/(storefront)/registrar/page.tsx`
- Modify: `src/app/(storefront)/pedido/[id]/page.tsx`
- Create: `src/app/(storefront)/paginas/[handle]/page.tsx`
- Create: `src/app/(storefront)/blogs/[blog]/page.tsx`
- Create: `src/app/(storefront)/blogs/[blog]/[article]/page.tsx`
- Modify: `src/app/not-found.tsx`

**Interfaces:**
- Consumes: active theme record, manifest, Liquid engine, route resolver, drops.
- Produces: `renderShopifyTheme(request): Promise<ShopifyRenderResult>` and `<ShopifyThemePage request={...} legacy={...} />`.

- [ ] **Step 1: Write failing ordered-section and layout tests**

Assert JSON template order, disabled section omission, disabled block preservation in context but omission from loops where required, static header/footer sections from `settings_data.json`, `content_for_layout`, and final document split into `headHtml` and `bodyHtml` with parse5.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/lib/shopify-theme/__tests__/renderer.test.ts`

Expected: FAIL because the renderer is missing.

- [ ] **Step 3: Implement template, section, and layout rendering**

Use:

```ts
export async function renderShopifyTheme(
  request: ShopifyRenderRequest,
  dependencies?: ShopifyRendererDependencies
): Promise<ShopifyRenderResult>;
```

Merge source settings and published overlay without mutating either. Preserve source section IDs and order. Return structured diagnostics and throw a typed render-limit error when output exceeds 5 MiB.

- [ ] **Step 4: Add the renderer branch without duplicating headers or footers**

`StorefrontLayout` checks `getActiveRendererMode()`. In `shopify_liquid` mode it omits React `Header`, `Footer`, `StorefrontThemeStyles`, and `CartDrawer`; the original theme layout owns those elements. In `react_native` mode current behavior is unchanged.

Each storefront page calls `ShopifyThemePage` when Liquid mode is active and otherwise renders its existing JSX through an extracted `legacy` component. Move the client-only cart JSX into `LegacyCartPage.tsx` so `carrinho/page.tsx` can become a server renderer selector. Add content-page and blog/article routes backed by `content.ts`; in legacy mode they render a minimal native content view, and in Liquid mode they select `page`, `blog`, or `article`. Login, register, account, and order routes select the corresponding `customers/*` templates while preserving current authentication behavior. SensaShop checkout remains native in both modes. `ShopifyThemeShell` injects approved head assets, body markup, and scripts in source order, with a stable `data-theme-id` root.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/renderer.test.ts && npm run typecheck && npm run build`

Expected: PASS and production build succeeds.

```bash
git add src/lib/shopify-theme/renderer.ts src/lib/shopify-theme/document.ts src/lib/shopify-theme/__tests__/renderer.test.ts src/components/storefront/ShopifyThemePage.tsx src/components/storefront/ShopifyThemeShell.tsx 'src/app/(storefront)' src/app/not-found.tsx
git commit -m "feat: render Shopify templates across storefront routes"
```

---

### Task 10: Theme-scoped Asset Delivery and Executable Security Copy

**Files:**
- Create: `src/app/theme-assets/[themeId]/[...path]/route.ts`
- Create: `src/lib/shopify-theme/__tests__/security.test.ts`
- Create: `src/lib/shopify-theme/__tests__/asset-route.test.ts`
- Modify: `src/lib/shopify-theme/security.ts`
- Modify: `src/lib/shopify-theme/document.ts`
- Modify: `src/lib/shopify-theme/liquid-filters.ts`

**Interfaces:**
- Consumes: storage, manifest security decisions.
- Produces: `createExecutableAsset(themeId, path, source, decisions)` and secure asset responses with content type, ETag, and CSP.

- [ ] **Step 1: Write failing security and asset tests**

Assert CSS is returned untruncated, font and SVG MIME types are correct, traversal is rejected, ETag matches file hash, verification callback text is absent from executable Vision JavaScript, document event blockers are absent, source storage bytes remain unchanged, and unknown external scripts are omitted with diagnostics.

- [ ] **Step 2: Verify failures**

Run: `npm test -- src/lib/shopify-theme/__tests__/security.test.ts src/lib/shopify-theme/__tests__/asset-route.test.ts`

Expected: FAIL because executable asset transformation and route do not exist.

- [ ] **Step 3: Implement immutable-source to executable-copy transformation**

Only transform files identified by manifest decisions. Replace blocked verification fetches with `Promise.resolve(new Response(null, { status: 204 }))`; remove inline scripts whose complete purpose is document mouse/keyboard/selection blocking; reject executable server-side extensions; and keep a decision diagnostic for every transform.

- [ ] **Step 4: Implement asset delivery and CSP**

Allow `GET` and `HEAD`. Set immutable cache headers using file SHA-256. CSP defaults to `default-src 'self'`, permits theme-scoped assets, and adds reviewed external origins from the manifest. `connect-src` never includes licensing endpoints.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/security.test.ts src/lib/shopify-theme/__tests__/asset-route.test.ts && npm run build`

Expected: PASS.

```bash
git add src/app/theme-assets src/lib/shopify-theme/security.ts src/lib/shopify-theme/document.ts src/lib/shopify-theme/liquid-filters.ts src/lib/shopify-theme/__tests__/security.test.ts src/lib/shopify-theme/__tests__/asset-route.test.ts
git commit -m "feat: serve isolated and sanitized theme assets"
```

---

### Task 11: Authoritative Shared Cart Service

**Files:**
- Modify: `src/lib/db.ts`
- Modify: `supabase/schema.sql`
- Create: `src/lib/shopify-theme/cart-service.ts`
- Create: `src/lib/shopify-theme/__tests__/cart-service.test.ts`

**Interfaces:**
- Produces: `getCart`, `addCartItem`, `changeCartLine`, `updateCart`, `clearCart`, and `serializeCart` keyed by an HttpOnly `sn_cart` token.
- Consumes: product repository and integer minor-unit prices.

- [ ] **Step 1: Write failing cart service tests**

Assert stable token creation, stock clamping, add/merge, line change/removal, note update, totals, product deactivation behavior, and transaction rollback. Verify prices are reloaded from products rather than trusted from the browser.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/lib/shopify-theme/__tests__/cart-service.test.ts`

Expected: FAIL because cart tables and service are missing.

- [ ] **Step 3: Add cart persistence and service**

Add `carts` and `cart_items` tables to SQLite and Supabase. Use a random 32-byte URL-safe token stored only as a hash in the database. The service returns:

```ts
interface CartSnapshot {
  token: string;
  note: string;
  items: CartSnapshotItem[];
  itemCount: number;
  subtotalCents: number;
}
```

- [ ] **Step 4: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/cart-service.test.ts && npm run typecheck`

Expected: PASS.

```bash
git add src/lib/db.ts supabase/schema.sql src/lib/shopify-theme/cart-service.ts src/lib/shopify-theme/__tests__/cart-service.test.ts
git commit -m "feat: unify React and Liquid cart state"
```

---

### Task 12: Shopify AJAX Compatibility Endpoints

**Files:**
- Create: `src/lib/shopify-theme/ajax-serializers.ts`
- Create: `src/lib/shopify-theme/__tests__/ajax-serializers.test.ts`
- Create: `src/app/cart.js/route.ts`
- Create: `src/app/cart/add.js/route.ts`
- Create: `src/app/cart/change.js/route.ts`
- Create: `src/app/cart/update.js/route.ts`
- Create: `src/app/products/[handle].js/route.ts`
- Create: `src/app/variants/[id]/route.ts`
- Create: `src/app/search/route.ts`
- Create: `src/app/search/suggest/route.ts`
- Create: `src/app/recommendations/products/route.ts`
- Create: `src/lib/shopify-theme/__tests__/ajax-routes.test.ts`
- Modify: `src/components/cart/CartProvider.tsx`
- Modify: `src/app/(storefront)/checkout/page.tsx`

**Interfaces:**
- Consumes: cart service, product repository, renderer section fragments.
- Produces: Shopify-shaped JSON and HTML response contracts used by Vision JavaScript.

- [ ] **Step 1: Write failing serializer tests**

Assert cart fields `token`, `item_count`, `total_price`, `items`, `original_price`, `final_price`, `url`, `image`, `variant_id`, and `quantity`; product fields `id`, `handle`, `title`, `variants`, `images`, and `featured_image`; and Shopify-style error `{ status, message, description }`.

- [ ] **Step 2: Write failing route integration tests**

Cover GET cart, add via FormData, add via JSON, change by line, change by ID, note update, product JSON, predictive search query, recommendation query, and `section_id` HTML fragments. Assert `sn_cart` is HttpOnly, SameSite Lax, and Secure in production.

- [ ] **Step 3: Verify failures**

Run: `npm test -- src/lib/shopify-theme/__tests__/ajax-serializers.test.ts src/lib/shopify-theme/__tests__/ajax-routes.test.ts`

Expected: FAIL because serializers and routes are missing.

- [ ] **Step 4: Implement serializers and handlers**

All mutations delegate to `cart-service.ts`. Search and recommendation handlers delegate to repositories and render the requested active-theme section when `section_id` is present. Shipping-rate endpoints return a named unsupported response until SensaShop has a shipping quotation service; the manifest preflight reports this Vision feature as a warning.

- [ ] **Step 5: Migrate React CartProvider to the shared endpoints**

Hydrate from `/cart.js`, send add/change/update requests through the new compatibility handlers, preserve drawer UI state locally, and remove product/price authority from localStorage. Migrate a valid legacy localStorage cart once by posting product IDs and quantities, then delete `clon-shopify.cart`. Verify the React checkout reads the same server-authoritative snapshot.

- [ ] **Step 6: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/ajax-serializers.test.ts src/lib/shopify-theme/__tests__/ajax-routes.test.ts && npm run build`

Expected: PASS.

```bash
git add src/lib/shopify-theme/ajax-serializers.ts src/lib/shopify-theme/__tests__/ajax-serializers.test.ts src/lib/shopify-theme/__tests__/ajax-routes.test.ts src/app/cart.js src/app/cart src/app/products src/app/variants src/app/search src/app/recommendations src/components/cart/CartProvider.tsx 'src/app/(storefront)/checkout/page.tsx'
git commit -m "feat: provide Shopify storefront AJAX compatibility"
```

---

### Task 13: Schema-driven Settings Overlays and Preview

**Files:**
- Create: `src/lib/shopify-theme/settings-overlay.ts`
- Create: `src/lib/shopify-theme/__tests__/settings-overlay.test.ts`
- Create: `src/app/api/theme/liquid-settings/route.ts`
- Create: `src/app/api/theme/media/route.ts`
- Create: `src/components/admin/theme-editor/ShopifySchemaEditor.tsx`
- Create: `src/components/admin/theme-editor/ShopifySchemaField.tsx`
- Modify: `src/components/admin/theme-editor/ThemeEditorShell.tsx`
- Modify: `src/components/admin/theme-editor/LivePreviewCanvas.tsx`

**Interfaces:**
- Consumes: manifest schemas, source settings, authenticated merchant session, theme bundle storage.
- Produces: `mergeThemeSettings`, `validateThemeOverlay`, `saveDraftOverlay`, `publishOverlay`, `mapMerchantMedia`, and schema-rendered controls.

- [ ] **Step 1: Write failing overlay tests**

Assert source immutability, global and section override precedence, block order and disabled state, range/select validation, unknown-control preservation, rejected unknown setting IDs, draft isolation by admin session, and atomic publish.

- [ ] **Step 2: Verify failure**

Run: `npm test -- src/lib/shopify-theme/__tests__/settings-overlay.test.ts`

Expected: FAIL because overlay functions are missing.

- [ ] **Step 3: Implement validation, media mapping, and persistence**

Generate Zod validators from source schemas for checkbox, text, textarea, richtext, liquid, HTML, color, range, select, radio, image, URL, video, product, collection, page, blog, link list, and font controls. Headers and paragraphs are non-value controls. Unknown control types preserve source values and emit `SCHEMA_CONTROL_READ_ONLY`. The authenticated media endpoint stores supplemental files in the active theme bundle's merchant-media namespace and records mappings from exact `shopify://shop_images/{filename}` references to theme-scoped URLs; duplicate filenames require explicit replacement.

- [ ] **Step 4: Implement editor controls and preview token**

`ShopifySchemaEditor` renders global groups, template sections, blocks, order, enabled state, presets, and missing-media controls. Draft preview uses a signed short-lived token sent only to the preview request; public storefront rendering reads only the published overlay.

- [ ] **Step 5: Verify and commit**

Run: `npm test -- src/lib/shopify-theme/__tests__/settings-overlay.test.ts && npm run typecheck && npm run build`

Expected: PASS.

```bash
git add src/lib/shopify-theme/settings-overlay.ts src/lib/shopify-theme/__tests__/settings-overlay.test.ts src/app/api/theme/liquid-settings src/app/api/theme/media src/components/admin/theme-editor/ShopifySchemaEditor.tsx src/components/admin/theme-editor/ShopifySchemaField.tsx src/components/admin/theme-editor/ThemeEditorShell.tsx src/components/admin/theme-editor/LivePreviewCanvas.tsx
git commit -m "feat: edit Shopify theme schemas without source loss"
```

---

### Task 14: Vision 5 Acceptance, Visual Verification, and Rollback

**Files:**
- Create: `scripts/verify-vision-theme.ts`
- Create: `src/lib/shopify-theme/__tests__/vision-acceptance.test.ts`
- Modify: `package.json`
- Modify: `src/app/api/theme/manage/route.ts`
- Modify: `src/components/admin/AdminThemesView.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: complete importer, registry, renderer, assets, cart, AJAX routes, settings overlays.
- Produces: repeatable Vision verification report and one-click rollback to the previous active theme.

- [ ] **Step 1: Write the Vision acceptance test with an explicit local-fixture guard**

The test uses `sabino_v5_nichado-1.zip` when present and skips with a named reason when the private fixture is absent. Assert 186 files, 62 sections, 36 snippets, 48 assets, all template paths, eight named missing merchant images, blocked verification callback, sanitized blockers, scoped asset URLs, and successful home/product/collection/cart/search/page/account renders.

- [ ] **Step 2: Add browser-verification script**

Add:

```json
"theme:verify:vision": "tsx scripts/verify-vision-theme.ts sabino_v5_nichado-1.zip"
```

The script imports into a test-owned storage root and database, renders the required pages with deterministic SensaShop fixtures, verifies referenced local assets exist, scans output for unresolved Liquid syntax, verifies output-size limits, and writes a JSON report under `data/theme-verification/`.

- [ ] **Step 3: Implement activation history and rollback**

Add `previous_theme_id` to `active_theme`. Activation stores the prior ID transactionally. `POST /api/theme/manage` accepts `action: "rollback"`, verifies the prior bundle, switches atomically, and returns both old and new theme IDs. Add the rollback action to the admin theme screen only when a previous valid theme exists.

- [ ] **Step 4: Run complete automated verification**

Run:

```bash
npm test
npm run theme:audit -- sabino_v5_nichado-1.zip
npm run theme:verify:vision
npm run lint
npm run typecheck
npm run build
```

Expected: all commands pass; Vision report contains zero error diagnostics and explicitly lists intentional security and missing-media warnings.

- [ ] **Step 5: Perform visual comparison**

Run the production build locally, import Vision without immediate activation, open admin preview, and capture desktop and mobile screenshots for home, product, collection, cart, and search. Compare DOM structure, typography, spacing, colors, responsive behavior, theme interactions, and media resolution. Record each remaining difference in the verification report under exactly one category: data, missing merchant media, unsupported integration, security policy, or renderer defect. Renderer defects block activation.

- [ ] **Step 6: Document operations and commit**

Document required Supabase buckets, environment variables, local storage location, import limits, diagnostics, preview, activation, and rollback in `README.md`.

```bash
git add package.json scripts/verify-vision-theme.ts src/lib/shopify-theme/__tests__/vision-acceptance.test.ts src/app/api/theme/manage/route.ts src/components/admin/AdminThemesView.tsx README.md
git commit -m "test: verify Vision theme end to end"
```

---

## Final Verification

After all task commits:

```bash
git status --short
npm test
npm run theme:audit -- sabino_v5_nichado-1.zip
npm run theme:verify:vision
npm run lint
npm run typecheck
npm run build
```

Expected results:

- unrelated pre-existing worktree changes remain untouched;
- all automated tests pass;
- the Vision bundle is preserved with exact audited counts;
- the storefront uses original Vision Liquid, CSS, approved JavaScript, and section order;
- SensaShop products, collections, cart, customer, and search data render through Shopify-compatible drops;
- missing media and intentional security removals remain explicit warnings;
- existing React-native themes still render;
- rollback returns to the prior active theme without data loss.
