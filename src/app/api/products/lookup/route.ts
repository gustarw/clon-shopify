import { NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/repo/products";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slugsParam = searchParams.get("slugs");
    const slug = searchParams.get("slug");

    if (slug) {
      const product = getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
      return NextResponse.json({ product });
    }

    if (slugsParam) {
      const slugs = slugsParam.split(",").map((s) => s.trim()).filter(Boolean);
      const products = slugs.map((s) => getProductBySlug(s)).filter(Boolean);
      return NextResponse.json({ products });
    }

    return NextResponse.json({ error: "Missing slug or slugs parameter" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to lookup products" }, { status: 500 });
  }
}
