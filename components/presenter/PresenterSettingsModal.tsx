"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SlideSyncPanel } from "@/components/presenter/SlideSyncPanel";
import { TopicEditor } from "@/components/presenter/TopicEditor";
import { X } from "lucide-react";

interface PresenterSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function PresenterSettingsModal({
  open,
  onClose,
}: PresenterSettingsModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Close settings"
        className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="presenter-settings-title"
        className="relative flex max-h-[min(90dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-border"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2
              id="presenter-settings-title"
              className="text-base font-semibold text-foreground"
            >
              Session settings
            </h2>
            <p className="mt-1 text-xs text-muted">
              Topics and slides — set up before you go live.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="shrink-0 px-2"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <TopicEditor embedded />
          <div className="my-5 border-t border-border" />
          <SlideSyncPanel embedded />
        </div>
      </div>
    </div>
  );
}
