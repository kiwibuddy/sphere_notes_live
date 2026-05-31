"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { SessionOverview } from "@/components/notes/SessionOverview";
import { useSendToMine } from "@/hooks/useSendToMine";
import { useSession } from "@/lib/session/context";

export default function OverviewNotesPage() {
  const { sessionMap, meta, isTabLiveActive } = useSession();
  const sendToMine = useSendToMine();
  const isLive = isTabLiveActive("notes");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <WaitingOverlay
        show={!isLive && meta.status !== "paused"}
        message="Session overview builds as teaching progresses."
      />
      <div className="flex-1 overflow-y-auto p-4">
        <SessionOverview
          segments={sessionMap}
          onSendToMine={(text) => sendToMine(text, "overview", "Session Map")}
        />
      </div>
    </div>
  );
}
