"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CardActions } from "./SectionTitleCard";

export function BulletsCard({
  items,
  onSendToMine,
}: {
  items: string[];
  onSendToMine?: (text: string) => void;
}) {
  const text = items.map((i) => `• ${i}`).join("\n");
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Summary
        </p>
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <span className="text-tab-notes">•</span>
              {item}
            </li>
          ))}
        </ul>
        <CardActions onSendToMine={onSendToMine} sendText={text} />
      </CardContent>
    </Card>
  );
}
