import SiteLayout from "@/components/SiteLayout";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-quote-clipboard.webp";
import NextStepCTA from "@/components/NextStepCTA";
import { useQuote } from "@/contexts/QuoteContext";
import { useAppData } from "@/contexts/DataContext";
import { buildQuoteEmailMessage, canSendEmail, sendEmailJs } from "@/lib/emailjs";
import { insertQuoteLead } from "@/lib/supabase-store";
import { supabasePublic } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { isValidEmail, isValidPhone } from "@/lib/validate";
import { Trash2, Minus, Plus, FileText, ArrowRight, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useMemo, useRef, useState } from "react";

function asLines(lines: any[]) {
  return (lines ?? []).map((l) => ({ name: l.name, qty: l.qty, note: l.note }));
}

export default function Quote() {
  const { data, setData } = useAppData();
  const { lines, addLine, updateQty, removeLine, updateNote, clear, count } = useQuote();

  const listRef = useRef<HTMLDivElement | null>(null);
  const companyRef = useRef<HTMLInputElement | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState<{ lines?: string; company?: string; name?: string; contact?: string; email?: string; phone?: string }>({});

  const [riskIndoorOutdoor, setRiskIndoorOutdoor] = useState(false);
  const [riskStage, setRiskStage] = useState(false);
  const [riskStaff, setRiskStaff] = useState(false);

  const topProps = useMemo(() => {
    const list = (data.props ?? []) as any[];
    return [...list]
      .filter((p) => (p.status ?? "public") === "public")
      .sort((a, b) => (b.views ?? 0) - (a.views ?? 0) || (a.order ?? 0) - (b.order ?? 0))
      .slice(0, 6);
  }, [data.props]);
  const [company, setCompany] = useState("");
  const [vat, setVat] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventName, setEventName] = useState("");

  const TIME_OPTIONS = useMemo(() => {
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of ["00", "15", "30", "45"]) out.push(`${String(h).padStart(2, "0")}:${m}`);
    }
    return out;
  }, []);

  const CITY_OPTIONS = [
    "台北市",
    "新北市",
    "桃園市",
    "台中市",
    "台南市",
    "高雄市",
    "基隆市",
    "新竹市",
    "新竹縣",
    "苗栗縣",
    "彰化縣",
    "南投縣",
    "雲林縣",
    "嘉義市",
    "嘉義縣",
    "屏東縣",
    "宜蘭縣",
    "花蓮縣",
    "台東縣",
    "澎湖縣",
    "金門縣",
    "連江縣",
  ];

  const [inDate, setInDate] = useState("");
  const [inTime, setInTime] = useState("");
  const [outDate, setOutDate] = useState("");
  const [outTime, setOutTime] = useState("");

  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [need, setNeed] = useState("");
  const [memo, setMemo] = useState("");

  const [sending, setSending] = useState(false);

  const submit = async () => {
    setShowErrors(true);

    const nextErrors: typeof errors = {};
    const missing: string[] = [];

    if (!lines.length) {
      nextErrors.lines = "請先加入至少 1 個道具。";
      missing.push("1. 未加入道具清單（請先到道具詳情頁按『加入詢價單』）");
    }
    if (!company.trim()) {
      nextErrors.company = "必填";
      missing.push("2. 公司名稱（必填）");
    }
    if (!name.trim()) {
      nextErrors.name = "必填";
      missing.push("3. 聯絡人（必填）");
    }
    if (!phone.trim() && !email.trim()) {
      nextErrors.contact = "請填寫電話或 EMAIL（擇一）";
      missing.push("4. 連絡電話 / EMAIL（擇一必填）");
    }

    const riskMissing: string[] = [];
    if (!riskIndoorOutdoor) riskMissing.push("室內/戶外（雨備）");
    if (!riskStage) riskMissing.push("舞台高度／有無坡道");
    if (!riskStaff) riskMissing.push("是否需要現場人員執行");

    setErrors(nextErrors);

    if (missing.length) {
      toast.error("尚未完成以下步驟：\n" + missing.join("\n"), { duration: 6500 });

      const scrollTo = (el: HTMLElement | null | undefined) => {
        if (!el) return;
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      };

      if (nextErrors.lines) {
        scrollTo(listRef.current);
        return;
      }
      if (nextErrors.company) {
        scrollTo(companyRef.current);
        companyRef.current?.focus();
        return;
      }
      if (nextErrors.name) {
        scrollTo(nameRef.current);
        nameRef.current?.focus();
        return;
      }
      if (nextErrors.contact) {
        scrollTo(phoneRef.current || emailRef.current);
        (phoneRef.current || emailRef.current)?.focus();
        return;
      }
      return;
    }

    if (riskMissing.length) {
      toast.message("建議補充（可先送出）：\n" + riskMissing.map((x) => `• ${x}`).join("\n"), { duration: 6000 });
    }
    if (email.trim() && !isValidEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "EMAIL 格式似乎不正確" }));
      toast.error("EMAIL 格式似乎不正確");
      emailRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      emailRef.current?.focus();
      return;
    }
    if (phone.trim() && !isValidPhone(phone)) {
      setErrors((prev) => ({ ...prev, phone: "連絡電話格式似乎不正確" }));
      toast.error("連絡電話格式似乎不正確");
      phoneRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      phoneRef.current?.focus();
      return;
    }

    setErrors((prev) => ({ ...prev, email: undefined, phone: undefined }));

    if (!canSendEmail(data.emailjs)) {
      toast.error("尚未設定 EmailJS（缺 template id）。請到後台補上 Template ID 後再測試寄信。", { duration: 6000 });
      return;
    }

    setSending(true);
    try {
      const createdAtIso = new Date().toISOString();
      const inAt = [inDate, inTime].filter(Boolean).join(" ");
      const outAt = [outDate, outTime].filter(Boolean).join(" ");
      const location = [city, district, address].filter(Boolean).join(" ");

      const riskNotes = [
        `室內/戶外（雨備）：${riskIndoorOutdoor ? "已確認" : "未填（待確認）"}`,
        `舞台高度／有無坡道：${riskStage ? "已確認" : "未填（待確認）"}`,
        `現場人員執行：${riskStaff ? "已確認" : "未填（待確認）"}`,
      ].join("\n");

      const base = {
        source: "quote" as const,
        company,
        vat,
        name,
        phone,
        email,
        eventName,
        inAt,
        outAt,
        location,
        need,
        memo: [memo?.trim(), memo?.trim() ? "" : "", "---", "報價關鍵確認：", riskNotes].filter(Boolean).join("\n"),
        lines: asLines(lines as any),
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        createdAtIso,
      };

      await sendEmailJs(data.emailjs, {
        ...base,
        from_name: name || company || "網站詢價",
        reply_to: email || "",
        subject: `【怪獸道具工廠】詢價單｜${company || "未填公司"}｜${name || "未填聯絡人"}`,
        message: buildQuoteEmailMessage(base),
      });

      toast.success("已送出，已寄送到信箱。\n預計 1 個工作天內回覆。", { duration: 5000 });

      // Save submission for analytics + quote leads
      // 1) Try Supabase (preferred)
      // 2) Fallback to localStorage (keeps current admin UI usable during migration)
      try {
        const id = `q_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
        const itemsCount = (lines as any[]).reduce((acc: number, cur: any) => acc + (cur.qty ?? 0), 0);

        // Supabase: public insert allowed via RLS
        await insertQuoteLead({
          id,
          created_at_iso: createdAtIso,
          updated_at_iso: createdAtIso,
          status: "new",
          company: String(company || "").trim(),
          name: String(name || "").trim(),
          phone: String(phone || "").trim(),
          email: String(email || "").trim(),
          city: city || "",
          district: district || "",
          items_count: itemsCount,
          thank_you_sent_at_iso: null,
        });

        await supabasePublic.from("analytics_quote_submissions").insert({
          id,
          created_at_iso: createdAtIso,
          city: city || "",
          district: district || "",
          items_count: itemsCount,
        });

        // Local snapshot
        const prevSubs = (data.analytics as any)?.quoteSubmissions ?? [];
        const prevLeads = (data as any).quoteLeads ?? [];

        setData({
          ...(data as any),
          quoteLeads: [
            {
              id,
              createdAtIso,
              updatedAtIso: createdAtIso,
              status: "new",
              company: String(company || "").trim(),
              name: String(name || "").trim(),
              phone: String(phone || "").trim(),
              email: String(email || "").trim(),
              city: city || "",
              district: district || "",
              itemsCount,
            },
            ...prevLeads,
          ],
          analytics: {
            ...(data.analytics as any),
            quoteSubmissions: [
              {
                id,
                createdAtIso,
                city: city || "",
                district: district || "",
                itemsCount,
              },
              ...prevSubs,
            ],
          },
        } as any);
      } catch {
        // ignore
      }

      setCompany("");
      setVat("");
      setName("");
      setPhone("");
      setEmail("");
      setEventName("");
      setInDate("");
      setInTime("");
      setOutDate("");
      setOutTime("");
      setCity("");
      setDistrict("");
      setAddress("");
      setNeed("");
      setMemo("");
      setRiskIndoorOutdoor(false);
      setRiskStage(false);
      setRiskStaff(false);
      setShowErrors(false);
      setErrors({});

      clear();
    } catch (e: any) {
      toast.error("送出失敗：EmailJS 寄信錯誤。請確認 Service/Template/收件信箱設定。", { duration: 6000 });
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteLayout>
      <PageBanner
        image={banner}
        kicker="QUOTE CART"
        title="詢價單"
        subtitle="先挑道具，再把活動資訊一次講清楚；這不是結帳，是報價與建議的流程。"
      />
      <section className="mx-auto max-w-6xl px-4 py-10">

        <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_.9fr]">
          <div>
            <Card className="border-border/70 bg-card/40 p-5" ref={listRef as any}>
              <div className="flex items-center justify-between">
                <div className="font-display text-2xl">道具清單</div>
                <div className="text-sm text-muted-foreground">共 {count} 件</div>
              </div>

              <Separator className="my-4" />

              {lines.length === 0 ? (
                <div className="rounded-xl border border-border/70 bg-background/20 p-6 text-sm text-muted-foreground">
                  目前沒有道具。請先到道具詳情頁按「加入詢價單」。

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                      <Link href="/props">去道具軍火庫挑道具</Link>
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        const el = document.getElementById("quote-recommend");
                        el?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      看熱門推薦 <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>

                  {showErrors && errors.lines ? (
                    <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-200">
                      {errors.lines}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-4">
                  {lines.map((l) => (
                    <div key={l.propId} className="rounded-xl border border-border/70 bg-background/15 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-display text-lg">{l.name}</div>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="icon"
                              onClick={() => updateQty(l.propId, Math.max(1, l.qty - 1))}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              value={String(l.qty)}
                              onChange={(e) => {
                                const v = Number(e.target.value || 1);
                                updateQty(l.propId, Number.isFinite(v) ? Math.max(1, v) : 1);
                              }}
                              className="w-16 text-center"
                            />
                            <Button variant="secondary" size="icon" onClick={() => updateQty(l.propId, l.qty + 1)}>
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => removeLine(l.propId)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <Textarea
                          value={l.note ?? ""}
                          onChange={(e) => updateNote(l.propId, e.target.value)}
                          placeholder="這個道具的備註（例：希望外觀配合主視覺、需要多人同時啟動…）"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <div id="quote-recommend" className="mt-6">
              <div className="flex items-center justify-between">
                <div className="font-display text-xl">熱門道具推薦</div>
                <Button asChild variant="ghost" className="text-accent">
                  <Link href="/props">看全部</Link>
                </Button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {topProps.map((p) => (
                  <Card key={p.id} className="border-border/70 bg-card/30 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-display text-base">{p.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">{p.summary}</div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                        onClick={() => {
                          addLine({ propId: p.id, slug: p.slug, name: p.name, qty: 1 });
                          toast.success("已加入詢價單");
                        }}
                      >
                        加入
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Card className="sticky top-24 border-border/70 bg-card/50 p-5">
              <div className="flex items-center gap-2 font-display text-2xl">
                <FileText className="h-6 w-6 text-accent" /> 活動資訊
              </div>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Input
                      ref={companyRef}
                      value={company}
                      onChange={(e) => {
                        setCompany(e.target.value);
                        if (showErrors) setErrors((prev) => ({ ...prev, company: e.target.value.trim() ? undefined : "必填" }));
                      }}
                      placeholder="1. 公司名稱*"
                      className={showErrors && errors.company ? "border-red-500/50 focus-visible:ring-red-500" : ""}
                    />
                    {showErrors && errors.company ? (
                      <div className="mt-1 text-xs text-red-200">{errors.company}</div>
                    ) : null}
                  </div>
                  <Input value={vat} onChange={(e) => setVat(e.target.value)} placeholder="2. 統一編號" />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Input
                      ref={nameRef}
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (showErrors) setErrors((prev) => ({ ...prev, name: e.target.value.trim() ? undefined : "必填" }));
                      }}
                      placeholder="3. 聯絡人*"
                      className={showErrors && errors.name ? "border-red-500/50 focus-visible:ring-red-500" : ""}
                    />
                    {showErrors && errors.name ? (
                      <div className="mt-1 text-xs text-red-200">{errors.name}</div>
                    ) : null}
                  </div>
                  <div>
                    <Input
                      ref={phoneRef}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (showErrors) setErrors((prev) => ({ ...prev, contact: (e.target.value.trim() || email.trim()) ? undefined : "請填寫電話或 EMAIL（擇一）", phone: undefined }));
                      }}
                      placeholder="4. 連絡電話（擇一）"
                      className={(showErrors && (errors.contact || errors.phone)) ? "border-red-500/50 focus-visible:ring-red-500" : ""}
                    />
                    {showErrors && errors.phone ? (
                      <div className="mt-1 text-xs text-red-200">{errors.phone}</div>
                    ) : null}
                  </div>
                </div>

                <div>
                  <Input
                    ref={emailRef}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (showErrors) setErrors((prev) => ({ ...prev, contact: (phone.trim() || e.target.value.trim()) ? undefined : "請填寫電話或 EMAIL（擇一）", email: undefined }));
                    }}
                    placeholder="5. EMAIL（擇一）"
                    className={(showErrors && (errors.contact || errors.email)) ? "border-red-500/50 focus-visible:ring-red-500" : ""}
                  />
                  {showErrors && errors.contact ? (
                    <div className="mt-1 text-xs text-red-200">{errors.contact}</div>
                  ) : null}
                  {showErrors && errors.email ? (
                    <div className="mt-1 text-xs text-red-200">{errors.email}</div>
                  ) : null}
                </div>
                <Input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="6. 活動名稱" />

                <div className="rounded-xl border border-border/70 bg-background/20 p-4">
                  <div className="font-display text-foreground">7–8. 進撤場時間</div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="grid gap-2">
                      <div className="text-xs text-muted-foreground">進場</div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <Input value={inDate} onChange={(e) => setInDate(e.target.value)} type="date" />
                        <Select value={inTime} onValueChange={setInTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="時間" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="text-xs text-muted-foreground">撤場</div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <Input value={outDate} onChange={(e) => setOutDate(e.target.value)} type="date" />
                        <Select value={outTime} onValueChange={setOutTime}>
                          <SelectTrigger>
                            <SelectValue placeholder="時間" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">不確定也可先留空；我們會再協助確認。</div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/20 p-4">
                  <div className="font-display text-foreground">9. 活動地點</div>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    <Select value={city} onValueChange={setCity}>
                      <SelectTrigger>
                        <SelectValue placeholder="縣市" />
                      </SelectTrigger>
                      <SelectContent>
                        {CITY_OPTIONS.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="區/鄉鎮（選填）" />
                    <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="地址/場館（選填）" />
                  </div>
                </div>
                <Textarea
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  placeholder="10. 需求：尺寸、大小、數量 等資訊；或與專員討論，我們提供建議"
                />
                <Textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="※備註（選填）你想先讓我們知道的重點：室內/戶外、舞台高度、是否有坡道、是否含人員執行…"
                />

                <div className="rounded-xl border border-border/70 bg-background/20 p-4 text-xs text-muted-foreground">
                  <div className="font-display text-foreground">報價關鍵確認（建議勾選）</div>
                  <div className="mt-3 grid gap-2">
                    <label className="flex items-start gap-3">
                      <Checkbox checked={riskIndoorOutdoor} onCheckedChange={(v) => setRiskIndoorOutdoor(Boolean(v))} />
                      <span>
                        室內/戶外（雨備）
                        {!riskIndoorOutdoor && showErrors ? <span className="ml-2 text-red-200">建議補充</span> : null}
                      </span>
                    </label>
                    <label className="flex items-start gap-3">
                      <Checkbox checked={riskStage} onCheckedChange={(v) => setRiskStage(Boolean(v))} />
                      <span>
                        舞台高度／有無坡道
                        {!riskStage && showErrors ? <span className="ml-2 text-red-200">建議補充</span> : null}
                      </span>
                    </label>
                    <label className="flex items-start gap-3">
                      <Checkbox checked={riskStaff} onCheckedChange={(v) => setRiskStaff(Boolean(v))} />
                      <span>
                        是否需要現場人員執行
                        {!riskStaff && showErrors ? <span className="ml-2 text-red-200">建議補充</span> : null}
                      </span>
                    </label>
                  </div>
                  <div className="mt-3 text-xs text-muted-foreground">
                    不勾選也能送出；若不確定，先送出我們會協助釐清。
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/20 p-4 text-xs text-muted-foreground">
                  <div className="font-display text-foreground">費用提醒</div>
                  <ul className="mt-2 grid gap-1">
                    <li>1. 費用會與進撤場時間有關（9 點前、18 點後會有加班費）</li>
                    <li>2. 使用人數可能會與道具大小有關，費用不同</li>
                    <li>3. 如需撤除會加收廢棄物清潔費</li>
                    <li>4. 廠商位於新北中和，運送距離/道具大小會影響運輸費</li>
                  </ul>
                </div>
              </div>

              {showErrors && (errors.lines || errors.company || errors.name || errors.contact || errors.email || errors.phone) ? (
                <button
                  type="button"
                  className="mt-4 w-full rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-left text-xs text-red-200"
                  onClick={() => {
                    const scrollTo = (el: HTMLElement | null | undefined) => {
                      if (!el) return;
                      el.scrollIntoView({ behavior: "smooth", block: "center" });
                    };

                    if (errors.lines) return scrollTo(listRef.current);
                    if (errors.company) return scrollTo(companyRef.current);
                    if (errors.name) return scrollTo(nameRef.current);
                    if (errors.contact) return scrollTo(phoneRef.current || emailRef.current);
                    if (errors.phone) return scrollTo(phoneRef.current);
                    if (errors.email) return scrollTo(emailRef.current);
                  }}
                >
                  <div className="flex items-center gap-2 font-display text-sm text-red-100">
                    <AlertTriangle className="h-4 w-4" /> 尚缺資料（點此跳到第一個缺漏）
                  </div>
                  <div className="mt-2 grid gap-1">
                    {errors.lines ? <div>• 道具清單：{errors.lines}</div> : null}
                    {errors.company ? <div>• 公司名稱：{errors.company}</div> : null}
                    {errors.name ? <div>• 聯絡人：{errors.name}</div> : null}
                    {errors.contact ? <div>• 聯絡方式：{errors.contact}</div> : null}
                    {errors.phone ? <div>• 電話：{errors.phone}</div> : null}
                    {errors.email ? <div>• EMAIL：{errors.email}</div> : null}
                  </div>
                </button>
              ) : null}

              <Button
                onClick={submit}
                size="lg"
                className="mt-5 w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={sending}
              >
                {sending ? "送出中…" : "送出詢價"}
              </Button>

              <div className="mt-3 rounded-xl border border-border/70 bg-background/20 p-4 text-xs text-muted-foreground">
                提醒：正式上線會串接 Email/LINE 通知、後台名單管理、以及匯出 Excel。
              </div>

              {lines.length ? (
                <Button asChild variant="secondary" className="mt-3 w-full">
                  <Link href="/props">再加一樣道具</Link>
                </Button>
              ) : null}
            </Card>
          </div>
        </div>
      
      <NextStepCTA mode="both" />
      </section>
    </SiteLayout>
  );
}
