"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { SlideViewer } from "@/components/slides/SlideViewer";
import { useSession } from "@/lib/session/context";

export default function SlidesPage() {
  const { meta, isTabLiveActive } = useSession();
  const isLive = isTabLiveActive("slides");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <WaitingOverlay
        show={!isLive && meta.status !== "paused"}
        message="Slides will sync when the session goes live."
      />
      <SlideViewer />
    </div>
  );
}
