import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getAllInstalledThemes,
  getThemeConfig,
  setActiveTheme,
  deleteTheme,
  duplicateTheme,
  getThemeById,
} from "@/lib/repo/theme";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const activeTheme = getThemeConfig();
    const installedThemes = getAllInstalledThemes();

    return NextResponse.json({
      success: true,
      activeTheme,
      installedThemes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Erro ao carregar temas." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Acesso não autorizado." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, themeId, config } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Ação não informada." },
        { status: 400 }
      );
    }

    if (action === "activate") {
      if (!themeId && !config) {
        return NextResponse.json(
          { success: false, error: "ID do tema ou configuração não fornecida." },
          { status: 400 }
        );
      }

      const activated = setActiveTheme(themeId, config);
      if (!activated) {
        return NextResponse.json(
          { success: false, error: "Tema não encontrado para ativação." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Tema "${activated.name}" ativado e publicado com sucesso!`,
        theme: activated,
      });
    }

    if (action === "duplicate") {
      if (!themeId) {
        return NextResponse.json(
          { success: false, error: "ID do tema não fornecido." },
          { status: 400 }
        );
      }

      const cloned = duplicateTheme(themeId);
      if (!cloned) {
        return NextResponse.json(
          { success: false, error: "Tema não encontrado para duplicação." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Tema duplicado com sucesso como "${cloned.name}"!`,
        theme: cloned,
      });
    }

    if (action === "delete") {
      if (!themeId) {
        return NextResponse.json(
          { success: false, error: "ID do tema não fornecido." },
          { status: 400 }
        );
      }

      const ok = deleteTheme(themeId);
      if (!ok) {
        return NextResponse.json(
          {
            success: false,
            error: "Não foi possível excluir o tema (o tema principal ativo não pode ser excluído).",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Tema excluído com sucesso!",
      });
    }

    return NextResponse.json(
      { success: false, error: `Ação desconhecida: "${action}"` },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Erro na API de gerenciamento de temas:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
