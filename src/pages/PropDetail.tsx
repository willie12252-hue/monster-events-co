import SiteLayout from "@/components/SiteLayout";
import { formatFootprint } from "@/lib/prop-specs";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-props-armory.webp";
import NextStepCTA from "@/components/NextStepCTA";
import { type PropItem } from "@/data/props";
import { useAppData } from "@/contexts/DataContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Streamdown, defaultRehypePlugins } from "streamdown";
import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuote } from "@/contexts/QuoteContext";
import hero from "@/assets/hero.webp";
import pattern from "@/assets/pattern.webp";
import { toast } from "sonner";
import { applySeo } from "@/lib/seo";
import { normalizeMarkdownImageUrls } from "@/lib/markdown";
import {
  ArrowLeft,
  Plus,
  PlayCircle,
  Image as ImageIcon,
  Zap,
  Users,
  DoorOpen,
  Ruler,
} from "lucide-react";

export default function PropDetail({ slug }: { slug: string }) {
  const { data, setData } = useAppData();
  const { props: propsData, categoryMeta } = data as any;

  const prop = ((propsData ?? []) as any[]).find((p) => p.slug === slug && (p.status ?? "public") === "public");
  const bumpedRef = useRef<string | null>(null);
  const { addLine } = useQuote();

  if (!prop) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-xl border border-border/70 bg-card/40 p-8">
            <div className="text-xs text-muted-foreground">（可能是草稿尚未公開，或連結有誤）</div>
            <div className="font-display text-2xl">找不到這個道具</div>
            <p className="mt-2 text-sm text-muted-foreground">可能是尚未上架，或連結有誤。</p>
            <Button asChild className="mt-6">
              <Link href="/props">
                <ArrowLeft className="mr-2 h-4 w-4" /> 回到道具軍火庫
              </Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  useEffect(() => {
    if (!prop) return;
    const title = (prop.seo?.title || prop.name || "") + "｜怪獸道具工廠";
    applySeo({
      title,
      description: prop.seo?.description || prop.summary,
      image: prop.seo?.image || prop.thumbnail,
    });
  }, [prop]);

  useEffect(() => {
    if (!prop) return;
    if (bumpedRef.current === prop.id) return;
    bumpedRef.current = prop.id;
    setData({
      ...(data as any),
      props: (data.props as any[]).map((p) => (p.id === prop.id ? { ...p, views: (p.views ?? 0) + 1 } : p)),
    } as any);
  }, [prop?.id]);

  const add = () => {
    addLine({ propId: prop.id, slug: prop.slug, name: prop.name });
    toast.success("已加入詢價單");
  };

  return (
    <SiteLayout>
      <PageBanner
        image={banner}
        kicker={categoryMeta?.[prop.category]?.label ?? "未分類"}
        title={prop.name || "未命名"}
        subtitle={prop.summary || ""}
      />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="secondary">
            <Link href="/props">
              <ArrowLeft className="mr-2 h-4 w-4" /> 回列表
            </Link>
          </Button>
          <Badge variant="secondary" className="bg-background/30">
            {categoryMeta?.[prop.category]?.label ?? "未分類"}
          </Badge>
          {(prop.tags || []).map((t: string) => (
            <Badge key={t} variant="outline" className="border-border/70">
              {t}
            </Badge>
          ))}
        </div>

        <div className="mt-6 grid gap-8 md:grid-cols-[1.2fr_.8fr]">
          <div>
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary" className="bg-background/30">
                <Zap className="h-3.5 w-3.5" />
                <span className="ml-1">
                  {prop?.quick?.power === "need"
                    ? "需用電"
                    : prop?.quick?.power === "none"
                      ? "不需用電"
                      : "可選用電/未標示"}
                </span>
              </Badge>
              <Badge variant="secondary" className="bg-background/30">
                <Users className="h-3.5 w-3.5" /> <span className="ml-1">{prop?.quick?.crew ?? 1} 人</span>
              </Badge>
              <Badge variant="secondary" className="bg-background/30">
                <DoorOpen className="h-3.5 w-3.5" />
                <span className="ml-1">
                  {prop?.quick?.venue === "indoor"
                    ? "室內"
                    : prop?.quick?.venue === "outdoor"
                      ? "戶外"
                      : "室內/戶外"}
                </span>
              </Badge>
              {prop?.quick?.footprint && (
                <Badge variant="secondary" className="bg-background/30">
                  <Ruler className="h-3.5 w-3.5" /> <span className="ml-1">{formatFootprint(prop.quick.footprint)}</span>
                </Badge>
              )}
            </div>

            <Card className="relative mt-6 overflow-hidden border-border/70 bg-card/40">
              <div className="hazard h-2 w-full" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="font-display">圖影混合展示</div>
                  <div className="text-xs text-muted-foreground">
                    {prop.heroType === "video" ? (
                      <span className="inline-flex items-center gap-1">
                        <PlayCircle className="h-4 w-4" /> 影片
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <ImageIcon className="h-4 w-4" /> 圖片
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  {prop.heroType === "video" && prop.heroVideo?.trim() ? (
                    <div className="grid gap-3 md:grid-cols-[1.35fr_.65fr]">
                      <div className="aspect-video overflow-hidden rounded-xl border border-border/70 bg-background/20">
                        <iframe
                          className="h-full w-full"
                          src={prop.heroVideo.startsWith("http") ? prop.heroVideo : `https://www.youtube.com/embed/${prop.heroVideo}`}
                          title={prop.name}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allowFullScreen
                        />
                      </div>

                      <div className="rounded-xl border border-border/70 bg-background/15 p-4">
                        <div className="font-display text-base">快速看懂（不用看完影片）</div>
                        <div className="mt-2 text-sm text-muted-foreground">{prop.summary}</div>
                        <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
                          {(prop.highlights || []).slice(0, 3).map((h: string) => (
                            <div key={h} className="flex gap-3">
                              <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                              <span>{h}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-border/70 bg-background/20">
                      <img
                        src={prop.heroImage === "pattern" ? pattern : hero}
                        alt={prop.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <div className="mt-8">
              <div className="font-display text-2xl">亮點</div>
              <ul className="mt-3 grid gap-2 text-sm text-muted-foreground">
                {(prop.highlights || []).map((h: string) => (
                  <li key={h} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 rounded-full bg-accent" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {prop.content?.trim() ? (
              <>
                <Separator className="my-8" />
                <div>
                  <div className="font-display text-2xl">詳細介紹</div>
                  <Card className="prose prose-invert mt-4 max-w-none border-border/70 bg-card/40 p-6">
                    <Streamdown rehypePlugins={[defaultRehypePlugins.raw]} remarkRehypeOptions={{ allowDangerousHtml: true }}>
                      {normalizeMarkdownImageUrls(prop.content)}
                    </Streamdown>
                  </Card>
                </div>
              </>
            ) : null}

            <Separator className="my-8" />

            <div>
              <div className="font-display text-2xl">租借/執行注意事項</div>
              <div className="mt-3 grid gap-3 text-sm text-muted-foreground">
                <div className="rounded-xl border border-border/70 bg-card/40 p-4">
                  <div className="font-display text-base text-foreground">運送與搬運</div>
                  <div className="mt-1">
                    跨縣市運費、樓層搬運、舞台上台方式需事前確認。大型道具建議提供坡道或貨梯資訊。
                  </div>
                </div>
                <div className="rounded-xl border border-border/70 bg-card/40 p-4">
                  <div className="font-display text-base text-foreground">戶外雨備</div>
                  <div className="mt-1">戶外活動務必準備頂蓬/雨備；遇雨且無法安全執行，可能會影響服務。</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <Card className="sticky top-24 border-border/70 bg-card/50 p-5">
              <div className="font-display text-2xl">規格</div>
              <div className="mt-4 grid gap-3 text-sm">
                {(
                  [
                    ["尺寸", prop?.specs?.size ?? "未標示"],
                    ["用電需求", prop?.specs?.power ?? "未標示"],
                    ["建議人員", `${prop?.quick?.crew ?? 1} 人`],
                    ["建議場地", prop?.quick?.venue === "indoor" ? "室內" : prop?.quick?.venue === "outdoor" ? "戶外" : "室內/戶外"],
                    ["尺寸提示", prop?.quick?.footprint ? formatFootprint(prop.quick.footprint) : "無"],
                  ] as const
                ).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-border/70 bg-background/20 p-3">
                    <div className="text-xs tracking-widest text-muted-foreground">{k}</div>
                    <div className="mt-1 text-sm text-foreground">{v}</div>
                  </div>
                ))}
              </div>

              <Button
                onClick={add}
                size="lg"
                className="mt-5 w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Plus className="mr-2 h-5 w-5" /> 加入詢價單
              </Button>

              <Button asChild variant="outline" className="mt-2 w-full">
                <Link href="/contact">直接聯絡專員</Link>
              </Button>
            </Card>
          </div>
        </div>

        <NextStepCTA mode="both" />
      </section>
    </SiteLayout>
  );
}
