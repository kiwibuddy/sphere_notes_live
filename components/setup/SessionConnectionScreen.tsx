"use client";

import { Button } from "@/components/ui/button";

export function SessionConnectionScreen({
  message,
  error,
  onRetry,
}: {
  message: string;
  error?: string | null;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      {!error && (
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground"
          aria-hidden
        />
      )}
      <p className="text-sm text-muted">{message}</p>
      {error && (
        <div className="max-w-md space-y-3">
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-900">
            {error}
          </p>
          <ul className="text-left text-xs text-muted">
            <li>Check Wi‑Fi and that Supabase project is active</li>
            <li>
              Confirm <code className="rounded bg-surface px-1">.env.local</code>{" "}
              URL and publishable key
            </li>
            <li>
              In Supabase: Authentication → Providers → Anonymous = ON
            </li>
          </ul>
          {onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
