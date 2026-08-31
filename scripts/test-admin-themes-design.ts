import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync("src/components/admin/AdminThemesView.tsx", "utf8");

assert.match(source, /bg-\[#fff0f3\]/, "The upload callout should use the admin accent tint.");
assert.match(source, /bg-\[#ff385c\]/, "Primary theme actions should use the admin accent.");
assert.doesNotMatch(source, /bg-emerald-600/, "The upload callout should not use emerald as a brand color.");
assert.doesNotMatch(source, /from-emerald|via-teal/, "The upload callout should not use an AI-style color gradient.");
assert.doesNotMatch(source, /Sparkles/, "Theme actions should not use decorative sparkle iconography.");
assert.doesNotMatch(source, /rounded-2xl border/, "Primary theme sections should use the admin card radius.");
assert.match(
  source,
  /const visibleThemePresets = THEME_PRESETS\.filter\(\(preset\) => preset\.id === "farfetch"\)/,
  "The admin theme library should only expose the Farfetch preset."
);
assert.match(source, /\{visibleThemePresets\.length\} templates disponíveis/, "The library count should match the visible presets.");
assert.match(source, /\{visibleThemePresets\.map\(\(preset\) => \{/, "The library should render only visible presets.");

console.log("AdminThemesView design contract passed.");
