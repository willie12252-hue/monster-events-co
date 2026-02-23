import SiteLayout from "@/components/SiteLayout";
import NextStepCTA from "@/components/NextStepCTA";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { reveal } from "@/lib/motion";
import { ShieldAlert } from "lucide-react";

export default function Terms() {
  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-10">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.35 }}>
          <div className="font-display text-sm tracking-widest text-muted-foreground">租借條款</div>
          <h1 className="mt-2 font-display text-4xl">租借條款（簡版示意）</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            這是原型站的「簡版條款」示意。正式上線建議由實際作業流程反推條款，並交由法務檢視。
          </p>
        </motion.div>

        <Card className="mt-8 border-border/70 bg-card/40 p-6">
          <div className="flex items-center gap-2 font-display text-2xl">
            <ShieldAlert className="h-6 w-6 text-accent" /> 重點整理
          </div>
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
              <div className="font-display text-foreground">5) 取消/改期（示意）</div>
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

        <NextStepCTA mode="both" />
      </section>
    </SiteLayout>
  );
}
