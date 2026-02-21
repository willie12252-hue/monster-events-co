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
    "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市", "基隆市", "新竹市", "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣", "嘉義市", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣", "澎湖縣", "金門縣", "連江縣"
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
      missing.push("1. 未加入道具清單");
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

    setErrors(nextErrors);
    if (missing.length) {
      toast.error("尚未完成步驟：
" + missing.join("
"));
      return;
    }

    setSending(true);
    try {
      const createdAtIso = new Date().toISOString();
      const inAt = [inDate, inTime].filter(Boolean).join(" ");
      const outAt = [outDate, outTime].filter(Boolean).join(" ");
      const location = [city, district, address].filter(Boolean).join(" ");

      const riskNotes = [
        `室內/戶外（雨備）：${riskIndoorOutdoor ? "已確認" : "未填"}`,
        `舞台高度／有無坡道：${riskStage ? "已確認" : "未填"}`,
        `現場人員執行：${riskStaff ? "已確認" : "未填"}`,
      ].join("
");

      const base = {
        source: "quote" as const,
        company, vat, name, phone, email, eventName, inAt, outAt, location, need,
        memo: [memo?.trim(), "---", "報價關鍵確認：", riskNotes].join("
"),
        lines: asLines(lines as any),
        pageUrl: window.location.href,
        createdAtIso,
      };

      await sendEmailJs(data.emailjs, {
        ...base,
        from_name: name || company || "網站詢價",
        reply_to: email || "",
        subject: `【怪獸道具工廠】詢價單｜${company}｜${name}`,
        message: buildQuoteEmailMessage(base),
      });

      toast.success("已送出");
      clear();
    } catch (e) {
      toast.error("送出失敗");
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteLayout>
      <PageBanner image={banner} kicker="QUOTE CART" title="詢價單" subtitle="報價與建議流程。" />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_.9fr]">
          <Card className="border-border/70 bg-card/40 p-5" ref={listRef as any}>
            <div className="flex items-center justify-between">
              <div className="font-display text-2xl">道具清單</div>
              <div className="text-sm text-muted-foreground">共 {count} 件</div>
            </div>
            <Separator className="my-4" />
            {lines.length === 0 ? (
              <div className="p-6 text-muted-foreground text-sm">請挑選道具。</div>
            ) : (
              <div className="grid gap-4">
                {lines.map((l) => (
                  <div key={l.propId} className="p-4 border rounded-xl">
                    <div className="text-lg font-display">{l.name} x {l.qty}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="p-5 bg-card/50">
            <div className="text-2xl font-display">活動資訊</div>
            <Button onClick={submit} disabled={sending} className="mt-5 w-full bg-accent text-white">{sending ? "送出中" : "送出詢價"}</Button>
          </Card>
        </div>
      </section>
    </SiteLayout>
  );
}
