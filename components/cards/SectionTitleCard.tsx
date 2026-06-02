"use client";

import { Card, CardContent } from "@/components/ui/card";
import { SendToMineButton } from "./SendToMineButton";

interface CardActionsProps {
  onSendToMine?: (text: string) => void;
  sendText?: string;
}

export function CardActions({ onSendToMine, sendText }: CardActionsProps) {
  if (!onSendToMine || !sendText) return null;
  return (
    <div className="mt-3 flex justify-end">
      <SendToMineButton onSend={() => onSendToMine(sendText)} />
    </div>
  );
}

export function SectionTitleCard({
  title,
  onSendToMine,
}: {
  title: string;
  onSendToMine?: (text: string) => void;
}) {
  return (
    <Card className="overflow-hidden border-l-4 border-l-tab-notes">
      <CardContent className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-tab-notes">
          Section
        </p>
        <h2 className="mt-2 font-display text-2xl leading-tight text-foreground">
          {title}
        </h2>
        <CardActions onSendToMine={onSendToMine} sendText={title} />
      </CardContent>
    </Card>
  );
}
