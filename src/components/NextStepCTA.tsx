import { Button } from "@/components/ui/button";
import { useQuote } from "@/contexts/QuoteContext";
import { Link } from "wouter";
import { FileText, MessageCircle } from "lucide-react";

export default function NextStepCTA({
  mode = "quote",
}: {
  mode?: "quote" | "contact" | "both";
}) {
  const { count } = useQuote();

  return (
    <div className="sticky bottom-0 z-40 mt-10 border-t border-border/70 bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-display text-foreground">下一步：</span>
          {count > 0 ? (
            <span>你已選 {count} 件道具，現在可以直接送出詢價。</span>
          ) : (
            <span>先加入詢價單或直接聯絡專員，我們會提供建議與報價。</span>
          )}
          <span className="ml-2">（填完不代表下訂，僅供報價與建議）</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(mode === "quote" || mode === "both") && (
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link href="/quote">
                <FileText className="mr-2 h-4 w-4" /> 加入詢價 / 送出
              </Link>
            </Button>
          )}
          {(mode === "contact" || mode === "both") && (
            <Button asChild variant="outline">
              <Link href="/contact">
                <MessageCircle className="mr-2 h-4 w-4" /> 直接聯絡專員
              </Link>
            </Button>
          )}

        </div>
      </div>
    </div>
  );
}
