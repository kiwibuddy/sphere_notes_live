"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CardActions } from "./SectionTitleCard";

export function QuoteCard({
  quote,
  onSendToMine,
}: {
  quote: string;
  onSendToMine?: (text: string) => void;
}) {
  return (
    <Card className="bg-background/50">
      <CardContent className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-tab-notes">
          Pull Quote
        </p>
        <blockquote className="mt-3 font-display text-xl italic leading-snug text-foreground">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <CardActions onSendToMine={onSendToMine} sendText={quote} />
      </CardContent>
    </Card>
  );
}
