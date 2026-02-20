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
            <div className="leading-tight">
