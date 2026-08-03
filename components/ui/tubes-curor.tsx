"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import createTubesCursor from "threejs-components/build/cursors/tubes1.min.js";

/**
 * Elegant ice / sapphire / pearl — quiet, silk-like on dark Phoenix OS.
 */
const TUBE_COLORS = ["#8ecae6", "#5b8db8", "#c9d6e2"];
/** Library always creates 4 point lights — pass 4 colors. */
const LIGHT_COLORS = ["#b8d4e8", "#7aa3c4", "#d7e2ec", "#f1f5f9"];

type TubesApp = ReturnType<typeof createTubesCursor>;

/**
 * TubesCursor ships as WebGPURenderer. Force the WebGL2 backend: hide
 * `navigator.gpu` during construct so Three falls back (and prefer the
 * patched `forceWebGL` in node_modules when present).
 */
function createTubesWithWebGLFallback(
  canvas: HTMLCanvasElement,
  options: Parameters<typeof createTubesCursor>[1],
): TubesApp {
  const descriptor = Object.getOwnPropertyDescriptor(Navigator.prototype, "gpu");
  try {
    Object.defineProperty(Navigator.prototype, "gpu", {
      configurable: true,
      enumerable: true,
      get() {
        return undefined;
      },
    });
  } catch {
    // Non-configurable in some hosts — still attempt mount.
  }

  try {
    return createTubesCursor(canvas, options);
  } finally {
    try {
      if (descriptor) {
        Object.defineProperty(Navigator.prototype, "gpu", descriptor);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (Navigator.prototype as any).gpu;
      }
    } catch {
      // ignore restore failures
    }
  }
}

/**
 * Full-viewport tube cursor trail (Kevin Levron / threejs-components).
 * Portaled to `document.body` so parent sizing is viewport, not document height.
 */
export default function TubesCursor() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%;";
    mount.appendChild(canvas);

    const instance = createTubesWithWebGLFallback(canvas, {
      // Node bloom often fails to present in this embed; forward path is enough.
      bloom: false,
      tubes: {
        count: 9,
        colors: TUBE_COLORS,
        minRadius: 0.004,
        maxRadius: 0.026,
        lerp: 0.32,
        noise: 0.028,
        // Soft matte silk — metalness:1 reads black without an env map.
        material: { metalness: 0, roughness: 0.68 },
        lights: {
          intensity: 115,
          colors: LIGHT_COLORS,
        },
      },
    });

    instance.tubes.setColors(TUBE_COLORS);
    instance.tubes.setLightsColors(LIGHT_COLORS);
    instance.tubes.setMaterialOption?.("metalness", 0);
    instance.tubes.setMaterialOption?.("roughness", 0.68);

    return () => {
      instance.dispose();
      canvas.remove();
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="phx-tubes-cursor pointer-events-none fixed inset-0 z-[9998] overflow-hidden"
      aria-hidden
    >
      <div ref={mountRef} className="h-full w-full" />
    </div>,
    document.body,
  );
}
