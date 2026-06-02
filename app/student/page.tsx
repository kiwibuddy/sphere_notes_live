"use client";

import { WaitingOverlay } from "@/components/layout/SessionHeader";
import { SlideViewer } from "@/components/slides/SlideViewer";
import { useSession } from "@/lib/session/context";

/** Default student tab — live Keynote slide sync. */
export default function SlidesPage() {
  const { meta, isTabLiveActive } = useSession();
  const isLive = isTabLiveActive("slides");
  const showContent = isLive || meta.status === "paused";

  return (
    <div className="absolute inset-0 overflow-hidden">
      {!showContent && (
        <WaitingOverlay
          show
          message="Slides will sync when the session goes live."
        />
      )}
      {showContent && <SlideViewer />}
    </div>
  );
}
