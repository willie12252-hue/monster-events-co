import { Link, useLocation } from "wouter";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import useQuote from "@/contexts/QuoteContext";
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

      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-background/70 backdrop-blur",
          tone === "hazard" && "border-accent/40"
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            <img src={logo} alt="怪獸道具工廠" className="h-14 w-auto" />
            <div className="leading-tight">
              <div className="text-xl font-black tracking-tighter italic">
                MONSTERS PROPS INC.
              </div>
              <div className="text-sm font-bold opacity-80 tracking-widest">
                怪獸道具工廠
              </div>
            </div>
          </Link>

          <nav className="ml-auto hidden items-center gap-8 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  loc === item.href ? "text-primary" : "text-foreground/70"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <div className="hidden items-center gap-3 lg:flex">
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <a href="tel:02-8228-1181">
                  <Phone className="h-4 w-4" />
                  <span>02-8228-1181</span>
                </a>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href="https://line.me" target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  <span>LINE</span>
                </a>
              </Button>
            </div>

            <Button size="sm" className="gap-2 relative" asChild>
              <Link href="/quote">
                <FileText className="h-4 w-4" />
                <span>詢價單</span>
                {count > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full">
                    {count}
                  </Badge>
                )}
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="text-left flex items-center gap-3">
                    <img src={logo} alt="Logo" className="h-8 w-auto" />
                    <span>怪獸道具工廠</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-8 flex flex-col gap-4">
                  {nav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "text-lg font-semibold transition-colors hover:text-primary",
                        loc === item.href ? "text-primary" : "text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <hr className="my-4 border-muted" />
                  <Button className="w-full gap-2" variant="outline" asChild>
                    <a href="https://line.me" target="_blank" rel="noreferrer">
                      <MessageCircle className="h-5 w-5" />
                      加 LINE 諮詢
                    </a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="mt-auto border-t bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={logo} alt="Logo" className="h-10 w-auto" />
                <div className="font-bold text-xl">怪獸道具工廠</div>
              </div>
              <p className="text-muted-foreground mb-6 max-w-md">
                我們提供全台灣最專業的啟動儀式道具租借與客製化製作服務。從新品發佈會、動土典禮到大型節慶，怪獸道具都是您最強大的執行後盾。
              </p>
              <div className="flex gap-4">
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4">
                  租借條款與細則
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-foreground/80 uppercase tracking-wider text-sm">快速連結</h3>
              <ul className="space-y-4 text-sm">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-muted-foreground hover:text-primary">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-bold mb-6 text-foreground/80 uppercase tracking-wider text-sm">聯繫方式</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>新北市中和區國光街112巷23弄24號1樓</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>02-8228-1181</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>willie12252@yahoo.com.tw</span>
                </li>
                <li className="pt-4">
                  <div className="bg-background p-3 rounded-xl border border-primary/10 inline-block">
                    <img src={lineQr} alt="LINE QR" className="h-24 w-24" />
                    <div className="text-[10px] text-center mt-2 font-bold text-primary">掃描加 LINE</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
            <div>© 2026 MONSTERS PROPS INC. 版權所有</div>
            <div className="flex gap-6">
              <span>怪獸活動公司出品</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
