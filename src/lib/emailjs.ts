import emailjs from "@emailjs/browser";
import type { EmailJsSettings } from "@/lib/data-store";

export type QuoteEmailPayload = {
  source: "quote" | "contact";
  subject: string;
  message: string;
  company: string;
  vat?: string;
  name: string;
  phone?: string;
  email?: string;
  eventName?: string;
  inAt?: string;
  outAt?: string;
  location?: string;
  need?: string;
  memo?: string;
  lines?: Array<{ name: string; qty: number; note?: string }>;
  pageUrl?: string;
  createdAtIso: string;
  to_email?: string;
  reply_to?: string;
  from_name?: string;
};

export function canSendEmail(s?: Partial<EmailJsSettings>) {
  return Boolean(s?.enabled && s?.serviceId?.trim() && s?.templateId?.trim() && s?.publicKey?.trim());
}

export function buildQuoteEmailMessage(p: Omit<QuoteEmailPayload, "message" | "subject">) {
  const linesText = (p.lines && p.lines.length)
    ? p.lines.map((l) => `- ${l.name} ×${l.qty}${l.note ? `（備註：${l.note}）` : ""}`).join("\n")
    : "（無）";

  return [
    `來源：${p.source === "quote" ? "詢價單" : "需求表單"}`,
    `時間：${p.createdAtIso}`,
    p.pageUrl ? `頁面：${p.pageUrl}` : "",
    "",
    `公司：${p.company || ""}`,
    p.vat ? `統編：${p.vat}` : "",
    `聯絡人：${p.name || ""}`,
    p.phone ? `電話：${p.phone}` : "",
    p.email ? `Email：${p.email}` : "",
    "",
    p.eventName ? `活動名稱：${p.eventName}` : "",
    p.inAt ? `進場：${p.inAt}` : "",
    p.outAt ? `撤場：${p.outAt}` : "",
    p.location ? `地點：${p.location}` : "",
    "",
    p.need ? `需求：\n${p.need}` : "需求：\n（無）",
    p.memo ? `\n備註：\n${p.memo}` : "",
    "",
    `詢問道具：\n${linesText}`,
  ].filter(Boolean).join("\n");
}

export async function sendEmailJs(settings: EmailJsSettings, params: QuoteEmailPayload) {
  const payload: QuoteEmailPayload = {
    ...params,
    to_email: settings.toEmail || params.to_email,
  };

  return emailjs.send(settings.serviceId, settings.templateId, payload as any, {
    publicKey: settings.publicKey,
  });
}
