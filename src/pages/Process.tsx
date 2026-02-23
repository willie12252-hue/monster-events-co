import SiteLayout from "@/components/SiteLayout";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-process-conveyor.webp";
import NextStepCTA from "@/components/NextStepCTA";
import { Card } from "@/components/ui/card";
import termsAttachment from "@/assets/terms-attachment.webp";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { reveal, stagger } from "@/lib/motion";
import { useState } from "react";
import {
  ArrowRight,
  CalendarClock,
  ClipboardList,
  FileText,
  Truck,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

const steps = [
  { icon: ClipboardList, title: "需求", desc: "填表或直接聯絡：活動名稱、地點、進撤場時間、想要的效果。" },
  { icon: FileText, title: "建議", desc: "專員依場地/預算/人數給道具組合建議，先把風險踩掉。" },
  { icon: CalendarClock, title: "報價", desc: "依進撤場時間、道具尺寸/數量、是否含人員、運送距離估價。" },
  { icon: CheckCircle2, title: "確認檔期", desc: "確認付款/押金與檔期後保留，並安排彩排與進場細節。" },
  { icon: Truck, title: "進撤場", desc: "按現場規範執行：運送、佈置、測試、啟動、撤除/清潔。" },
  { icon: ArrowRight, title: "結案", desc: "回收點交、押金結算；整理下次更好用的建議。" },
];

export default function Process() {
  const [open, setOpen] = useState(false);

  return (
    <SiteLayout>
      <PageBanner
        image={banner}
        kicker="合作流程"
        title="合作流程"
        subtitle="把流程拆清楚：你知道什麼時候提供什麼資料，我們也知道什麼時候該做什麼。"
      />
      <section className="mx-auto max-w-6xl px-4 py-10">

        <motion.div className="mt-8 grid gap-4 md:grid-cols-2" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.2 }}>
          {steps.map((s, i) => (
            <motion.div key={s.title} variants={reveal}>
              <Card className="border-border/70 bg-card/40 p-5">
                <div className="flex items-start gap-4">
                  <div className="relative mt-0.5 h-11 w-11 overflow-hidden rounded-xl border border-border/70 bg-background/20 p-2 text-accent">
                    <div className="absolute inset-0 opacity-35 hazard" />
                    <s.icon className="relative h-7 w-7" />
                  </div>
                  <div>
                    <div className="text-xs tracking-widest text-muted-foreground">步驟 {String(i + 1).padStart(2, "0")}</div>
                    <div className="mt-2 font-display text-2xl">{s.title}</div>
                    <div className="mt-2 text-sm text-muted-foreground">{s.desc}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        
        <motion.div
          id="terms"
          className="mt-12"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <Card className="border-border/70 bg-card/40 p-6">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="group relative w-full overflow-hidden rounded-xl border border-border/70 bg-background/20"
                  title="點擊放大"
                >
                  <img
                    src={termsAttachment}
                    alt="租借條款附件（點擊放大）"
                    className="h-auto w-full object-cover transition group-hover:opacity-95"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/25 group-hover:opacity-100">
                    <div className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs text-white">
                      點擊放大
                    </div>
                  </div>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-[96vw] sm:max-w-4xl">
                <DialogHeader>
                  <DialogTitle>租借條款附件</DialogTitle>
                </DialogHeader>
                <div className="max-h-[75vh] overflow-auto rounded-xl border border-border/70 bg-background/10">
                  <img src={termsAttachment} alt="租借條款附件放大圖" className="h-auto w-full" />
                </div>
                <div className="text-xs text-muted-foreground">提示：手機可雙指縮放。</div>
              </DialogContent>
            </Dialog>
            <div className="flex items-center gap-2 font-display text-2xl">
              <ShieldAlert className="h-6 w-6 text-accent" /> 租借條款
            </div>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              條款以實際作業流程為準；大型/客製項目會在報價單中另行補充。
            </p>
            <Separator className="my-4" />

            <div className="grid gap-6 text-sm text-muted-foreground">
              <div>
                <div className="font-display text-foreground">1) 進撤場時間與加班費</div>
                <div className="mt-2">費用會與進撤場時間有關；9 點前、18 點後通常會有加班費（依現場規範與人力配置調整）。</div>
              </div>
              <div>
                <div className="font-display text-foreground">2) 使用人員與道具大小</div>
                <div className="mt-2">使用人數可能會與道具大小/操作複雜度有關（例如大型、電動、連動道具），人員配置不同費用也會不同。</div>
              </div>
              <div>
                <div className="font-display text-foreground">3) 運送費</div>
                <div className="mt-2">廠商位於新北中和，運送距離、道具大小、車次會影響運輸費；如需上樓搬運或有進場限制請事前告知。</div>
              </div>
              <div>
                <div className="font-display text-foreground">4) 撤除與清潔費</div>
                <div className="mt-2">如需撤除會加收廢棄物清潔費；若現場有回收/分類規範或指定清運流程，也請先提供。</div>
              </div>
              <div>
                <div className="font-display text-foreground">5) 取消/改期</div>
                <div className="mt-2">正式版建議依活動日前天數設定取消/改期費用（例如 30 天、14 天等分段），並明確說明耗材/輸出不可退項目。</div>
              </div>
              <div>
                <div className="font-display text-foreground">6) 押金與損壞</div>
                <div className="mt-2">道具損毀、髒污、遺失、故障等情形，將依押金與實際損害處理；建議進撤場點交時錄影存證。</div>
              </div>
              <div>
                <div className="font-display text-foreground">7) 戶外雨備</div>
                <div className="mt-2">戶外活動主辦方需準備雨備（帳篷/頂蓬）。遇雨且無法安全執行時，可能改以替代方案或延期處理（依正式條款）。</div>
              </div>
            </div>
          </Card>
        </motion.div>

        <NextStepCTA mode="both" />
      </section>
    </SiteLayout>
  );
}
