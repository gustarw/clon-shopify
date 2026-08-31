import "server-only";
import { get, query, run, tx } from "../db";
import { uniqueSlug } from "../slug";
import type { Category } from "./categories";
import { getSupabaseAdmin } from "../supabase";

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  compare_at_cents: number | null;
  image: string;
  stock: number;
  category_id: number | null;
  active: number;
  created_at: string;
  category?: Category;
}

export type ProductInput = {
  name: string;
  description: string;
  price_cents: number;
  compare_at_cents: number | null;
  image: string;
  stock: number;
  category_id: number | null;
  active: number;
};

export interface ProductFilters {
  search?: string;
  categoryId?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name";
  page?: number;
  perPage?: number;
  includeInactive?: boolean;
}

const SORTS: Record<NonNullable<ProductFilters["sort"]>, string> = {
  newest: "p.created_at DESC, p.id DESC",
  price_asc: "p.price_cents ASC",
  price_desc: "p.price_cents DESC",
  name: "p.name ASC",
};

const BASE_SELECT = `
  SELECT p.*, c.name AS category_name, c.slug AS category_slug, c.description AS category_description
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

interface ProductRow {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  compare_at_cents: number | null;
  image: string;
  stock: number;
  category_id: number | null;
  active: number;
  created_at: string;
  category_name: string | null;
  category_slug: string | null;
  category_description: string | null;
}

interface SlugRow {
  slug: string;
}

interface StockRow {
  stock: number;
}

function hydrate(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price_cents: row.price_cents,
    compare_at_cents: row.compare_at_cents,
    image: row.image,
    stock: row.stock,
    category_id: row.category_id,
    active: row.active,
    created_at: row.created_at,
    category: row.category_name
      ? { id: row.category_id as number, name: row.category_name, slug: row.category_slug as string, description: row.category_description as string }
      : undefined,
  };
}

export function listProducts(filters: ProductFilters = {}): { products: Product[]; total: number; page: number; perPage: number } {
  const page = Math.max(1, filters.page || 1);
  const perPage = Math.min(100, Math.max(1, filters.perPage || 12));
  const where: string[] = [];
  const params: unknown[] = [];

  if (!filters.includeInactive) where.push("p.active = 1");
  if (filters.categoryId) {
    where.push("p.category_id = ?");
    params.push(filters.categoryId);
  }
  if (filters.search?.trim()) {
    where.push("(p.name LIKE ? OR p.description LIKE ?)");
    const like = `%${filters.search.trim()}%`;
    params.push(like, like);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const total = Number(get<{ n: number }>("SELECT COUNT(*) AS n FROM products p " + whereSql, params)?.n ?? 0);
  const offset = (page - 1) * perPage;

  const rows = query<ProductRow>(
    `${BASE_SELECT} ${whereSql} ORDER BY ${SORTS[filters.sort || "newest"]} LIMIT ? OFFSET ?`,
    [...params, perPage, offset]
  );

  return { products: rows.map(hydrate), total, page, perPage };
}

export async function listProductsAsync(filters: ProductFilters = {}): Promise<{ products: Product[]; total: number; page: number; perPage: number }> {
  try {
    const supabase = getSupabaseAdmin();
    const page = Math.max(1, filters.page || 1);
    const perPage = Math.min(100, Math.max(1, filters.perPage || 12));
    const offset = (page - 1) * perPage;

    let query = supabase
      .from("products")
      .select("*, categories(*)", { count: "exact" });

    if (!filters.includeInactive) query = query.eq("active", 1);
    if (filters.categoryId) query = query.eq("category_id", filters.categoryId);
    if (filters.search?.trim()) {
      query = query.or(`name.ilike.%${filters.search.trim()}%,description.ilike.%${filters.search.trim()}%`);
    }

    if (filters.sort === "price_asc") query = query.order("price_cents", { ascending: true });
    else if (filters.sort === "price_desc") query = query.order("price_cents", { ascending: false });
    else if (filters.sort === "name") query = query.order("name", { ascending: true });
    else query = query.order("created_at", { ascending: false });

    query = query.range(offset, offset + perPage - 1);

    const { data, error, count } = await query;

    if (!error && data && data.length > 0) {
      const prods: Product[] = data.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description || "",
        price_cents: p.price_cents,
        compare_at_cents: p.compare_at_cents,
        image: p.image || "/products/default.svg",
        stock: p.stock,
        category_id: p.category_id,
        active: p.active,
        created_at: p.created_at,
        category: p.categories
          ? { id: p.categories.id, name: p.categories.name, slug: p.categories.slug, description: p.categories.description }
          : undefined,
      }));
      return { products: prods, total: count || prods.length, page, perPage };
    }
  } catch (err) {
    console.warn("Supabase listProductsAsync warning:", err);
  }
  return listProducts(filters);
}

export function getProductBySlug(slug: string): Product | undefined {
  const row = get<ProductRow>(`${BASE_SELECT} WHERE p.slug = ?`, [slug]);
  return row ? hydrate(row) : undefined;
}

export async function getProductBySlugAsync(slug: string): Promise<Product | undefined> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("*, categories(*)")
      .eq("slug", slug)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        price_cents: data.price_cents,
        compare_at_cents: data.compare_at_cents,
        image: data.image || "/products/default.svg",
        stock: data.stock,
        category_id: data.category_id,
        active: data.active,
        created_at: data.created_at,
        category: data.categories
          ? { id: data.categories.id, name: data.categories.name, slug: data.categories.slug, description: data.categories.description }
          : undefined,
      };
    }
  } catch (err) {
    console.warn("Supabase getProductBySlugAsync warning:", err);
  }
  return getProductBySlug(slug);
}

export function getProduct(id: number): Product | undefined {
  const row = get<ProductRow>(`${BASE_SELECT} WHERE p.id = ?`, [id]);
  return row ? hydrate(row) : undefined;
}

export function listFeaturedProducts(limit = 8): Product[] {
  const rows = query<ProductRow>(
    `${BASE_SELECT} WHERE p.active = 1 AND p.stock > 0 ORDER BY p.price_cents DESC LIMIT ?`,
    [limit]
  );
  return rows.map(hydrate);
}

export function listNewestProducts(limit = 8): Product[] {
  const rows = query<ProductRow>(`${BASE_SELECT} WHERE p.active = 1 ORDER BY p.created_at DESC LIMIT ?`, [limit]);
  return rows.map(hydrate);
}

export function listRelatedProducts(categoryId: number | null, excludeId: number, limit = 4): Product[] {
  if (!categoryId) return listNewestProducts(limit).filter((p) => p.id !== excludeId);
  const rows = query<ProductRow>(
    `${BASE_SELECT} WHERE p.active = 1 AND p.category_id = ? AND p.id != ? ORDER BY p.price_cents ASC LIMIT ?`,
    [categoryId, excludeId, limit]
  );
  return rows.map(hydrate);
}

export function createProduct(input: ProductInput): Product {
  const name = input.name.trim();
  const existing = new Set(query<SlugRow>("SELECT slug FROM products").map((r) => r.slug));
  const slug = uniqueSlug(name, existing);
  const { lastInsertRowid } = run(
    `INSERT INTO products (name, slug, description, price_cents, compare_at_cents, image, stock, category_id, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      slug,
      input.description.trim(),
      input.price_cents,
      input.compare_at_cents,
      input.image.trim() || "/products/default.svg",
      input.stock,
      input.category_id,
      input.active,
    ]
  );
  const newProduct = getProduct(lastInsertRowid)!;

  // Asynchronously sync to Supabase
  try {
    const supabase = getSupabaseAdmin();
    supabase
      .from("products")
      .insert({
        name: newProduct.name,
        slug: newProduct.slug,
        description: newProduct.description,
        price_cents: newProduct.price_cents,
        compare_at_cents: newProduct.compare_at_cents,
        image: newProduct.image,
        stock: newProduct.stock,
        category_id: newProduct.category_id,
        active: newProduct.active,
      })
      .then(({ error }) => {
        if (error) console.warn("Supabase create product sync:", error.message);
      });
  } catch (err) {
    console.warn("Supabase create product error:", err);
  }

  return newProduct;
}

