"use client";

import { useEffect, useState } from "react";

export interface VisualViewportRect {
  width: number;
  height: number;
  offsetTop: number;
  offsetLeft: number;
}

/** Sizes fixed overlays to the visible area (excludes Safari toolbars on iOS). */
export function useVisualViewport(): VisualViewportRect {
  const [rect, setRect] = useState<VisualViewportRect>(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0,
    offsetTop: 0,
    offsetLeft: 0,
  }));

  useEffect(() => {
    const update = () => {
      const vv = window.visualViewport;
      setRect({
        width: Math.round(vv?.width ?? window.innerWidth),
        height: Math.round(vv?.height ?? window.innerHeight),
        offsetTop: Math.round(vv?.offsetTop ?? 0),
        offsetLeft: Math.round(vv?.offsetLeft ?? 0),
      });
    };

    update();
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.visualViewport?.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return rect;
}
