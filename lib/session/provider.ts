/**
 * Session provider abstraction.
 * MVP uses MockSessionProvider (lib/session/context.tsx).
 * LIVE: Swap to SupabaseSessionProvider when env vars are configured.
 */
export type SessionProviderType = "mock" | "supabase";

export function getSessionProviderType(): SessionProviderType {
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return "supabase";
  }
  return "mock";
}
