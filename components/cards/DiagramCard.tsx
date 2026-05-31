"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CardActions } from "./SectionTitleCard";
import { ChevronRight } from "lucide-react";

export function DiagramCard({
  title,
  nodes,
  onSendToMine,
}: {
  title: string;
  nodes: string[];
  onSendToMine?: (text: string) => void;
}) {
  const full = `${title}: ${nodes.join(" → ")}`;
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">
          Diagram
        </p>
        <p className="mt-1 text-sm font-medium text-foreground">{title}</p>
        <div className="mt-4 flex flex-wrap items-center gap-1">
          {nodes.map((node, i) => (
            <span key={node} className="flex items-center gap-1">
              <span className="rounded-md bg-background px-2.5 py-1.5 text-xs font-medium text-foreground">
                {node}
              </span>
              {i < nodes.length - 1 && (
                <ChevronRight className="h-3.5 w-3.5 text-muted" />
              )}
            </span>
          ))}
        </div>
        <CardActions onSendToMine={onSendToMine} sendText={full} />
      </CardContent>
    </Card>
  );
}
