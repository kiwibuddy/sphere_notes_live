"use client";

export function SendToMineButton({ onSend }: { onSend: () => void }) {
  return (
    <button
      type="button"
      onClick={onSend}
      className="text-xs font-medium text-tab-mine transition-colors hover:text-tab-mine/80"
    >
      + My Notes
    </button>
  );
}
