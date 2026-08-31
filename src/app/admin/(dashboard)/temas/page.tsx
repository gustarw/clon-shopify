import { getThemeConfig } from "@/lib/repo/theme";
import { AdminThemesView } from "@/components/admin/AdminThemesView";

export const dynamic = "force-dynamic";

export default async function AdminThemesPage() {
  const currentTheme = getThemeConfig();

  return <AdminThemesView currentTheme={currentTheme} />;
}
