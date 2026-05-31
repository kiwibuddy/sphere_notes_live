"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CardActions } from "./SectionTitleCard";

export function StoryTitleCard({
  title,
  onSendToMine,
}: {
  title: string;
  onSendToMine?: (text: string) => void;
}) {
  return (
    <Card className="bg-gradient-to-br from-surface to-background">
      <CardContent className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Story
        </p>
        <h3 className="mt-2 font-display text-xl italic text-foreground">
          {title}
        </h3>
        <CardActions onSendToMine={onSendToMine} sendText={title} />
      </CardContent>
    </Card>
  );
}
