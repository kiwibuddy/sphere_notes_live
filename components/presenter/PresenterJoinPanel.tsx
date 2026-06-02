"use client";

import { useCallback, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session/context";
import { formatTeachingDayCaption } from "@/lib/session/day-label";
import { buildStudentJoinUrl } from "@/lib/session/join-url";
import { Copy, Check, Link2 } from "lucide-react";

export function PresenterJoinPanel() {
  const { joinEventId, activeDay, getDayInfo, meta } = useSession();
  const [copied, setCopied] = useState(false);

  const joinUrl = useMemo(
    () => buildStudentJoinUrl(joinEventId, activeDay),
    [joinEventId, activeDay]
  );

  const dayInfo = getDayInfo(activeDay);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard denied */
    }
  }, [joinUrl]);

  return (
    <section className="mb-6 rounded-xl bg-surface p-4 shadow-card md:p-6">
      <div className="mb-4 flex items-start gap-3">
        <Link2 className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Student join link
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Students scan the QR or open the link on their phones — same Wi‑Fi
            or your deployed URL.{" "}
            <strong>
              {formatTeachingDayCaption(activeDay, dayInfo, meta.totalDays)}
            </strong>
            {" "}
            (URL uses <code className="rounded bg-background px-1">day={activeDay}</code>
            ). Speech subtitles only appear on phones using this same day number.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-border">
          <QRCodeSVG value={joinUrl} size={160} level="M" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <p className="break-all rounded-lg bg-background px-3 py-2 font-mono text-xs text-foreground">
            {joinUrl}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={copyLink}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy link
              </>
            )}
          </Button>
          <p className="text-[11px] leading-relaxed text-muted">
            Phones must reach this same host (e.g. open presenter via your Mac
            IP, not localhost, if students are on other devices). Optional: set{" "}
            <code className="rounded bg-background px-1">NEXT_PUBLIC_APP_URL</code>{" "}
            in <code className="rounded bg-background px-1">.env.local</code> for
            a fixed production URL.
          </p>
        </div>
      </div>
    </section>
  );
}
