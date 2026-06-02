"use client";
import { LIVE_SYNC_DAY } from "@/lib/session/live-sync";
import { useMineNotes } from "@/hooks/useMineNotes";
import { NotesFormatToolbar } from "@/components/notes/NotesFormatToolbar";
import { ClippingBlock } from "@/components/notes/ClippingBlock";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef } from "react";

interface MineEditorProps {
  day?: number;
  scope?: "live" | "archive";
}

export function MineEditor({ day = LIVE_SYNC_DAY, scope = "live" }: MineEditorProps) {
  const {
    content,
    clippings,
    lastSaved,
    updateContent,
    removeClipping,
  } = useMineNotes(day, { scope });
  const editorRef = useRef<HTMLDivElement>(null);
  const skipSync = useRef(false);

  useEffect(() => {
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== content) {
      editor.innerHTML = content || "";
    }
  }, [content]);

  const persistEditor = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    skipSync.current = true;
    updateContent(html);
  }, [updateContent]);

  const handleCopy = async () => {
    const editor = editorRef.current;
    if (!editor) return;
    try {
      await navigator.clipboard.writeText(editor.innerText);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleExportPdf = useCallback(() => {
    persistEditor();
    window.print();
  }, [persistEditor]);

  return (
    <div className="flex h-full flex-col bg-[#F5F0E8]">
      <div className="relative flex-1 overflow-y-auto p-4 md:p-6">
        <NotesFormatToolbar editorRef={editorRef} onChange={persistEditor} />

        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={persistEditor}
          onBlur={persistEditor}
          data-placeholder={
            scope === "archive"
              ? "Your archived notes for this week session…"
              : "Your notes for this session…"
          }
          className={cn(
            "mine-editor min-h-[160px] rounded-xl bg-surface/60 px-4 pb-4 pt-12",
            "text-sm leading-relaxed text-foreground shadow-sm",
            "outline-none ring-1 ring-border/40 transition-shadow",
            "focus:bg-surface focus:ring-tab-mine/30",
            "md:min-h-[200px] md:px-5 md:pb-5 md:pt-14 md:text-base"
          )}
        />

        {clippings.length > 0 && (
          <div className="mt-5 space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              Clippings
            </p>
            {clippings.map((clip) => (
              <ClippingBlock
                key={clip.id}
                clip={clip}
                onRemove={removeClipping}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mine-notes-actions border-t border-border/50 bg-surface/50 p-3 md:p-4">
        <div className="mx-auto flex max-w-lg gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 rounded-lg border border-border bg-surface py-2.5 text-xs font-medium text-muted transition-colors hover:text-foreground md:text-sm"
          >
            Copy
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            className="mine-export-pdf flex-1 rounded-lg bg-tab-mine py-2.5 text-xs font-medium text-white transition-opacity hover:opacity-90 md:text-sm"
          >
            Export PDF
          </button>
        </div>
        <p className="mt-2 text-center font-mono text-[10px] text-muted">
          {lastSaved
            ? `Saved ${formatRelative(lastSaved)}`
            : "Auto-save enabled"}
        </p>
      </div>
    </div>
  );
}

function formatRelative(date: Date) {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  return `${Math.floor(sec / 60)}m ago`;
}
