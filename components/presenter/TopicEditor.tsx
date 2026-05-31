"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session/context";
import { cn } from "@/lib/utils";
import { Check, Pencil, X } from "lucide-react";

function EditableField({
  label,
  value,
  onSave,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const startEdit = () => {
    setDraft(value);
    setEditing(true);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={className}>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
          {label}
        </p>
        <div className="flex items-start gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-foreground/20 focus:ring-2"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={save}
            className="shrink-0 px-2"
            aria-label="Save"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={cancel}
            className="shrink-0 px-2"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
        {label}
      </p>
      <button
        type="button"
        onClick={startEdit}
        className={cn(
          "group flex w-full items-start gap-2 rounded-lg px-1 py-0.5 text-left transition-colors hover:bg-background"
        )}
      >
        <span className="min-w-0 flex-1 text-sm text-foreground">{value}</span>
        <Pencil className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      </button>
    </div>
  );
}

export function TopicEditor({ embedded = false }: { embedded?: boolean }) {
  const { meta, getDayInfo, setEventTitle, setDayTopic, setDayDate } =
    useSession();
  const day = getDayInfo(meta.currentDay);

  const content = (
    <div className="grid gap-4 sm:grid-cols-2">
      <EditableField
        label="Week topic"
        value={meta.title}
        onSave={setEventTitle}
        placeholder="e.g. Biblical Worldview"
      />
      <EditableField
        label="Day topic"
        value={day.topic}
        onSave={(topic) => setDayTopic(meta.currentDay, topic)}
        placeholder="e.g. Creation & Fall"
      />
      <EditableField
        label="Date"
        value={day.date}
        onSave={(date) => setDayDate(meta.currentDay, date)}
        placeholder="e.g. Monday 2 June"
        className="sm:col-span-2"
      />
    </div>
  );

  if (embedded) {
    return (
      <div>
        <h3 className="text-sm font-semibold text-foreground">Session topics</h3>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Week and day titles sync to student phones, display screen, and week
          archive.
        </p>
        <div className="mt-4">{content}</div>
      </div>
    );
  }

  return (
    <section className="mb-6 rounded-xl border border-border bg-surface p-4 shadow-card md:p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Session topics</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Week and day titles sync to student phones, display screen, and week
          archive. Update these at the start of each teaching day.
        </p>
      </div>
      {content}
    </section>
  );
}
