/** True on iPhone / iPad Safari and home-screen web apps. */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Phone-sized touch device (student phones). */
export function isMobilePhone(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 900px)").matches;
  return coarse && narrow;
}

/** Div fullscreen API — unreliable on iOS; use CSS immersive overlay instead. */
export function supportsElementFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  if (isIOS()) return false;
  const el = document.createElement("div");
  return !!(
    el.requestFullscreen ||
    (el as HTMLElement & { webkitRequestFullscreen?: () => void })
      .webkitRequestFullscreen
  );
}

export function isLandscape(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(orientation: landscape)").matches;
}
