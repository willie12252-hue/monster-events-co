// PageBanner — Monster Energy Factory UI
// Core principles: full-bleed cinematic image, hazard/neon overlay, strong typography contrast.

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { reveal } from "@/lib/motion";

export default function PageBanner({
  image,
  kicker,
  title,
  subtitle,
  align = "left",
  glow = "on",
  sparkle = "none",
}: {
  image: string;
  kicker: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  glow?: "none" | "on";
  sparkle?: "none" | "glasses";
}) {
  return (
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="absolute inset-0">
        <img src={image} alt="" className="h-full w-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/15" />
        <div className="noise absolute inset-0 opacity-60" />

        {glow !== "none" ? (
          <div className="pointer-events-none absolute inset-0">
            <div className="banner-glow banner-glow--a" />
            <div className="banner-glow banner-glow--b" />
            <div className="banner-glow banner-glow--c" />
          </div>
        ) : null}

        {sparkle === "glasses" ? (
          <div className="pointer-events-none absolute inset-0">
            <div className="banner-sparkle banner-sparkle--l" aria-hidden="true" />
            <div className="banner-sparkle banner-sparkle--r" aria-hidden="true" />
          </div>
        ) : null}
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 md:py-16">
        <motion.div
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          className={cn(align === "center" ? "mx-auto text-center" : "", "max-w-3xl")}
        >
          <div className="font-display text-xs tracking-[0.32em] text-muted-foreground">{kicker}</div>
          <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">{title}</h1>
          {subtitle ? <p className="mt-3 text-sm text-muted-foreground md:text-base">{subtitle}</p> : null}
        </motion.div>
      </div>
    </section>
  );
}
