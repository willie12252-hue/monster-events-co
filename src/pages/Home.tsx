import SiteLayout from "@/components/SiteLayout";
import hero from "@/assets/hero.webp";
import mascot from "@/assets/mascot.webp";
import pattern from "@/assets/pattern.webp";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useAppData } from "@/contexts/DataContext";
import { toYouTubeEmbedUrl } from "@/lib/youtube";

import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import {
  ArrowRight,
  Zap,
  DoorOpen,
  Gauge,
  Wrench,
  Balloon,
  Lightbulb,
  IdCard,
  Droplets,
  Sticker,
  Cpu,
  Boxes,
} from "lucide-react";

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className="mb-6">
      <div className="font-display text-sm tracking-widest text-muted-foreground">{kicker}</div>
      <h2 className="mt-2 font-display text-3xl text-[#abf95f] md:text-4xl">{title}</h2>
    </div>
  );
}

export default function Home() {
  const {
    data: { categoryMeta, props: propsData, articles, marquee, homeVideo },
  } = useAppData();

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 700], [0, -120]);
  const heroFade = useTransform(scrollY, [0, 520], [1, 0.35]);

  const reveal: Variants = {
    hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] as any },
    },
  };

  return (
    <SiteLayout tone="hazard">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/70">
        <motion.div className="absolute inset-0" style={{ y: heroY, opacity: heroFade }}>
          <img src={hero} alt="啟動儀式能量工廠" className="h-full w-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
          <div className="noise absolute inset-0 opacity-70" />
        </motion.div>

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.2fr_.8fr] md:py-20">
          {/* Top marquee strip (admin configurable) */}
          {marquee?.enabled && marquee.text?.trim() ? (
            <div className="pointer-events-none absolute left-0 right-0 top-0 h-10">
              <div className="absolute inset-0 hazard opacity-45" />
              <div className="relative marquee-viewport h-full">
                <div
                  className={`marquee-track marquee-${marquee.effect || "scroll-left"}`}
                  style={{
                    ["--marquee-duration" as any]: `${Math.max(4, Number(marquee.duration) || 15)}s`,
                    ["--marquee-color" as any]: marquee.color || "oklch(0.98 0 0)",
                    ["--marquee-size" as any]: `${Math.max(12, Number(marquee.size) || 18)}px`,
                  }}
                  aria-hidden="true"
                >
                  <span className="marquee-text">{marquee.text}</span>
                  <span className="marquee-gap" />
                  <span className="marquee-text">{marquee.text}</span>
                  <span className="marquee-gap" />
                  <span className="marquee-text">{marquee.text}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="pointer-events-none absolute left-0 right-0 top-0 h-10 hazard opacity-25" />
          )}

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-card/60 px-3 py-1 text-xs text-muted-foreground neon-pill">
              <Gauge className="h-3.5 w-3.5 text-accent" />
              能量值監測：提案 → 彩排 → 啟動 → 掌聲
            </div>

            {/* Kinetic hero copy: 10s animation + 5s pause = 15s loop */}
            <h1 className="mt-6 font-ming text-5xl font-black leading-[1.06] text-white md:mt-8 md:text-7xl">
              {(
                [
                  { text: "怪獸襲來！", delay: 0 },
                  { text: "聚焦全場目光，", delay: 0.7 },
                  { text: "成就品牌高光", delay: 1.4 },
                ] as const
              ).map((l, idx) => (
                <motion.span
                  key={l.text}
                  className={idx === 0 ? "block text-[#abf95f]" : "block text-white"}
                  initial={{ opacity: 0, y: 24, scale: 0.985, filter: "blur(10px)" }}
                  animate={{
                    opacity: [0, 1, 1, 1, 1],
                    y: [28, 0, 0, 0, 0],
                    scale: [0.98, 1.03, 1.01, 1, 1],
                    rotate: [0, -0.6, 0.4, 0, 0],
                    x: [0, 0, -6, 6, 0],
                    filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)"],
                    textShadow: [
                      "0 0 0 rgba(0,0,0,0)",
                      "0 0 26px rgba(118,255,166,.35)",
                      "0 0 12px rgba(118,255,166,.18)",
                      "0 0 0 rgba(0,0,0,0)",
                      "0 0 0 rgba(0,0,0,0)",
                    ],
                  }}
                  transition={{
                    duration: 10,
                    delay: l.delay,
                    times: [0, 0.12, 0.35, 0.55, 1],
                    ease: [0.16, 1, 0.3, 1],
                    repeat: Infinity,
                    repeatDelay: 5,
                  }}
                >
                  {l.text}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg"
              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
              animate={{
                opacity: [0, 1, 1, 1, 1],
                y: [10, 0, 0, 0, 0],
                filter: ["blur(6px)", "blur(0px)", "blur(0px)", "blur(0px)", "blur(0px)"],
              }}
              transition={{
                duration: 10,
                delay: 2.2,
                times: [0, 0.18, 0.45, 0.7, 1],
                repeat: Infinity,
                repeatDelay: 5,
              }}
            >
              啟動道具租借｜客製化製作｜現場執行支援。用怪獸工廠的工程思維，把驚喜做得更穩、更準、更好看。
            </motion.p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/props">
                  <DoorOpen className="mr-2 h-5 w-5" /> 進入道具軍火庫
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/quote">
                  <Zap className="mr-2 h-5 w-5" /> 先做一張詢價單
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
              <div className="rounded-lg border border-border/70 bg-card/50 p-3">
                <div className="font-display text-foreground">圖片＋影片同頁呈現</div>
                <div className="mt-1">讓客戶一眼看懂效果</div>
              </div>
              <div className="rounded-lg border border-border/70 bg-card/50 p-3">
                <div className="font-display text-foreground">百場道具製作</div>
                <div className="mt-1">不怕做不到，只怕你想不到</div>
              </div>
              <div className="rounded-lg border border-border/70 bg-card/50 p-3">
                <div className="font-display text-foreground">加Line即時溝通</div>
                <div className="mt-1">租期/運費/人員一次講清楚</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="absolute -right-10 -top-8 h-44 w-44 rounded-full bg-accent/20 blur-2xl" />
            <Card className="relative overflow-hidden border-border/70 bg-card/60">
              <div className="hazard h-2 w-full" />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <img
                    src={mascot}
                    alt="怪獸工程師"
                    className="h-20 w-20 rounded-xl border border-border/60 object-cover"
                  />
                  <div>
                    <div className="font-display text-xl">怪獸工程師提醒</div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      想做出『客戶買單』、『符合預算』，你需要的不是更花俏的道具，而是更完整的 SOP。
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {["活動日期/地點", "室內或戶外（雨備）", "舞台高度/搬運動線", "是否需要現場人員執行"].map(
                    (t) => (
                      <div
                        key={t}
                        className="flex items-center gap-3 rounded-lg border border-border/70 bg-background/30 px-3 py-2"
                      >
                        <span className="inline-block h-2 w-2 rounded-full bg-accent" />
                        <span className="text-sm text-muted-foreground">{t}</span>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-5">
                  <Button asChild className="w-full">
                    <Link href="/contact">
                      <Wrench className="mr-2 h-4 w-4" /> 丟需求給怪獸（表單）
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* DOORS */}
      <section className="relative mx-auto max-w-6xl px-4 py-14">
        <div className="pointer-events-none absolute -top-10 left-1/2 h-24 w-[120%] -translate-x-1/2 bg-gradient-to-r from-accent/0 via-accent/15 to-accent/0 blur-2xl" />

        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
          <SectionTitle kicker="PORTAL DOORS" title="挑一扇門，尋找讓客戶尖叫的神兵利器!" />
        </motion.div>

        <motion.div
          className="grid gap-4 md:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.06 } } }}
        >
          {(Object.entries(categoryMeta) as [
            keyof typeof categoryMeta,
            (typeof categoryMeta)[keyof typeof categoryMeta],
          ][]).map(([key, meta], idx) => {
            const Icon =
              ({
                balloon: Balloon,
                lighting: Lightbulb,
                card: IdCard,
                water: Droplets,
                sticker: Sticker,
                electric: Cpu,
                large: Boxes,
              } as const)[key as any] ?? Boxes;

            return (
              <Link key={key} href={`/props?cat=${key}`}>
                <motion.div variants={reveal} className="portal-card-wrap">
                  <Card className="portal-card group relative overflow-hidden border-border/70 bg-card/50 p-5">
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                      <div className="noise absolute inset-0" />
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="relative mt-0.5 h-11 w-11 overflow-hidden rounded-xl border border-border/70 bg-background/20 p-2 text-accent">
                          <div className="absolute inset-0 opacity-35 hazard" />
                          <Icon className="relative h-7 w-7" />
                        </div>

                        <div>
                          <div className="font-display text-xs tracking-widest text-muted-foreground">
                            {String(idx + 1).padStart(2, "0")} / {meta.door}
                          </div>
                          <div className="mt-2 font-display text-2xl">{meta.label}</div>
                          <div className="mt-2 text-sm text-muted-foreground">{meta.blurb}</div>
                        </div>
                      </div>

                      <div className="h-10 w-10 rounded-lg border border-border/70 bg-background/20 p-2 text-accent transition group-hover:rotate-6">
                        <ArrowRight className="h-6 w-6" />
                      </div>
                    </div>

                    <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-background/20">
                      <div className="absolute left-0 top-0 h-full w-full opacity-0 transition group-hover:opacity-100">
                        <div className="absolute inset-0 hazard opacity-20" />
                      </div>
                      <div className="h-full bg-accent" style={{ width: `${30 + idx * 10}%` }} />
                    </div>
                  </Card>
                </motion.div>
              </Link>
            );
          })}
        </motion.div>
      </section>


      {/* KNOWLEDGE */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
          <SectionTitle kicker="KNOWLEDGE" title="怪獸情報局：讓你的提案更穩" />
        </motion.div>

        <motion.div
          className="grid gap-4 md:grid-cols-2"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          {articles.map((a) => (
            <Link key={a.id} href={`/knowledge/${a.slug}`}>
              <motion.div variants={reveal}>
                <Card className="group border-border/70 bg-card/40 p-5 transition hover:border-accent/50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs tracking-widest text-muted-foreground">{a.category}</div>
                      <div className="mt-2 font-display text-2xl">{a.title}</div>
                      <div className="mt-2 text-sm text-muted-foreground">{a.excerpt}</div>
                    </div>
                    <div className="mt-1 text-accent transition group-hover:translate-x-1">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* HOME VIDEO */}
      {homeVideo?.enabled && homeVideo.youtubeUrl?.trim() ? (
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
            <div className="rounded-2xl border border-border/70 bg-card/30 p-5">
              <div className="font-display text-sm tracking-widest text-muted-foreground">VIDEO</div>
              <h2 className="mt-2 font-display text-3xl text-[#abf95f] md:text-4xl">{homeVideo.title || "影片"}</h2>
              {homeVideo.subtitle ? <p className="mt-2 text-sm text-muted-foreground md:text-base">{homeVideo.subtitle}</p> : null}
            </div>
          </motion.div>

          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} className="mt-4">
            <Card className="overflow-hidden border-border/70 bg-card/40">
              <div className="hazard h-2 w-full opacity-60" />
              <div className="aspect-video w-full bg-background/20">
                <iframe
                  className="h-full w-full"
                  src={toYouTubeEmbedUrl(homeVideo.youtubeUrl || "")}
                  title={homeVideo.title || "YouTube"}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            </Card>
          </motion.div>
        </section>
      ) : null}

      {/* ADMIN */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <Card className="border-border/70 bg-card/40 p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-display text-lg">管理員後台</div>
              <div className="mt-1 text-sm text-muted-foreground">登入後可管理：道具、案例、文章、分類與詢價名單。</div>
            </div>
            <Button asChild variant="secondary">
              <Link href="/admin">管理員後台</Link>
            </Button>
          </div>
        </Card>
      </section>
    </SiteLayout>
  );
}
