import { getSupabaseBrowserClient } from "@/lib/supabase/client";

/** Silent anonymous sign-in — reuses persisted session when possible. */
export async function ensureSupabaseAuth(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user.id) {
    return sessionData.session.user.id;
  }
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    console.error("[supabase] anonymous sign-in failed", error.message);
    return null;
  }
  return data.user?.id ?? null;
}
