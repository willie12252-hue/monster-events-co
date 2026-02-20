import SiteLayout from "@/components/SiteLayout";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-knowledge-lab.webp";
import NextStepCTA from "@/components/NextStepCTA";
import { useAppData } from "@/contexts/DataContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { ArrowRight, Search, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { reveal, stagger } from "@/lib/motion";
import { useMemo,
   
  useState } from "react";
import { toast } from "sonner";
import hero from "@/assets/hero.webp";
import pattern from "@/assets/pattern.webp";

export default function Knowledge() {
  const { data, setData } = useAppData();
  const { articles, articleCategories, newsletter, newsletterSubscribers } = data;

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");

  // Newsletter
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(true);
  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);

  const subscribe = async () => {
    const e = email.trim().toLowerCase();
    if (!newsletter?.enabled) return;
    if (!consent) return toast.error("請先勾選同意接收電子報");
    if (!emailOk) return toast.error("請輸入正確的 Email");

    const exists = (newsletterSubscribers ?? []).some((x: any) => String(x.email || "").toLowerCase() === e);
    if (exists) return toast.message("你已訂閱過了");

    const next = [{ email: e, createdAt: new Date().toISOString(), source: "knowledge" }, ...(newsletterSubscribers ?? [])];
    setData({ ...data, newsletterSubscribers: next } as any);
    setEmail("");
    try {
            const { insertNewsletterSubscriber } = await import("@/lib/supabase-store");
                  await insertNewsletterSubscriber({ email: e, source: "knowledge" });
    } catch (err) {
            console.error("[newsletter] supabase insert failed", err);
    }
toast.success("已完成訂閱！");

  };

  const normalizedCats = useMemo(() => {
    const base = Array.isArray(articleCategories) ? articleCategories : [];
    const fromArticles = Array.from(new Set((articles ?? []).map((a: any) => String(a.category || "").trim()).filter(Boolean)));
    const merged = Array.from(new Set([...base, ...fromArticles]));
    return merged.length ? merged : ["趨勢靈感", "實戰避雷", "怪獸實驗室", "能量案例"];
  }, [articleCategories, articles]);

  const publicList = useMemo(() => {
    return (articles ?? [])
      .map((a: any, idx: number) => ({ ...a, order: typeof a.order === "number" ? a.order : idx }))
      .filter((a: any) => (a.status ?? "public") === "public")
      .sort((x: any, y: any) => (x.order ?? 0) - (y.order ?? 0));
  }, [articles]);

  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of publicList) {
      for (const t of (a.tags ?? []) as string[]) {
        const k = String(t || "").trim();
        if (!k) continue;
        map.set(k, (map.get(k) ?? 0) + 1);
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [publicList]);

  const catCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of publicList) {
      const k = String(a.category || "").trim() || "未分類";
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  }, [publicList]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return publicList.filter((a: any) => {
      if (cat !== "all" && String(a.category || "").trim() !== cat) return false;
      if (tag !== "all") {
        const tags = (a.tags ?? []) as string[];
        if (!tags.some((t) => String(t).trim() === tag)) return false;
      }
      if (!term) return true;
      const hay = `${a.title} ${a.excerpt} ${(a.tags ?? []).join(" ")}`.toLowerCase();
      return hay.includes(term);
    });
  }, [publicList, q, cat, tag]);

  return (
    <SiteLayout>
      <PageBanner
        image={banner}
        kicker="MONSTER INTEL"
        title="怪獸情報局"
        subtitle="把客戶最常問的風險與避雷先寫好，提案會更穩、成交會更快。"
      />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <div>
            <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
              <div className="rounded-2xl border border-border/70 bg-card/30 p-4">
                <div className="font-display text-foreground">關鍵字搜尋</div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="搜尋標題 / 摘要 / 標籤…"
                      className="pl-9"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setQ("");
                      setCat("all");
                      setTag("all");
                    }}
                  >
                    清除
                  </Button>
                </div>

                {(cat !== "all" || tag !== "all") && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>篩選中：</span>
                    {cat !== "all" ? (
                      <span className="rounded-full border border-border/70 bg-background/20 px-2 py-1">分類：{cat}</span>
                    ) : null}
                    {tag !== "all" ? (
                      <span className="rounded-full border border-border/70 bg-background/20 px-2 py-1">標籤：#{tag}</span>
                    ) : null}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              className="mt-8 grid gap-4"
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
            >
              {list.length ? (
                list.map((a) => (
                  <motion.div key={a.id} variants={reveal}>
                    <Link href={`/knowledge/${a.slug}`}>
                      <Card className="group overflow-hidden border-border/70 bg-card/40 transition hover:border-accent/50">
                        <div className="grid gap-0 md:grid-cols-[320px_1fr]">
                          <div className="aspect-[16/9] w-full overflow-hidden border-b border-border/70 bg-background/20 md:aspect-auto md:h-full md:border-b-0 md:border-r">
                            <img
                              src={a.thumbnail || pattern || hero}
                              alt={a.title}
                              className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.02]"
                              loading="lazy"
                            />
                          </div>

                          <div className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge className="bg-background/30 text-foreground" variant="secondary">
                                    {a.category || "未分類"}
                                  </Badge>
                                  <div className="text-xs text-muted-foreground">{a.date}</div>
                                  <div className="text-xs text-muted-foreground">FAQ：{(a.faq ?? []).length} 題</div>
                                </div>

                                <div className="mt-3 font-display text-2xl leading-snug">{a.title}</div>
                                <div className="mt-2 text-sm text-muted-foreground">{a.excerpt}</div>

                                {(a.tags ?? []).length ? (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {(a.tags ?? []).slice(0, 6).map((t: string) => (
                                      <span
                                        key={t}
                                        className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-background/20 px-2 py-1 text-xs text-muted-foreground"
                                      >
                                        <Tag className="h-3 w-3" /> {t}
                                      </span>
                                    ))}
                                  </div>
                                ) : null}

                                <div className="mt-4 inline-flex items-center gap-2 text-sm text-accent">
                                  查看全文 <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <Card className="border-border/70 bg-card/30 p-6 text-sm text-muted-foreground">
                  沒有符合條件的文章。你可以試試：清除篩選、換關鍵字、或改選其他分類/標籤。
                </Card>
              )}
            </motion.div>

            {newsletter?.enabled ? (
              <Card className="mt-4 overflow-hidden border-border/70 bg-card/40">
                <div className="hazard h-2 w-full opacity-60" />
                <div className="p-5">
                  <div className="font-display text-2xl text-[#abf95f]">{newsletter.title}</div>
                  {newsletter.subtitle ? <div className="mt-2 text-sm text-muted-foreground">{newsletter.subtitle}</div> : null}

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={newsletter.placeholder}
                      inputMode="email"
                      className="sm:flex-1"
                    />
                    <Button
                      type="button"
                      className="bg-accent text-accent-foreground hover:bg-accent/90"
                      onClick={subscribe}
                      disabled={!email.trim()}
                    >
                      {newsletter.buttonText}
                    </Button>
                  </div>

                  <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                    <Checkbox checked={consent} onCheckedChange={(v) => setConsent(Boolean(v))} />
                    <div className="leading-relaxed">{newsletter.consentText}</div>
                  </div>

                  <div className="mt-3 text-[11px] text-muted-foreground">
                    目前訂閱數：{(newsletterSubscribers ?? []).length}
                  </div>
                </div>
              </Card>
            ) : null}

            <NextStepCTA mode="both" />
          </div>

          {/* Sidebar: categories + hot tags */}
          <aside className="hidden md:block">
            <div className="sticky top-24 grid gap-4">
              <div className="rounded-2xl border border-border/70 bg-card/40 p-4">
                <div className="font-display text-foreground">文章分類</div>
                <div className="mt-3 grid gap-2">
                  {(
                    [{ label: "所有文章", value: "all", count: publicList.length }] as const
                  )
                    .concat(
                      normalizedCats.map((c) => ({ label: c, value: c, count: catCounts.get(c) ?? 0 })) as any,
                    )
                    .map((c: any) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          setCat(c.value);
                          setTag("all");
                        }}
                        className={
                          "flex items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition " +
                          (cat === c.value
                            ? "border-accent/60 bg-background/20 text-foreground"
                            : "border-border/60 bg-background/10 text-muted-foreground hover:border-accent/40 hover:text-foreground")
                        }
                      >
                        <span className="font-display">{String((c as any)?.label ?? "")}</span>
                        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-background/30 px-2 py-1 text-xs text-muted-foreground">
                          {c.count}
                        </span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/40 p-4">
                <div className="font-display text-foreground">熱門標籤</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tagCounts.length ? (
                    tagCounts.slice(0, 18).map(([t, n]) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => {
                          setTag(t);
                          setCat("all");
                        }}
                        className={
                          "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs transition " +
                          (tag === t
                            ? "border-accent/60 bg-accent/15 text-foreground"
                            : "border-border/60 bg-background/10 text-muted-foreground hover:border-accent/40 hover:text-foreground")
                        }
                      >
                        <span>#{t}</span>
                        <span className="rounded-full bg-background/30 px-2 py-0.5 text-[11px] text-muted-foreground">
                          {n}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="text-sm text-muted-foreground">尚未設定標籤。</div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>

      </section>
    </SiteLayout>
  );
}
