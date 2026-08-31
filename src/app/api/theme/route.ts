import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getThemeConfig, resetThemeConfig, saveThemeConfig } from "@/lib/repo/theme";

export async function GET() {
  try {
    const config = getThemeConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error("API Theme GET error:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao carregar tema" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acesso não autorizado" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, config } = body;

    if (action === "reset") {
      const resetConfig = resetThemeConfig();
      return NextResponse.json({ success: true, config: resetConfig });
    }

    if (!config) {
      return NextResponse.json(
        { success: false, error: "Configuração inválida" },
        { status: 400 }
      );
    }

    const saved = saveThemeConfig(config);
    return NextResponse.json({ success: true, config: saved });
  } catch (error) {
    console.error("API Theme POST error:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao salvar tema" },
      { status: 500 }
    );
  }
}
