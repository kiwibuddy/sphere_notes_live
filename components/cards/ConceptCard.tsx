"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CardActions } from "./SectionTitleCard";

export function ConceptCard({
  term,
  definition,
  onSendToMine,
}: {
  term: string;
  definition: string;
  onSendToMine?: (text: string) => void;
}) {
  const full = `${term}: ${definition}`;
  return (
    <Card>
      <CardContent className="p-5">
        <p className="font-display text-2xl text-foreground">{term}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">{definition}</p>
        <CardActions onSendToMine={onSendToMine} sendText={full} />
      </CardContent>
    </Card>
  );
}
