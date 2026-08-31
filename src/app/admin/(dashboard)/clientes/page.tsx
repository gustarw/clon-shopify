import type { Metadata } from "next";
import { listUsers } from "@/lib/repo/users";
import { query, get } from "@/lib/db";
import { AdminClientsView } from "@/components/admin/AdminClientsView";

export const metadata: Metadata = { title: "Clientes" };
export const dynamic = "force-dynamic";

export default function AdminClientsPage() {
  const users = listUsers();
  const revRow = get<{ s: number }>(
    "SELECT COALESCE(SUM(total_cents), 0) AS s FROM orders WHERE status != 'cancelled'"
  );
  const totalRevenue = Number(revRow?.s || 0);

  const statsRows = query<{ email: string; count: number; cents: number }>(
    `SELECT LOWER(email) AS email, COUNT(*) AS count, COALESCE(SUM(total_cents), 0) AS cents
     FROM orders WHERE status != 'cancelled'
     GROUP BY LOWER(email)`
  );

  const byEmail: Record<string, { count: number; cents: number }> = {};
  for (const r of statsRows) {
    byEmail[r.email] = { count: Number(r.count), cents: Number(r.cents) };
  }

  return (
    <AdminClientsView
      users={users}
      totalRevenue={totalRevenue}
      byEmail={byEmail}
    />
  );
}
