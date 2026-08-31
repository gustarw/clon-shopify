import "server-only";
import { get, query, run, tx } from "../db";
import { getSupabaseAdmin } from "../supabase";

export type {
  OrderStatus,
  Order,
  OrderItem,
  OrderWithItems,
} from "../types";
export { ORDER_STATUSES } from "../types";
import type { Order, OrderStatus, OrderWithItems, OrderItem } from "../types";
import { ORDER_STATUSES } from "../types";

export interface CheckoutLine {
  productId: number;
  name: string;
  priceCents: number;
  quantity: number;
}

export interface CheckoutInput {
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
  userId: number | null;
  lines: CheckoutLine[];
}

const ORDER_SELECT = `
  SELECT o.*, u.name AS customer_name, u.email AS customer_email
  FROM orders o LEFT JOIN users u ON u.id = o.user_id
`;

interface OrderRow {
  id: number;
  user_id: number | null;
  status: string;
  total_cents: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_country: string;
  email: string;
  created_at: string;
  customer_name: string | null;
  customer_email: string | null;
}

function withItems(row: OrderRow): OrderWithItems {
  return {
    id: row.id,
    user_id: row.user_id,
    status: row.status as OrderStatus,
    total_cents: row.total_cents,
    shipping_name: row.shipping_name,
    shipping_address: row.shipping_address,
    shipping_city: row.shipping_city,
    shipping_zip: row.shipping_zip,
    shipping_country: row.shipping_country,
    email: row.email,
    created_at: row.created_at,
    items: listOrderItems(row.id),
  };
}

export function listOrders(filters: { status?: OrderStatus; search?: string } = {}): OrderWithItems[] {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filters.status) {
    where.push("o.status = ?");
    params.push(filters.status);
  }
  if (filters.search?.trim()) {
    where.push("(o.email LIKE ? OR o.shipping_name LIKE ?)");
    const like = `%${filters.search.trim()}%`;
    params.push(like, like);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orders = query<OrderRow>(
    `${ORDER_SELECT} ${whereSql} ORDER BY o.created_at DESC, o.id DESC LIMIT 100`,
    params
  );

  if (!orders.length) return [];

  const orderIds = orders.map((o) => o.id);
  const placeholders = orderIds.map(() => "?").join(",");
  const allItems = query<OrderItem>(
    `SELECT * FROM order_items WHERE order_id IN (${placeholders}) ORDER BY id`,
    orderIds
  );

  const itemsByOrder = new Map<number, OrderItem[]>();
  for (const item of allItems) {
    const list = itemsByOrder.get(item.order_id) || [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  }

  return orders.map((row) => ({
    id: row.id,
    user_id: row.user_id,
    status: row.status as OrderStatus,
    total_cents: row.total_cents,
    shipping_name: row.shipping_name,
    shipping_address: row.shipping_address,
    shipping_city: row.shipping_city,
    shipping_zip: row.shipping_zip,
    shipping_country: row.shipping_country,
    email: row.email,
    created_at: row.created_at,
    items: itemsByOrder.get(row.id) || [],
  }));
}

export async function listOrdersAsync(filters: { status?: OrderStatus; search?: string } = {}): Promise<OrderWithItems[]> {
  try {
    const supabase = getSupabaseAdmin();
    let q = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (filters.status) q = q.eq("status", filters.status);
    if (filters.search?.trim()) {
      q = q.or(`email.ilike.%${filters.search.trim()}%,shipping_name.ilike.%${filters.search.trim()}%`);
    }

    const { data, error } = await q.limit(100);
    if (!error && data && data.length > 0) {
      return data.map((o: any) => ({
        id: o.id,
        user_id: o.user_id,
        status: o.status as OrderStatus,
        total_cents: o.total_cents,
        shipping_name: o.shipping_name,
        shipping_address: o.shipping_address,
        shipping_city: o.shipping_city,
        shipping_zip: o.shipping_zip,
        shipping_country: o.shipping_country,
        email: o.email,
        created_at: o.created_at,
        items: (o.order_items || []).map((item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          name: item.name,
          price_cents: item.price_cents,
          quantity: item.quantity,
        })),
      }));
    }
  } catch (err) {
    console.warn("Supabase listOrdersAsync warning:", err);
  }
  return listOrders(filters);
}

export function getOrder(id: number): OrderWithItems | undefined {
  const o = get<OrderRow>(`${ORDER_SELECT} WHERE o.id = ?`, [id]);
  return o ? withItems(o) : undefined;
}

