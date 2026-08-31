import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { importShopifyThemeFromZip } from "@/lib/theme-importer/shopify-zip-extractor";
import { installTheme } from "@/lib/repo/theme";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer;
    let originalName = "shopify-theme.zip";
    let setActive = false;

    if (contentType.includes("application/json")) {
      const body = await req.json();
      const base64Data = body.data || body.file || body.dataUrl || "";
      originalName = body.name || body.filename || "shopify-theme.zip";
      setActive = Boolean(body.setActive);

      if (!base64Data) {
        return NextResponse.json(
          { success: false, error: "Nenhum arquivo ou dado base64 fornecido." },
          { status: 400 }
        );
      }

      const match = base64Data.match(/^data:application\/[a-zA-Z0-9.-]+;base64,(.+)$/);
      buffer = Buffer.from(match ? match[1] : base64Data, "base64");
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      setActive = formData.get("setActive") === "true" || formData.get("setActive") === "1";

      if (!file) {
        return NextResponse.json(
          { success: false, error: "Nenhum arquivo enviado no formulário." },
          { status: 400 }
        );
      }

      originalName = file.name || "shopify-theme.zip";
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    if (!originalName.toLowerCase().endsWith(".zip") && !originalName.toLowerCase().endsWith(".json")) {
      return NextResponse.json(
        {
          success: false,
          error: "Formato inválido. Por favor, envie um arquivo .ZIP do tema Shopify ou arquivo de template .JSON.",
        },
        { status: 400 }
      );
    }

    // Process conversion
    const conversionResult = await importShopifyThemeFromZip(buffer, originalName);

    if (!conversionResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Falha na conversão do tema Shopify.",
          warnings: conversionResult.warnings,
          logs: conversionResult.logs,
        },
        { status: 422 }
      );
    }

    // Save newly converted theme to database
    installTheme(conversionResult.theme, setActive);

    return NextResponse.json({
      message: `Tema "${conversionResult.metadata.themeName}" importado e convertido com sucesso!`,
      ...conversionResult,
    });
  } catch (error: any) {
    console.error("Erro na API de upload de tema Shopify:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro inesperado ao processar o tema.",
      },
      { status: 500 }
    );
  }
}
