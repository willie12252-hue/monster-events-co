import SiteLayout from "@/components/SiteLayout";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-contact-controlroom.webp";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <SiteLayout>
      <PageBanner
        image={banner}
        kicker="404"
        title="這扇門不存在"
        subtitle="回到首頁，重新選一扇任意門。"
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="rounded-xl border border-border/70 bg-card/40 p-8">
          <div className="font-display text-2xl">404｜訊號遺失</div>
          <p className="mt-2 text-sm text-muted-foreground">這扇門沒有接到能量。回到首頁重新選一扇。</p>
          <Button asChild className="mt-6">
            <Link href="/">回首頁</Link>
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
