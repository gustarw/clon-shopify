import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer;
    let originalName = "upload.jpg";

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const dataUrl = body.dataUrl || body.image || "";
      originalName = body.name || body.filename || "upload.jpg";

      if (!dataUrl) {
        return NextResponse.json({ error: "Nenhum dado de imagem fornecido" }, { status: 400 });
      }

      const base64Match = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
      if (base64Match) {
        buffer = Buffer.from(base64Match[2], "base64");
      } else {
        buffer = Buffer.from(dataUrl, "base64");
      }
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
      }

      originalName = file.name || "upload.jpg";
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Clean extension and filename
    const ext = path.extname(originalName) || ".jpg";
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40);
    const filename = `${baseName}_${Date.now()}${ext}`;

    const filePath = path.join(uploadsDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: publicUrl, success: true });
  } catch (error: any) {
    console.error("Erro no upload de imagem:", error);
    return NextResponse.json(
      { error: "Falha ao salvar a imagem", details: error?.message },
      { status: 500 }
    );
  }
}
