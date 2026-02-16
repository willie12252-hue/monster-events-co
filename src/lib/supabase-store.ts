// Supabase-backed data store adapter
// Project: Monsters props inc
// Philosophy:
// - Public pages can READ via anon key.
// - Admin pages can WRITE only when authenticated.

import { supabase, supabasePublic } from "@/lib/supabase";
import { getDefaultData, type AppData } from "@/lib/data-store";

type DbRow<T extends object> = T & { id: any };

const SETTINGS_ID = 1;

function pickSettings(d: AppData) {
  const {
    marquee,
    homeVideo,
    articleCategories,
    newsletter,
    emailjs,
  } = d;
  return { marquee, homeVideo, articleCategories, newsletter, emailjs };
}

function applySettings(base: AppData, settings: any): AppData {
  if (!settings || typeof settings !== "object") return base;
  return {
    ...base,
    marquee: { ...base.marquee, ...(settings.marquee ?? {}) },
    homeVideo: { ...base.homeVideo, ...(settings.homeVideo ?? {}) },
    articleCategories: Array.isArray(settings.articleCategories) ? settings.articleCategories : base.articleCategories,
    newsletter: { ...base.newsletter, ...(settings.newsletter ?? {}) },
    emailjs: { ...base.emailjs, ...(settings.emailjs ?? {}) },
  };
}

async function ensureSeedContent(defaultData: AppData) {
  // If props/articles/cases tables are empty, seed them from defaults.
  const [{ count: pCount }, { count: aCount }, { count: cCount }] = await Promise.all([
    supabasePublic.from("props").select("id", { count: "exact", head: true }),
    supabasePublic.from("articles").select("id", { count: "exact", head: true }),
    supabasePublic.from("cases").select("id", { count: "exact", head: true }),
  ]);

  const ops: any[] = [];
  if (!pCount) {
    ops.push(
      supabase
        .from("props")
        .upsert(
          defaultData.props.map((p: any) => ({
            id: p.id,
            data: p,
            status: (p as any).status ?? "public",
            order: (p as any).order ?? 0,
            views: (p as any).views ?? 0,
          })),
          { onConflict: "id" }
        )
    );
  }
  if (!aCount) {
    ops.push(
      supabase
        .from("articles")
        .upsert(defaultData.articles.map((a: any) => ({ id: a.id, data: a })), { onConflict: "id" })
    );
  }
  if (!cCount) {
    ops.push(
      supabase
        .from("cases")
        .upsert(defaultData.cases.map((c: any) => ({ id: c.id, data: c })), { onConflict: "id" })
    );
  }
  if (ops.length) await Promise.all(ops as any);
}

export async function loadDataFromSupabase(): Promise<AppData> {
  const base = getDefaultData();

  // NOTE: We intentionally do NOT auto-seed from the public (anon) client.
  // Seeding should be done by an authenticated admin to avoid unexpected writes.

  const [settingsRes, propsRes, articlesRes, casesRes] = await Promise.all([
    supabasePublic.from("site_settings").select("id,data").eq("id", SETTINGS_ID).maybeSingle(),
    supabasePublic.from("props").select("id,data,status,order,views"),
    supabasePublic.from("articles").select("id,data"),
    supabasePublic.from("cases").select("id,data"),
  ]);

  // NOTE: Do not auto-create settings row from public client.
  // Creating rows should be an authenticated admin action.
  const settings = settingsRes.data?.data ?? pickSettings(base);

  const props = (propsRes.data ?? []).map((r: any) => ({
    ...(r.data ?? {}),
    id: r.id,
    status: r.status ?? (r.data?.status ?? "public"),
    order: r.order ?? (r.data?.order ?? 0),
    views: r.views ?? (r.data?.views ?? 0),
  }));

  const articles = (articlesRes.data ?? []).map((r: any) => ({ ...(r.data ?? {}), id: r.id }));
  const cases = (casesRes.data ?? []).map((r: any) => ({ ...(r.data ?? {}), id: r.id }));

  return applySettings(
    {
      ...base,
      props: props.length ? (props as any) : base.props,
      articles: articles.length ? (articles as any) : base.articles,
      cases: cases.length ? (cases as any) : base.cases,
    },
    settings
  );
}

export async function saveDataToSupabase(next: AppData) {
  // Admin-only write API (requires auth session)

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error("not_authenticated");
  }

  const settings = pickSettings(next);

  const ops: any[] = [
    supabase.from("site_settings").upsert({ id: SETTINGS_ID, data: settings }),
    supabase
      .from("props")
      .upsert(
        next.props.map((p: any) => ({
          id: p.id,
          data: p,
          status: (p.status ?? "public") as string,
          order: Number.isFinite(p.order) ? p.order : 0,
          views: Number.isFinite(p.views) ? p.views : 0,
        })),
        { onConflict: "id" }
      ),
    supabase.from("articles").upsert(next.articles.map((a: any) => ({ id: a.id, data: a })), { onConflict: "id" }),
    supabase.from("cases").upsert(next.cases.map((c: any) => ({ id: c.id, data: c })), { onConflict: "id" }),
  ];

  await Promise.all(ops as any);
}

