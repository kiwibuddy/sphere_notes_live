"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { StudentContent } from "@/components/layout/StudentContent";
import { SessionOverview } from "@/components/notes/SessionOverview";
import { useSendToMine } from "@/hooks/useSendToMine";
import { useSession } from "@/lib/session/context";

export default function OverviewNotesPage() {
  const { sessionMap, meta, isTabLiveActive } = useSession();
  const sendToMine = useSendToMine();
  const isLive = isTabLiveActive("notes");
  const showContent = isLive || meta.status === "paused";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <StudentContent width="default" className="relative">
        <WaitingOverlay
          show={!showContent}
          message="Session overview builds as teaching progresses."
        />
        {showContent && (
          <SessionOverview
            segments={sessionMap}
            onSendToMine={(text) => sendToMine(text, "overview", "Session Map")}
          />
        )}
      </StudentContent>
    </div>
  );
}
