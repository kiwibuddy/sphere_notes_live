"use client";

import { motion } from "framer-motion";
import type { NoteCard } from "@/types/session";
import { SectionTitleCard } from "./SectionTitleCard";
import { BulletsCard } from "./BulletsCard";
import { QuoteCard } from "./QuoteCard";
import { ScriptureCard } from "./ScriptureCard";
import { ConceptCard } from "./ConceptCard";
import { DiagramCard } from "./DiagramCard";
import { StoryTitleCard } from "./StoryTitleCard";

interface NoteCardRendererProps {
  card: NoteCard;
  index?: number;
  onSendToMine?: (text: string) => void;
}

export function NoteCardRenderer({
  card,
  index = 0,
  onSendToMine,
}: NoteCardRendererProps) {
  const sendProps = onSendToMine ? { onSendToMine } : {};

  const content = (() => {
    switch (card.type) {
      case "section":
        return (
          <SectionTitleCard
            title={card.content.title as string}
            {...sendProps}
          />
        );
      case "bullets":
        return (
          <BulletsCard
            items={card.content.items as string[]}
            {...sendProps}
          />
        );
      case "quote":
        return (
          <QuoteCard quote={card.content.quote as string} {...sendProps} />
        );
      case "scripture":
        return (
          <ScriptureCard
            reference={card.content.reference as string}
            translation={card.content.translation as string}
            text={card.content.text as string}
            {...sendProps}
          />
        );
      case "concept":
        return (
          <ConceptCard
            term={card.content.term as string}
            definition={card.content.definition as string}
            {...sendProps}
          />
        );
      case "diagram":
        return (
          <DiagramCard
            title={card.content.title as string}
            nodes={card.content.nodes as string[]}
            {...sendProps}
          />
        );
      case "story":
        return (
          <StoryTitleCard
            title={card.content.title as string}
            {...sendProps}
          />
        );
      default:
        return null;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      {content}
    </motion.div>
  );
}