export function updateProduct(id: number, input: Partial<ProductInput>): Product {
  const fields: string[] = [];
  const params: unknown[] = [];
  const map: Record<keyof ProductInput, string> = {
    name: "name",
    description: "description",
    price_cents: "price_cents",
    compare_at_cents: "compare_at_cents",
    image: "image",
    stock: "stock",
    category_id: "category_id",
    active: "active",
  };
  for (const [key, column] of Object.entries(map) as [keyof ProductInput, string][]) {
    if (input[key] !== undefined) {
      fields.push(`${column} = ?`);
      params.push(input[key]);
    }
  }
  if (fields.length) {
    params.push(id);
    run(`UPDATE products SET ${fields.join(", ")} WHERE id = ?`, params);
  }
  const updated = getProduct(id)!;

  // Asynchronously sync to Supabase
  try {
    const supabase = getSupabaseAdmin();
    supabase
      .from("products")
      .update({
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.price_cents !== undefined ? { price_cents: input.price_cents } : {}),
        ...(input.compare_at_cents !== undefined ? { compare_at_cents: input.compare_at_cents } : {}),
        ...(input.image !== undefined ? { image: input.image } : {}),
        ...(input.stock !== undefined ? { stock: input.stock } : {}),
        ...(input.category_id !== undefined ? { category_id: input.category_id } : {}),
        ...(input.active !== undefined ? { active: input.active } : {}),
      })
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.warn("Supabase update product sync:", error.message);
      });
  } catch (err) {
    console.warn("Supabase update product error:", err);
  }

  return updated;
}

