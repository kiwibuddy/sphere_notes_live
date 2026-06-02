import type { ReactNode } from "react";

const URL_PATTERN =
  /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

function trimTrailingPunctuation(url: string): string {
  return url.replace(/[.,;:!?)]+$/, "");
}

export function renderSubtitleText(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  URL_PATTERN.lastIndex = 0;
  while ((match = URL_PATTERN.exec(text)) !== null) {
    const raw = match[0];
    const href = trimTrailingPunctuation(raw);
    const trailing = raw.slice(href.length);

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    parts.push(
      <a
        key={`${match.index}-${href}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="break-all text-tab-live underline underline-offset-2"
      >
        {href}
      </a>
    );

    if (trailing) parts.push(trailing);
    lastIndex = match.index + raw.length;
  }

  if (parts.length === 0) return text;
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
