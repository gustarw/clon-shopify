import "server-only";
import { get, query, run } from "../db";
import { getSupabaseAdmin } from "../supabase";

export interface Review {
  id: number;
  product_id: number;
  user_id: number | null;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface ProductRating {
  average: number;
  count: number;
  histogram: [number, number, number, number, number]; // index 0 => 1 star
}

export function listReviews(productId: number, limit = 50): Review[] {
  return query<Review>(
    "SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC, id DESC LIMIT ?",
    [productId, limit]
  );
}

export async function listReviewsAsync(productId: number, limit = 50): Promise<Review[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as Review[];
    }
  } catch (err) {
    console.warn("Supabase listReviewsAsync warning:", err);
  }
  return listReviews(productId, limit);
}

export function createReview(input: { productId: number; authorName: string; rating: number; comment: string; userId: number | null }): Review {
  const rating = Math.min(5, Math.max(1, Math.round(input.rating)));
  const { lastInsertRowid } = run(
    "INSERT INTO reviews (product_id, user_id, author_name, rating, comment) VALUES (?, ?, ?, ?, ?)",
    [input.productId, input.userId, input.authorName.trim() || "Anônimo", rating, input.comment.trim()]
  );
  const rev = query<Review>("SELECT * FROM reviews WHERE id = ?", [Number(lastInsertRowid)])[0];

  try {
    const supabase = getSupabaseAdmin();
    supabase
      .from("reviews")
      .insert({
        product_id: input.productId,
        user_id: input.userId,
        author_name: input.authorName.trim() || "Anônimo",
        rating,
        comment: input.comment.trim(),
      })
      .then();
  } catch {}

  return rev;
}

export function deleteReview(id: number): void {
  run("DELETE FROM reviews WHERE id = ?", [id]);

  try {
    const supabase = getSupabaseAdmin();
    supabase.from("reviews").delete().eq("id", id).then();
  } catch {}
}

export function getProductRating(productId: number): ProductRating {
  const row = get<{ average: number | null; count: number | null }>(
    "SELECT COALESCE(AVG(rating), 0) AS average, COUNT(*) AS count FROM reviews WHERE product_id = ?",
    [productId]
  );
  const counts = query<{ stars: number; n: number }>(
    "SELECT rating AS stars, COUNT(*) AS n FROM reviews WHERE product_id = ? GROUP BY rating",
    [productId]
  );
  const histogram: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const c of counts) histogram[c.stars - 1] = c.n;
  return {
    average: row ? Number(row.average) : 0,
    count: row ? Number(row.count) : 0,
    histogram,
  };
}

export function countAllReviews(): number {
  return Number(get<{ n: number }>("SELECT COUNT(*) AS n FROM reviews")?.n ?? 0);
}
