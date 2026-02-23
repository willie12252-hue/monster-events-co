import SiteLayout from "@/components/SiteLayout";
import { formatFootprint } from "@/lib/prop-specs";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-props-armory.webp";
import NextStepCTA from "@/components/NextStepCTA";
import { Card } from "@/components/ui/card";
import hero from "@/assets/hero.webp";
import pattern from "@/assets/pattern.webp";
import mascot from "@/assets/mascot.webp";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type PropCategoryKey, type PropItem } from "@/data/props";
import { useAppData } from "@/contexts/DataContext";
import { Link, useLocation } from "wouter";
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  ShieldAlert,
  Truck,
  CalendarClock,
  Zap,
  Users,
  DoorOpen,
  Ruler,
} from "lucide-react";
import { useMemo, useState } from "react";

const CATEGORY_KEYS: PropCategoryKey[] = [
  "balloon",
  "lighting",
  "card",
  "water",
  "sticker",
  "electric",
  "large",
];

function fallbackThumb(k?: string) {
  if (k === "pattern") return pattern;
  if (k === "mascot") return mascot;
  return hero;
}

function getQueryCat(loc: string): PropCategoryKey | "all" {
  try {
    const u = new URL("https://x.local" + loc);
    const cat = u.searchParams.get("cat") as PropCategoryKey | null;
    if (!cat) return "all";
    return CATEGORY_KEYS.includes(cat) ? cat : "all";
  } catch {
    return "all";
  }
}

