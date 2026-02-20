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
import { useMemo, useState } from "react";

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
      for (const m of ["00", "15", "30", "45"]) {
        out.push(String(h).padStart(2, "0") + ":" + m);
      }
    }
    return out;
  }, []);

  const CITY_OPTIONS = [
    "台北市", "新北市", "桃園市", "台中市", "台南市", "高雄市",
    "基隆市", "新竹市", "新竹縣", "苗栗縣", "彰化縣", "南投縣", "雲林縣",
    "嘉義市", "嘉義縣", "屏東縣", "宜蘭縣", "花蓮縣", "台東縣",
    "澎湖縣", "金門縣", "連江縣"
  ];

  const submit = async () => {
    if (!company.trim() || !name.trim() || (!phone.trim() && !email.trim())) {
      toast.error("請至少填寫：公司名稱、聯絡人，以及連絡電話或 EMAIL");
      return;
    }

    if (email.trim() && !isValidEmail(email)) {
      toast.error("請輸入正確的 EMAIL 格式");
      return;
    }

    if (phone.trim() && !isValidPhone(phone)) {
      toast.error("請輸入正確的電話格式");
      return;
    }

    if (!canSendEmail(data.emailJs)) {
      toast.error("發送次數已達上限，請稍後再試或直接聯繫我們。");
      return;
    }

    setSending(true);
    try {
      const inAtStr = inDate ? (inDate + " " + (inTime || "00:00")) : "";
      const outAtStr = outDate ? (outDate + " " + (outTime || "00:00")) : "";
      const locationStr = city ? (city + (district || "") + (address || "")) : address;

      const payloadBase = {
        source: "contact" as const,
        company,
        vat,
        name,
        phone,
        email,
        eventName,
        inAt: inAtStr,
        outAt: outAtStr,
        location: locationStr,
        need,
        memo: note,
        createdAtIso: new Date().toISOString(),
        pageUrl: window.location.href,
        reply_to: email,
        from_name: name,
      };

      const message = buildQuoteEmailMessage(payloadBase);

      await sendEmailJs(data.emailJs, {
        ...payloadBase,
        message,
        subject: "[需求表單] " + company + " - " + name,
      });

      toast.success("發送成功！我們將盡快與您聯繫。");
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
    } catch (error) {
      console.error(error);
      toast.error("發送失敗，請稍後再試或直接聯繫我們。");
    } finally {
      setSending(false);
    }
  };

  return (
    <SiteLayout>
      <PageBanner 
        image={banner} 
        kicker="立即諮詢"
        title="聯絡怪獸" 
        subtitle="請填寫以下資訊，我們將在 24 小時內回覆您的需求。"
      />

      <div className="bg-slate-50 py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 聯絡資訊 */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-monster-primary" />
                  聯絡資訊
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-monster-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-monster-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">聯絡電話</p>
                      <p className="font-medium hover:text-monster-primary transition-colors">
                        <a href="tel:0910123456">0910-123-456</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-monster-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-monster-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">電子郵件</p>
                      <p className="font-medium hover:text-monster-primary transition-colors">
                        <a href="mailto:service@monsterevents.com">service@monsterevents.com</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-monster-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-monster-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">辦公地點</p>
                      <p className="font-medium">台北市信義區忠孝東路五段 1 號</p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600 mb-4">加入 LINE 官方帳號</p>
                  <div className="bg-white p-2 inline-block rounded-xl shadow-sm border mb-4">
                    <img src={lineQr} alt="LINE QR Code" className="w-32 h-32" />
                  </div>
                  <p className="text-xs text-slate-400">掃描 QR Code 立即諮詢</p>
                </div>
              </Card>

              <Card className="p-6 bg-monster-primary text-white">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldAlert className="w-5 h-5" />
                  <h4 className="font-bold">急件處理</h4>
                </div>
                <p className="text-sm opacity-90 leading-relaxed mb-4">
                  若您的活動在 48 小時內即將舉行，建議直接撥打電話或透過 LINE 聯繫，以便我們為您提供即時協助。
                </p>
                <Button variant="secondary" className="w-full" asChild>
                  <a href="tel:0910123456">撥打電話</a>
                </Button>
              </Card>
            </div>

            {/* 需求表單 */}
            <div className="lg:col-span-2">
              <Card className="p-6 lg:p-8">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">填寫需求表單</h3>
                  <p className="text-slate-500">
                    請填寫以下資訊，我們將在 24 小時內回覆您的需求。
                  </p>
                </div>

                <div className="space-y-8">
                  <Accordion type="multiple" defaultValue={["basic", "event", "needs"]}>
                    <AccordionItem value="basic" className="border-monster-primary/20">
                      <AccordionTrigger className="text-lg font-bold hover:no-underline py-4">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-monster-primary text-white text-xs flex items-center justify-center">1</span>
                          基本資訊
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">公司名稱/單位 <span className="text-red-500">*</span></label>
                            <Input placeholder="請輸入公司或單位名稱" value={company} onChange={(e) => setCompany(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">統一編號 (選填)</label>
                            <Input placeholder="請輸入 8 位數字" value={vat} onChange={(e) => setVat(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">聯絡人姓名 <span className="text-red-500">*</span></label>
                            <Input placeholder="請輸入姓名" value={name} onChange={(e) => setName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">聯絡電話 <span className="text-red-500">*</span></label>
                            <Input placeholder="請輸入電話" value={phone} onChange={(e) => setPhone(e.target.value)} />
                          </div>
                          <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-slate-700">電子郵件 <span className="text-red-500">*</span></label>
                            <Input placeholder="example@mail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="event" className="border-monster-primary/20">
                      <AccordionTrigger className="text-lg font-bold hover:no-underline py-4">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-monster-primary text-white text-xs flex items-center justify-center">2</span>
                          活動細節
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-6 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">活動名稱 (選填)</label>
                          <Input placeholder="例如：2024 年度尾牙" value={eventName} onChange={(e) => setEventName(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">進場時間</label>
                            <div className="flex gap-2">
                              <Input type="date" className="flex-1" value={inDate} onChange={(e) => setInDate(e.target.value)} />
                              <Select value={inTime} onValueChange={setInTime}>
                                <SelectTrigger className="w-[110px]">
                                  <SelectValue placeholder="時間" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">撤場時間</label>
                            <div className="flex gap-2">
                              <Input type="date" className="flex-1" value={outDate} onChange={(e) => setOutDate(e.target.value)} />
                              <Select value={outTime} onValueChange={setOutTime}>
                                <SelectTrigger className="w-[110px]">
                                  <SelectValue placeholder="時間" />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_OPTIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">活動地點</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <Select value={city} onValueChange={setCity}>
                              <SelectTrigger>
                                <SelectValue placeholder="選擇縣市" />
                              </SelectTrigger>
                              <SelectContent>
                                {CITY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <Input placeholder="區域（如：信義區）" value={district} onChange={(e) => setDistrict(e.target.value)} />
                            <Input placeholder="詳細地址" className="md:col-span-1" value={address} onChange={(e) => setAddress(e.target.value)} />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="needs" className="border-monster-primary/20 border-b-0">
                      <AccordionTrigger className="text-lg font-bold hover:no-underline py-4">
                        <span className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-monster-primary text-white text-xs flex items-center justify-center">3</span>
                          需求說明
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-2 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">主要需求項目</label>
                          <Input placeholder="例如：舞台音響、燈光租賃、活動統籌" value={need} onChange={(e) => setNeed(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">備註或其他說明</label>
                          <Textarea 
                            placeholder="請在此提供更多細節，幫助我們更精確地為您報價..." 
                            className="min-h-[120px]"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>

                <div className="mt-8">
                  <Button 
                    className="w-full h-12 text-lg font-bold" 
                    onClick={submit}
                    disabled={sending}
                  >
                    {sending ? "發送中..." : "確認送出需求"}
                  </Button>
                  <p className="text-center text-xs text-slate-400 mt-4">
                    點擊送出即代表您同意我們的服務條款與隱私權政策
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <NextStepCTA />
    </SiteLayout>
  );
}
