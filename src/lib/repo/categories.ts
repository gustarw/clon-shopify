import "server-only";
import { get, query, run } from "../db";
import { uniqueSlug } from "../slug";
import { getSupabaseAdmin } from "../supabase";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export function listCategories(): Category[] {
  try {
    // Return local categories or sync
    return query<Category>("SELECT * FROM categories ORDER BY name");
  } catch (err) {
    console.error("Error listing categories:", err);
    return [];
  }
}

export async function listCategoriesAsync(): Promise<Category[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as Category[];
    }
  } catch (err) {
    console.warn("Supabase categories query warning:", err);
  }
  return listCategories();
}

export function getCategory(id: number): Category | undefined {
  return get<Category>("SELECT * FROM categories WHERE id = ?", [id]);
}

export async function getCategoryAsync(id: number): Promise<Category | undefined> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) return data as Category;
  } catch (err) {
    console.warn("Supabase getCategory warning:", err);
  }
  return getCategory(id);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return get<Category>("SELECT * FROM categories WHERE slug = ?", [slug]);
}

export async function getCategoryBySlugAsync(slug: string): Promise<Category | undefined> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) return data as Category;
  } catch (err) {
    console.warn("Supabase getCategoryBySlug warning:", err);
  }
  return getCategoryBySlug(slug);
}

export function createCategory(input: { name: string; description?: string }): Category {
  const name = input.name.trim();
  const existing = new Set(query<Category>("SELECT slug FROM categories").map((c) => c.slug));
  const slug = uniqueSlug(name, existing);
  const { lastInsertRowid } = run(
    "INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)",
    [name, slug, (input.description || "").trim()]
  );

  const newCat = getCategory(lastInsertRowid)!;

  // Asynchronously sync to Supabase
  try {
    const supabase = getSupabaseAdmin();
    supabase
      .from("categories")
      .insert({
        name: newCat.name,
        slug: newCat.slug,
        description: newCat.description,
      })
      .then(({ error }) => {
        if (error) console.warn("Supabase insert category sync:", error.message);
      });
  } catch (err) {
    console.warn("Supabase insert category error:", err);
  }

  return newCat;
}

export function updateCategory(id: number, input: { name: string; description?: string }): Category {
  const name = input.name.trim();
  run("UPDATE categories SET name = ? WHERE id = ?", [name, id]);
  if (input.description !== undefined) {
    run("UPDATE categories SET description = ? WHERE id = ?", [input.description.trim(), id]);
  }
  const updated = getCategory(id)!;

  // Asynchronously sync to Supabase
  try {
    const supabase = getSupabaseAdmin();
    supabase
      .from("categories")
      .update({
        name: updated.name,
        description: updated.description,
      })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.warn("Supabase update category sync:", error.message);
      });
  } catch (err) {
    console.warn("Supabase update category error:", err);
  }

  return updated;
}

export function deleteCategory(id: number): void {
  run("DELETE FROM categories WHERE id = ?", [id]);

  // Asynchronously sync to Supabase
  try {
    const supabase = getSupabaseAdmin();
    supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.warn("Supabase delete category sync:", error.message);
      });
  } catch (err) {
    console.warn("Supabase delete category error:", err);
  }
}
