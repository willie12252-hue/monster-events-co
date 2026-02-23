// Data store — Monster Events Co.
// Goal: make front-end data editable via Admin page, persisted in localStorage.

import { categoryGuides, categoryMeta, propsData, type PropCategoryKey, type PropItem } from "@/data/props";
import { articles, type ArticleItem } from "@/data/articles";
import { cases, type CaseItem } from "@/data/cases";

export type MarqueeEffect =
  | "scroll-left"
  | "scroll-right"
  | "bounce"
  | "wave"
  | "glitch";

export type MarqueeSettings = {
  enabled: boolean;
  text: string;
  effect: MarqueeEffect;
  color: string; // CSS color
  size: number; // px
  duration: number; // seconds per loop
};

export type HomeVideoSettings = {
  enabled: boolean;
  title: string;
  subtitle?: string;
  youtubeUrl: string;
};

export type NewsletterSettings = {
  enabled: boolean;
  title: string;
  subtitle?: string;
  placeholder: string;
  buttonText: string;
  consentText: string;
};

export type NewsletterSubscriber = {
  email: string;
  createdAt: string; // ISO
  source: "knowledge";
};

export type EmailJsSettings = {
  enabled: boolean;
  serviceId: string;
  templateId: string; // 管理端收件模板
  publicKey: string;
  toEmail: string; // 管理端收件信箱
  thankYouEnabled?: boolean;
  thankYouTemplateId?: string; // 客戶感謝信模板（可用同一模板）
};

export type QuoteLeadStatus = "new" | "contacted" | "won" | "lost";

export type QuoteLead = {
  id: string;
  createdAtIso: string;
  updatedAtIso: string;
  status: QuoteLeadStatus;
  company: string;
  name: string;
  phone?: string;
  email?: string;
  city?: string;
  district?: string;
  itemsCount: number;
  thankYouSentAtIso?: string;
};

export type AppData = {
  version: number;
  props: PropItem[];
  articles: ArticleItem[];
  cases: CaseItem[];
  categoryMeta: Record<PropCategoryKey, { label: string; door: string; blurb: string }>;
  categoryGuides: typeof categoryGuides;
  marquee: MarqueeSettings;
  homeVideo: HomeVideoSettings;
  articleCategories: string[];
  newsletter: NewsletterSettings;
  newsletterSubscribers: NewsletterSubscriber[];
  quoteLeads: QuoteLead[];
  analytics: {
    pageviewsDaily: Record<string, number>; // YYYY-MM-DD -> count
    pageviewsDailyByPath: Record<string, Record<string, number>>; // YYYY-MM-DD -> { path -> count }
    quoteSubmissions: Array<{
      id: string;
      createdAtIso: string;
      city?: string;
      district?: string;
      itemsCount: number;
    }>;
  };
  emailjs: EmailJsSettings;
};

const KEY = "meco.appData.v1";
const VERSION = 1;

export function getDefaultData(): AppData {
  return {
    version: VERSION,
    props: propsData,
    articles,
    cases,
    categoryMeta,
    categoryGuides,
    marquee: {
      enabled: true,
      text: "怪獸道具工廠｜客製化啟動道具 / 現場執行支援 / 加 LINE 立即詢價",
      effect: "scroll-left",
      color: "oklch(0.98 0 0)",
      size: 18,
      duration: 15,
    },
    homeVideo: {
      enabled: true,
      title: "怪獸現場能量回放",
      subtitle: "先看一段，馬上抓到節奏：聲光、走位、倒數、揭曉。",
      youtubeUrl: "https://youtu.be/tOS9wmw-m6c?si=kMay7nBmtgfhhMyW",
    },
    articleCategories: ["趨勢靈感", "實戰避雷", "怪獸實驗室", "能量案例"],
    newsletter: {
      enabled: true,
      title: "訂閱怪獸電子報",
      subtitle: "每週一封：提案話術、避雷清單、最新案例節奏。",
      placeholder: "輸入你的電子郵件",
      buttonText: "訂閱",
      consentText: "我同意接收電子報（可隨時取消）",
    },
    newsletterSubscribers: [],
    quoteLeads: [],
    analytics: {
      pageviewsDaily: {},
      pageviewsDailyByPath: {},
      quoteSubmissions: [],
    },
    emailjs: {
      enabled: true,
      serviceId: "service_sbm9mb6",
      templateId: "template_os1yh0p",
      publicKey: "NAblGRT4QgIAilmbZ",
      toEmail: "willie1225@yahoo.com.tw",
      thankYouEnabled: false,
      thankYouTemplateId: "",
    },
  };
}

