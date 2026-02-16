import SiteLayout from "@/components/SiteLayout";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-knowledge-lab.webp";
import NextStepCTA from "@/components/NextStepCTA";
import { useAppData } from "@/contexts/DataContext";
import { Streamdown, defaultRehypePlugins } from "streamdown";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { ArrowLeft, Boxes, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { reveal, stagger } from "@/lib/motion";
import { useEffect, useRef } from "react";
import { applySeo } from "@/lib/seo";
import { normalizeMarkdownImageUrls } from "@/lib/markdown";

export default function Article({ slug }: { slug: string }) {
  const { data, setData } = useAppData();
  const { articles, props: propsData } = data as any;

  const a = articles.find((x: any) => x.slug === slug && (x.status ?? "public") === "public");
  const bumpedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!a) return;

    applySeo({
      title: (a.seo?.title || a.title) + "｜怪獸道具工廠",
      description: a.seo?.description || a.excerpt,
      image: a.seo?.image || a.thumbnail,
    });

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: a.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };

    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.text = JSON.stringify(jsonLd);
    document.head.appendChild(el);
    return () => {
      document.head.removeChild(el);
    };
  }, [a]);

  // View counter (localStorage based)
  useEffect(() => {
    if (!a) return;
    if (bumpedRef.current === a.id) return;
    bumpedRef.current = a.id;
    setData({
      ...(data as any),
      articles: (data.articles as any[]).map((x) => (x.id === a.id ? { ...x, views: (x.views ?? 0) + 1 } : x)),
    } as any);
  }, [a?.id]);

  if (!a) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-xl border border-border/70 bg-card/40 p-8">
            <div className="font-display text-2xl">找不到這篇文章</div>
            <p className="mt-2 text-sm text-muted-foreground">可能是尚未發佈，或連結有誤。</p>
            <Button asChild className="mt-6">
              <Link href="/knowledge">
                <ArrowLeft className="mr-2 h-4 w-4" /> 回到知識庫
              </Link>
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const related = propsData.filter((p) => a.relatedPropSlugs.includes(p.slug));

  return (
    <SiteLayout>
      <PageBanner
        image={banner}
        kicker={a.category}
        title={a.title}
        subtitle={a.excerpt}
      />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="secondary">
            <Link href="/knowledge">
              <ArrowLeft className="mr-2 h-4 w-4" /> 回知識庫
            </Link>
          </Button>
          <Badge variant="secondary" className="bg-background/30">
            {a.category}
          </Badge>
          <div className="text-xs text-muted-foreground">{a.date}</div>
        </div>

        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
          <Card className="prose prose-invert mt-8 max-w-none border-border/70 bg-card/40 p-6">
            {a.videoUrl?.trim() ? (
              <div className="not-prose mb-5 overflow-hidden rounded-xl border border-border/70 bg-background/20">
                <div className="aspect-video">
                  <iframe
                    className="h-full w-full"
                    src={a.videoUrl}
                    title={a.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : null}
            <Streamdown rehypePlugins={[defaultRehypePlugins.raw]} remarkRehypeOptions={{ allowDangerousHtml: true }}>
              {normalizeMarkdownImageUrls(a.content)}
            </Streamdown>
          </Card>
        </motion.div>

        <motion.div className="mt-10" variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }}>
          <div className="flex items-center gap-2 font-display text-2xl">
            <MessageCircle className="h-6 w-6 text-accent" /> 常見問題（FAQ）
          </div>
          <p className="mt-2 text-sm text-muted-foreground">（此區塊同時輸出 FAQ 結構化資料，利於 SEO）</p>
          <Card className="mt-4 border-border/70 bg-card/40 p-4">
            <Accordion type="single" collapsible>
              {a.faq.map((f, i) => (
                <AccordionItem key={f.q} value={`faq${i}`} className="border-border/70">
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </motion.div>

        <div className="mt-10">
          <div className="flex items-center gap-2 font-display text-2xl">
            <Boxes className="h-6 w-6 text-accent" /> 推薦搭配道具
          </div>
          <motion.div
            className="mt-4 grid gap-4 md:grid-cols-3"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            {related.map((p) => (
              <motion.div key={p.id} variants={reveal}>
                <Card className="border-border/70 bg-card/40 p-5">
                  <div className="text-xs tracking-widest text-muted-foreground">{p.tags[0]}</div>
                  <div className="mt-2 font-display text-xl">{p.name}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{p.summary}</div>
                  <Button asChild className="mt-4 w-full">
                    <Link href={`/props/${p.slug}`}>看道具詳情</Link>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <NextStepCTA mode="both" />
      </section>
    </SiteLayout>
  );
}
