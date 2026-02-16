// PortalRails — Monster Events Co.
// Design goal: Monochrome line UI (white + #abf95f) inspired by "hanging portal doors" rails.
// Interaction: pointer move left/right to shift the rail indicator and highlight nearest door.

import React, { useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";

import {
  Balloon,
  Lightbulb,
  IdCard,
  Droplets,
  Sticker,
  Cpu,
  Boxes,
  ArrowRight,
} from "lucide-react";

type DoorKey = string;

export type PortalDoorItem = {
  key: DoorKey;
  label: string;
  door: string;
  blurb: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function iconForKey(key: string) {
  return (
    ({
      balloon: Balloon,
      lighting: Lightbulb,
      card: IdCard,
      water: Droplets,
      sticker: Sticker,
      electric: Cpu,
      large: Boxes,
    } as const)[key as any] ?? Boxes
  );
}

function splitRows(items: PortalDoorItem[]) {
  const top = items.slice(0, 4);
  const bottom = items.slice(4);
  return { top, bottom };
}

function usePointerRail() {
  const ref = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0.5); // 0..1
  const xSpring = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / Math.max(1, r.width);
    x.set(clamp(nx, 0, 1));
  };

  const onLeave: React.MouseEventHandler<HTMLDivElement> = () => {
    x.set(0.5);
  };

  return { ref, x: xSpring, onMove, onLeave };
}

function PortalDoorCard({
  item,
  idx,
  globalIndex,
  count,
  sharedX,
  isActive,
}: {
  item: PortalDoorItem;
  idx: number;
  globalIndex: number;
  count: number;
  sharedX: ReturnType<typeof usePointerRail>["x"];
  isActive: boolean;
}) {
  const Icon = iconForKey(item.key);
  const localOffset = (idx / Math.max(1, count - 1) - 0.5) * 2; // -1..1

  const hangerX = useTransform(sharedX, (v) => (v - 0.5) * 16 * (0.8 + Math.abs(localOffset) * 0.2));
  const glowX = useTransform(sharedX, (v) => (v - 0.5) * 28 * (0.9 + Math.abs(localOffset) * 0.1));

  return (
    <Link href={`/props?cat=${item.key}`}>
      <motion.div
        className={`portal-door ${isActive ? "is-active" : ""}`}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
      >
        {/* hanger + hook */}
        <div className="portal-door-hook" aria-hidden="true">
          <motion.div className="portal-door-hook-cable" style={{ x: hangerX }} />
          <div className="portal-door-hook-clamp" />
          <div className="portal-door-hook-ring" />
        </div>

        {/* door frame */}
        <div className="portal-door-frame2" aria-hidden="true">
          <div className="portal-door-frame2-inner" />
          <div className="portal-door-frame2-panels" />
          <div className="portal-door-frame2-handle" />
        </div>

        {/* info block */}
        <div className="portal-door-info">
          <div className="portal-door-head">
            <div className="portal-door-kicker">
              {String(globalIndex + 1).padStart(2, "0")} / {item.door}
            </div>
            <div className="portal-door-tag">{item.label}</div>
          </div>

          <div className="portal-door-meta">
            <div className="portal-door-icon">
              <Icon className="h-5 w-5" />
            </div>
            <div className="portal-door-blurb">{item.blurb}</div>
          </div>

          <div className="portal-door-cta" aria-hidden="true">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>

        {/* active glow strip */}
        <motion.div className="portal-door-glow" aria-hidden="true" style={{ x: glowX }} />
      </motion.div>
    </Link>
  );
}

function RailRow({
  items,
  rowIndex,
  sharedX,
  baseIndex,
}: {
  items: PortalDoorItem[];
  rowIndex: number;
  sharedX: ReturnType<typeof usePointerRail>["x"];
  baseIndex: number;
}) {
  const count = Math.max(1, items.length);
  const [activeIndex, setActiveIndex] = useState(0);

  useMotionValueEvent(sharedX, "change", (v) => {
    setActiveIndex(clamp(Math.round(v * (count - 1)), 0, count - 1));
  });

  const indicator = useSpring(sharedX, { stiffness: 320, damping: 30, mass: 0.5 });
  const indicatorLeft = useTransform(indicator, (v) => `${v * 100}%`);

  return (
    <div className="portal-rail-row" data-row={rowIndex}>
      <div className="portal-rail-track" aria-hidden="true">
        <div className="portal-rail-line" />
        <motion.div className="portal-rail-indicator" style={{ left: indicatorLeft }} />
      </div>

      <div className="portal-rail-items" style={{ ["--count" as any]: count }}>
        {items.map((it, idx) => (
          <PortalDoorCard
            key={`${rowIndex}_${it.key}`}
            item={it}
            idx={idx}
            globalIndex={baseIndex + idx}
            count={count}
            sharedX={sharedX}
            isActive={idx === activeIndex}
          />
        ))}
      </div>
    </div>
  );
}

export default function PortalRails({ items }: { items: PortalDoorItem[] }) {
  const { top, bottom } = useMemo(() => splitRows(items), [items]);
  const rail = usePointerRail();

  return (
    <div
      ref={rail.ref}
      className="portal-rails portal-rails--mcu"
      onMouseMove={rail.onMove}
      onMouseLeave={rail.onLeave}
      role="application"
      aria-label="道具類別滑軌選擇"
    >
      <div className="portal-rails-hint">左右移動滑鼠，像在滑軌上選門</div>
      <div className="portal-rails-rail" aria-hidden="true">
        <div className="portal-rails-rail-top" />
        <div className="portal-rails-rail-bottom" />
      </div>
      <RailRow items={top} rowIndex={0} sharedX={rail.x} baseIndex={0} />
      {bottom.length ? <RailRow items={bottom} rowIndex={1} sharedX={rail.x} baseIndex={top.length} /> : null}
    </div>
  );
}
