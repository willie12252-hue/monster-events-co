import SiteLayout from "@/components/SiteLayout";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-cases-stagebay.webp";
import NextStepCTA from "@/components/NextStepCTA";
import { useAppData } from "@/contexts/DataContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowLeft, MapPin, PlayCircle } from "lucide-react";
import { Streamdown, defaultRehypePlugins } from "streamdown";
import { useEffect, useRef } from "react";
import { applySeo } from "@/lib/seo";
import { normalizeMarkdownImageUrls } from "@/lib/markdown";

export default function CaseDetail({ id }: { id: string }) {
  const { data, setData } = useAppData();
  const { cases } = data as any;

  const c = cases.find((x: any) => x.id === id && (x.status ?? "public") === "public");
  const bumpedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!c) return;
    applySeo({
      title: (c.seo?.title || c.title) + "｜怪獸道具工廠",
      description: c.seo?.description || c.highlight,
      image: c.seo?.image || c.thumbnail,
    });
  }, [c]);

  // View counter (localStorage based)
  useEffect(() => {
    if (!c) return;
    if (bumpedRef.current === c.id) return;
    bumpedRef.current = c.id;
    setData({
      ...(data as any),
      cases: (data.cases as any[]).map((x) => (x.id === c.id ? { ...x, views: (x.views ?? 0) + 1 } : x)),
    } as any);
  }, [c?.id]);

  if (!c) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-xl border border-border/70 bg-card/40 p-8">
            <div className="font-display text-2xl">找不到這個案例</div>
            <p className="mt-2 text-sm text-muted-foreground">可能是尚未上架，或連結有誤。</p>
            <Button asChild className="mt-6">
              <Link href="/cases">
                <ArrowLeft className="mr-2 h-4 w-4" /> 回到近期案例
              </Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageBanner image={banner} kicker="近期案例" title={c.title} subtitle={c.highlight} />

      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="secondary">
            <Link href="/cases">
              <ArrowLeft className="mr-2 h-4 w-4" /> 回列表
            </Link>
          </Button>
          <Badge variant="secondary" className="bg-background/30">
            {c.type}
          </Badge>
          <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-4 w-4" /> {c.city}
          </div>
        </div>

        {c.videoUrl?.trim() ? (
          <Card className="mt-8 overflow-hidden border-border/70 bg-card/40">
            <div className="flex items-center justify-between border-b border-border/70 bg-background/20 px-4 py-3">
              <div className="font-display">案例影片</div>
              <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <PlayCircle className="h-4 w-4" /> YouTube
              </div>
            </div>
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={c.videoUrl}
                title={c.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </Card>
        ) : null}

        {c.content?.trim() ? (
          <Card className="prose prose-invert mt-8 max-w-none border-border/70 bg-card/40 p-6">
            <Streamdown rehypePlugins={[defaultRehypePlugins.raw]} remarkRehypeOptions={{ allowDangerousHtml: true }}>
              {normalizeMarkdownImageUrls(c.content)}
            </Streamdown>
          </Card>
        ) : (
          <Card className="mt-8 border-border/70 bg-card/40 p-6 text-sm text-muted-foreground">
            尚未填寫案例詳細介紹（可於後台補上圖文內容）。
          </Card>
        )}

        <NextStepCTA mode="both" />
      </section>
    </SiteLayout>
  );
}
