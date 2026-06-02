"use client";

import { useCallback, useMemo } from "react";
import { useSession } from "@/lib/session/session-context";
import { buildStudentJoinQuery } from "@/lib/session/join-url";

export function useStudentJoinQuery(): string {
  const { joinEventId } = useSession();
  return useMemo(
    () => buildStudentJoinQuery(joinEventId),
    [joinEventId]
  );
}

/** Append ?event= to student tab links so join params persist. */
export function useStudentHref(path: string): string {
  const query = useStudentJoinQuery();
  return `${path}${query}`;
}

export function useStudentPathBuilder() {
  const query = useStudentJoinQuery();
  return useCallback((path: string) => `${path}${query}`, [query]);
}
