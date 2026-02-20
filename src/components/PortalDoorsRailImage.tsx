// PortalDoorsRailImage — Monster Events Co.
// Goal: Match the provided reference UI 1:1 by using the reference artwork as base image,
// then layer interactive hotspots + a moving neon selection glow.
// Note: This assumes you own / have rights to use the reference image.

import React, { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import bg from "@/assets/portal-doors-rail-bg-clean.jpg";

type Hotspot = {
  key: string;
  href: string;
  label: string;
  rect: { x: number; y: number; w: number; h: number }; // percent (0-100)
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function PortalDoorsRailImage({
  items,
}: {
  items: Array<{ key: string; door: string; label: string; blurb: string }>;
}) {
  // The reference image is 1024x565, with 4 doors on top row and 3 on bottom row.
  // Hotspots are defined in percent to stay responsive.

  const layout = useMemo(() => {
    // Percent-based layout tuned for the new (text-less) background.
    // We overlay crisp typography near each door.
    const doorRects = [
      { x: 3.2, y: 6.5, w: 17.0, h: 40.0 },
      { x: 27.0, y: 6.5, w: 17.0, h: 40.0 },
      { x: 50.8, y: 6.5, w: 17.0, h: 40.0 },
      { x: 74.6, y: 6.5, w: 17.0, h: 40.0 },
      { x: 12.0, y: 54.2, w: 17.0, h: 40.0 },
      { x: 41.0, y: 54.2, w: 17.0, h: 40.0 },
      { x: 70.0, y: 54.2, w: 17.0, h: 40.0 },
    ];

    const infoRects = [
      { x: 22.0, y: 15.8, w: 14.5, h: 24.0 },
      { x: 45.7, y: 15.8, w: 14.5, h: 24.0 },
      { x: 69.4, y: 15.8, w: 14.5, h: 24.0 },
      { x: 86.8, y: 15.8, w: 11.8, h: 24.0 },
      { x: 33.2, y: 64.5, w: 16.0, h: 24.0 },
      { x: 62.2, y: 64.5, w: 16.0, h: 24.0 },
      { x: 85.0, y: 64.5, w: 13.8, h: 24.0 },
    ];

    return { doorRects, infoRects };
  }, []);

  const hotspots: Hotspot[] = useMemo(() => {
    return layout.doorRects.map((rect, idx) => {
      const it = items[idx];
      const key = it?.key ?? `k${idx}`;
      return {
        key,
        href: `/props?cat=${encodeURIComponent(key)}`,
        label: it?.label ?? key,
        rect,
      };
    });
  }, [items, layout.doorRects]);

  const info = useMemo(() => {
    return layout.infoRects.map((rect, idx) => ({ rect, item: items[idx] }));
  }, [items, layout.infoRects]);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const xMv = useMotionValue(0.5);
  const x = useSpring(xMv, { stiffness: 280, damping: 28, mass: 0.6 });
  const [active, setActive] = useState(0);
  const leftPct = useTransform(x, (v: number) => `${v * 100}%`);

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / Math.max(1, r.width);
    xMv.set(clamp(nx, 0, 1));

    // choose nearest hotspot center by x
    const cx = nx * 100;
    let best = 0;
    let bestD = Infinity;
    hotspots.forEach((h, i) => {
      const hc = h.rect.x + h.rect.w / 2;
      const d = Math.abs(hc - cx);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setActive(best);
  };

  const onLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    xMv.set(0.5);
  };

  const activeRect = hotspots[active]?.rect ?? { x: 50, y: 50, w: 10, h: 10 };

  return (
    <div
      ref={wrapRef}
      className="portal-ref"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      role="application"
      aria-label="門軌道具分類選擇"
    >
      <div className="portal-ref-aspect" aria-hidden="true">
        <img
          className="portal-ref-img"
          src={bg}
          alt="Portal Doors rail background"
          loading="eager"
          decoding="sync"
          fetchPriority="high"
        />

        {/* moving rail glow (top and bottom) */}
        <motion.div
          className="portal-ref-railGlow portal-ref-railGlow--top"
          style={{ left: leftPct }}
          aria-hidden="true"
        />
        <motion.div
          className="portal-ref-railGlow portal-ref-railGlow--bottom"
          style={{ left: leftPct }}
          aria-hidden="true"
        />

        {/* active door glow */}
        <motion.div
          className="portal-ref-doorGlow"
          style={{
            left: `${activeRect.x}%`,
            top: `${activeRect.y}%`,
            width: `${activeRect.w}%`,
            height: `${activeRect.h}%`,
          }}
          aria-hidden="true"
        />

        {/* crisp text overlay (our original copy) */}
        {info.map((row, idx) => {
          const it = row.item;
          if (!it) return null;
          return (
            <div
              key={`info_${it.key}`}
              className="portal-ref-info"
              style={{
                left: `${row.rect.x}%`,
                top: `${row.rect.y}%`,
                width: `${row.rect.w}%`,
                height: `${row.rect.h}%`,
              }}
            >
              <div className="portal-ref-kicker">
                {String(idx + 1).padStart(2, "0")} / {it.door}
              </div>
              <div className="portal-ref-title">{it.label}</div>
              <div className="portal-ref-blurb">{it.blurb}</div>
            </div>
          );
        })}

        {/* hotspots */}
        {hotspots.map((h, idx) => (
          <Link key={h.key} href={h.href}>
            <a
              className={`portal-ref-hotspot ${idx === active ? "is-active" : ""}`}
              style={{
                left: `${h.rect.x}%`,
                top: `${h.rect.y}%`,
                width: `${h.rect.w}%`,
                height: `${h.rect.h}%`,
              }}
              aria-label={`前往 ${h.label}`}
            />
          </Link>
        ))}
      </div>

      <div className="portal-ref-hint">左右移動滑鼠，像在滑軌上選門</div>
    </div>
  );
}
