"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ObsWebSocketClient } from "@/lib/obs/client";
import {
  DEFAULT_OBS_SCENES,
  OBS_STORAGE_KEY,
  defaultObsConfig,
  type ObsConnectionConfig,
  type ObsSceneId,
} from "@/lib/obs/constants";

export type ObsConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "error";

function loadConfig(): ObsConnectionConfig {
  if (typeof window === "undefined") return defaultObsConfig;
  try {
    const raw = localStorage.getItem(OBS_STORAGE_KEY);
    if (!raw) return defaultObsConfig;
    return { ...defaultObsConfig, ...JSON.parse(raw) };
  } catch {
    return defaultObsConfig;
  }
}

function saveConfig(config: ObsConnectionConfig) {
  localStorage.setItem(OBS_STORAGE_KEY, JSON.stringify(config));
}

export function resolveSceneName(
  sceneId: ObsSceneId,
  config: ObsConnectionConfig
): string {
  const override = config.sceneNames[sceneId];
  if (override?.trim()) return override.trim();
  const def = DEFAULT_OBS_SCENES.find((s) => s.id === sceneId);
  return def?.name ?? sceneId;
}

export function useObsRemote() {
  const clientRef = useRef<ObsWebSocketClient | null>(null);
  const [config, setConfigState] = useState<ObsConnectionConfig>(defaultObsConfig);
  const [status, setStatus] = useState<ObsConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [currentScene, setCurrentScene] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    setConfigState(loadConfig());
  }, []);

  const setConfig = useCallback((next: ObsConnectionConfig) => {
    setConfigState(next);
    saveConfig(next);
  }, []);

  const refreshCurrentScene = useCallback(async () => {
    const client = clientRef.current;
    if (!client?.connected) return;
    try {
      const name = await client.getCurrentScene();
      setCurrentScene(name);
    } catch {
      /* ignore poll errors */
    }
  }, []);

  const connect = useCallback(async () => {
    const host = config.host.trim();
    if (!host) {
      setError("Enter your Mac’s IP address in OBS settings.");
      setSettingsOpen(true);
      return;
    }

    setStatus("connecting");
    setError(null);

    const client = new ObsWebSocketClient();
    clientRef.current = client;

    try {
      await client.connect(host, config.port, config.password);
      setStatus("connected");

      client.onEvent("CurrentProgramSceneChanged", (data) => {
        setCurrentScene(data.sceneName as string);
      });

      await refreshCurrentScene();
    } catch (err) {
      clientRef.current = null;
      setStatus("error");
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  }, [config, refreshCurrentScene]);

  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;
    setStatus("disconnected");
    setCurrentScene(null);
  }, []);

  const switchScene = useCallback(
    async (sceneId: ObsSceneId) => {
      const client = clientRef.current;
      if (!client?.connected) {
        setError("Connect to OBS first.");
        setSettingsOpen(true);
        return;
      }

      const sceneName = resolveSceneName(sceneId, config);
      setError(null);
      try {
        await client.setScene(sceneName);
        setCurrentScene(sceneName);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : `Could not switch to "${sceneName}"`
        );
      }
    },
    [config]
  );

  useEffect(() => {
    if (status !== "connected") return;
    const interval = setInterval(refreshCurrentScene, 4000);
    return () => clearInterval(interval);
  }, [status, refreshCurrentScene]);

  useEffect(() => {
    return () => {
      clientRef.current?.disconnect();
    };
  }, []);

  return {
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
    scenes: DEFAULT_OBS_SCENES,
  };
}
