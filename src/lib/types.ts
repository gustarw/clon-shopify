/** Shared order types and constants. Kept dependency-free so client components can import them. */

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export const ORDER_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  name: string;
  price_cents: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number | null;
  status: OrderStatus;
  total_cents: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_zip: string;
  shipping_country: string;
  email: string;
  created_at: string;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  compare_at_cents: number | null;
  image: string;
  stock: number;
  category_id: number | null;
  active: number;
  created_at: string;
  category?: Category;
}