export async function insertQuoteLead(lead: any) {
  return supabasePublic.from("quote_leads").insert(lead);
}

export async function listQuoteLeads() {
  const res = await supabasePublic.from("quote_leads").select("*").order("created_at_iso", { ascending: false });
  return res;
}

export async function updateQuoteLead(id: string, patch: any) {
  return supabasePublic.from("quote_leads").update(patch).eq("id", id);
}

export async function insertNewsletterSubscriber(row: any) {
  return supabasePublic.from("newsletter_subscribers").insert(row);
}

// One-time migration helper: seed current localStorage snapshot to Supabase.
// - Requires admin login (authenticated session)
// - Upserts: site_settings / props / articles / cases / quote_leads / analytics*
// - Inserts newsletter_subscribers (dedup by email)
export async function seedAllToSupabase(appData: AppData) {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) throw new Error("not_authenticated");

  // 1) Core editable content + settings
  await saveDataToSupabase(appData);

  // 2) Quote leads (upsert by id)
  if (Array.isArray((appData as any).quoteLeads) && (appData as any).quoteLeads.length) {
    const rows = (appData as any).quoteLeads.map((q: any) => ({
      id: String(q.id),
      created_at_iso: String(q.createdAtIso ?? q.created_at_iso ?? new Date().toISOString()),
      updated_at_iso: String(q.updatedAtIso ?? q.updated_at_iso ?? new Date().toISOString()),
      status: String(q.status ?? "new"),
      company: String(q.company ?? ""),
      name: String(q.name ?? ""),
      phone: q.phone ? String(q.phone) : null,
      email: q.email ? String(q.email) : null,
      city: q.city ? String(q.city) : null,
      district: q.district ? String(q.district) : null,
      items_count: Number.isFinite(q.itemsCount) ? q.itemsCount : Number(q.items_count ?? 0) || 0,
      thank_you_sent_at_iso: q.thankYouSentAtIso ? String(q.thankYouSentAtIso) : q.thank_you_sent_at_iso ? String(q.thank_you_sent_at_iso) : null,
    }));

    await supabase.from("quote_leads").upsert(rows, { onConflict: "id" });
  }

  // 3) Newsletter subscribers (insert, dedupe by email)
  if (Array.isArray((appData as any).newsletterSubscribers) && (appData as any).newsletterSubscribers.length) {
    const local = (appData as any).newsletterSubscribers
      .map((s: any) => ({
        email: String(s.email ?? "").trim().toLowerCase(),
        created_at: s.createdAt ? String(s.createdAt) : null,
        source: s.source ? String(s.source) : "knowledge",
      }))
      .filter((s: any) => s.email);

    const uniq = new Map<string, any>();
    for (const s of local) if (!uniq.has(s.email)) uniq.set(s.email, s);

    const { data: existing } = await supabase.from("newsletter_subscribers").select("email");
    const exists = new Set((existing ?? []).map((r: any) => String(r.email ?? "").trim().toLowerCase()).filter(Boolean));

    const toInsert = [...uniq.values()].filter((s) => !exists.has(s.email)).map((s) => {
      const row: any = { email: s.email, source: s.source };
      if (s.created_at) row.created_at = s.created_at;
      return row;
    });

    if (toInsert.length) await supabase.from("newsletter_subscribers").insert(toInsert);
  }

  // 4) Analytics pageviews (upsert by day+path)
  const dailyByPath = ((appData.analytics as any)?.pageviewsDailyByPath ?? {}) as Record<string, Record<string, number>>;
  const pvRows: any[] = [];
  for (const [day, byPath] of Object.entries(dailyByPath)) {
    if (!byPath || typeof byPath !== "object") continue;
    for (const [path, count] of Object.entries(byPath)) {
      pvRows.push({ day, path, count: Number.isFinite(count) ? count : Number(count) || 0 });
    }
  }
  if (pvRows.length) await supabase.from("analytics_pageviews_daily").upsert(pvRows, { onConflict: "day,path" });

  // 5) Analytics quote submissions (upsert by id)
  const qs = (((appData.analytics as any)?.quoteSubmissions ?? []) as any[]).filter(Boolean);
  if (qs.length) {
    const rows = qs.map((s) => ({
      id: String(s.id),
      created_at_iso: String(s.createdAtIso ?? new Date().toISOString()),
      city: s.city ? String(s.city) : null,
      district: s.district ? String(s.district) : null,
      items_count: Number.isFinite(s.itemsCount) ? s.itemsCount : Number(s.itemsCount ?? 0) || 0,
    }));
    await supabase.from("analytics_quote_submissions").upsert(rows, { onConflict: "id" });
  }
}
