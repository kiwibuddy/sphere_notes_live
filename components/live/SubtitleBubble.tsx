"use client";

import { SendToMineButton } from "@/components/cards/SendToMineButton";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { SubtitleLine } from "@/types/session";

interface SubtitleBubbleProps {
  line: SubtitleLine;
  text: string;
  fontSize: number;
  readOnly?: boolean;
  onSendToMine?: (text: string) => void;
}

function TypingIndicator() {
  return (
    <span className="mt-2 flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-tab-live/70"
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </span>
  );
}

export function SubtitleBubble({
  line,
  text,
  fontSize,
  readOnly,
  onSendToMine,
}: SubtitleBubbleProps) {
  const isLive = !!line.isCurrent;

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 420,
        damping: 32,
        mass: 0.8,
      }}
      className={cn("flex w-full", isLive ? "justify-center px-1" : "justify-start")}
    >
      <div
        className={cn(
          "relative max-w-full",
          isLive ? "w-full max-w-[34rem]" : "max-w-[88%]"
        )}
      >
        {/* Bubble tail — presenter voice from above */}
        <div
          className={cn(
            "absolute h-3 w-3 rotate-45",
            isLive
              ? "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-white ring-1 ring-tab-live/20"
              : "left-5 top-0 -translate-y-1/2 bg-surface ring-1 ring-border/80"
          )}
          aria-hidden
        />

        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 shadow-card transition-shadow duration-300",
            isLive
              ? "rounded-t-sm bg-white ring-2 ring-tab-live/25 shadow-[0_8px_32px_rgba(37,99,235,0.12)]"
              : "rounded-tl-sm bg-surface/95 ring-1 ring-border/70"
          )}
        >
          {isLive && (
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live-active opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-live-active" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-tab-live">
                Now speaking
              </span>
            </div>
          )}

          <motion.p
            key={isLive ? text : line.id}
            initial={isLive ? { opacity: 0.7 } : false}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "leading-relaxed",
              isLive ? "font-medium text-foreground" : "text-muted"
            )}
            style={{ fontSize: `${fontSize}px` }}
          >
            {text}
          </motion.p>

          {isLive && <TypingIndicator />}

          {!readOnly && onSendToMine && (
            <div
              className={cn(
                "mt-3 border-t pt-2",
                isLive ? "border-border/60" : "border-border/50"
              )}
            >
              <SendToMineButton onSend={() => onSendToMine(text)} />
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
