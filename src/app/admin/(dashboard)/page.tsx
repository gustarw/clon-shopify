import type { Metadata } from "next";
import { getDashboardStats } from "@/lib/repo/stats";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";

export const metadata: Metadata = { title: "Painel Geral" };
export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  const stats = getDashboardStats();

  return <AdminDashboardView stats={stats} />;
}
