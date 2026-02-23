import SiteLayout from "@/components/SiteLayout";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-cases-stagebay.webp";
import NextStepCTA from "@/components/NextStepCTA";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/contexts/DataContext";
import { Link } from "wouter";
import hero from "@/assets/hero.webp";
import pattern from "@/assets/pattern.webp";
import mascot from "@/assets/mascot.webp";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { reveal, stagger } from "@/lib/motion";

function getImg(k: string) {
  if (k === "pattern") return pattern;
  if (k === "mascot") return mascot;
  return hero;
}

export default function Cases() {
  const {
    data: { cases },
  } = useAppData();

  const list = useMemo(() => {
    return cases
      .map((c: any, idx: number) => ({ ...c, order: typeof c.order === "number" ? c.order : idx }))
      .filter((c: any) => (c.status ?? "public") === "public")
      .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }, [cases]);

  return (
    <SiteLayout>
      <PageBanner
        image={banner}
        kicker="案例"
        title="近期案例"
        subtitle="精選近期合作案例與可複製的啟動節奏，方便你快速找靈感。"
      />
      <section className="mx-auto max-w-6xl px-4 py-10">

        <div className="mt-8 columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
          {list.map((c) => (
            <motion.div key={c.id} variants={reveal} className="break-inside-avoid">
              <Card className="group overflow-hidden border-border/70 bg-card/40 transition hover:border-accent/50">
                <div className="aspect-[16/9] overflow-hidden border-b border-border/70 bg-background/20">
                  {c.videoUrl?.trim() ? (
                    <iframe
                      className="h-full w-full"
                      src={c.videoUrl}
                      title={c.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={c.thumbnail || getImg(c.image)}
                      alt={c.title}
                      className="h-full w-full object-cover opacity-90"
                      loading="lazy"
                    />
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-accent text-accent-foreground" variant="secondary">
                      {c.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{c.city}</span>
                  </div>
                  <div className="mt-3 font-display text-xl leading-snug">{c.title}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{c.highlight}</div>

                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link href={`/cases/${c.id}`}>查看案例詳情</Link>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-10 grid gap-4 md:grid-cols-3" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {["動土典禮", "新品發表", "店鋪開幕"].map((t) => (
            <motion.div key={t} variants={reveal}>
              <Card className="border-border/70 bg-background/20 p-5 text-sm text-muted-foreground">
                <div className="font-display text-foreground">適用活動</div>
                <div className="mt-2">{t}：可用不同道具組合出『更有記憶點』的開場節奏。</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <NextStepCTA mode="both" />
      </section>
    </SiteLayout>
  );
}
