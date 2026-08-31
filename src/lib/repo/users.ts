import "server-only";
import { get, query, run } from "../db";
import { hashPassword } from "../auth";
import { getSupabaseAdmin } from "../supabase";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: "customer" | "admin";
  created_at: string;
}

export type PublicUser = Omit<User, "password_hash">;

const USER_SELECT = "SELECT id, name, email, password_hash, role, created_at FROM users";

export function listUsers(): PublicUser[] {
  return query<User>("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC");
}

export async function listUsersAsync(): Promise<PublicUser[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data as PublicUser[];
    }
  } catch (err) {
    console.warn("Supabase listUsersAsync warning:", err);
  }
  return listUsers();
}

export function getUser(id: number): User | undefined {
  return get<User>(`${USER_SELECT} WHERE id = ?`, [id]);
}

export async function getUserAsync(id: number): Promise<User | undefined> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) return data as User;
  } catch (err) {
    console.warn("Supabase getUserAsync warning:", err);
  }
  return getUser(id);
}

export function getUserByEmail(email: string): User | undefined {
  return get<User>(`${USER_SELECT} WHERE lower(email) = lower(?)`, [email.trim()]);
}

export async function getUserByEmailAsync(email: string): Promise<User | undefined> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("email", email.trim().toLowerCase())
      .maybeSingle();

    if (!error && data) return data as User;
  } catch (err) {
    console.warn("Supabase getUserByEmailAsync warning:", err);
  }
  return getUserByEmail(email);
}

export async function createUser(input: { name: string; email: string; password: string; role?: "customer" | "admin" }): Promise<User> {
  const password_hash = await hashPassword(input.password);
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanName = input.name.trim();
  const role = input.role || "customer";

  const { lastInsertRowid } = run(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
    [cleanName, cleanEmail, password_hash, role]
  );
  const user = getUser(lastInsertRowid)!;

  // Asynchronously sync to Supabase
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("users").insert({
      name: cleanName,
      email: cleanEmail,
      password_hash: password_hash,
      role: role,
    });
  } catch (err) {
    console.warn("Supabase createUser sync warning:", err);
  }

  return user;
}

export function deleteUser(id: number): void {
  run("DELETE FROM users WHERE id = ?", [id]);

  try {
    const supabase = getSupabaseAdmin();
    supabase.from("users").delete().eq("id", id).then();
  } catch {}
}

export function countUsers(): number {
  return Number(get<{ n: number }>("SELECT COUNT(*) AS n FROM users")?.n ?? 0);
}
