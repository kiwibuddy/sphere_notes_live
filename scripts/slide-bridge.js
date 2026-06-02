/**
 * Keynote → Supabase slide bridge (Mac only).
 *
 * Polls Keynote every 2s while slideshow is playing and writes the current
 * slide number to Supabase so student phones follow your deck (including jumps).
 *
 * Usage:
 *   node scripts/slide-bridge.js
 *
 * Env (or .env.local in repo root):
 *   NEXT_PUBLIC_SUPABASE_URL / SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   NEXT_PUBLIC_EVENT_ID / EVENT_ID  (default: biblical-worldview-2026)
 *
 * Grant Automation once: System Settings → Privacy → Automation → Terminal → Keynote
 */

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

/** Matches lib/slides/constants.ts — event-wide deck position, not per teaching day. */
const SLIDE_SYNC_DAY = 1;

const POLL_MS = parseInt(process.env.SLIDE_BRIDGE_POLL_MS ?? "2000", 10);

const KEYNOTE_APPLESCRIPT = `
tell application "Keynote"
  if not running then return "0|0"
  if not (exists front document) then return "0|0"
  if playing is false then return "0|0"
  set n to slide number of current slide of front document
  set t to count of slides of front document
  return (n as text) & "|" & (t as text)
end tell
`.trim();

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function requireEnv() {
  loadEnvLocal();
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const eventId =
    process.env.EVENT_ID ??
    process.env.NEXT_PUBLIC_EVENT_ID ??
    "biblical-worldview-2026";

  if (!url || !serviceKey) {
    console.error(
      "Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or the shell."
    );
    process.exit(1);
  }

  return { url, serviceKey, eventId };
}

function readKeynoteSlide() {
  try {
    const out = execFileSync("osascript", ["-e", KEYNOTE_APPLESCRIPT], {
      encoding: "utf8",
      timeout: 8000,
    }).trim();
    const [currentRaw, totalRaw] = out.split("|");
    const current = parseInt(currentRaw, 10) || 0;
    const total = parseInt(totalRaw, 10) || 0;
    return { current, total, playing: current > 0 };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

function log(message) {
  const time = new Date().toLocaleTimeString("en-NZ", { hour12: false });
  console.log(`[${time}] ${message}`);
}

async function pushSlideToSupabase(url, serviceKey, eventId, current) {
  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/day_slides?event_id=eq.${encodeURIComponent(eventId)}&day=eq.${SLIDE_SYNC_DAY}`;
  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      current,
      updated_at: new Date().toISOString(),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
}

async function main() {
  const { url, serviceKey, eventId } = requireEnv();

  log(`Slide bridge started — event ${eventId}, poll every ${POLL_MS}ms`);
  log("Open Keynote and start slideshow (Play). Ctrl+C to stop.");

  let lastCurrent = null;
  let lastErrorLog = 0;

  const tick = async () => {
    const state = readKeynoteSlide();

    if (state.error) {
      const now = Date.now();
      if (now - lastErrorLog > 15_000) {
        log(`Keynote read failed: ${state.error}`);
        lastErrorLog = now;
      }
      return;
    }

    if (!state.playing) {
      if (lastCurrent !== null) {
        log("Keynote not in slideshow — waiting for Play…");
        lastCurrent = null;
      }
      return;
    }

    if (state.current === lastCurrent) return;

    try {
      await pushSlideToSupabase(url, serviceKey, eventId, state.current);
    } catch (err) {
      log(
        `Supabase update failed: ${err instanceof Error ? err.message : String(err)}`
      );
      return;
    }

    lastCurrent = state.current;
    log(
      `Slide ${state.current}${state.total ? ` of ${state.total}` : ""} → Supabase`
    );
  };

  await tick();
  const interval = setInterval(() => {
    void tick();
  }, POLL_MS);

  process.on("SIGINT", () => {
    log("Stopping slide bridge.");
    clearInterval(interval);
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
