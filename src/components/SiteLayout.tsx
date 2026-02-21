import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useQuote } from "@/contexts/QuoteContext";
import ScrollEnergyBar from "@/components/ScrollEnergyBar";
import ScrollToTopFab from "@/components/ScrollToTopFab";
import logo from "@/assets/logo_new.png";
import lineQr from "@/assets/line-qr.webp";
import {
  Phone,
  MessageCircle,
  FileText,
  Boxes,
  Sparkles,
  ShieldAlert,
  MapPin,
  Printer,
  Mail,
  Menu,
} from "lucide-react";

const nav = [
  { href: "/", label: "首頁" },
  { href: "/props", label: "道具軍火庫" },
  { href: "/cases", label: "近期案例" },
  { href: "/process", label: "合作流程" },
  { href: "/knowledge", label: "怪獸情報局" },
  { href: "/contact", label: "聯絡怪獸" },
];

export default function SiteLayout({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "hazard";
}) {
  const [loc] = useLocation();
  const { count } = useQuote();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollEnergyBar />
      <ScrollToTopFab />
      <header className={cn("sticky top-0 z-50 border-b bg-background/70 backdrop-blur", tone === "hazard" && "border-accent/40")}> 
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="怪獸道具工廠"
              className="h-14 w-auto"
            />
          </Link>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            {nav.map((i) => (
              <Link
                key={i.href}
                href={i.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-secondary hover:text-foreground",
                  loc === i.href && "bg-secondary text-foreground",
                )}
              >
                {i.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">

            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <a href="https://line.me/ti/p/idasr_y8A9" target="_blank" rel="noreferrer" aria-label="加入 LINE">
                <MessageCircle className="mr-2 h-4 w-4" /> LINE
              </a>
            </Button>

            <Button asChild className="relative">
              <Link href="/quote">
                <FileText className="mr-2 h-4 w-4" /> 詢價單
                {count > 0 && (
                  <Badge className="ml-2 bg-accent text-accent-foreground">{count}</Badge>
                )}
              </Link>
            </Button>

            {/* Mobile menu */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="icon" aria-label="開啟選單">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[86vw] max-w-sm">
                  <SheetHeader>
                    <SheetTitle className="font-display">選單</SheetTitle>
                  </SheetHeader>

                  <div className="mt-6 grid gap-2">
                    {nav.map((i) => (
                      <Link
                        key={i.href}
                        href={i.href}
                        className={cn(
                          "rounded-lg border border-border/70 bg-card/40 px-4 py-3 text-sm text-muted-foreground transition hover:border-accent/50 hover:text-foreground",
                          loc === i.href && "border-accent/50 text-foreground",
                        )}
                      >
                        {i.label}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-2">
                    <Button asChild variant="outline" className="justify-start">
                      <a href="https://line.me/ti/p/idasr_y8A9" target="_blank" rel="noreferrer">
                        <MessageCircle className="mr-2 h-4 w-4" /> 加入 LINE
                      </a>
                    </Button>
                  </div>


                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="relative mt-24 border-t border-border/70">
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="noise absolute inset-0" />
        </div>
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
          <div>
            <div className="font-display text-xl">怪獸道具工廠</div>
            <p className="mt-2 text-sm text-muted-foreground">
              我們不收集尖叫聲；我們只收集現場的驚嘆聲與掌聲。
              <br />
              啟動道具租借｜客製化製作｜現場執行支援
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="font-display text-base text-foreground">快速入口</div>
            <div className="mt-2 grid gap-2">
              <Link href="/props" className="inline-flex items-center gap-2 hover:text-foreground">
                <Boxes className="h-4 w-4" /> 道具軍火庫
              </Link>
              <Link href="/knowledge" className="inline-flex items-center gap-2 hover:text-foreground">
                <Sparkles className="h-4 w-4" /> 怪獸情報局
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 hover:text-foreground">
                <ShieldAlert className="h-4 w-4" /> 聯絡與條款
              </Link>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <div className="font-display text-base text-foreground">聯絡資訊</div>
            <div className="mt-2 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="inline-flex items-center gap-2"><Phone className="h-4 w-4 text-accent" />TEL：02-8228-1181</div>
                <div className="inline-flex items-center gap-2"><Printer className="h-4 w-4 text-accent" />FAX：02-8228-2686</div>
                <div className="inline-flex items-center gap-2"><Mail className="h-4 w-4 text-accent" />EMAIL：willie1225@yahoo.com.tw</div>
                <div className="inline-flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-accent" /><span>新北市中和區國光街112巷23弄24號1樓</span></div>
              </div>

              <div className="flex items-start justify-between gap-4">
                <div className="text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-2 font-display text-foreground"><MessageCircle className="h-4 w-4 text-accent" />LINE</div>
                  <div className="mt-1">掃碼加入（或到聯絡頁點連結）</div>
                </div>
                <div className="rounded-lg border border-border/70 bg-white/95 p-2">
                  <img src={lineQr} alt="LINE QR Code" className="h-24 w-24" />
                </div>
              </div>

            </div>
          </div>
        </div>
        <div className="border-t border-border/70 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Monster Events Co.
        </div>
      </footer>
    </div>
  );
}
