"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session/session-context";
import { buildStudentJoinQuery, isStudentRoute } from "@/lib/session/join-url";

/** Ensures /student/* URLs include ?event= (no day number). */
export function StudentJoinRedirect() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sessionReady, joinEventId } = useSession();

  useEffect(() => {
    if (!isStudentRoute(pathname) || !sessionReady) return;

    const event = searchParams.get("event");
    if (event) return;

    const query = buildStudentJoinQuery(joinEventId);
    router.replace(`${pathname}${query}`);
  }, [pathname, searchParams, router, sessionReady, joinEventId]);

  return null;
}
