"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { StudentContent } from "@/components/layout/StudentContent";
import { NoteCardRenderer } from "@/components/cards/NoteCardRenderer";
import { useSendToMine } from "@/hooks/useSendToMine";
import { useSession } from "@/lib/session/context";

export default function AutoNotesPage() {
  const { notes, meta, isTabLiveActive } = useSession();
  const sendToMine = useSendToMine();
  const isLive = isTabLiveActive("notes");
  const showContent = isLive || meta.status === "paused";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <StudentContent width="wide" className="relative">
        <WaitingOverlay
          show={!showContent}
          message="AI notes will generate when the session goes live."
        />
        {showContent && (
          <div className="grid gap-4 lg:grid-cols-2">
            {notes.map((card, i) => (
              <div
                key={card.id}
                className={
                  card.type === "quote" || card.type === "section"
                    ? "lg:col-span-2"
                    : undefined
                }
              >
                <NoteCardRenderer
                  card={card}
                  index={i}
                  onSendToMine={(text) => sendToMine(text, "auto", "AI Notes")}
                />
              </div>
            ))}
          </div>
        )}
      </StudentContent>
    </div>
  );
}