export async function getOrderAsync(id: number): Promise<OrderWithItems | undefined> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        user_id: data.user_id,
        status: data.status as OrderStatus,
        total_cents: data.total_cents,
        shipping_name: data.shipping_name,
        shipping_address: data.shipping_address,
        shipping_city: data.shipping_city,
        shipping_zip: data.shipping_zip,
        shipping_country: data.shipping_country,
        email: data.email,
        created_at: data.created_at,
        items: (data.order_items || []).map((item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          name: item.name,
          price_cents: item.price_cents,
          quantity: item.quantity,
        })),
      };
    }
  } catch (err) {
    console.warn("Supabase getOrderAsync warning:", err);
  }
  return getOrder(id);
}

export function listOrderItems(orderId: number): OrderItem[] {
  return query<OrderItem>("SELECT * FROM order_items WHERE order_id = ? ORDER BY id", [orderId]);
}

/**
 * Places an order atomically: reserves stock, writes the order and its lines,
 * then marks it paid. Rolls back everything if stock is insufficient.
 */
export function placeOrder(input: CheckoutInput): { ok: true; order: Order } | { ok: false; error: string } {
  return tx(() => {
    if (!input.lines.length) return { ok: false as const, error: "Seu carrinho está vazio." };

    for (const line of input.lines) {
      const p = get<{ stock: number }>("SELECT stock FROM products WHERE id = ?", [line.productId]);
      if (!p) return { ok: false as const, error: `Produto indisponível: ${line.name}` };
      if (p.stock < line.quantity) {
        return { ok: false as const, error: `Estoque insuficiente para ${line.name} (disponível: ${p.stock}).` };
      }
    }

    for (const line of input.lines) {
      run("UPDATE products SET stock = stock - ? WHERE id = ?", [line.quantity, line.productId]);
    }

    const total = input.lines.reduce((sum, l) => sum + l.priceCents * l.quantity, 0);
    const { lastInsertRowid } = run(
      `INSERT INTO orders (user_id, status, total_cents, shipping_name, shipping_address, shipping_city, shipping_zip, shipping_country, email)
       VALUES (?, 'paid', ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.userId,
        total,
        input.shippingName.trim(),
        input.shippingAddress.trim(),
        input.shippingCity.trim(),
        input.shippingZip.trim(),
        input.shippingCountry.trim(),
        input.email.trim().toLowerCase(),
      ]
    );
    const orderId = Number(lastInsertRowid);

    for (const line of input.lines) {
      run(
        "INSERT INTO order_items (order_id, product_id, name, price_cents, quantity) VALUES (?, ?, ?, ?, ?)",
        [orderId, line.productId, line.name, line.priceCents, line.quantity]
      );
    }

    // Asynchronously sync order to Supabase
    try {
      const supabase = getSupabaseAdmin();
      supabase
        .from("orders")
        .insert({
          user_id: input.userId,
          status: "paid",
          total_cents: total,
          shipping_name: input.shippingName.trim(),
          shipping_address: input.shippingAddress.trim(),
          shipping_city: input.shippingCity.trim(),
          shipping_zip: input.shippingZip.trim(),
          shipping_country: input.shippingCountry.trim(),
          email: input.email.trim().toLowerCase(),
        })
        .select("id")
        .single()
        .then(({ data: createdOrder, error }) => {
          if (!error && createdOrder) {
            const items = input.lines.map((l) => ({
              order_id: createdOrder.id,
              product_id: l.productId,
              name: l.name,
              price_cents: l.priceCents,
              quantity: l.quantity,
            }));
            supabase.from("order_items").insert(items).then();
          }
        });
    } catch (err) {
      console.warn("Supabase placeOrder sync error:", err);
    }

    return {
      ok: true as const,
      order: {
        id: orderId,
        user_id: input.userId,
        status: "paid",
        total_cents: total,
        shipping_name: input.shippingName,
        shipping_address: input.shippingAddress,
        shipping_city: input.shippingCity,
        shipping_zip: input.shippingZip,
        shipping_country: input.shippingCountry,
        email: input.email,
        created_at: new Date().toISOString(),
      },
    };
  });
}

export function setOrderStatus(orderId: number, status: OrderStatus): void {
  if (!ORDER_STATUSES.includes(status)) throw new Error("Status inválido");
  run("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);

  try {
    const supabase = getSupabaseAdmin();
    supabase.from("orders").update({ status }).eq("id", orderId).then();
  } catch {}
}

export function listCustomerOrders(userId: number): OrderWithItems[] {
  const orders = query<OrderRow>(
    `${ORDER_SELECT} WHERE o.user_id = ? ORDER BY o.created_at DESC, o.id DESC`,
    [userId]
  );
  return orders.map(withItems);
}

export function deleteOrder(id: number): void {
  run("DELETE FROM orders WHERE id = ?", [id]);

  try {
    const supabase = getSupabaseAdmin();
    supabase.from("orders").delete().eq("id", id).then();
  } catch {}
}
