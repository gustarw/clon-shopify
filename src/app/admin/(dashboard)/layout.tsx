import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAiProvider } from "@/components/admin/AdminAiProvider";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <AdminAiProvider>
      <AdminShell userName={session.name}>{children}</AdminShell>
    </AdminAiProvider>
  );
}
