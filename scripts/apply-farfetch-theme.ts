import path from "node:path";
import Database from "better-sqlite3";
import { THEME_PRESETS } from "../src/components/admin/theme-editor/default-presets";

const DATA_DIR = path.join(process.cwd(), "data");
const db = new Database(path.join(DATA_DIR, "shop.db"));

const farfetchPreset = THEME_PRESETS.find((p) => p.id === "farfetch");

if (farfetchPreset) {
  const jsonStr = JSON.stringify(farfetchPreset.config);
  db.prepare(`
    INSERT INTO theme_settings (id, name, config_json, updated_at)
    VALUES (?, ?, ?, datetime('now'))
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      config_json = excluded.config_json,
      updated_at = datetime('now')
  `).run("main-theme", farfetchPreset.config.name, jsonStr);

  console.log("✅ Tema FARFETCH España ativado com sucesso no Storefront e gravado no banco de dados!");
} else {
  console.error("❌ Preset Farfetch não encontrado!");
}
