"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createSession,
  destroySession,
  getSession,
  verifyPassword,
} from "./auth";
import { createUser, getUserByEmail, getUserByEmailAsync } from "./repo/users";
import { placeOrder, setOrderStatus, type OrderStatus } from "./repo/orders";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  type ProductInput,
} from "./repo/products";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "./repo/categories";
import { createReview } from "./repo/reviews";
import { parseMoney } from "./money";

/* ---------------------------------- Auth ---------------------------------- */

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(1, "Informe a senha."),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  });
  if (!parsed.success) {
    redirect(`/login?erro=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const { email, password } = parsed.data;
  const user = (await getUserByEmailAsync(email)) || getUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    redirect("/login?erro=Credenciais%20inválidas.");
  }

  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  redirect(user.role === "admin" ? "/admin" : "/login");
}

const registerSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("Informe um e-mail válido."),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
  password2: z.string(),
});

export async function registerAction(formData: FormData) {
  const data = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    password2: String(formData.get("password2") || ""),
  };
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    redirect(`/registrar?erro=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }
  if (data.password !== data.password2) {
    redirect("/registrar?erro=As%20senhas%20não%20coincidem.");
  }
  const existing = (await getUserByEmailAsync(data.email)) || getUserByEmail(data.email);
  if (existing) {
    redirect("/registrar?erro=Já%20existe%20uma%20conta%20com%20esse%20e-mail.");
  }

  const user = await createUser({ name: data.name, email: data.email, password: data.password });
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  redirect("/login");
}

export async function adminLoginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
  });
  if (!parsed.success) {
    redirect(`/admin/login?erro=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }

  const { email, password } = parsed.data;
  const user = (await getUserByEmailAsync(email)) || getUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    redirect("/admin/login?erro=E-mail%20ou%20senha%20incorretos.");
  }
  if (user.role !== "admin") {
    redirect("/admin/login?erro=Acesso%20restrito%20a%20administradores.");
  }

  await createSession({ id: user.id, name: user.name, email: user.email, role: "admin" });
  redirect("/admin");
}

export async function adminRegisterAction(formData: FormData) {
  const data = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    password: String(formData.get("password") || ""),
    password2: String(formData.get("password2") || ""),
  };
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    redirect(`/admin/registrar?erro=${encodeURIComponent(parsed.error.issues[0].message)}`);
  }
  if (data.password !== data.password2) {
    redirect("/admin/registrar?erro=As%20senhas%20não%20coincidem.");
  }
  const existing = (await getUserByEmailAsync(data.email)) || getUserByEmail(data.email);
  if (existing) {
    redirect("/admin/registrar?erro=Já%20existe%20uma%20conta%20com%20esse%20e-mail.");
  }

  const user = await createUser({
    name: data.name,
    email: data.email,
    password: data.password,
    role: "admin",
  });

  await createSession({ id: user.id, name: user.name, email: user.email, role: "admin" });
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

/* ------------------------------- Checkout -------------------------------- */

export async function checkoutAction(payload: {
  lines: { productId: number; name: string; priceCents: number; quantity: number }[];
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingZip: string;
  shippingCountry: string;
}) {
  const session = await getSession();
  const result = placeOrder({
    userId: session?.id ?? null,
    lines: payload.lines,
    email: payload.email,
    shippingName: payload.shippingName,
    shippingAddress: payload.shippingAddress,
    shippingCity: payload.shippingCity,
    shippingZip: payload.shippingZip,
    shippingCountry: payload.shippingCountry,
  });

  if (!result.ok) return { ok: false as const, error: result.error };
  return { ok: true as const, orderId: result.order.id };
}

/* ------------------------------- Reviews -------------------------------- */

export async function submitReviewAction(input: {
  productId: number;
  authorName: string;
  rating: number;
  comment: string;
}): Promise<{ ok: boolean; error?: string }> {
  const parsed = z
    .object({
      productId: z.number().int().positive(),
      authorName: z.string().max(60).optional().or(z.literal("")),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(3, "Comentário muito curto.").max(600),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }

  const session = await getSession();
  createReview({
    productId: parsed.data.productId,
    authorName: parsed.data.authorName || session?.name || "Anônimo",
    rating: parsed.data.rating,
    comment: parsed.data.comment,
    userId: session?.id ?? null,
  });
  revalidatePath(`/produtos`);
  return { ok: true };
}

/* --------------------------- Admin: products ----------------------------- */

const productSchema = z.object({
  name: z.string().min(2, "Informe um nome com pelo menos 2 caracteres."),
  description: z.string().max(4000).optional(),
  price: z.string().min(1, "Informe o preço."),
  compareAt: z.string().optional(),
  image: z.string().max(500).optional(),
  stock: z.coerce.number().int().min(0, "Estoque não pode ser negativo."),
  categoryId: z.coerce.number().int().positive().optional(),
  active: z.enum(["1", "0", "on", "true", ""]).optional(),
});

function parseProductInput(formData: FormData): ProductInput {
  const data = productSchema.parse({
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || ""),
    price: String(formData.get("price") || ""),
    compareAt: String(formData.get("compareAt") || ""),
    image: String(formData.get("image") || ""),
    stock: formData.get("stock") ?? 0,
    categoryId: formData.get("categoryId") || "",
    active: String(formData.get("active") || ""),
  });

  const compareAt = data.compareAt?.trim();
  return {
    name: data.name,
    description: data.description || "",
    price_cents: parseMoney(data.price),
    compare_at_cents: compareAt ? parseMoney(compareAt) : null,
    image: data.image?.trim() || "",
    stock: data.stock,
    category_id: data.categoryId || null,
    active: data.active === "" || data.active === "1" || data.active === "on" ? 1 : 0,
  };
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin();
  const idRaw = String(formData.get("id") || "").trim();
  const id = idRaw ? Number(idRaw) : null;
  const input = parseProductInput(formData);
  const p = id ? updateProduct(id, input) : createProduct(input);
  revalidatePath("/admin/produtos");
  revalidatePath(`/produtos/${p.slug}`);
  redirect("/admin/produtos");
}

export async function deleteProductAction(id: number) {
  await requireAdmin();
  deleteProduct(id);
  revalidatePath("/admin/produtos");
  revalidatePath("/produtos");
}

/* --------------------------- Admin: categories --------------------------- */

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const idRaw = String(formData.get("id") || "").trim();
  const id = idRaw ? Number(idRaw) : null;
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (name.length < 2) {
    redirect(`/admin/categorias?erro=Informe%20um%20nome%20válido.`);
  }
  if (id) updateCategory(id, { name, description });
  else createCategory({ name, description });
  revalidatePath("/admin/categorias");
  revalidatePath("/admin");
}

export async function deleteCategoryAction(id: number) {
  await requireAdmin();
  deleteCategory(id);
  revalidatePath("/admin/categorias");
  revalidatePath("/admin");
}

/* --------------------------- Admin: orders ------------------------------- */

export async function updateOrderStatusAction(orderId: number, status: OrderStatus) {
  await requireAdmin();
  setOrderStatus(orderId, status);
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function requireAdmin(): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/admin/login");
}