export default function Props() {
  const {
    data: { props: propsData, categoryGuides, categoryMeta },
  } = useAppData();

  const [loc] = useLocation();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<PropCategoryKey | "all">(() => getQueryCat(loc));

  const guide = cat !== "all" ? (categoryGuides as any)[cat] : null;

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (propsData || [])
      .map((p: any, idx: number) => ({ ...p, order: typeof p.order === "number" ? p.order : idx }))
      .filter((p: any) => (p?.status ?? "public") === "public")
      .sort((a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0))
      .filter((p: any) => (cat === "all" ? true : p?.category === cat))
      .filter((p: any) => {
        if (!term) return true;
        const hay = `${p?.name || ''} ${p?.summary || ''} ${(p?.tags ?? []).join(" ")}`.toLowerCase();
        return hay.includes(term);
      });
  }, [q, cat, propsData]);

  const specBadges = (p: PropItem) => {
    // 加上極致的防禦性編程 (Defensive Programming)
    const powerLabel = p?.quick?.power === "need" ? "需用電" : p?.quick?.power === "none" ? "不需用電" : "可選用電/未標示";
    const powerIcon = <Zap className="h-3.5 w-3.5" />;
    const venueLabel = p?.quick?.venue === "indoor" ? "室內" : p?.quick?.venue === "outdoor" ? "戶外" : "室內/戶外";
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary" className="bg-background/30">
          {powerIcon} <span className="ml-1">{powerLabel}</span>
        </Badge>
        <Badge variant="secondary" className="bg-background/30">
          <Users className="h-3.5 w-3.5" /> <span className="ml-1">{p?.quick?.crew ?? 1} 人</span>
        </Badge>
        <Badge variant="secondary" className="bg-background/30">
          <DoorOpen className="h-3.5 w-3.5" /> <span className="ml-1">{venueLabel}</span>
        </Badge>
        {p?.quick?.footprint && (
          <Badge variant="secondary" className="bg-background/30">
            <Ruler className="h-3.5 w-3.5" /> <span className="ml-1">{formatFootprint(p.quick.footprint)}</span>
          </Badge>
        )}
      </div>
    );
  };

  return (
    <SiteLayout>
      <PageBanner
        image={banner}
        kicker="道具軍火庫"
        title="道具軍火庫"
        subtitle="挑道具之前，先把場地/時間/動線想清楚；報價會更準、執行風險更低。"
        glow="on"
      />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-sm text-muted-foreground">
              支援分類篩選、圖影混合展示與加入詢價，讓客戶快速看懂效果與執行需求。
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜尋：注水、推桿、顯字…" className="pl-9" />
            </div>
            <Select value={cat} onValueChange={(v) => setCat(v as any)}>
              <SelectTrigger className="w-full md:w-52">
                <SelectValue placeholder="選擇分類" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分類</SelectItem>
                {(Object.keys(categoryMeta || {}) as PropCategoryKey[]).map((k) => (
                  <SelectItem key={k} value={k}>
                    {categoryMeta?.[k]?.label ?? String(k)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="secondary">
              <SlidersHorizontal className="mr-2 h-4 w-4" /> 進階篩選
            </Button>
          </div>
        </div>

        {guide 
          ? (
            <div className="mt-8 grid gap-4 md:grid-cols-[1.1fr_.9fr]">
              <Card className="border-border/70 bg-card/40 p-5">
                <div className="flex items-center gap-2 font-display text-2xl">
                  <ShieldAlert className="h-6 w-6 text-accent" /> {guide.title}
                </div>
                <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                  {(guide.intro || []).map((p: string) => (
                    <p key={p}>{p}</p>
                  ))}
                  <div className="mt-1 flex flex-wrap gap-2">
                    {(guide.bestFor || []).map((b: string) => (
                      <span
                        key={b}
                        className="rounded-full border border-border/70 bg-background/20 px-3 py-1 text-xs"
                      >
                        適合：{b}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                  {(guide.rentNotes || []).map((t: string) => (
                    <div key={t} className="rounded-xl border border-border/70 bg-background/20 p-4">
                      <div className="flex gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                        <span>{t}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                  <div className="rounded-xl border border-border/70 bg-background/20 p-4">
                    <div className="inline-flex items-center gap-2 font-display text-foreground">
                      <CalendarClock className="h-4 w-4 text-accent" /> 預訂建議
                    </div>
                    <div className="mt-2 text-xs">熱門檔期請提早，客製化請預留製作期。</div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/20 p-4">
                    <div className="inline-flex items-center gap-2 font-display text-foreground">
                      <Truck className="h-4 w-4 text-accent" /> 運送搬運
                    </div>
                    <div className="mt-2 text-xs">跨縣市運費、貨梯/坡道、進撤場限制請先提供。</div>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/20 p-4">
                    <div className="inline-flex items-center gap-2 font-display text-foreground">
                      <ShieldAlert className="h-4 w-4 text-accent" /> 雨備安全
                    </div>
                    <div className="mt-2 text-xs">戶外需雨備；涉及電力/機構者建議含人員執行。</div>
                  </div>
                </div>
              </Card>

              <Card className="border-border/70 bg-card/40 p-5">
                <div className="font-display text-2xl">常見問題（FAQ）</div>
                <p className="mt-2 text-sm text-muted-foreground">把客戶最常問的先回答，溝通成本會下降很多。</p>
                <Accordion type="single" collapsible className="mt-4">
                  {(guide.faq || []).map((f: any, i: number) => (
                    <AccordionItem key={f.q || i} value={`q${i}`}
                      className="border-border/70">
                      <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Card>
            </div>
          )
          : (
            <div className="mt-8 rounded-xl border border-border/70 bg-card/40 p-5 text-sm text-muted-foreground">
              想看每個分類的租借說明與 FAQ：請先在右上方選擇分類（例如：注水道具、電動道具）。
            </div>
          )}

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {list.map((p: any) => (
            <Card key={p.id || Math.random()} className="group overflow-hidden border-border/70 bg-card/40">
              <div className="aspect-[16/9] overflow-hidden border-b border-border/70 bg-background/20">
                <img
                  src={p.thumbnail || fallbackThumb(p.heroImage)}
                  alt={p.name || "道具"}
                  className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs tracking-widest text-muted-foreground">{categoryMeta?.[p.category]?.label ?? "未分類"}</div>
                  <div className="mt-2 font-display text-xl">{p.name || "未命名道具"}</div>
                </div>
                <div className="text-accent transition group-hover:translate-x-1">
                  <ArrowRight className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-3 text-sm text-muted-foreground">{p.summary || "尚無簡介。"}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                {(p.tags || []).map((t: string) => (
                  <Badge key={t} variant="secondary" className="bg-background/30">
                    {t}
                  </Badge>
                ))}
              </div>

              {specBadges(p)}

              <div className="mt-5">
                <Button asChild className="w-full">
                  <Link href={`/props/${p.slug}`}>查看道具詳情</Link>
                </Button>
              </div>
              </div>
            </Card>
          ))}
        </div>

        {list.length === 0 && (
          <div className="mt-10 rounded-xl border border-border/70 bg-card/40 p-6 text-sm text-muted-foreground">
            沒找到符合條件的道具。
          </div>
        )}
      </section>
      <NextStepCTA mode="both" />
    </SiteLayout>
  );
}
