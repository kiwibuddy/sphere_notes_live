"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { NoteCardRenderer } from "@/components/cards/NoteCardRenderer";
import { useSendToMine } from "@/hooks/useSendToMine";
import { useSession } from "@/lib/session/context";

export default function AutoNotesPage() {
  const { notes, meta, isTabLiveActive } = useSession();
  const sendToMine = useSendToMine();
  const isLive = isTabLiveActive("notes");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <WaitingOverlay
        show={!isLive && meta.status !== "paused"}
        message="AI notes will generate when the session goes live."
      />
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {notes.map((card, i) => (
          <NoteCardRenderer
            key={card.id}
            card={card}
            index={i}
            onSendToMine={(text) => sendToMine(text, "auto", "AI Notes")}
          />
        ))}
      </div>
    </div>
  );
}
