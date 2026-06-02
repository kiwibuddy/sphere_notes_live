/** True on iPhone / iPad Safari and home-screen web apps. */
export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
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
