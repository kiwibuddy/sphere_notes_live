"use client";

import { useCallback, useEffect, useState } from "react";
import type { RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
  Palette,
} from "lucide-react";

const TEXT_COLORS = [
  { label: "Default", value: "#1A1A18" },
  { label: "Terracotta", value: "#C2410C" },
  { label: "Blue", value: "#2563EB" },
  { label: "Gold", value: "#B45309" },
  { label: "Green", value: "#16A34A" },
  { label: "Muted", value: "#6B6860" },
];

const FONT_SIZES = [
  { label: "S", value: "14px" },
  { label: "M", value: "16px" },
  { label: "L", value: "20px" },
  { label: "XL", value: "24px" },
];

const BLOCK_STYLES = [
  { label: "Title", tag: "h1" as const },
  { label: "Subtitle", tag: "h2" as const },
  { label: "Body", tag: "p" as const },
];

interface NotesFormatToolbarProps {
  editorRef: RefObject<HTMLDivElement | null>;
  onChange: () => void;
}

export function NotesFormatToolbar({
  editorRef,
  onChange,
}: NotesFormatToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  const [activeColor, setActiveColor] = useState(TEXT_COLORS[0].value);
  const [activeMarks, setActiveMarks] = useState({
    bold: false,
    italic: false,
    underline: false,
    unorderedList: false,
    orderedList: false,
    alignLeft: true,
    alignCenter: false,
    alignRight: false,
  });

  const refreshMarks = useCallback(() => {
    setActiveMarks({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
      alignLeft: document.queryCommandState("justifyLeft"),
      alignCenter: document.queryCommandState("justifyCenter"),
      alignRight: document.queryCommandState("justifyRight"),
    });
  }, []);

  const run = useCallback(
    (command: string, value?: string) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      document.execCommand("styleWithCSS", false, "true");
      document.execCommand(command, false, value);
      refreshMarks();
      onChange();
    },
    [editorRef, onChange, refreshMarks]
  );

  const applyBlock = useCallback(
    (tag: "h1" | "h2" | "p") => {
      run("formatBlock", tag);
    },
    [run]
  );

  const applyFont = useCallback(
    (family: "sans" | "serif") => {
      const value =
        family === "serif"
          ? "Instrument Serif, Georgia, serif"
          : "var(--font-geist-sans), system-ui, sans-serif";
      run("fontName", value);
    },
    [run]
  );

  const wrapSelection = useCallback(
    (applyStyle: (el: HTMLElement) => void) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      if (selection.isCollapsed) {
        document.execCommand("styleWithCSS", false, "true");
        return false;
      }

      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      applyStyle(span);
      try {
        range.surroundContents(span);
      } catch {
        span.appendChild(range.extractContents());
        range.insertNode(span);
      }
      selection.removeAllRanges();
      return true;
    },
    [editorRef]
  );

  const applyFontSize = useCallback(
    (size: string) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      if (selection.isCollapsed) {
        document.execCommand("fontSize", false, "4");
        const fontElements = editor.querySelectorAll("font[size]");
        fontElements.forEach((el) => {
          const span = document.createElement("span");
          span.style.fontSize = size;
          span.innerHTML = el.innerHTML;
          el.replaceWith(span);
        });
      } else {
        wrapSelection((el) => {
          el.style.fontSize = size;
        });
      }
      setShowSizes(false);
      onChange();
    },
    [editorRef, onChange, wrapSelection]
  );

  const applyColor = useCallback(
    (color: string) => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      setActiveColor(color);

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      if (selection.isCollapsed) {
        document.execCommand("styleWithCSS", false, "true");
        document.execCommand("foreColor", false, color);
      } else {
        wrapSelection((el) => {
          el.style.color = color;
        });
      }

      setShowColors(false);
      refreshMarks();
      onChange();
    },
    [editorRef, onChange, refreshMarks, wrapSelection]
  );

  const applyAlignment = useCallback(
    (align: "left" | "center" | "right") => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.focus();
      document.execCommand("styleWithCSS", false, "true");

      const command =
        align === "center"
          ? "justifyCenter"
          : align === "right"
            ? "justifyRight"
            : "justifyLeft";
      document.execCommand(command, false);

      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        let node: Node | null = selection.getRangeAt(0).commonAncestorContainer;
        while (node && node !== editor) {
          if (node instanceof HTMLElement && node !== editor) {
            const display = window.getComputedStyle(node).display;
            if (
              display === "block" ||
              node.tagName === "P" ||
              node.tagName === "H1" ||
              node.tagName === "H2" ||
              node.tagName === "LI" ||
              node.tagName === "DIV"
            ) {
              node.style.textAlign = align;
              break;
            }
          }
          node = node.parentNode;
        }
      }

      refreshMarks();
      onChange();
    },
    [editorRef, onChange, refreshMarks]
  );

  const toggleList = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.focus();
    document.execCommand("styleWithCSS", false, "true");

    const inOl = document.queryCommandState("insertOrderedList");
    const inUl = document.queryCommandState("insertUnorderedList");

    if (inOl) {
      document.execCommand("insertOrderedList", false);
    } else if (inUl) {
      document.execCommand("insertOrderedList", false);
    } else {
      document.execCommand("insertUnorderedList", false);
    }

    refreshMarks();
    onChange();
  }, [editorRef, onChange, refreshMarks]);

  useEffect(() => {
    const handler = () => refreshMarks();
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, [refreshMarks]);

  return (
    <div className="mine-notes-toolbar pointer-events-none absolute right-3 top-3 z-20 md:right-4 md:top-4">
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key="toolbar-panel"
            layout
            initial={{ opacity: 0, scale: 0.82, y: -8, x: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: -6, x: 6 }}
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 28,
              mass: 0.75,
            }}
            className="pointer-events-auto absolute right-0 top-0 origin-top-right"
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="mb-2 mr-12 w-[min(calc(100vw-2.5rem),22rem)] overflow-hidden rounded-2xl border border-border/60 bg-surface/98 p-2 shadow-lg backdrop-blur-md"
            >
              <div className="flex flex-wrap items-center gap-0.5">
                <ToolbarButton
                  active={activeMarks.bold}
                  onClick={() => run("bold")}
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  active={activeMarks.italic}
                  onClick={() => run("italic")}
                  title="Italic"
                >
                  <Italic className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  active={activeMarks.underline}
                  onClick={() => run("underline")}
                  title="Underline"
                >
                  <Underline className="h-3.5 w-3.5" />
                </ToolbarButton>

                <Divider />

                {BLOCK_STYLES.map(({ label, tag }) => (
                  <ToolbarButton
                    key={tag}
                    onClick={() => applyBlock(tag)}
                    title={label}
                    className="px-2.5 text-[11px] font-medium"
                  >
                    {label}
                  </ToolbarButton>
                ))}

                <Divider />

                <ToolbarButton
                  active={
                    activeMarks.unorderedList || activeMarks.orderedList
                  }
                  onClick={toggleList}
                  title={
                    activeMarks.orderedList
                      ? "Numbered list"
                      : activeMarks.unorderedList
                        ? "Switch to numbered list"
                        : "Bullet list"
                  }
                >
                  {activeMarks.orderedList ? (
                    <ListOrdered className="h-3.5 w-3.5" />
                  ) : (
                    <List className="h-3.5 w-3.5" />
                  )}
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                  active={activeMarks.alignLeft}
                  onClick={() => applyAlignment("left")}
                  title="Align left"
                >
                  <AlignLeft className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  active={activeMarks.alignCenter}
                  onClick={() => applyAlignment("center")}
                  title="Align center"
                >
                  <AlignCenter className="h-3.5 w-3.5" />
                </ToolbarButton>
                <ToolbarButton
                  active={activeMarks.alignRight}
                  onClick={() => applyAlignment("right")}
                  title="Align right"
                >
                  <AlignRight className="h-3.5 w-3.5" />
                </ToolbarButton>

                <Divider />

                <ToolbarButton onClick={() => applyFont("serif")} title="Serif font">
                  <span className="font-display text-sm leading-none">Aa</span>
                </ToolbarButton>
                <ToolbarButton onClick={() => applyFont("sans")} title="Sans font">
                  <span className="font-sans text-sm font-medium leading-none">
                    Aa
                  </span>
                </ToolbarButton>

                <Divider />

                <ToolbarButton
                  active={showSizes}
                  onClick={() => {
                    setShowColors(false);
                    setShowSizes((v) => !v);
                  }}
                  title="Font size"
                >
                  <Type className="h-3.5 w-3.5" />
                  <ChevronDown
                    className={cn(
                      "h-2.5 w-2.5 opacity-60 transition-transform",
                      showSizes && "rotate-180"
                    )}
                  />
                </ToolbarButton>

                <ToolbarButton
                  active={showColors}
                  onClick={() => {
                    setShowSizes(false);
                    setShowColors((v) => !v);
                  }}
                  title="Text color"
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-border"
                    style={{ backgroundColor: activeColor }}
                  />
                  <ChevronDown
                    className={cn(
                      "h-2.5 w-2.5 opacity-60 transition-transform",
                      showColors && "rotate-180"
                    )}
                  />
                </ToolbarButton>
              </div>

              <AnimatePresence initial={false}>
                {showSizes && (
                  <motion.div
                    key="size-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 border-t border-border/50 pt-2">
                      <p className="mb-1.5 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Size
                      </p>
                      <div className="flex items-center justify-between gap-1 px-0.5">
                        {FONT_SIZES.map(({ label, value }) => (
                          <button
                            key={label}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFontSize(value)}
                            className="flex-1 rounded-lg py-2 text-xs font-medium text-foreground transition-colors hover:bg-background"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {showColors && (
                  <motion.div
                    key="color-panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="mt-2 border-t border-border/50 pt-2">
                      <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted">
                        Color
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2.5 px-1 pb-0.5">
                        {TEXT_COLORS.map(({ label, value }) => (
                          <button
                            key={value}
                            type="button"
                            title={label}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyColor(value)}
                            className={cn(
                              "h-8 w-8 rounded-full border-2 transition-transform hover:scale-105",
                              activeColor === value
                                ? "border-tab-mine ring-2 ring-tab-mine/25"
                                : "border-border/80"
                            )}
                            style={{ backgroundColor: value }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label={isOpen ? "Close formatting options" : "Open formatting options"}
        aria-expanded={isOpen}
        onClick={() => {
          setShowColors(false);
          setShowSizes(false);
          setIsOpen((v) => !v);
        }}
        whileTap={{ scale: 0.92 }}
        animate={{
          rotate: isOpen ? 90 : 0,
          boxShadow: isOpen
            ? "0 8px 24px rgba(194, 65, 12, 0.25)"
            : "0 4px 14px rgba(26, 26, 24, 0.12)",
        }}
        transition={{ type: "spring", stiffness: 380, damping: 22 }}
        className={cn(
          "pointer-events-auto relative flex h-10 w-10 items-center justify-center rounded-full border shadow-card backdrop-blur-sm transition-colors",
          isOpen
            ? "border-tab-mine/40 bg-tab-mine text-white"
            : "border-border/70 bg-surface/95 text-muted hover:text-foreground"
        )}
      >
        <motion.span
          animate={{ scale: isOpen ? 1.05 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Palette className="h-4 w-4" />
        </motion.span>
      </motion.button>
    </div>
  );
}

function ToolbarButton({
  children,
  onClick,
  active,
  title,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex h-8 shrink-0 items-center justify-center gap-0.5 rounded-lg px-2 text-muted transition-colors",
        "hover:bg-background hover:text-foreground",
        active && "bg-background text-tab-mine",
        className
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-0.5 h-5 w-px shrink-0 bg-border" />;
}
