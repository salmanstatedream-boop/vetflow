'use client';

import { useEffect, useRef, useState } from 'react';
import OverviewDashboardVisual, {
  OVERVIEW_DASHBOARD_DESIGN_WIDTH,
} from '@/components/home/overview-dashboard-visual/OverviewDashboardVisual';

/**
 * Fits the fixed design-width dashboard flush into the hero column
 * while preserving photo-2 proportions.
 */
export default function ScaledOverviewDashboard() {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.62);
  const [frameHeight, setFrameHeight] = useState(520);

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    if (!frame || !canvas) return;

    const update = () => {
      const frameWidth = frame.clientWidth;
      if (frameWidth <= 0) return;
      // Fill the column width exactly (never leave empty strip)
      const nextScale = frameWidth / OVERVIEW_DASHBOARD_DESIGN_WIDTH;
      const nextHeight = Math.round(canvas.scrollHeight * nextScale);
      setScale(nextScale);
      setFrameHeight(nextHeight);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(frame);
    // Re-measure after fonts/images settle
    const t1 = window.setTimeout(update, 80);
    const t2 = window.setTimeout(update, 280);
    return () => {
      ro.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className="relative w-full overflow-hidden"
      style={{ height: frameHeight }}
    >
      <div
        ref={canvasRef}
        className="absolute left-0 top-0 origin-top-left will-change-transform"
        style={{
          width: OVERVIEW_DASHBOARD_DESIGN_WIDTH,
          transform: `scale(${scale})`,
        }}
      >
        <OverviewDashboardVisual />
      </div>
    </div>
  );
}
