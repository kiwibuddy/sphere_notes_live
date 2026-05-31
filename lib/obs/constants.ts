/** Default scene names — must match OBS scene names exactly. */
export const DEFAULT_OBS_SCENES = [
  {
    id: "desktop",
    name: "Desktop",
    shortLabel: "Desktop",
    hint: "MacBook screen",
  },
  {
    id: "idle",
    name: "Title / Idle",
    shortLabel: "Idle",
    hint: "Title or waiting",
  },
  {
    id: "keynote",
    name: "Keynote",
    shortLabel: "Keynote",
    hint: "External monitor slides",
  },
  {
    id: "camera",
    name: "Camera",
    shortLabel: "Camera",
    hint: "Webcam",
  },
  {
    id: "spherenotes",
    name: "SphereNotes",
    shortLabel: "SphereNotes",
    hint: "/display browser source",
  },
  {
    id: "pip",
    name: "Keynote + PiP",
    shortLabel: "PiP",
    hint: "Slides + camera",
  },
] as const;

export type ObsSceneId = (typeof DEFAULT_OBS_SCENES)[number]["id"];

export const OBS_STORAGE_KEY = "spherenotes-obs-config";
export const OBS_DEFAULT_PORT = 4455;

export interface ObsConnectionConfig {
  host: string;
  port: number;
  password: string;
  /** Optional overrides keyed by scene id */
  sceneNames: Partial<Record<ObsSceneId, string>>;
}

export const defaultObsConfig: ObsConnectionConfig = {
  host: "",
  port: OBS_DEFAULT_PORT,
  password: "",
  sceneNames: {},
};
