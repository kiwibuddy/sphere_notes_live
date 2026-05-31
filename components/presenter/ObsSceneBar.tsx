"use client";

import { useObsRemote, resolveSceneName } from "@/hooks/useObsRemote";
import type { ObsSceneId } from "@/lib/obs/constants";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Monitor,
  Radio,
  Wifi,
  WifiOff,
} from "lucide-react";

export function ObsSceneBar() {
  const {
    config,
    setConfig,
    status,
    error,
    currentScene,
    settingsOpen,
    setSettingsOpen,
    connect,
    disconnect,
    switchScene,
    scenes,
  } = useObsRemote();

  const connected = status === "connected";

  return (
    <div className="border-t border-border bg-surface shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
      {/* Connection row */}
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2 md:px-4">
        <button
          type="button"
          onClick={() => setSettingsOpen(!settingsOpen)}
          className="flex min-h-[44px] flex-1 items-center gap-2 text-left"
        >
          <ObsStatusDot status={status} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              OBS scenes
            </p>
            <p className="truncate text-sm text-foreground">
              {connected
                ? currentScene ?? "Connected"
                : status === "connecting"
                  ? "Connecting…"
                  : "Not connected"}
            </p>
          </div>
          {settingsOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted" />
          ) : (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted" />
          )}
        </button>

        {connected ? (
          <button
            type="button"
            onClick={disconnect}
            className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium text-muted"
          >
            <WifiOff className="h-4 w-4" />
            <span className="hidden sm:inline">Disconnect</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={connect}
            disabled={status === "connecting"}
            className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-lg bg-foreground px-3 text-sm font-medium text-background disabled:opacity-60"
          >
            <Wifi className="h-4 w-4" />
            <span className="hidden sm:inline">Connect</span>
          </button>
        )}
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div className="space-y-3 border-b border-border/60 bg-background/50 px-3 py-3 md:px-4">
          <p className="text-xs text-muted">
            iPad and Mac on the same Wi‑Fi. Enable OBS → Tools → WebSocket
            Server. Scene names must match OBS exactly.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="block sm:col-span-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Mac IP address
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="192.168.1.42"
                value={config.host}
                onChange={(e) =>
                  setConfig({ ...config, host: e.target.value.trim() })
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Port
              </span>
              <input
                type="number"
                value={config.port}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    port: parseInt(e.target.value, 10) || 4455,
                  })
                }
                className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
              WebSocket password
            </span>
            <input
              type="password"
              autoComplete="off"
              placeholder="From OBS WebSocket settings"
              value={config.password}
              onChange={(e) =>
                setConfig({ ...config, password: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
            />
          </label>
          <details className="text-xs text-muted">
            <summary className="cursor-pointer font-medium text-foreground">
              Rename scenes (if OBS names differ)
            </summary>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {scenes.map((scene) => (
                <label key={scene.id} className="block">
                  <span className="text-[10px] text-muted">{scene.shortLabel}</span>
                  <input
                    type="text"
                    placeholder={scene.name}
                    value={config.sceneNames[scene.id] ?? ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        sceneNames: {
                          ...config.sceneNames,
                          [scene.id]: e.target.value,
                        },
                      })
                    }
                    className="mt-0.5 w-full rounded-md border border-border bg-surface px-2 py-1.5 text-sm"
                  />
                </label>
              ))}
            </div>
          </details>
          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-800">
              {error}
            </p>
          )}
        </div>
      )}

      {/* Scene buttons — 2×3 grid, touch-first */}
      <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-3 md:gap-3 md:p-4">
        {scenes.map((scene) => {
          const obsName = resolveSceneName(scene.id, config);
          const isActive =
            connected &&
            currentScene !== null &&
            currentScene.toLowerCase() === obsName.toLowerCase();

          return (
            <button
              key={scene.id}
              type="button"
              disabled={!connected && status !== "connecting"}
              onClick={() => switchScene(scene.id as ObsSceneId)}
              className={cn(
                "flex min-h-[72px] flex-col items-center justify-center rounded-xl border-2 px-2 py-3 transition-all active:scale-[0.98]",
                "touch-manipulation select-none",
                isActive
                  ? "border-foreground bg-foreground text-background shadow-md"
                  : "border-border bg-surface text-foreground hover:border-foreground/30",
                !connected && "opacity-70"
              )}
            >
              <SceneIcon id={scene.id} active={isActive} />
              <span className="mt-1 text-sm font-semibold leading-tight">
                {scene.shortLabel}
              </span>
              <span
                className={cn(
                  "mt-0.5 text-[10px] leading-tight",
                  isActive ? "text-background/70" : "text-muted"
                )}
              >
                {scene.hint}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ObsStatusDot({ status }: { status: string }) {
  const color =
    status === "connected"
      ? "bg-green-500"
      : status === "connecting"
        ? "bg-amber-400 animate-pulse"
        : status === "error"
          ? "bg-red-500"
          : "bg-muted";

  return (
    <span
      className={cn("h-2.5 w-2.5 shrink-0 rounded-full", color)}
      aria-hidden
    />
  );
}

function SceneIcon({ id, active }: { id: string; active: boolean }) {
  const className = cn("h-5 w-5", active ? "text-background" : "text-muted");

  if (id === "camera") return <Radio className={className} />;
  if (id === "desktop") return <Monitor className={className} />;
  return <Monitor className={className} />;
}