function mergeById<T extends { id: string }>(base: T[], saved?: T[]) {
  if (!Array.isArray(saved)) return base;
  const map = new Map(saved.map((i) => [i.id, i] as const));
  const merged: T[] = [];
  for (const b of base) merged.push(map.get(b.id) ?? b);
  for (const s of saved) if (!base.some((b) => b.id === s.id)) merged.push(s);
  return merged;
}

export function loadData(): AppData {
  try {
    const base = getDefaultData();
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;

    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed || typeof parsed !== "object") return base;

    const merged: AppData = {
      ...base,
      ...(parsed as any),
      version: VERSION,
      props: mergeById(base.props, (parsed as any).props),
      articles: mergeById(base.articles, (parsed as any).articles),
      cases: mergeById(base.cases, (parsed as any).cases),
      marquee: { ...base.marquee, ...((parsed as any).marquee ?? {}) },
      homeVideo: { ...base.homeVideo, ...((parsed as any).homeVideo ?? {}) },
      articleCategories: Array.isArray((parsed as any).articleCategories)
        ? ((parsed as any).articleCategories as any)
        : base.articleCategories,
      newsletter: { ...base.newsletter, ...((parsed as any).newsletter ?? {}) },
      newsletterSubscribers: Array.isArray((parsed as any).newsletterSubscribers)
        ? ((parsed as any).newsletterSubscribers as any)
        : base.newsletterSubscribers,
      quoteLeads: Array.isArray((parsed as any).quoteLeads) ? ((parsed as any).quoteLeads as any) : base.quoteLeads,
      analytics: {
        ...(base.analytics as any),
        ...(((parsed as any).analytics ?? {}) as any),
        pageviewsDaily:
          (parsed as any).analytics?.pageviewsDaily && typeof (parsed as any).analytics.pageviewsDaily === "object"
            ? ((parsed as any).analytics.pageviewsDaily as any)
            : base.analytics.pageviewsDaily,
        pageviewsDailyByPath:
          (parsed as any).analytics?.pageviewsDailyByPath && typeof (parsed as any).analytics.pageviewsDailyByPath === "object"
            ? ((parsed as any).analytics.pageviewsDailyByPath as any)
            : base.analytics.pageviewsDailyByPath,
        quoteSubmissions: Array.isArray((parsed as any).analytics?.quoteSubmissions)
          ? ((parsed as any).analytics.quoteSubmissions as any)
          : base.analytics.quoteSubmissions,
      },
      emailjs: {
        ...(base.emailjs as any),
        ...(((parsed as any).emailjs ?? {}) as any),
      },
    };

    return merged;
  } catch {
    return getDefaultData();
  }
}

function stripHugeDataUrls(obj: any) {
  const isHugeDataUrl = (v: any) => typeof v === "string" && v.startsWith("data:") && v.length > 220_000;

  const strip = (x: any) => {
    if (!x || typeof x !== "object") return x;

    if (Array.isArray(x)) return x.map(strip);

    const out: any = { ...x };
    for (const k of Object.keys(out)) {
      const v = out[k];
      if (isHugeDataUrl(v)) out[k] = "";
      else out[k] = strip(v);
    }
    return out;
  };

  return strip(obj);
}

export function saveData(data: AppData) {
  const payload = JSON.stringify({ ...data, version: VERSION });
  try {
    localStorage.setItem(KEY, payload);
  } catch (e: any) {
    // If localStorage quota exceeded, try to drop huge embedded images (dataURL) and retry once.
    try {
      const stripped = stripHugeDataUrls({ ...data, version: VERSION });
      localStorage.setItem(KEY, JSON.stringify(stripped));
    } catch {
      // Give up silently; caller may toast.
      throw e;
    }
  }
}

export function resetData() {
  localStorage.removeItem(KEY);
}

export function updateData(mutator: (d: AppData) => AppData) {
  const next = mutator(loadData());
  saveData(next);
  return next;
}
