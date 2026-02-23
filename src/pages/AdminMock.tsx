import React, { useEffect, useMemo, useState } from "react";

import SiteLayout from "@/components/SiteLayout";
import PageBanner from "@/components/PageBanner";
import banner from "@/assets/banner-process-conveyor.webp";

import { useAppData } from "@/contexts/DataContext";
import { seedAllToSupabase } from "@/lib/supabase-store";
import MarkdownEditorPanel from "@/components/MarkdownEditorPanel";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { normalizeFootprintToObject } from "@/lib/prop-specs";

import {
  Box,
  BookOpen,
  CalendarDays,
  FileText,
  LogOut,
  Plus,
  Save,
  Search,
  Trash2,
  Wrench,
  Pencil,
  GripVertical,
  Sparkles,
  PlaySquare,
  Mail,
  Download,
  ClipboardList,
} from "lucide-react";

import { toYouTubeEmbedUrl } from "@/lib/youtube";
import emailjs from "@emailjs/browser";
import { rangeDays, toMonthKey } from "@/lib/analytics";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const LOGIN_LOG_KEY = "meco.admin.loginLogs.v1";

type LoginLog = { user: string; ts: string };

function loadLoginLogs(): LoginLog[] {
  try {
    const raw = localStorage.getItem(LOGIN_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLoginLogs(items: LoginLog[]) {
  localStorage.setItem(LOGIN_LOG_KEY, JSON.stringify(items.slice(0, 200)));
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}


async function fileToDataUrl(file: File): Promise<string> {
  // Compress image before saving into localStorage to avoid quota issues.
  // Strategy: downscale to max 1600px and encode as webp (fallback to original if fails).
  try {
    const bitmap = await createImageBitmap(file);

    const max = 1600;
    const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas ctx");
    ctx.drawImage(bitmap, 0, 0, w, h);

    const webp = canvas.toDataURL("image/webp", 0.82);
    if (webp && webp.startsWith("data:image/webp") && webp.length > 1000) return webp;
  } catch {
    // ignore and fallback
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read file failed"));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-\u4e00-\u9fff]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 64);
}

type AdminSection = "props" | "cases" | "knowledge" | "newsletter" | "marquee" | "homeVideo" | "analytics" | "quoteLeads" | "email";

export default function AdminMock() {
  const [session, setSession] = useState<Session | null>(null);
  const authed = !!session;

  useEffect(() => {
    let alive = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!alive) return;
        setSession(data.session ?? null);
      })
      .catch(() => {
        if (!alive) return;
        setSession(null);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <SiteLayout>
      <PageBanner
        image={banner}
        kicker="管理後台"
        title="管理員後台"
        subtitle="管理：道具軍火庫／近期案例／怪獸情報局（文章）。"
      />

      {!authed ? <AdminLogin /> : <AdminShell session={session as Session} />}
    </SiteLayout>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const login = async () => {
    const e = email.trim();
    if (!e || !pwd) {
      toast.error("請輸入 Email 與密碼");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: e, password: pwd });
      if (error) throw error;

      const now = new Date().toISOString();
      const logs = loadLoginLogs();
      saveLoginLogs([{ user: e, ts: now }, ...logs]);

      toast.success("登入成功");
    } catch (err: any) {
      toast.error(err?.message || "登入失敗");
    } finally {
      setLoading(false);
    }
  };

  const sendReset = async () => {
    const e = email.trim();
    if (!e) {
      toast.error("請先輸入 Email");
      return;
    }

    setResetLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(e);
      if (error) throw error;
      toast.success("已寄出重設密碼 Email（請到信箱收信）");
    } catch (err: any) {
      toast.error(err?.message || "寄送失敗");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <section className="mx-auto grid max-w-6xl px-4 py-10">
      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <div className="hidden md:block">
          <div className="rounded-2xl border border-border/70 bg-card/30 p-8">
            <div className="font-display text-2xl">怪獸道具工廠</div>
            <div className="mt-2 text-sm text-muted-foreground">
              管理後台登入：
              <br />
              使用 Supabase Auth 的 Email / 密碼
            </div>
            <div className="mt-6 text-xs text-muted-foreground">提示：可在 Supabase 後台建立多個使用者帳號（多人管理）。</div>
          </div>
        </div>

        <Card className="border-border/70 bg-card/40 p-6 md:p-8">
          <div className="font-display text-2xl">登入</div>
          <div className="mt-1 text-sm text-muted-foreground">請輸入管理員帳號密碼</div>
          <div className="mt-6 grid gap-3">
            <div className="grid gap-1">
              <div className="text-xs text-muted-foreground">Email</div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="grid gap-1">
              <div className="text-xs text-muted-foreground">密碼</div>
              <Input value={pwd} onChange={(e) => setPwd(e.target.value)} type="password" />
            </div>
            <Button onClick={login} disabled={loading} className="mt-2 bg-accent text-accent-foreground hover:bg-accent/90">
              {loading ? "登入中…" : "登入"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={sendReset}
              disabled={loading || resetLoading}
              className="border-border/70"
            >
              {resetLoading ? "寄送中…" : "寄送重設密碼 Email"}
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}

function AdminShell({ session }: { session: Session }) {
  const { data, setData, reset } = useAppData();
  const [section, setSection] = useState<AdminSection>("props");


  const seedFromLocalStorage = async () => {
    if (!confirm("這會把目前瀏覽器 localStorage 的資料寫入 Supabase（會覆蓋同 ID 的資料）。確定要繼續？")) return;

    try {
      const raw = localStorage.getItem("meco.appData.v1");
      if (!raw) {
        toast.error("找不到本機資料（meco.appData.v1）");
        return;
      }
      const parsed = JSON.parse(raw);
      await seedAllToSupabase(parsed);
      toast.success("匯入完成：已把本機資料寫入 Supabase");
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.warn("seedFromLocalStorage failed", e);
      toast.error(e?.message || "匯入失敗");
    }
  };

  const exportJson = () => {
    navigator.clipboard
      .writeText(JSON.stringify(data, null, 2))
      .then(() => toast.success("已複製資料 JSON"))
      .catch(() => toast.error("複製失敗"));
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      location.reload();
    }
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="sticky top-24 h-fit rounded-2xl border border-border/70 bg-card/30 p-3">
          <div className="px-3 py-2">
            <div className="font-display">後台選單</div>
            <div className="mt-1 text-xs text-muted-foreground">只保留你指定的三個模組</div>
          </div>
          <Separator className="my-2" />

          <nav className="grid gap-1">
            <div className="px-2 pb-2">
              <div className="rounded-xl border border-border/70 bg-card/40 p-3">
                <div className="text-xs text-muted-foreground">已登入</div>
                <div className="mt-1 text-sm font-medium">{session.user.email}</div>
                <div className="mt-3 grid gap-2">
                  <Button
  variant="secondary"
  onClick={seedFromLocalStorage}
  className="h-auto w-full justify-start whitespace-normal break-words py-2 text-left leading-snug"
>
                    <Download className="mr-2 h-4 w-4" />
                    一次性：匯入本機資料到 Supabase
                  </Button>
                  <Button
  variant="ghost"
  onClick={exportJson}
  className="h-auto w-full justify-start whitespace-normal break-words py-2 text-left leading-snug"
>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    匯出資料 JSON（複製）
                  </Button>
                  <Button
  variant="ghost"
  onClick={logout}
  className="h-auto w-full justify-start whitespace-normal break-words py-2 text-left leading-snug text-destructive hover:text-destructive"
>
                    <LogOut className="mr-2 h-4 w-4" />
                    登出
                  </Button>
                </div>
              </div>
            </div>
            <SideBtn active={section === "props"} onClick={() => setSection("props")} icon={<Box className="h-4 w-4" />}>
              道具軍火庫
            </SideBtn>
            <SideBtn active={section === "cases"} onClick={() => setSection("cases")} icon={<CalendarDays className="h-4 w-4" />}>
              近期案例
            </SideBtn>
            <SideBtn
              active={section === "knowledge"}
              onClick={() => setSection("knowledge")}
              icon={<BookOpen className="h-4 w-4" />}
            >
              怪獸情報局
            </SideBtn>

            <SideBtn
              active={section === "newsletter"}
              onClick={() => setSection("newsletter")}
              icon={<Mail className="h-4 w-4" />}
            >
              電子報
            </SideBtn>

            <SideBtn
              active={section === "marquee"}
              onClick={() => setSection("marquee")}
              icon={<Sparkles className="h-4 w-4" />}
            >
              首頁跑馬
            </SideBtn>

            <SideBtn
              active={section === "homeVideo"}
              onClick={() => setSection("homeVideo")}
              icon={<PlaySquare className="h-4 w-4" />}
            >
              首頁影片
            </SideBtn>

            <SideBtn active={section === "analytics"} onClick={() => setSection("analytics")} icon={<Download className="h-4 w-4" />}>
              參訪統計
            </SideBtn>

            <SideBtn active={section === "quoteLeads"} onClick={() => setSection("quoteLeads")} icon={<ClipboardList className="h-4 w-4" />}>
              詢價名單
            </SideBtn>

            <SideBtn active={section === "email"} onClick={() => setSection("email")} icon={<Mail className="h-4 w-4" />}>
              EmailJS
            </SideBtn>
          </nav>

          <Separator className="my-3" />
          <div className="grid gap-2 px-2">
            <Button variant="secondary" onClick={exportJson} className="justify-start">
              <Save className="mr-2 h-4 w-4" /> 匯出 JSON（複製）
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (!confirm("確定還原預設資料？會清空此瀏覽器的所有編輯結果。")) return;
                reset();
                toast.success("已還原預設資料");
              }}
              className="justify-start"
            >
              <Wrench className="mr-2 h-4 w-4" /> 還原預設
            </Button>
            <Button variant="outline" onClick={logout} className="justify-start">
              <LogOut className="mr-2 h-4 w-4" /> 登出
            </Button>
          </div>
        </aside>

        <main>
          {section === "props" ? (
            <PropsManager />
          ) : section === "cases" ? (
            <CasesManager />
          ) : section === "knowledge" ? (
            <KnowledgeManager />
          ) : section === "newsletter" ? (
            <NewsletterManager />
          ) : section === "marquee" ? (
            <MarqueeManager />
          ) : section === "homeVideo" ? (
            <HomeVideoManager />
          ) : section === "analytics" ? (
            <AnalyticsManager />
          ) : section === "quoteLeads" ? (
            <QuoteLeadsManager />
          ) : (
            <EmailJsManager />
          )}
        </main>
      </div>
    </section>
  );
}

function SideBtn({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition " +
        (active
          ? "border-accent/60 bg-background/20 text-foreground"
          : "border-border/60 bg-background/10 text-muted-foreground hover:border-accent/40 hover:text-foreground")
      }
    >
      <span className={active ? "text-accent" : "text-muted-foreground"}>{icon}</span>
      <span className="font-display">{children}</span>
    </button>
  );
}

function PropsManager() {
  const { data, setData } = useAppData();
  const [q, setQ] = useState("");

  const ordered = useMemo(() => {
    const base = data.props.map((p: any, idx: number) => ({ ...p, order: typeof p.order === "number" ? p.order : idx }));
    return base.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }, [data.props]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ordered.filter((p: any) => {
      if (!term) return true;
      const hay = `${p.name} ${p.summary} ${(p.tags ?? []).join(" ")}`.toLowerCase();
      return hay.includes(term);
    });
  }, [ordered, q]);

  return (
    <Card className="border-border/70 bg-card/40 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-display text-2xl">道具軍火庫</div>
          <div className="mt-1 text-sm text-muted-foreground">新增/編輯/刪除道具，並用圖文編輯器撰寫內容。</div>
        </div>
        <Button
          onClick={() => {
            const id = uid("p");
            const nextItem: any = {
              id,
              slug: id,
              name: "新道具",
              category: "large",
              tags: ["新上架"],
              heroType: "image",
              heroImage: "pattern",
              summary: "請填寫一句話摘要",
              highlights: ["亮點 1", "亮點 2", "亮點 3"],
              quick: { power: "optional", crew: "2–6", venue: "both", footprint: { lengthCm: "", widthCm: "", heightCm: "" } },
              specs: {
                size: "依案客製",
                power: "視配置",
              },
              status: "draft",
              order: 0,
              seo: { title: "", description: "", image: "" },
              content: "## 道具說明\n\n- 適用場景\n- 操作流程\n- 注意事項\n",
              views: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              publishedAt: "",
            };
            setData({ ...data, props: [nextItem, ...data.props] } as any);
            toast.success("已新增道具（請編輯內容）");
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> 新增道具
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" placeholder="搜尋道具…" />
        </div>
      </div>

      {q.trim() ? (
        <div className="mt-4 rounded-xl border border-border/70 bg-background/10 p-3 text-xs text-muted-foreground">
          目前為「搜尋模式」：拖拉排序請先清空搜尋。
        </div>
      ) : null}

      <DndPropsTable
        disabled={Boolean(q.trim())}
        rows={ordered}
        renderRow={(p) => (
          <>
            <TableCell className="font-display">{p.name}</TableCell>
            <TableCell className="hidden md:table-cell">{data.categoryMeta[p.category]?.label ?? p.category}</TableCell>
            <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{p.slug}</TableCell>
            <TableCell className="text-right">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" variant="secondary">
                    <Pencil className="mr-2 h-4 w-4" /> 編輯
                  </Button>
                </DialogTrigger>
                <PropEditDialog
                  item={p}
                  categoryKeys={Object.keys(data.categoryMeta)}
                  categoryMeta={data.categoryMeta as any}
                  onSave={(nextObj) => {
                    if (!nextObj.slug) nextObj.slug = slugify(nextObj.name) || p.id;
                    setData({ ...data, props: data.props.map((x) => (x.id === p.id ? nextObj : x)) } as any);
                    toast.success("已儲存道具");
                  }}
                />
              </Dialog>

              <Button
                size="sm"
                variant="outline"
                className="ml-2"
                onClick={() => {
                  if (!confirm(`確定刪除「${p.name}」？`)) return;
                  setData({ ...data, props: data.props.filter((x) => x.id !== p.id) } as any);
                  toast.success("已刪除");
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> 刪除
              </Button>
            </TableCell>
          </>
        )}
        onReorder={(nextOrdered) => {
          const next = nextOrdered.map((x: any, idx: number) => ({ ...x, order: idx }));
          setData({ ...data, props: next } as any);
          toast.success("已更新排序（前台會依此順序顯示）");
        }}
      />
    </Card>
  );
}

function PropEditDialog({
  item,
  categoryKeys,
  categoryMeta,
  onSave,
}: {
  item: any;
  categoryKeys: string[];
  categoryMeta: Record<string, { label: string }>;
  onSave: (next: any) => void;
}) {
  const initialRef = React.useRef<any>(null);

  const [draft, setDraft] = React.useState<any>(() => {
    const fp = item?.quick?.footprint;
    if (typeof fp === "string") {
      return {
        ...item,
        _legacyFootprintText: fp,
        quick: { ...(item.quick ?? {}), footprint: normalizeFootprintToObject(fp) },
      };
    }
    return { ...item };
  });
  React.useEffect(() => {
    const fp = item?.quick?.footprint;
    if (typeof fp === "string") {
      const next = {
        ...item,
        _legacyFootprintText: fp,
        quick: { ...(item.quick ?? {}), footprint: normalizeFootprintToObject(fp) },
      };
      setDraft(next);
      initialRef.current = JSON.parse(JSON.stringify(next));
      return;
    }
    const next = { ...item };
    setDraft(next);
    initialRef.current = JSON.parse(JSON.stringify(next));
  }, [item]);
  const set = (patch: any) => setDraft((d: any) => ({ ...d, ...patch }));

  return (
    <DialogContent
      className="h-[92vh] w-[98vw] max-w-none sm:max-w-none overflow-y-auto"
      onInteractOutside={(e) => {
        try {
          const init = JSON.stringify(initialRef.current ?? {});
          const now = JSON.stringify(draft ?? {});
          if (init !== now) {
            if (!confirm("尚未儲存變更，確定要關閉？")) e.preventDefault();
          }
        } catch {
          // ignore
        }
      }}
      onEscapeKeyDown={(e) => {
        try {
          const init = JSON.stringify(initialRef.current ?? {});
          const now = JSON.stringify(draft ?? {});
          if (init !== now) {
            if (!confirm("尚未儲存變更，確定要關閉？")) e.preventDefault();
          }
        } catch {
          // ignore
        }
      }}
    >
      <DialogHeader>
        <DialogTitle>編輯道具</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">道具名稱</div>
            <Input value={draft.name ?? ""} onChange={(e) => set({ name: e.target.value })} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">狀態（前台是否顯示）</div>
            <Select value={draft.status ?? "public"} onValueChange={(v) => set({ status: v })}>
              <SelectTrigger>
                <SelectValue placeholder="選擇狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">草稿（不顯示）</SelectItem>
                <SelectItem value="public">公開（顯示）</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <div className="text-xs text-muted-foreground">Slug（網址）</div>
            <Input value={draft.slug ?? ""} onChange={(e) => set({ slug: e.target.value })} placeholder="留空會自動產生" />
          </div>
        </div>


        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <div className="text-xs text-muted-foreground">瀏覽數</div>
            <Input
              type="number"
              value={typeof draft.views === "number" ? String(draft.views) : String(draft.views ?? 0)}
              onChange={(e) => set({ views: Number(e.target.value) })}
              min={0}
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">排序</div>
            <Input
              type="number"
              value={typeof draft.order === "number" ? String(draft.order) : String(draft.order ?? 0)}
              onChange={(e) => set({ order: Number(e.target.value) })}
              min={0}
            />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">發佈時間（ISO，可留空）</div>
            <Input value={draft.publishedAt ?? ""} onChange={(e) => set({ publishedAt: e.target.value })} placeholder="2026-01-30T11:03:19.000Z" />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">更新時間（自動）</div>
            <Input value={draft.updatedAt ?? ""} readOnly className="opacity-70" />
          </div>
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">建立時間（自動）</div>
            <Input value={draft.createdAt ?? ""} readOnly className="opacity-70" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">分類</div>
            <Select value={draft.category} onValueChange={(v) => set({ category: v })}>
              <SelectTrigger>
                <SelectValue placeholder="選擇分類" />
              </SelectTrigger>
              <SelectContent>
                {categoryKeys.map((k) => (
                  <SelectItem key={k} value={k}>
                    {categoryMeta[k]?.label ?? k}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">標籤（逗號分隔）</div>
            <Input value={(draft.tags ?? []).join(",")} onChange={(e) => set({ tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">摘要（快速看懂的那句）</div>
            <Input value={draft.summary ?? ""} onChange={(e) => set({ summary: e.target.value })} />
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">亮點（每行一條）</div>
          <Textarea
            value={(draft.highlights ?? []).join("\n")}
            onChange={(e) =>
              set({
                highlights: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder={"例：\n啟動瞬間『字浮出來』，鏡頭很吃香\n可依主視覺客製字樣與造型外觀\n適合 2–6 位貴賓同時啟動"}
          />
          <div className="mt-1 text-xs text-muted-foreground">提示：道具詳情頁的「快速看懂」會取前 3 條。</div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">規格（前台 icon + 右側欄共用）</div>
          <div className="mt-2 grid gap-3 rounded-xl border border-border/70 bg-background/10 p-4 md:grid-cols-4">
            <div>
              <div className="text-xs text-muted-foreground">用電（icon）</div>
              <Select value={draft.quick?.power ?? "optional"} onValueChange={(v) => set({ quick: { ...(draft.quick ?? {}), power: v } })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="need">需用電</SelectItem>
                  <SelectItem value="optional">可選用電</SelectItem>
                  <SelectItem value="none">不需用電</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <div className="text-xs text-muted-foreground">用電需求（文字說明）</div>
              <Input value={draft.specs?.power ?? ""} onChange={(e) => set({ specs: { ...(draft.specs ?? {}), power: e.target.value } })} placeholder="不一定（視燈光/特效配置）" />
            </div>

            <div>
              <div className="text-xs text-muted-foreground">人數（icon）</div>
              <Input value={draft.quick?.crew ?? ""} onChange={(e) => set({ quick: { ...(draft.quick ?? {}), crew: e.target.value } })} placeholder="2–6" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">場地（icon）</div>
              <Select value={draft.quick?.venue ?? "both"} onValueChange={(v) => set({ quick: { ...(draft.quick ?? {}), venue: v } })}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indoor">室內</SelectItem>
                  <SelectItem value="outdoor">戶外</SelectItem>
                  <SelectItem value="both">室內/戶外</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs text-muted-foreground">尺寸提示（icon）</div>
              <div className="mt-1 grid grid-cols-3 gap-2">
                <div className="relative">
                  <Input
                    inputMode="numeric"
                    value={typeof draft.quick?.footprint === "object" ? (draft.quick.footprint as any).lengthCm ?? "" : ""}
                    onChange={(e) =>
                      set({
                        quick: {
                          ...(draft.quick ?? {}),
                          footprint: {
                            ...((typeof draft.quick?.footprint === "object" ? (draft.quick.footprint as any) : {}) as any),
                            lengthCm: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="長"
                  />
                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</div>
                </div>
                <div className="relative">
                  <Input
                    inputMode="numeric"
                    value={typeof draft.quick?.footprint === "object" ? (draft.quick.footprint as any).widthCm ?? "" : ""}
                    onChange={(e) =>
                      set({
                        quick: {
                          ...(draft.quick ?? {}),
                          footprint: {
                            ...((typeof draft.quick?.footprint === "object" ? (draft.quick.footprint as any) : {}) as any),
                            widthCm: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="寬"
                  />
                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</div>
                </div>
                <div className="relative">
                  <Input
                    inputMode="numeric"
                    value={typeof draft.quick?.footprint === "object" ? (draft.quick.footprint as any).heightCm ?? "" : ""}
                    onChange={(e) =>
                      set({
                        quick: {
                          ...(draft.quick ?? {}),
                          footprint: {
                            ...((typeof draft.quick?.footprint === "object" ? (draft.quick.footprint as any) : {}) as any),
                            heightCm: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="高"
                  />
                  <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</div>
                </div>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">提示：此欄位會顯示在前台「尺」圖示旁。</div>
              {(draft as any)._legacyFootprintText ? (
                <div className="mt-1 text-xs text-muted-foreground">舊資料：{String((draft as any)._legacyFootprintText)}</div>
              ) : null}
            </div>

            <div className="md:col-span-4">
              <div className="text-xs text-muted-foreground">尺寸（右側欄）</div>
              <Input value={draft.specs?.size ?? ""} onChange={(e) => set({ specs: { ...(draft.specs ?? {}), size: e.target.value } })} placeholder="依案客製（常見寬 180–240cm）" />
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">縮圖（列表/封面圖）</div>
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border/70 bg-background/15 p-3 md:flex-row md:items-center">
            <div className="w-40 aspect-video overflow-hidden rounded-lg border border-border/70 bg-background/20">
              {draft.thumbnail ? (
                <img src={draft.thumbnail} alt="thumbnail" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">尚未上傳</div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary/80">
                上傳
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const input = e.currentTarget;
                    const f = input.files?.[0];
                    if (!f) return;
                    const url = await fileToDataUrl(f);
                    set({ thumbnail: url });
                    input.value = "";
                  }}
                />
              </label>
              {draft.thumbnail ? (
                <Button type="button" variant="outline" onClick={() => set({ thumbnail: "" })}>
                  清除
                </Button>
              ) : null}
              <div className="text-xs text-muted-foreground self-center">建議尺寸：1600×900（16:9），最少 1280×720</div>
            </div>
          </div>
        </div>


        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">YouTube 影片連結（貼上後自動轉成可嵌入）</div>
            <Input
              value={draft.heroVideo ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                set({ heroVideo: v, heroType: v.trim() ? "video" : draft.heroType });
              }}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <div className="mt-1 text-xs text-muted-foreground">提示：儲存時會自動轉成 embed 形式；清空即可移除。</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">主視覺型態</div>
            <Select
              value={draft.heroType}
              onValueChange={(v) => set({ heroType: v, heroVideo: v === "video" ? draft.heroVideo ?? "" : "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="選擇" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="image">圖片</SelectItem>
                <SelectItem value="video">影片</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">SEO（可選）</div>
          <div className="mt-2 grid gap-3 rounded-xl border border-border/70 bg-background/10 p-4">
            <div>
              <div className="text-xs text-muted-foreground">SEO 標題（瀏覽器標題/分享標題）</div>
              <Input value={draft.seo?.title ?? ""} onChange={(e) => set({ seo: { ...(draft.seo ?? {}), title: e.target.value } })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">SEO 描述（meta description）</div>
              <Textarea value={draft.seo?.description ?? ""} onChange={(e) => set({ seo: { ...(draft.seo ?? {}), description: e.target.value } })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">分享圖（可用縮圖；留空則用縮圖）</div>
              <Input value={draft.seo?.image ?? ""} onChange={(e) => set({ seo: { ...(draft.seo ?? {}), image: e.target.value } })} placeholder="https://... 或 dataURL" />
              <div className="mt-1 text-xs text-muted-foreground">建議尺寸：1200×630（OG 1.91:1），最少 600×315</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">內容（圖文編輯器）</div>
          <div className="mt-2">
            <MarkdownEditorPanel value={draft.content ?? ""} onChange={(v) => set({ content: v })} height={540} label="道具內容" />
          </div>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            onClick={() => {
              if (!draft.name?.trim()) return toast.error("請填寫道具名稱");
              const now = new Date().toISOString();
              const next = {
                ...draft,
                views: Number.isFinite(Number(draft.views)) ? Number(draft.views) : 0,
                order: Number.isFinite(Number(draft.order)) ? Number(draft.order) : 0,
                createdAt: draft.createdAt || now,
                updatedAt: now,
                publishedAt: draft.status === "public" ? (draft.publishedAt || now) : draft.publishedAt,
                quick: {
                  power: (draft.quick?.power ?? "optional"),
                  crew: String(draft.quick?.crew ?? "").trim() || "2–6",
                  venue: (draft.quick?.venue ?? "both"),
                  footprint: (() => {
                    const legacy = String((draft as any)._legacyFootprintText ?? "").trim();
                    if (typeof draft.quick?.footprint === "object") {
                      const o = {
                        lengthCm: String((draft.quick.footprint as any).lengthCm ?? "").trim(),
                        widthCm: String((draft.quick.footprint as any).widthCm ?? "").trim(),
                        heightCm: String((draft.quick.footprint as any).heightCm ?? "").trim(),
                      };
                      const empty = !o.lengthCm && !o.widthCm && !o.heightCm;
                      return empty && legacy ? legacy : o;
                    }
                    return String(draft.quick?.footprint ?? "").trim() || legacy;
                  })(),
                },
                specs: {
                  size: String(draft.specs?.size ?? "").trim() || "依案客製",
                  power: String(draft.specs?.power ?? "").trim() || "視配置",
                },
              };
              if (next.heroVideo?.trim()) next.heroVideo = toYouTubeEmbedUrl(next.heroVideo);
              onSave(next);
            }}
          >
            <Save className="mr-2 h-4 w-4" /> 儲存
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function CasesManager() {
  const { data, setData } = useAppData();
  const [q, setQ] = useState("");

  const ordered = useMemo(() => {
    const base = data.cases.map((c: any, idx: number) => ({ ...c, order: typeof c.order === "number" ? c.order : idx }));
    return base.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
  }, [data.cases]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ordered.filter((c: any) => {
      if (!term) return true;
      const hay = `${c.title} ${c.type} ${c.city} ${c.highlight}`.toLowerCase();
      return hay.includes(term);
    });
  }, [ordered, q]);

  return (
    <Card className="border-border/70 bg-card/40 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-display text-2xl">近期案例</div>
          <div className="mt-1 text-sm text-muted-foreground">管理案例卡片與案例圖文內容。</div>
        </div>
        <Button
          onClick={() => {
            const nextItem: any = {
              id: uid("c"),
              title: "新案例",
              type: "開幕",
              city: "台北",
              image: "hero",
              highlight: "請填寫一句亮點",
              status: "draft",
              order: 0,
              seo: { title: "", description: "", image: "" },
              content: "## 案例說明\n\n- 活動背景\n- 使用道具\n- 現場節奏\n",
              views: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              publishedAt: "",
            };
            setData({ ...data, cases: [nextItem, ...data.cases] } as any);
            toast.success("已新增案例（請編輯內容）");
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> 新增案例
        </Button>
      </div>

      {/* 分類管理 */}
      <div className="mt-4 rounded-2xl border border-border/70 bg-background/10 p-4">
        <div className="font-display text-foreground">文章分類管理</div>
        <div className="mt-1 text-xs text-muted-foreground">前台分類清單、後台下拉選單都會使用這裡的類別。</div>

        <div className="mt-3 flex flex-wrap gap-2">
          {(data.articleCategories ?? []).map((c) => (
            <span key={c} className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/20 px-3 py-1 text-xs text-muted-foreground">
              <span className="font-display text-foreground">{c}</span>
              <button
                type="button"
                className="rounded-full border border-border/70 bg-background/10 px-2 py-0.5 text-[11px] hover:bg-secondary/40"
                onClick={() => {
                  if (!confirm(`確定刪除分類「${c}」？（文章仍保留，但分類會變成『未分類』）`)) return;
                  const nextCats = (data.articleCategories ?? []).filter((x) => x !== c);
                  const nextArticles = data.articles.map((a: any) =>
                    String(a.category || "").trim() === c ? { ...a, category: nextCats[0] ?? "未分類" } : a,
                  );
                  setData({ ...data, articleCategories: nextCats, articles: nextArticles } as any);
                  toast.success("已刪除分類");
                }}
              >
                刪除
              </button>
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
          <Input
            value={(window as any).__mecoNewCat ?? ""}
            onChange={(e) => ((window as any).__mecoNewCat = e.target.value)}
            placeholder="新增分類，例如：專業新知"
            className="md:max-w-sm"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const raw = String((window as any).__mecoNewCat ?? "").trim();
              if (!raw) return toast.error("請輸入分類名稱");
              const next = Array.from(new Set([...(data.articleCategories ?? []), raw]));
              setData({ ...data, articleCategories: next } as any);
              (window as any).__mecoNewCat = "";
              toast.success("已新增分類");
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> 新增分類
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <div className="relative w-full md:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" placeholder="搜尋案例…" />
        </div>
      </div>

      {q.trim() ? (
        <div className="mt-4 rounded-xl border border-border/70 bg-background/10 p-3 text-xs text-muted-foreground">
          目前為「搜尋模式」：拖拉排序請先清空搜尋。
        </div>
      ) : null}

      <DndMasonry
        disabled={Boolean(q.trim())}
        items={q.trim() ? list : ordered}
        getId={(c: any) => c.id}
        onReorder={(nextOrdered: any[]) => {
          const next = nextOrdered.map((x: any, idx: number) => ({ ...x, order: idx }));
          setData({ ...data, cases: next } as any);
          toast.success("已更新排序（前台會依此順序顯示）");
        }}
        renderItem={(c: any) => (
          <Card className="overflow-hidden border-border/70 bg-background/10">
            <div className="aspect-[16/9] overflow-hidden border-b border-border/70 bg-background/20">
              {c.thumbnail ? (
                <img src={c.thumbnail} alt={c.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">尚未上傳縮圖</div>
              )}
            </div>
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="bg-background/30">
                  {c.type}
                </Badge>
                <Badge
                  variant={c.status === "draft" ? "outline" : "secondary"}
                  className={c.status === "draft" ? "border-accent/50 text-accent" : "bg-accent text-accent-foreground"}
                >
                  {c.status === "draft" ? "草稿" : "公開"}
                </Badge>
                <div className="text-xs text-muted-foreground">{c.city}</div>
              </div>
              <div className="mt-2 font-display text-lg leading-snug">{c.title}</div>
              <div className="mt-2 text-sm text-muted-foreground line-clamp-3">{c.highlight}</div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="secondary" className="flex-1">
                      <Pencil className="mr-2 h-4 w-4" /> 編輯
                    </Button>
                  </DialogTrigger>
                  <CaseEditDialog
                    item={c}
                    onSave={(nextObj) => {
                      setData({ ...data, cases: data.cases.map((x) => (x.id === c.id ? nextObj : x)) } as any);
                      toast.success("已儲存案例");
                    }}
                  />
                </Dialog>

                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (!confirm(`確定刪除「${c.title}」？`)) return;
                    setData({ ...data, cases: data.cases.filter((x) => x.id !== c.id) } as any);
                    toast.success("已刪除");
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> 刪除
                </Button>
              </div>
            </div>
          </Card>
        )}
      />
    </Card>
  );
}

function CaseEditDialog({ item, onSave }: { item: any; onSave: (next: any) => void }) {
  const [draft, setDraft] = React.useState<any>(() => ({ ...item }));
  React.useEffect(() => setDraft({ ...item }), [item]);
  const set = (patch: any) => setDraft((d: any) => ({ ...d, ...patch }));

  const types = ["動土", "發表會", "開幕", "論壇"] as const;
  const images = ["hero", "pattern", "mascot"] as const;

  return (
    <DialogContent className="h-[92vh] w-[98vw] max-w-none sm:max-w-none overflow-y-auto">
      <DialogHeader>
        <DialogTitle>編輯案例</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">標題</div>
            <Input value={draft.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">狀態（前台是否顯示）</div>
            <Select value={draft.status ?? "public"} onValueChange={(v) => set({ status: v })}>
              <SelectTrigger>
                <SelectValue placeholder="選擇狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">草稿（不顯示）</SelectItem>
                <SelectItem value="public">公開（顯示）</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <div className="text-xs text-muted-foreground">城市</div>
            <Input value={draft.city ?? ""} onChange={(e) => set({ city: e.target.value })} />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">類型</div>
            <Select value={draft.type} onValueChange={(v) => set({ type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="選擇類型" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">封面圖（代號）</div>
            <Select value={draft.image} onValueChange={(v) => set({ image: v })}>
              <SelectTrigger>
                <SelectValue placeholder="選擇圖片" />
              </SelectTrigger>
              <SelectContent>
                {images.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">亮點（一句話）</div>
            <Input value={draft.highlight ?? ""} onChange={(e) => set({ highlight: e.target.value })} />
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">縮圖（列表/封面圖）</div>
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border/70 bg-background/15 p-3 md:flex-row md:items-center">
            <div className="w-40 aspect-video overflow-hidden rounded-lg border border-border/70 bg-background/20">
              {draft.thumbnail ? (
                <img src={draft.thumbnail} alt="thumbnail" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">尚未上傳</div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary/80">
                上傳
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const input = e.currentTarget;
                    const f = input.files?.[0];
                    if (!f) return;
                    const url = await fileToDataUrl(f);
                    set({ thumbnail: url });
                    input.value = "";
                  }}
                />
              </label>
              {draft.thumbnail ? (
                <Button type="button" variant="outline" onClick={() => set({ thumbnail: "" })}>
                  清除
                </Button>
              ) : null}
              <div className="text-xs text-muted-foreground self-center">建議尺寸：1600×900（16:9），最少 1280×720</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">SEO（可選）</div>
          <div className="mt-2 grid gap-3 rounded-xl border border-border/70 bg-background/10 p-4">
            <div>
              <div className="text-xs text-muted-foreground">SEO 標題</div>
              <Input value={draft.seo?.title ?? ""} onChange={(e) => set({ seo: { ...(draft.seo ?? {}), title: e.target.value } })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">SEO 描述</div>
              <Textarea value={draft.seo?.description ?? ""} onChange={(e) => set({ seo: { ...(draft.seo ?? {}), description: e.target.value } })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">分享圖（留空則用縮圖）</div>
              <Input value={draft.seo?.image ?? ""} onChange={(e) => set({ seo: { ...(draft.seo ?? {}), image: e.target.value } })} placeholder="https://... 或 dataURL" />
              <div className="mt-1 text-xs text-muted-foreground">建議尺寸：1200×630（OG 1.91:1），最少 600×315</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">案例內容（圖文編輯器）</div>
          <div className="mt-2">
            <MarkdownEditorPanel value={draft.content ?? ""} onChange={(v) => set({ content: v })} height={540} label="案例內容" />
          </div>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            onClick={() => {
              if (!draft.title?.trim()) return toast.error("請填寫案例標題");
              const now = new Date().toISOString();
              const next = {
                ...draft,
                views: Number.isFinite(Number(draft.views)) ? Number(draft.views) : 0,
                order: Number.isFinite(Number(draft.order)) ? Number(draft.order) : 0,
                createdAt: draft.createdAt || now,
                updatedAt: now,
                publishedAt: draft.status === "public" ? (draft.publishedAt || now) : draft.publishedAt,
              };
              if (next.videoUrl?.trim()) next.videoUrl = toYouTubeEmbedUrl(next.videoUrl);
              onSave(next);
            }}
          >
            <Save className="mr-2 h-4 w-4" /> 儲存
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function KnowledgeManager() {
  const { data, setData } = useAppData();
  const [q, setQ] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const ordered = useMemo(() => {
    const base = data.articles.map((a: any, idx: number) => ({ ...a, order: typeof a.order === "number" ? a.order : idx }));
    return base.sort((x: any, y: any) => (x.order ?? 0) - (y.order ?? 0));
  }, [data.articles]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return ordered.filter((a: any) => {
      if (!term) return true;
      const hay = `${a.title} ${a.excerpt} ${a.category}`.toLowerCase();
      return hay.includes(term);
    });
  }, [ordered, q]);

  return (
    <Card className="border-border/70 bg-card/40 p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-display text-2xl">怪獸情報局</div>
          <div className="mt-1 text-sm text-muted-foreground">管理文章與 FAQ，使用滿版圖文編輯器。</div>
        </div>
        <Button
          onClick={() => {
            const id = uid("a");
            const nextItem: any = {
              id,
              slug: id,
              title: "新文章",
              category: (data.articleCategories?.[0] ?? "未分類"),
              tags: [],
              excerpt: "請在後台補上摘要",
              date: new Date().toISOString().slice(0, 10),
              content: "## 標題\n\n內容...",
              relatedPropSlugs: [],
              status: "draft",
              order: 0,
              seo: { title: "", description: "", image: "" },
              faq: [{ q: "常見問題？", a: "回答..." }],
              views: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              publishedAt: "",
            };
            setData({ ...data, articles: [nextItem, ...data.articles] } as any);
            toast.success("已新增文章（請編輯內容）");
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> 新增文章
        </Button>
      </div>

      <div className="mt-4">
        <div className="relative w-full md:w-96">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" placeholder="搜尋文章…" />
        </div>
      </div>

      {q.trim() ? (
        <div className="mt-4 rounded-xl border border-border/70 bg-background/10 p-3 text-xs text-muted-foreground">
          目前為「搜尋模式」：拖拉排序請先清空搜尋。
        </div>
      ) : null}

      <DndCardList
        disabled={Boolean(q.trim())}
        items={q.trim() ? list : ordered}
        getId={(a) => a.id}
        onReorder={(nextOrdered) => {
          const next = nextOrdered.map((x: any, idx: number) => ({ ...x, order: idx }));
          setData({ ...data, articles: next } as any);
          toast.success("已更新排序（前台會依此順序顯示）");
        }}
        renderItem={(a) => (
          <div className="grid gap-0 md:grid-cols-[220px_1fr]">
            <div className="aspect-[16/9] w-full overflow-hidden border-b border-border/70 bg-background/20 md:aspect-auto md:h-full md:border-b-0 md:border-r">
              {a.thumbnail ? (
                <img src={a.thumbnail} alt={a.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">尚未上傳縮圖</div>
              )}
            </div>

            <div className="p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="bg-background/30">
                      {a.category}
                    </Badge>
                    <Badge
                      variant={a.status === "draft" ? "outline" : "secondary"}
                      className={a.status === "draft" ? "border-accent/50 text-accent" : "bg-accent text-accent-foreground"}
                    >
                      {a.status === "draft" ? "草稿" : "公開"}
                    </Badge>
                    <div className="text-xs text-muted-foreground">{a.date}</div>
                  </div>
                  <div className="mt-2 font-display text-xl">{a.title}</div>
                  <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2 md:justify-end">
                  <Dialog
                    open={editId === a.id}
                    onOpenChange={(v) => {
                      setEditId(v ? a.id : null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setEditId(a.id);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> 編輯
                      </Button>
                    </DialogTrigger>
                    <ArticleEditDialog
                      item={a}
                      propSlugs={data.props.map((p) => p.slug)}
                      categories={data.articleCategories ?? []}
                      onSave={(nextObj) => {
                        if (!nextObj.slug) nextObj.slug = slugify(nextObj.title) || a.id;
                        setData({ ...data, articles: data.articles.map((x) => (x.id === a.id ? nextObj : x)) } as any);
                        toast.success("已儲存文章");
                      }}
                      onClose={() => setEditId(null)}
                    />
                  </Dialog>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!confirm(`確定刪除「${a.title}」？`)) return;
                      setData({ ...data, articles: data.articles.filter((x) => x.id !== a.id) } as any);
                      toast.success("已刪除");
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> 刪除
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      />
    </Card>
  );
}

function ArticleEditDialog({
  item,
  propSlugs,
  categories,
  onSave,
  onClose,
}: {
  item: any;
  propSlugs: string[];
  categories: string[];
  onSave: (next: any) => void;
  onClose?: () => void;
}) {
  const [draft, setDraft] = React.useState<any>(() => ({ ...item }));
  React.useEffect(() => setDraft({ ...item }), [item]);
  const set = (patch: any) => setDraft((d: any) => ({ ...d, ...patch }));

  const categoryList = (Array.isArray(categories) && categories.length
    ? categories
    : ["趨勢靈感", "實戰避雷", "怪獸實驗室", "能量案例"]) as string[];

  return (
    <DialogContent className="h-[92vh] w-[98vw] max-w-none sm:max-w-none overflow-y-auto">
      <DialogHeader>
        <DialogTitle>編輯文章</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="text-xs text-muted-foreground">標題</div>
            <Input value={draft.title ?? ""} onChange={(e) => set({ title: e.target.value })} />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">狀態（前台是否顯示）</div>
            <Select value={draft.status ?? "public"} onValueChange={(v) => set({ status: v })}>
              <SelectTrigger>
                <SelectValue placeholder="選擇狀態" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">草稿（不顯示）</SelectItem>
                <SelectItem value="public">公開（顯示）</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <div className="text-xs text-muted-foreground">Slug（網址）</div>
            <Input value={draft.slug ?? ""} onChange={(e) => set({ slug: e.target.value })} placeholder="留空會自動產生" />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <div className="text-xs text-muted-foreground">分類</div>
            <Select value={draft.category} onValueChange={(v) => set({ category: v })}>
              <SelectTrigger>
                <SelectValue placeholder="選擇分類" />
              </SelectTrigger>
              <SelectContent>
                {categoryList.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">日期</div>
            <Input value={draft.date ?? ""} onChange={(e) => set({ date: e.target.value })} placeholder="YYYY-MM-DD" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">標籤（用逗號分隔）</div>
            <Input
              value={(draft.tags ?? []).join(",")}
              onChange={(e) =>
                set({
                  tags: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder="例如：雨備,舞台,動線"
            />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">推薦道具（slug，用逗號分隔）</div>
            <Input
              value={(draft.relatedPropSlugs ?? []).join(",")}
              onChange={(e) =>
                set({
                  relatedPropSlugs: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder={propSlugs.slice(0, 3).join(",") + "..."}
            />
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">摘要（列表顯示）</div>
          <Textarea value={draft.excerpt ?? ""} onChange={(e) => set({ excerpt: e.target.value })} />
        </div>

        <div>
          <div className="text-xs text-muted-foreground">縮圖（列表/封面圖）</div>
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-border/70 bg-background/15 p-3 md:flex-row md:items-center">
            <div className="w-40 aspect-video overflow-hidden rounded-lg border border-border/70 bg-background/20">
              {draft.thumbnail ? (
                <img src={draft.thumbnail} alt="thumbnail" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">尚未上傳</div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center rounded-md bg-secondary px-3 py-2 text-sm text-secondary-foreground hover:bg-secondary/80">
                上傳
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const input = e.currentTarget;
                    const f = input.files?.[0];
                    if (!f) return;
                    const url = await fileToDataUrl(f);
                    set({ thumbnail: url });
                    input.value = "";
                  }}
                />
              </label>
              {draft.thumbnail ? (
                <Button type="button" variant="outline" onClick={() => set({ thumbnail: "" })}>
                  清除
                </Button>
              ) : null}
              <div className="text-xs text-muted-foreground self-center">建議尺寸：1600×900（16:9），最少 1280×720</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">YouTube 影片連結（貼上後自動轉成可嵌入）</div>
          <Input value={draft.videoUrl ?? ""} onChange={(e) => set({ videoUrl: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
        </div>

        <div>
          <div className="text-xs text-muted-foreground">SEO（可選）</div>
          <div className="mt-2 grid gap-3 rounded-xl border border-border/70 bg-background/10 p-4">
            <div>
              <div className="text-xs text-muted-foreground">SEO 標題</div>
              <Input value={draft.seo?.title ?? ""} onChange={(e) => set({ seo: { ...(draft.seo ?? {}), title: e.target.value } })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">SEO 描述</div>
              <Textarea value={draft.seo?.description ?? ""} onChange={(e) => set({ seo: { ...(draft.seo ?? {}), description: e.target.value } })} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">分享圖（留空則用縮圖）</div>
              <Input value={draft.seo?.image ?? ""} onChange={(e) => set({ seo: { ...(draft.seo ?? {}), image: e.target.value } })} placeholder="https://... 或 dataURL" />
              <div className="mt-1 text-xs text-muted-foreground">建議尺寸：1200×630（OG 1.91:1），最少 600×315</div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground">文章正文（圖文編輯器）</div>
          <div className="mt-2">
            <MarkdownEditorPanel value={draft.content ?? ""} onChange={(v) => set({ content: v })} height={560} label="文章內容" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">常見問題（FAQ）</div>
            <Button size="sm" variant="secondary" onClick={() => set({ faq: [...(draft.faq ?? []), { q: "", a: "" }] })}>
              <Plus className="mr-2 h-4 w-4" /> 新增 FAQ
            </Button>
          </div>
          <div className="mt-2 grid gap-3">
            {(draft.faq ?? []).map((f: any, idx: number) => (
              <div key={idx} className="rounded-xl border border-border/70 bg-background/20 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <div className="text-xs text-muted-foreground">問題</div>
                    <Input
                      value={f.q ?? ""}
                      onChange={(e) =>
                        set({
                          faq: (draft.faq ?? []).map((x: any, i: number) => (i === idx ? { ...x, q: e.target.value } : x)),
                        })
                      }
                    />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">回答</div>
                    <Input
                      value={f.a ?? ""}
                      onChange={(e) =>
                        set({
                          faq: (draft.faq ?? []).map((x: any, i: number) => (i === idx ? { ...x, a: e.target.value } : x)),
                        })
                      }
                    />
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button size="sm" variant="outline" onClick={() => set({ faq: (draft.faq ?? []).filter((_: any, i: number) => i !== idx) })}>
                    <Trash2 className="mr-2 h-4 w-4" /> 刪除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <DialogClose asChild>
          <Button
            onClick={() => {
              if (!draft.title?.trim()) return toast.error("請填寫文章標題");
              const now = new Date().toISOString();
              const next = {
                ...draft,
                category: categoryList.includes(draft.category) ? draft.category : (categoryList[0] ?? "未分類"),
                tags: Array.isArray(draft.tags) ? draft.tags.map((t: any) => String(t).trim()).filter(Boolean) : [],
                views: Number.isFinite(Number(draft.views)) ? Number(draft.views) : 0,
                order: Number.isFinite(Number(draft.order)) ? Number(draft.order) : 0,
                createdAt: draft.createdAt || now,
                updatedAt: now,
                publishedAt: draft.status === "public" ? (draft.publishedAt || now) : draft.publishedAt,
              };
              if (next.videoUrl?.trim()) next.videoUrl = toYouTubeEmbedUrl(next.videoUrl);
              onSave(next);
            }}
          >
            <Save className="mr-2 h-4 w-4" /> 儲存
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function MarqueeManager() {
  const { data, setData } = useAppData();
  const m = data.marquee;

  const setM = (patch: Partial<typeof m>) => {
    setData({ ...data, marquee: { ...m, ...patch } as any });
  };

  return (
    <section className="grid w-full max-w-2xl justify-self-start gap-6">
      <div className="rounded-2xl border border-border/70 bg-card/30 p-5">
        <div className="font-display text-2xl">首頁跑馬文字</div>
        <div className="mt-2 text-sm text-muted-foreground">
          調整首頁上方警示條的跑馬文字：內容、效果、顏色、大小、速度。
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border/70 bg-card/30 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-display">啟用跑馬</div>
            <div className="text-xs text-muted-foreground">關閉後會回到原本的純條紋裝飾</div>
          </div>
          <Button
            variant={m.enabled ? "secondary" : "outline"}
            onClick={() => setM({ enabled: !m.enabled })}
          >
            {m.enabled ? "已啟用" : "已停用"}
          </Button>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">跑馬文字（可輸入一段長句，會自動循環）</div>
          <Textarea
            value={m.text}
            onChange={(e) => setM({ text: e.target.value })}
            placeholder="例如：怪獸道具工廠｜客製化啟動道具 / 現場執行支援 / 加 LINE 立即詢價"
            className="min-h-24"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <div className="text-xs text-muted-foreground">跑馬效果</div>
            <select
              value={m.effect}
              onChange={(e) => setM({ effect: e.target.value as any })}
              className="h-10 w-full rounded-xl border border-border/70 bg-background/20 px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value="scroll-left">向左跑（常見跑馬）</option>
              <option value="scroll-right">向右跑</option>
              <option value="bounce">來回彈跳</option>
              <option value="wave">波浪偏移</option>
              <option value="glitch">故障閃動</option>
            </select>
          </div>

          <div className="grid gap-2">
            <div className="text-xs text-muted-foreground">文字顏色</div>

            <div className="flex flex-wrap items-center gap-3">
              <input
                type="color"
                value={String(m.color || "#ffffff").startsWith("#") ? String(m.color) : "#ffffff"}
                onChange={(e) => setM({ color: e.target.value })}
                className="h-10 w-12 cursor-pointer rounded-lg border border-border/70 bg-background/20"
                title="選擇顏色"
              />
              <Input
                value={m.color}
                onChange={(e) => setM({ color: e.target.value })}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { name: "白", v: "#ffffff" },
                { name: "螢光綠", v: "#76ffa6" },
                { name: "警示黃", v: "#ffe96b" },
                { name: "怪獸青", v: "#33c7d6" },
                { name: "橘", v: "#ff8a3d" },
                { name: "粉", v: "#ff4fd8" },
              ].map((c) => (
                <button
                  key={c.v}
                  type="button"
                  onClick={() => setM({ color: c.v })}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/10 px-3 py-1 text-xs text-muted-foreground hover:bg-secondary/30"
                  title={c.v}
                >
                  <span className="h-3 w-3 rounded-full border border-border/70" style={{ background: c.v }} />
                  {c.name}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-muted-foreground">
              進階：仍可直接輸入 CSS 色碼（例如 <span className="font-mono">oklch(...)</span>）。若輸入非 <span className="font-mono">#RRGGBB</span>，調色盤會先以白色顯示。
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <div className="text-xs text-muted-foreground">文字大小（px）</div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={12}
                max={28}
                step={1}
                value={Number(m.size) || 18}
                onChange={(e) => setM({ size: Number(e.target.value) })}
                className="w-full"
              />
              <div className="w-12 text-right text-sm text-muted-foreground">{Number(m.size) || 18}</div>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-xs text-muted-foreground">速度（秒/一圈，越小越快）</div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={6}
                max={30}
                step={1}
                value={Number(m.duration) || 15}
                onChange={(e) => setM({ duration: Number(e.target.value) })}
                className="w-full"
              />
              <div className="w-12 text-right text-sm text-muted-foreground">{Number(m.duration) || 15}</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/20 p-4">
          <div className="text-xs text-muted-foreground">預覽（後台）</div>
          <div className="mt-2 overflow-hidden rounded-lg border border-border/70 hazard">
            <div className="marquee-viewport h-10">
              <div
                className={`marquee-track marquee-${m.effect}`}
                style={{
                  ["--marquee-duration" as any]: `${Math.max(4, Number(m.duration) || 15)}s`,
                  ["--marquee-color" as any]: m.color || "oklch(0.98 0 0)",
                  ["--marquee-size" as any]: `${Math.max(12, Number(m.size) || 18)}px`,
                }}
              >
                <span className="marquee-text">{m.text || "（尚未輸入文字）"}</span>
                <span className="marquee-gap" />
                <span className="marquee-text">{m.text || "（尚未輸入文字）"}</span>
                <span className="marquee-gap" />
                <span className="marquee-text">{m.text || "（尚未輸入文字）"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          提示：文字顏色可用 <span className="font-mono">#ffffff</span> 或 <span className="font-mono">oklch(...)</span>；若你想要更多特效（例如逐字閃、跳字），我也可以再加。
        </div>
      </div>
    </section>
  );
}


function HomeVideoManager() {
  const { data, setData } = useAppData();
  const v = data.homeVideo;

  const setV = (patch: Partial<typeof v>) => {
    setData({ ...data, homeVideo: { ...v, ...patch } as any });
  };


  return (
    <section className="grid w-full max-w-2xl justify-self-start gap-6">
      <div className="rounded-2xl border border-border/70 bg-card/30 p-5">
        <div className="font-display text-2xl">首頁影片</div>
        <div className="mt-2 text-sm text-muted-foreground">顯示在首頁「怪獸情報局」下方，可隨時替換 YouTube 連結。</div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border/70 bg-card/30 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-display">啟用首頁影片</div>
            <div className="text-xs text-muted-foreground">關閉後，首頁不會顯示影片區塊</div>
          </div>
          <Button variant={v.enabled ? "secondary" : "outline"} onClick={() => setV({ enabled: !v.enabled })}>
            {v.enabled ? "已啟用" : "已停用"}
          </Button>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">標題</div>
          <Input value={v.title} onChange={(e) => setV({ title: e.target.value })} placeholder="例如：怪獸現場能量回放" />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">副標（可留空）</div>
          <Input value={v.subtitle ?? ""} onChange={(e) => setV({ subtitle: e.target.value })} placeholder="例如：先看一段，馬上抓到節奏..." />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">YouTube 連結</div>
          <Input
            value={v.youtubeUrl}
            onChange={(e) => setV({ youtubeUrl: e.target.value })}
            placeholder="https://youtu.be/... 或 https://www.youtube.com/watch?v=..."
          />
          <div className="text-[11px] text-muted-foreground">支援 youtu.be / youtube.com/watch?v= / youtube.com/embed/</div>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/20 p-4">
          <div className="text-xs text-muted-foreground">預覽（後台）</div>
          <div className="mt-2 overflow-hidden rounded-lg border border-border/70">
            <div className="aspect-video w-full bg-background/30">
              <iframe
                className="h-full w-full"
                src={toYouTubeEmbedUrl(v.youtubeUrl || "")}
                title={v.title || "YouTube"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function NewsletterManager() {
  const { data, setData } = useAppData();
  const n = data.newsletter;
  const subs = data.newsletterSubscribers;

  const setN = (patch: Partial<typeof n>) => {
    setData({ ...data, newsletter: { ...n, ...patch } as any });
  };

  const setSubs = (next: typeof subs) => {
    setData({ ...data, newsletterSubscribers: next as any });
  };

  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return subs;
    return subs.filter((s) => s.email.toLowerCase().includes(query));
  }, [subs, q]);

  const toCsv = (rows: typeof subs) => {
    const header = ["email", "createdAt", "source"].join(",");
    const lines = rows.map((s) => {
      const email = `"${String(s.email).replace(/"/g, '""')}"`;
      const createdAt = String(s.createdAt ?? "");
      const source = String(s.source ?? "");
      return [email, createdAt, source].join(",");
    });
    return [header, ...lines].join("\n");
  };

  const copyCsv = () => {
    const csv = toCsv(subs);
    navigator.clipboard
      .writeText(csv)
      .then(() => toast.success("已複製 CSV"))
      .catch(() => toast.error("複製失敗"));
  };

  const downloadCsv = () => {
    try {
      const csv = toCsv(subs);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const stamp = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `meco-newsletter-subscribers-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success("已下載 CSV");
    } catch {
      toast.error("下載失敗");
    }
  };

  return (
    <section className="grid w-full max-w-2xl justify-self-start gap-6">
      <div className="rounded-2xl border border-border/70 bg-card/30 p-5">
        <div className="font-display text-2xl">電子報</div>
        <div className="mt-2 text-sm text-muted-foreground">管理怪獸情報局頁面的訂閱卡片文案，並查看訂閱名單。</div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border/70 bg-card/30 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-display">啟用電子報訂閱</div>
            <div className="text-xs text-muted-foreground">關閉後，知識庫頁面不會顯示訂閱卡片</div>
          </div>
          <Button variant={n.enabled ? "secondary" : "outline"} onClick={() => setN({ enabled: !n.enabled })}>
            {n.enabled ? "已啟用" : "已停用"}
          </Button>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">標題</div>
          <Input value={n.title} onChange={(e) => setN({ title: e.target.value })} placeholder="例如：訂閱怪獸電子報" />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">副標（可留空）</div>
          <Input value={n.subtitle ?? ""} onChange={(e) => setN({ subtitle: e.target.value })} placeholder="例如：每週一封：提案話術、避雷清單..." />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">Email 欄位提示文字</div>
          <Input value={n.placeholder} onChange={(e) => setN({ placeholder: e.target.value })} placeholder="例如：輸入你的 Email" />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">按鈕文字</div>
          <Input value={n.buttonText} onChange={(e) => setN({ buttonText: e.target.value })} placeholder="例如：訂閱" />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">同意文字</div>
          <Textarea
            value={n.consentText}
            onChange={(e) => setN({ consentText: e.target.value })}
            rows={2}
            placeholder="例如：我同意接收電子報（可隨時取消）"
          />
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border/70 bg-card/30 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="font-display">訂閱名單</div>
            <div className="mt-1 text-xs text-muted-foreground">目前 {subs.length} 筆（本機瀏覽器 localStorage）。</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={copyCsv} disabled={subs.length === 0}>
              <Save className="mr-2 h-4 w-4" /> 複製 CSV
            </Button>
            <Button variant="outline" onClick={downloadCsv} disabled={subs.length === 0}>
              <Download className="mr-2 h-4 w-4" /> 下載 CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (subs.length === 0) return;
                if (!confirm("確定清空所有訂閱名單？")) return;
                setSubs([]);
                toast.success("已清空名單");
              }}
              disabled={subs.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" /> 清空
            </Button>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">搜尋 Email</div>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="例如：gmail" />
        </div>

        <div className="overflow-hidden rounded-xl border border-border/70">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">訂閱時間</TableHead>
                <TableHead className="hidden md:table-cell">來源</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    {subs.length === 0 ? "尚無訂閱名單" : "找不到符合的 Email"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered
                  .slice()
                  .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
                  .map((s) => {
                    const dt = s.createdAt ? new Date(s.createdAt) : null;
                    return (
                      <TableRow key={`${s.email}_${s.createdAt}`}>
                        <TableCell className="font-mono text-xs">{s.email}</TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                          {dt && !Number.isNaN(dt.getTime()) ? dt.toLocaleString() : "-"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground">{s.source}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (!confirm(`刪除 ${s.email} 這筆訂閱？`)) return;
                              setSubs(subs.filter((x) => !(x.email === s.email && x.createdAt === s.createdAt)));
                              toast.success("已刪除");
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> 刪除
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="text-[11px] text-muted-foreground">
          提示：目前此網站是示範版（資料存在瀏覽器）。若你要正式上線，可改成串接後端資料庫＋雙重確認（double opt-in）。
        </div>
      </div>
    </section>
  );
}


function AnalyticsManager() {
  const { data, setData } = useAppData();
  const daily = (data.analytics?.pageviewsDaily ?? {}) as Record<string, number>;
  const dailyByPath = (data.analytics as any)?.pageviewsDailyByPath ?? {};
  const quoteSubs = ((data.analytics as any)?.quoteSubmissions ?? []) as Array<{ id: string; createdAtIso: string; city?: string; district?: string; itemsCount: number }>;

  const now = new Date();
  const days14 = rangeDays(now, 14);
  const counts14 = days14.map((k) => daily[k] ?? 0);
  const weekPrev = counts14.slice(0, 7);
  const weekThis = counts14.slice(7);
  const max14 = Math.max(1, ...counts14);

  const year = now.getFullYear();
  const monthLabels = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));

  const sumMonth = (y: number, m: string) => {
    const key = `${y}-${m}`;
    let s = 0;
    for (const [d, c] of Object.entries(daily)) if (toMonthKey(d) === key) s += Number(c) || 0;
    return s;
  };

  const monthsThis = monthLabels.map((m) => sumMonth(year, m));
  const monthsLast = monthLabels.map((m) => sumMonth(year - 1, m));
  const maxMonth = Math.max(1, ...monthsThis, ...monthsLast);

  const totalThis = monthsThis.reduce((a, b) => a + b, 0);
  const totalLast = monthsLast.reduce((a, b) => a + b, 0);
  const maxTotal = Math.max(1, totalThis, totalLast);

  const loginLogs = loadLoginLogs().slice(0, 6);

  const clear = () => {
    if (!confirm("確定清空參訪統計？（只影響此瀏覽器）")) return;
    setData({
      ...(data as any),
      analytics: { ...(data.analytics as any), pageviewsDaily: {}, pageviewsDailyByPath: {}, quoteSubmissions: [] },
    } as any);
    toast.success("已清空參訪統計");
  };

  const toMonth = (isoOrDay: string) => String(isoOrDay).slice(0, 7);

  const last12Months = (() => {
    const out: string[] = [];
    const d = new Date();
    d.setDate(1);
    for (let i = 0; i < 12; i++) {
      const k = d.toISOString().slice(0, 7);
      out.unshift(k);
      d.setMonth(d.getMonth() - 1);
    }
    return out;
  })();

  const quotePvByMonth = (m: string) => {
    let s = 0;
    for (const [day, paths] of Object.entries(dailyByPath as any)) {
      if (toMonth(day) !== m) continue;
      const c = (paths as any)?.["/quote"] ?? 0;
      s += Number(c) || 0;
    }
    return s;
  };

  const quoteSubByMonth = (m: string) => {
    let s = 0;
    for (const q of quoteSubs) if (toMonth(q.createdAtIso) === m) s += 1;
    return s;
  };

  const conversionRows = last12Months.map((m) => {
    const pv = quotePvByMonth(m);
    const sub = quoteSubByMonth(m);
    const rate = pv > 0 ? sub / pv : 0;
    return { m, pv, sub, rate };
  });

  const maxRate = Math.max(0.01, ...conversionRows.map((r) => r.rate));

  const cityAgg = (() => {
    const start = last12Months[0];
    const end = last12Months[last12Months.length - 1];
    const map = new Map<string, { city: string; sub: number }>();
    for (const q of quoteSubs) {
      const mk = toMonth(q.createdAtIso);
      if (mk < start || mk > end) continue;
      const city = String(q.city || "未填").trim() || "未填";
      map.set(city, { city, sub: (map.get(city)?.sub ?? 0) + 1 });
    }
    return Array.from(map.values()).sort((a, b) => b.sub - a.sub).slice(0, 10);
  })();

  const totalQuotePv12 = conversionRows.reduce((a, r) => a + r.pv, 0);

  return (
    <section className="grid gap-6">
      <div className="rounded-2xl border border-border/70 bg-card/30 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-2xl">參訪統計</div>
            <div className="mt-2 text-sm text-muted-foreground">示範版：以 localStorage 記錄全站每日瀏覽次數（不含 /admin）。</div>
          </div>
          <Button variant="outline" onClick={clear}>
            <Trash2 className="mr-2 h-4 w-4" /> 清空統計
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/40 p-5">
          <div className="font-display">詢價單轉換率（近 12 個月）</div>
          <div className="mt-1 text-xs text-muted-foreground">分母：詢價單頁（/quote）瀏覽次數｜分子：送出成功筆數（本機）</div>

          <div className="mt-4 grid grid-cols-12 items-end gap-2 h-44">
            {conversionRows.map((r) => (
              <div key={r.m} className="grid gap-1">
                <div className="h-36 w-full rounded-md border border-border/70 bg-background/15 overflow-hidden flex items-end">
                  <div className="w-full bg-accent/80" style={{ height: `${Math.round((r.rate / maxRate) * 100)}%` }} />
                </div>
                <div className="text-[10px] text-muted-foreground text-center">{r.m.slice(5)}</div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            最近 12 個月：送出 {conversionRows.reduce((a, r) => a + r.sub, 0)} 筆｜/quote 瀏覽 {totalQuotePv12} 次｜平均轉換率 {totalQuotePv12 ? `${Math.round((conversionRows.reduce((a, r) => a + r.sub, 0) / totalQuotePv12) * 1000) / 10}%` : "—"}
          </div>
        </Card>

        <Card className="border-border/70 bg-card/40 p-5">
          <div className="font-display">詢價送出地區分佈（近 12 個月）</div>
          <div className="mt-1 text-xs text-muted-foreground">此為「送出詢價」的地點欄位統計（縣市）。</div>

          <div className="mt-4 grid gap-2">
            {cityAgg.length ? (
              cityAgg.map((c) => (
                <div key={c.city} className="grid grid-cols-[120px_1fr_52px] items-center gap-3">
                  <div className="text-xs text-muted-foreground truncate">{c.city}</div>
                  <div className="h-3 rounded-md border border-border/70 bg-background/15 overflow-hidden">
                    <div
                      className="h-full bg-accent/80"
                      style={{ width: `${Math.round((c.sub / Math.max(1, cityAgg[0]?.sub ?? 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="text-right text-xs text-muted-foreground">{c.sub}</div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">尚無詢價送出資料（本機）。請先在前台送出幾筆詢價再查看。</div>
            )}
          </div>

          <div className="mt-3 text-xs text-muted-foreground">
            註：地區統計目前用「詢價單表單填寫的活動地點」推估，非訪客 IP 地理位置。
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/40 p-5">
          <div className="font-display">兩週每日人次</div>
          <div className="mt-1 text-xs text-muted-foreground">灰色：上週｜紅色：本週</div>

          <div className="mt-4 grid grid-cols-14 items-end gap-1 h-44">
            {weekPrev.map((v, i) => (
              <div key={`p_${i}`} className="w-full rounded-sm bg-muted/40" style={{ height: `${Math.round((v / max14) * 100)}%` }} />
            ))}
            {weekThis.map((v, i) => (
              <div key={`t_${i}`} className="w-full rounded-sm bg-accent/80" style={{ height: `${Math.round((v / max14) * 100)}%` }} />
            ))}
          </div>

          <div className="mt-3 flex justify-between text-[11px] text-muted-foreground">
            <span>{days14[0].slice(5)}</span>
            <span>{days14[13].slice(5)}</span>
          </div>
        </Card>

        <Card className="border-border/70 bg-card/40 p-5">
          <div className="font-display">兩年每月人次</div>
          <div className="mt-1 text-xs text-muted-foreground">淺色：去年｜藍綠：今年</div>

          <div className="mt-4 grid grid-cols-12 items-end gap-2 h-44">
            {monthLabels.map((m, idx) => (
              <div key={m} className="grid grid-cols-2 gap-1 items-end">
                <div className="rounded-sm bg-muted/40" style={{ height: `${Math.round((monthsLast[idx] / maxMonth) * 100)}%` }} />
                <div className="rounded-sm bg-accent/80" style={{ height: `${Math.round((monthsThis[idx] / maxMonth) * 100)}%` }} />
              </div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-12 gap-2 text-[10px] text-muted-foreground">
            {monthLabels.map((m) => (
              <div key={`l_${m}`} className="text-center">{Number(m)}</div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/70 bg-card/40 p-5">
          <div className="font-display">兩年總人次</div>
          <div className="mt-4 grid gap-4">
            {[{ y: year - 1, v: totalLast, color: "bg-muted/40" }, { y: year, v: totalThis, color: "bg-accent/80" }].map((row) => (
              <div key={row.y} className="grid gap-2">
                <div className="text-xs text-muted-foreground">{row.y}</div>
                <div className="h-6 w-full rounded-md border border-border/70 bg-background/15 overflow-hidden">
                  <div className={`h-full ${row.color}`} style={{ width: `${Math.round((row.v / maxTotal) * 100)}%` }} />
                </div>
                <div className="text-xs text-muted-foreground">{row.v}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/70 bg-card/40 p-5">
          <div className="font-display">近期登入記錄</div>
          <div className="mt-1 text-xs text-muted-foreground">示範版：登入成功時寫入本機紀錄</div>

          <div className="mt-4 overflow-hidden rounded-xl border border-border/70">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">狀態</TableHead>
                  <TableHead>帳號</TableHead>
                  <TableHead className="text-right">時間</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">
                      尚無登入記錄
                    </TableCell>
                  </TableRow>
                ) : (
                  loginLogs.map((x, idx) => {
                    const dt = x.ts ? new Date(x.ts) : null;
                    return (
                      <TableRow key={`${x.ts}_${idx}`}>
                        <TableCell className="text-center text-accent">✓</TableCell>
                        <TableCell className="font-mono text-xs">{x.user}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {dt && !Number.isNaN(dt.getTime()) ? dt.toLocaleString() : x.ts}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </section>
  );
}

function EmailJsManager() {
  const { data, setData } = useAppData();
  const s = (data.emailjs ?? {
    enabled: false,
    serviceId: "",
    templateId: "",
    publicKey: "",
    toEmail: "",
    thankYouEnabled: false,
    thankYouTemplateId: "",
  }) as any;

  const setS = (patch: Partial<typeof s>) => {
    setData({ ...data, emailjs: { ...s, ...patch } as any } as any);
  };

  return (
    <section className="grid w-full max-w-2xl justify-self-start gap-6">
      <div className="rounded-2xl border border-border/70 bg-card/30 p-5">
        <div className="font-display text-2xl">EmailJS（表單寄信）</div>
        <div className="mt-2 text-sm text-muted-foreground">
          讓「需求表單 / 詢價單」送出後直接寄到你的 Email（示範版：設定存在本機 localStorage）。
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-border/70 bg-card/30 p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-display">啟用 EmailJS 寄信</div>
            <div className="text-xs text-muted-foreground">若未填 Template ID，前台會提示無法寄信</div>
          </div>
          <Button variant={s.enabled ? "secondary" : "outline"} onClick={() => setS({ enabled: !s.enabled })}>
            {s.enabled ? "已啟用" : "已停用"}
          </Button>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">Service ID</div>
          <Input value={s.serviceId ?? ""} onChange={(e) => setS({ serviceId: e.target.value })} placeholder="service_xxx" />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">Template ID</div>
          <Input value={s.templateId ?? ""} onChange={(e) => setS({ templateId: e.target.value })} placeholder="template_xxx" />
          <div className="text-[11px] text-muted-foreground">
            EmailJS 需要 Template ID 才能寄信（你目前已提供 Service ID / Public Key）。
          </div>
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">Public Key</div>
          <Input value={s.publicKey ?? ""} onChange={(e) => setS({ publicKey: e.target.value })} placeholder="public_xxx" />
        </div>

        <div className="grid gap-2">
          <div className="text-xs text-muted-foreground">收件信箱（to_email）</div>
          <Input value={s.toEmail ?? ""} onChange={(e) => setS({ toEmail: e.target.value })} placeholder="name@example.com" />
        </div>

        <div className="rounded-xl border border-border/70 bg-background/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-display text-foreground">已成交自動感謝信</div>
              <div className="mt-1 text-xs text-muted-foreground">後台把名單狀態改為「已成交」時寄給客戶（需客戶有填 Email）</div>
            </div>
            <Button variant={s.thankYouEnabled ? "secondary" : "outline"} onClick={() => setS({ thankYouEnabled: !s.thankYouEnabled })}>
              {s.thankYouEnabled ? "已啟用" : "已停用"}
            </Button>
          </div>

          <div className="mt-3 grid gap-2">
            <div className="text-xs text-muted-foreground">感謝信 Template ID（可用同一個模板）</div>
            <Input value={s.thankYouTemplateId ?? ""} onChange={(e) => setS({ thankYouTemplateId: e.target.value })} placeholder="template_xxx" />
            <div className="text-[11px] text-muted-foreground">留空時會沿用上面的 Template ID。</div>
          </div>
        </div>

        <div className="rounded-xl border border-border/70 bg-background/10 p-4 text-xs text-muted-foreground">
          <div className="font-display text-foreground">模板必填（建議最穩）</div>
          <ul className="mt-2 grid gap-1">
            <li>• <span className="font-mono">to_email</span>（收件人）</li>
            <li>• <span className="font-mono">subject</span>（信件標題）</li>
            <li>• <span className="font-mono">message</span>（完整內容：公司/聯絡/時間/地點/道具）</li>
            <li>• <span className="font-mono">reply_to</span>（可選：回覆會寄給客戶）</li>
            <li>• <span className="font-mono">from_name</span>（可選：寄件人顯示名稱）</li>
          </ul>
          <div className="mt-3 text-[11px] text-muted-foreground">
            若信件內容是空的，幾乎都是因為 EmailJS Template 沒有放對應變數。
          </div>
        </div>
      </div>
    </section>
  );
}

function DndPropsTable({
  rows,
  onReorder,
  renderRow,
  disabled,
}: {
  rows: any[];
  onReorder: (next: any[]) => void;
  renderRow: (row: any) => React.ReactNode;
  disabled?: boolean;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(rows, oldIndex, newIndex));
  };

  return (
    <Table className="mt-4">
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">排序</TableHead>
          <TableHead>名稱</TableHead>
          <TableHead className="hidden md:table-cell">分類/類型</TableHead>
          <TableHead className="hidden md:table-cell">Slug/城市</TableHead>
          <TableHead className="text-right">操作</TableHead>
        </TableRow>
      </TableHeader>

      {disabled ? (
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.id}>{renderRow(r)}</TableRow>
          ))}
        </TableBody>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
            <TableBody>
              {rows.map((r) => (
                <SortableTableRow key={r.id} id={r.id}>
                  {renderRow(r)}
                </SortableTableRow>
              ))}
            </TableBody>
          </SortableContext>
        </DndContext>
      )}
    </Table>
  );
}

function SortableTableRow({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <TableRow ref={setNodeRef as any} style={style} {...attributes}>
      <DragHandle listeners={listeners} />
      {children}
    </TableRow>
  );
}

function DragHandle({ listeners, disabled }: { listeners?: any; disabled?: boolean }) {
  return (
    <button
      type="button"
      className={
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/70 bg-background/20 text-muted-foreground " +
        (disabled ? "opacity-40" : "cursor-grab active:cursor-grabbing hover:text-foreground")
      }
      {...(disabled ? {} : listeners)}
      title={disabled ? "清空搜尋後可拖拉排序" : "拖拉排序"}
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}


type DndCardListProps<T> = {
  disabled?: boolean;
  items: T[];
  getId: (t: T) => string;
  onReorder: (next: T[]) => void;
  renderItem: (t: T) => React.ReactNode;
};

function DndCardList<T>({ disabled, items, getId, onReorder, renderItem }: DndCardListProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = items.findIndex((r) => getId(r) === active.id);
    const newIndex = items.findIndex((r) => getId(r) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items as any, oldIndex, newIndex));
  };

  if (disabled) {
    return (
      <div className="mt-4 grid gap-3">
        {items.map((it) => (
          <Card key={getId(it)} className="overflow-hidden border-border/70 bg-background/10">
            {renderItem(it)}
          </Card>
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((it) => getId(it))} strategy={verticalListSortingStrategy}>
        <div className="mt-4 grid gap-3">
          {items.map((it) => (
            <SortableCard key={getId(it)} id={getId(it)}>
              <Card className="overflow-hidden border-border/70 bg-background/10">
                {renderItem(it)}
              </Card>
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef as any} style={style} {...attributes} className="relative">
      <div className="absolute left-3 top-3 z-10">
        <DragHandle listeners={listeners} />
      </div>
      <div className="pl-12">{children}</div>
    </div>
  );
}


type DndMasonryProps<T> = {
  disabled?: boolean;
  items: T[];
  getId: (t: T) => string;
  onReorder: (next: T[]) => void;
  renderItem: (t: T) => React.ReactNode;
};

function DndMasonry<T>({ disabled, items, getId, onReorder, renderItem }: DndMasonryProps<T>) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = items.findIndex((r) => getId(r) === active.id);
    const newIndex = items.findIndex((r) => getId(r) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(items as any, oldIndex, newIndex));
  };

  const wrap = (child: React.ReactNode) => (
    <div className="break-inside-avoid">
      <div className="relative">
        <div className="absolute left-3 top-3 z-10">
          <DragHandle />
        </div>
        <div className="pl-12">{child}</div>
      </div>
    </div>
  );

  if (disabled) {
    return <div className="mt-4 columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">{items.map((it) => <div key={getId(it)} className="break-inside-avoid">{renderItem(it)}</div>)}</div>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((it) => getId(it))} strategy={verticalListSortingStrategy}>
        <div className="mt-4 columns-1 gap-4 space-y-4 md:columns-2 lg:columns-3">
          {items.map((it) => (
            <SortableMasonryItem key={getId(it)} id={getId(it)}>
              {renderItem(it)}
            </SortableMasonryItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableMasonryItem({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef as any} style={style} {...attributes} className="break-inside-avoid">
      <div className="relative">
        <div className="absolute left-3 top-3 z-10">
          <DragHandle listeners={listeners} />
        </div>
        <div className="pl-12">{children}</div>
      </div>
    </div>
  );
}

function QuoteLeadsManager() {
  const { data, setData } = useAppData();
  const leads = (data as any).quoteLeads ?? [];

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (leads as any[])
      .slice()
      .sort((a, b) => String(b.createdAtIso || "").localeCompare(String(a.createdAtIso || "")))
      .filter((x) => (status === "all" ? true : String(x.status || "new") === status))
      .filter((x) => {
        if (!term) return true;
        const hay = `${x.company} ${x.name} ${x.phone} ${x.email} ${x.city} ${x.district}`.toLowerCase();
        return hay.includes(term);
      });
  }, [leads, q, status]);

  const setLeadStatus = async (id: string, nextStatus: string) => {
    const now = new Date().toISOString();
    const lead = (leads as any[]).find((x) => x.id === id);
    const prevStatus = String(lead?.status ?? "new");

    setData({
      ...(data as any),
      quoteLeads: (leads as any[]).map((l) => (l.id === id ? { ...l, status: nextStatus, updatedAtIso: now } : l)),
    } as any);

    if (prevStatus !== "won" && nextStatus === "won") {
      const s = (data as any).emailjs ?? {};
      const enabled = Boolean(s.thankYouEnabled);
      const templateId = String(s.thankYouTemplateId || s.templateId || "").trim();
      const serviceId = String(s.serviceId || "").trim();
      const publicKey = String(s.publicKey || "").trim();

      const toEmail = String(lead?.email || "").trim();
      const alreadySent = Boolean(lead?.thankYouSentAtIso);

      if (!enabled) {
        toast.message("已成交：感謝信目前未啟用（後台 EmailJS 可開啟）");
      } else if (!toEmail) {
        toast.message("已成交：此筆名單未填 Email，無法寄送感謝信");
      } else if (alreadySent) {
        toast.message("已成交：此筆已寄送過感謝信");
      } else if (!serviceId || !templateId || !publicKey) {
        toast.error("已成交：EmailJS 設定不完整（Service/Template/PublicKey）");
      } else {
        try {
          const msg = [
            `Hi ${lead?.name || ""}，`,
            "", 
            "感謝你選擇怪獸道具工廠，這次合作很榮幸能一起完成現場！",
            "若後續還有活動需求，歡迎直接回信或加 LINE 與我們聯繫。",
            "", 
            "怪獸道具工廠 敬上",
          ].join("\n");

          await emailjs.send(
            serviceId,
            templateId,
            {
              to_email: toEmail,
              subject: `【怪獸道具工廠】感謝您的合作｜${lead?.company || ""}`,
              from_name: "怪獸道具工廠",
              reply_to: (data as any).emailjs?.toEmail || "",
              message: msg,
            } as any,
            { publicKey },
          );

          setData({
            ...(data as any),
            quoteLeads: ((data as any).quoteLeads ?? []).map((l: any) => (l.id === id ? { ...l, thankYouSentAtIso: new Date().toISOString() } : l)),
          } as any);
          toast.success("已成交：感謝信已寄出");
        } catch {
          toast.error("已成交：感謝信寄送失敗（請確認 EmailJS Template 變數）");
        }
      }
    }

    toast.success("已更新狀態");
  };

  const exportCsv = () => {
    const esc = (v: any) => {
      const s = String(v ?? "");
      const needs = /[",\n]/.test(s);
      const out = s.replace(/"/g, '""');
      return needs ? `"${out}"` : out;
    };

    const header = [
      "createdAtIso",
      "status",
      "company",
      "name",
      "phone",
      "email",
      "itemsCount",
      "city",
      "district",
      "updatedAtIso",
      "id",
    ];

    const rows = filtered.map((l: any) =>
      header
        .map((k) => {
          if (k === "itemsCount") return esc(Number(l.itemsCount ?? 0));
          return esc(l[k]);
        })
        .join(","),
    );

    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quote-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    if (!confirm("確定清空詢價名單？（只影響此瀏覽器）")) return;
    setData({ ...(data as any), quoteLeads: [] } as any);
    toast.success("已清空詢價名單");
  };

  return (
    <section className="grid gap-6">
      <div className="rounded-2xl border border-border/70 bg-card/30 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-display text-2xl">詢價名單</div>
            <div className="mt-2 text-sm text-muted-foreground">
              以「Email 寄出成功」為準寫入（本機 localStorage）。可更新狀態、搜尋、匯出 CSV。
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" /> 匯出 CSV
            </Button>
            <Button variant="outline" onClick={clear}>
              <Trash2 className="mr-2 h-4 w-4" /> 清空
            </Button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜尋：公司 / 聯絡人 / 電話 / Email / 縣市" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部狀態</SelectItem>
              <SelectItem value="new">新</SelectItem>
              <SelectItem value="contacted">已聯絡</SelectItem>
              <SelectItem value="won">已成交</SelectItem>
              <SelectItem value="lost">未成交</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="border-border/70 bg-card/40 p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>時間</TableHead>
              <TableHead>公司</TableHead>
              <TableHead>聯絡人</TableHead>
              <TableHead>道具件數</TableHead>
              <TableHead>縣市</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>感謝信</TableHead>
              <TableHead className="text-right">動作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                  尚無名單。請先在前台送出詢價（Email 寄出成功）後再查看。
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((l: any) => (
                <TableRow key={l.id} className="border-border/70">
                  <TableCell className="text-xs text-muted-foreground">{String(l.createdAtIso || "").replace("T", " ").slice(0, 16)}</TableCell>
                  <TableCell>{l.company}</TableCell>
                  <TableCell className="text-sm">{l.name}</TableCell>
                  <TableCell className="text-sm">{Number(l.itemsCount ?? 0)}</TableCell>
                  <TableCell className="text-sm">{l.city || "未填"}</TableCell>
                  <TableCell>
                    <Select value={String(l.status || "new")} onValueChange={(v) => setLeadStatus(l.id, v)}>
                      <SelectTrigger className="h-9 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">新</SelectItem>
                        <SelectItem value="contacted">已聯絡</SelectItem>
                        <SelectItem value="won">已成交</SelectItem>
                        <SelectItem value="lost">未成交</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {l.thankYouSentAtIso ? "已寄" : l.status === "won" ? "未寄" : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const text = [
                          `公司：${l.company}`,
                          `聯絡人：${l.name}`,
                          l.phone ? `電話：${l.phone}` : "",
                          l.email ? `Email：${l.email}` : "",
                          `道具件數：${Number(l.itemsCount ?? 0)}`,
                          `地點：${[l.city, l.district].filter(Boolean).join(" ") || "未填"}`,
                          `狀態：${l.status}`,
                          `時間：${l.createdAtIso}`,
                        ]
                          .filter(Boolean)
                          .join("\n");
                        navigator.clipboard.writeText(text).then(
                          () => toast.success("已複製"),
                          () => toast.error("複製失敗"),
                        );
                      }}
                    >
                      複製
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </section>
  );
}
