import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;
let publicClient: SupabaseClient | null = null;

export function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://gnxcszxwrsiyoozkqzky.supabase.co"
  );
}

export function getSupabaseSecretKey(): string {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    ""
  );
}

export function getSupabasePublishableKey(): string {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

/**
 * Returns a server-side Supabase client with elevated / admin permissions (using SECRET_KEY).
 * Falls back gracefully if running in environment where only publishable key is present.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = getSupabaseUrl();
  const key = getSupabaseSecretKey() || getSupabasePublishableKey();

  if (!key) {
    console.warn("Supabase key is not configured in environment variables.");
  }

  adminClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}

/**
 * Returns a public client suitable for client-side or anon operations.
 */
export function getSupabaseClient(): SupabaseClient {
  if (publicClient) return publicClient;
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();

  publicClient = createClient(url, key);
  return publicClient;
}
