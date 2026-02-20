import SiteLayout from "@/components/SiteLayout";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-contact-controlroom.webp";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useAppData } from "@/contexts/DataContext";
import { buildQuoteEmailMessage, canSendEmail, sendEmailJs } from "@/lib/emailjs";
import NextStepCTA from "@/components/NextStepCTA";
import { isValidEmail, isValidPhone } from "@/lib/validate";
import { MessageCircle, Phone, Mail, ShieldAlert, MapPin, Printer } from "lucide-react";
import lineQr from "@/assets/line-qr.webp";
import { useState, useMemo } from "react";

export default function Contact() {
  const { data } = useAppData();
  const [company, setCompany] = useState("");
  const [vat, setVat] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [eventName, setEventName] = useState("");
  
  const [inDate, setInDate] = useState("");
  const [inTime, setInTime] = useState("");
  const [outDate, setOutDate] = useState("");
  const [outTime, setOutTime] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");

  const [need, setNeed] = useState("");
  const [note, setNote] = useState("");

  const [sending, setSending] = useState(false);

  const TIME_OPTIONS = useMemo(() => {
    const out: string[] = [];
    for (let h = 0; h < 24; h++) {
      for (const m of ["00", "15", "30", "45"]) out.push(`${String(h).padStart(2, "0")}:${m}`);
    }
    return out;
  }, []);

  const CITY_OPTIONS = [
    "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
    "基隆市", "新竹市", "新竹縣", "苗栗縣", "彰化縣", "南投縣",
    "雲林縣", "嘉義市", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣",
    "台東縣", "澎湖縣", "金門縣", "連江縣",
  ];

  const submit = async () => {
    if (!company.trim() || !name.trim() || (!phone.trim() && !email.trim())) {
      toast.error("請至少填寫：公司名稱、聯絡人，以及連絡電話或 EMAIL");
      return;
    }
    if (email.trim() && !isValidEmail(email)) {
      toast.error("EMAIL 格式似乎不正確");
      return;
    }
    if (phone.trim() && !isValidPhone(phone)) {
      toast.error("連絡電話格式似乎不正確");
      return;
    }

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

      const base = {
        source: "contact" as const,
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
        memo: note,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
        createdAtIso,
      };

      await sendEmailJs(data.emailjs, {
        ...base,
        from_name: name || company || "網站表單",
        reply_to: email || "",
        subject: `【怪獸道具工廠】需求表單｜${company || "未填公司"}｜${name || "未填聯絡人"}`,
        message: buildQuoteEmailMessage({ ...base, lines: [] }),
      });

      toast.success("已送出，已寄送到信箱。
預計 1 個工作天內回覆。", { duration: 5000 });

      // Reset fields
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
      setNote("");
    } catch {
      toast.error("送出失敗：EmailJS 寄信錯誤。請確認 Service/Template/收件信箱設定。", { duration: 6000 });
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteLayout>
      <PageBanner
        image={banner}
        kicker="CONTACT"
        title="聯絡怪獸"
        subtitle="把活動資訊丟過來，我們用『道具＋執行』角度幫你把風險先踩掉。"
      />
      <section className="mx-auto max-w-6xl px-4 py-10">

        <div className="mt-8 grid gap-6 md:grid-cols-[.9fr_1.1fr]">
          <div className="grid gap-4">
            <Card className="border-border/70 bg-card/40 p-5">
              <div className="font-display text-2xl">快速聯繫</div>

              <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="grid gap-2">
                    <div className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4 text-accent" /> TEL：02-8228-1181
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Printer className="h-4 w-4 text-accent" /> FAX：02-8228-2686
                    </div>
                    <div className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-accent" /> EMAIL：willie1225@yahoo.com.tw
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-white/95 p-2">
                    <img src={lineQr} alt="LINE QR Code" className="h-28 w-28" />
                    <div className="mt-2 text-center text-xs text-muted-foreground">
                      掃碼加入 LINE 或
                      <a className="underline underline-offset-4" href="https://line.me/ti/p/idasr_y8A9" target="_blank" rel="noreferrer">點此加入</a>
                    </div>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" /> 新北市中和區國光街112巷23弄24號1樓
                  </div>
                  <div className="mt-2 overflow-hidden rounded-xl border border-border/70 bg-background/20">
                    <iframe
                      title="怪獸道具工廠 Google Map"
                      className="h-56 w-full"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      src="https://www.google.com/maps?q=%E6%96%B0%E5%8C%97%E5%B8%82%E4%B8%AD%E5%92%8C%E5%8D%80%E5%9C%8B%E5%85%89%E8%A1%97112%E5%B7%B723%E5%BC%8424%E8%99%9F1%E6%A8%93&output=embed"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="border-border/70 bg-card/40 p-5">
              <div className="flex items-center gap-2 font-display text-2xl">
                <ShieldAlert className="h-6 w-6 text-accent" /> 租借條款（重點）
              </div>
              <Separator className="my-4" />
              <ul className="grid gap-2 text-sm text-muted-foreground">
                <li>• 運費/遠距費用依地點另計；大型道具需事前確認搬運動線與貨梯。</li>
                <li>• 戶外活動需雨備；遇雨且無安全條件時，可能無法執行。</li>
                <li>• 道具損毀/髒污/遺失將依押金與實際損害處理。</li>
                <li>• 正式版網站會提供完整條款頁與取消/改期/退款規則。</li>
              </ul>
            </Card>
          </div>

          <Card className="border-border/70 bg-card/50 p-5">
            <div className="font-display text-2xl">需求表單</div>
            <p className="mt-2 text-sm text-muted-foreground">
              請留下以下資訊，專員會依活動條件回覆建議與報價。
            </p>

            <div className="mt-5 grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="1. 公司名稱*" />
                <Input value={vat} onChange={(e) => setVat(e.target.value)} placeholder="2. 統一編號" />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="3. 聯絡人*" />
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="4. 連絡電話（擇一）" />
              </div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="5. EMAIL（擇一）" />
              <Input value={eventName} onChange={(e) => setEventName(e.target.value)} placeholder="6. 活動名稱" />
              
              <div className="rounded-xl border border-border/70 bg-background/20 p-4">
                <div className="font-display text-foreground text-sm">7–8. 進撤場時間</div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="grid gap-2">
                    <div className="text-xs text-muted-foreground">進場</div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <Input 
                        value={inDate} 
                        onChange={(e) => setInDate(e.target.value)} 
                        type="date" 
                        className="[&::-webkit-calendar-picker-indicator]:invert"
                      />
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
                      <Input 
                        value={outDate} 
                        onChange={(e) => setOutDate(e.target.value)} 
                        type="date" 
                        className="[&::-webkit-calendar-picker-indicator]:invert"
                      />
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
              </div>

              <div className="rounded-xl border border-border/70 bg-background/20 p-4">
                <div className="font-display text-foreground text-sm">9. 活動地點</div>
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
                  <Input value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="區/鄉鎮" />
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="場館/詳細地址" />
                </div>
              </div>

              <Textarea
                value={need}
                onChange={(e) => setNeed(e.target.value)}
                placeholder="10. 需求：尺寸、大小、數量 等資訊；或與專員討論，我們提供建議"
              />
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="※備註（其他補充）" />

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

            <Button onClick={submit} size="lg" className="mt-5 w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={sending}>
              {sending ? "送出中…" : "送出"}
            </Button>
          </Card>

          <Card className="border-border/70 bg-card/40 p-5">
            <div className="font-display text-2xl">常見問題（FAQ）</div>
            <p className="mt-2 text-sm text-muted-foreground">先把客戶最常問的回答好，報價溝通會快很多。</p>

            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="q1" className="border-border/70">
                <AccordionTrigger className="text-left">費用會怎麼計算？</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  主要會依「進撤場時間、道具尺寸/數量、是否含現場人員、運送距離」評估。9 點前與 18 點後通常會有加班費。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q2" className="border-border/70">
                <AccordionTrigger className="text-left">運輸費怎麼算？</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  廠商位於新北中和，運送距離以及道具大小/車次會影響費用；若有進場限制或需要上樓搬運，也請先告知。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q3" className="border-border/70">
                <AccordionTrigger className="text-left">需要多少使用人數？</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  使用人數可能會與道具大小、操作複雜度有關（例如大型/電動/連動道具），人員配置不同費用也會不同。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q4" className="border-border/70">
                <AccordionTrigger className="text-left">撤除與清潔費用怎麼算？</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  如需撤除會加收廢棄物清潔費；若現場有回收/分類規範或指定清運流程，也請先提供。
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="q5" className="border-border/70">
                <AccordionTrigger className="text-left">我不確定需求尺寸/數量怎麼辦？</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  沒問題。先填寫活動名稱、進撤場時間、地點與大概想要的效果（例如注水顯字/推桿連動/揭牌），我們會與你討論並提供建議。
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>
      <NextStepCTA mode="both" />
      </section>
    </SiteLayout>
  );
}