export function deleteProduct(id: number): void {
  tx(() => {
    run("DELETE FROM reviews WHERE product_id = ?", [id]);
    run("UPDATE order_items SET product_id = NULL WHERE product_id = ?", [id]);
    run("DELETE FROM products WHERE id = ?", [id]);
  });

  // Asynchronously sync to Supabase
  try {
    const supabase = getSupabaseAdmin();
    supabase
      .from("products")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.warn("Supabase delete product sync:", error.message);
      });
  } catch (err) {
    console.warn("Supabase delete product error:", err);
  }
}

/** Decrements stock for each purchased line. Returns false if any item lacks stock. */
export function reserveStock(items: { productId: number; quantity: number }[]): boolean {
  return tx(() => {
    for (const item of items) {
      const p = get<StockRow>("SELECT stock FROM products WHERE id = ?", [item.productId]);
      if (!p || p.stock < item.quantity) return false;
      run("UPDATE products SET stock = stock - ? WHERE id = ?", [item.quantity, item.productId]);
    }

    // Sync to Supabase
    try {
      const supabase = getSupabaseAdmin();
      for (const item of items) {
        const p = get<StockRow>("SELECT stock FROM products WHERE id = ?", [item.productId]);
        if (p) {
          supabase
            .from("products")
            .update({ stock: p.stock })
            .eq("id", item.productId)
            .then();
        }
      }
    } catch {}

    return true;
  });
}

export function restoreStock(items: { productId: number; quantity: number }[]): void {
  tx(() => {
    for (const item of items) {
      run("UPDATE products SET stock = stock + ? WHERE id = ?", [item.quantity, item.productId]);
    }

    // Sync to Supabase
    try {
      const supabase = getSupabaseAdmin();
      for (const item of items) {
        const p = get<StockRow>("SELECT stock FROM products WHERE id = ?", [item.productId]);
        if (p) {
          supabase
            .from("products")
            .update({ stock: p.stock })
            .eq("id", item.productId)
            .then();
        }
      }
    } catch {}
  });
}
