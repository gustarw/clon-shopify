import "server-only";
import { get, query } from "../db";
import { countUsers } from "./users";
import { listProducts } from "./products";

export interface DashboardStats {
  revenueCents: number;
  revenueDeltaPct: number | null;
  ordersCount: number;
  ordersDeltaPct: number | null;
  productsCount: number;
  activeProductsCount: number;
  lowStockCount: number;
  customersCount: number;
  avgOrderCents: number;
  revenueByDay: Array<{ date: string; label: string; cents: number }>;
  revenueByCategory: Array<{ name: string; cents: number; count: number }>;
  topProducts: Array<{ name: string; sold: number; cents: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  recentOrders: Array<{ id: number; email: string; total_cents: number; status: string; created_at: string }>;
}

function dayStart(offset: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - offset);
  return d.toISOString().slice(0, 10);
}

export function getDashboardStats(days = 30): DashboardStats {
  const from = dayStart(days);
  const fromPrev = dayStart(days * 2);

  const totalRevenue = Number(
    get<{ s: number | null }>(
      "SELECT COALESCE(SUM(total_cents),0) AS s FROM orders WHERE status != 'cancelled'"
    )?.s || 0
  );
  const orderCount = Number(
    get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM orders WHERE status != 'cancelled'"
    )?.n || 0
  );

  const currentRange = query<{ date: string; cents: number }>(
    `SELECT substr(created_at,1,10) AS date, COALESCE(SUM(total_cents),0) AS cents
     FROM orders WHERE status != 'cancelled' AND created_at >= ?
     GROUP BY date ORDER BY date`,
    [from]
  );
  const previousRange = query<{ cents: number }>(
    `SELECT COALESCE(SUM(total_cents),0) AS cents FROM orders
     WHERE status != 'cancelled' AND created_at >= ? AND created_at < ?`,
    [fromPrev, from]
  );

  const currentCents = currentRange.reduce((s, r) => s + r.cents, 0);
  const previousCents = previousRange[0]?.cents || 0;
  const revenueDeltaPct = previousCents > 0 ? ((currentCents - previousCents) / previousCents) * 100 : null;

  const currentOrders = Number(
    get<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE created_at >= ?", [from])?.n || 0
  );
  const previousOrders = Number(
    get<{ n: number }>(
      "SELECT COUNT(*) AS n FROM orders WHERE created_at >= ? AND created_at < ?",
      [fromPrev, from]
    )?.n || 0
  );
  const ordersDeltaPct = previousOrders > 0 ? ((currentOrders - previousOrders) / previousOrders) * 100 : null;

  // Build a continuous day series so the chart has no gaps.
  const byDate = new Map(currentRange.map((r) => [r.date, r.cents]));
  const revenueByDay: DashboardStats["revenueByDay"] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = dayStart(i);
    const d = new Date(date + "T00:00:00Z");
    revenueByDay.push({
      date,
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "UTC" }),
      cents: byDate.get(date) || 0,
    });
  }

  const prodStats = get<{ total: number; active: number; low_stock: number }>(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN active = 1 THEN 1 ELSE 0 END), 0) AS active,
            COALESCE(SUM(CASE WHEN active = 1 AND stock <= 5 THEN 1 ELSE 0 END), 0) AS low_stock
     FROM products`
  ) || { total: 0, active: 0, low_stock: 0 };

  const revenueByCategory = query<{ name: string; cents: number; count: number }>(
    `SELECT COALESCE(c.name, 'Sem categoria') AS name,
            COALESCE(SUM(oi.price_cents * oi.quantity), 0) AS cents,
            COUNT(DISTINCT o.id) AS count
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id AND o.status != 'cancelled'
     LEFT JOIN products p ON p.id = oi.product_id
     LEFT JOIN categories c ON c.id = p.category_id
     GROUP BY COALESCE(c.name, 'Sem categoria')
     ORDER BY cents DESC LIMIT 6`
  );

  const topProducts = query<{ name: string; sold: number; cents: number }>(
    `SELECT oi.name AS name, SUM(oi.quantity) AS sold, SUM(oi.price_cents * oi.quantity) AS cents
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status != 'cancelled'
     GROUP BY oi.product_id, oi.name
     ORDER BY sold DESC LIMIT 5`
  );

  const statusBreakdown = query<{ status: string; count: number }>(
    "SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC"
  );

  const recentOrders = query<DashboardStats["recentOrders"][number]>(
    `SELECT id, email, total_cents, status, created_at FROM orders
     ORDER BY id DESC LIMIT 5`
  );

  return {
    revenueCents: totalRevenue,
    revenueDeltaPct,
    ordersCount: orderCount,
    ordersDeltaPct,
    productsCount: prodStats.total,
    activeProductsCount: prodStats.active,
    lowStockCount: prodStats.low_stock,
    customersCount: countUsers(),
    avgOrderCents: orderCount ? Math.round(totalRevenue / orderCount) : 0,
    revenueByDay,
    revenueByCategory,
    topProducts,
    statusBreakdown,
    recentOrders,
  };
}
