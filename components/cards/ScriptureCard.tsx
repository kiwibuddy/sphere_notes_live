"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CardActions } from "./SectionTitleCard";

export function ScriptureCard({
  reference,
  translation,
  text,
  onSendToMine,
}: {
  reference: string;
  translation: string;
  text: string;
  onSendToMine?: (text: string) => void;
}) {
  const full = `${reference} (${translation}): ${text}`;
  return (
    <Card>
      <CardContent className="p-5">
        <p className="font-display text-lg font-normal text-tab-notes">
          {reference}
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted">
          {translation}
        </p>
        <p className="mt-3 font-display text-sm leading-relaxed text-foreground">
          {text}
        </p>
        <CardActions onSendToMine={onSendToMine} sendText={full} />
      </CardContent>
    </Card>
  );
}
