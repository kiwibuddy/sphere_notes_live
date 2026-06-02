"use client";

/**
 * Shown when Supabase env vars are missing. The app does not run on mock data.
 */
export function SupabaseRequired() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <p className="font-display text-2xl text-foreground">Live backend required</p>
      <p className="mt-3 max-w-md text-sm text-muted">
        SphereNotes Live only runs with Supabase configured. There is no mock-data
        mode — you will not see fake subtitles, notes, or session state.
      </p>
      <ol className="mt-6 max-w-md list-inside list-decimal space-y-2 text-left text-sm text-foreground">
        <li>
          Create a Supabase project and enable <strong>Anonymous</strong> sign-in.
        </li>
        <li>
          Run <code className="rounded bg-surface px-1">supabase/migrations/001_initial_schema.sql</code>{" "}
          in the SQL Editor.
        </li>
        <li>
          Copy <code className="rounded bg-surface px-1">.env.example</code> →{" "}
          <code className="rounded bg-surface px-1">.env.local</code> and set{" "}
          <code className="rounded bg-surface px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-surface px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </li>
        <li>Restart <code className="rounded bg-surface px-1">npm run dev</code>.</li>
      </ol>
      <p className="mt-6 text-xs text-muted">
        See <code className="rounded bg-surface px-1">supabase/README.md</code> in the repo.
      </p>
    </div>
  );
}
