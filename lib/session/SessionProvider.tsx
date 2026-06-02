"use client";

import { Suspense, type ReactNode } from "react";
import { SupabaseRequired } from "@/components/setup/SupabaseRequired";
import { isSupabaseConfigured } from "@/lib/session/provider";
import { SupabaseSessionProvider } from "@/lib/session/supabase-provider";

function SessionProviderInner({ children }: { children: ReactNode }) {
  if (!isSupabaseConfigured()) {
    return <SupabaseRequired />;
  }
  return <SupabaseSessionProvider>{children}</SupabaseSessionProvider>;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-sm text-muted">
          Connecting…
        </div>
      }
    >
      <SessionProviderInner>{children}</SessionProviderInner>
    </Suspense>
  );
}
