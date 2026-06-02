"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/session/session-context";
import { buildStudentJoinQuery, isStudentRoute } from "@/lib/session/join-url";

/**
 * Ensures /student/* URLs always include ?event=&day= (Step 2 join contract).
 */
export function StudentJoinRedirect() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sessionReady, joinEventId, activeDay, meta } = useSession();

  useEffect(() => {
    if (!isStudentRoute(pathname) || !sessionReady) return;

    const event = searchParams.get("event");
    const day = searchParams.get("day");

    if (event && day) {
      if (event !== joinEventId) return;
      return;
    }

    const query = buildStudentJoinQuery(joinEventId, activeDay);
    router.replace(`${pathname}${query}`);
  }, [
    pathname,
    searchParams,
    router,
    sessionReady,
    joinEventId,
    activeDay,
    meta.eventId,
  ]);

  return null;
}
