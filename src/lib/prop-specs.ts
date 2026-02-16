import type { PropFootprintCm } from "@/data/props";

export function formatFootprint(footprint: string | PropFootprintCm | undefined | null) {
  if (!footprint) return "";
  if (typeof footprint === "string") return footprint;

  const l = String(footprint.lengthCm ?? "").trim();
  const w = String(footprint.widthCm ?? "").trim();
  const h = String(footprint.heightCm ?? "").trim();

  if (!l && !w && !h) return "";

  const parts: string[] = [];
  if (l) parts.push(`長 ${l}cm`);
  if (w) parts.push(`寬 ${w}cm`);
  if (h) parts.push(`高 ${h}cm`);
  return parts.join(" × ");
}

export function normalizeFootprintToObject(footprint: string | PropFootprintCm | undefined | null): PropFootprintCm {
  if (!footprint) return {};
  if (typeof footprint !== "string") return footprint;

  // 盡量從舊字串抽出數字（例如："寬 180–240cm"），但不做強制格式化
  const m = footprint.match(/(\d+(?:\.\d+)?(?:\s*[-–~～]\s*\d+(?:\.\d+)?)?)/);
  if (!m) return {};
  return { widthCm: m[1].replace(/\s+/g, "") };
}
