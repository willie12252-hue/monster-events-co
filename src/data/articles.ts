import type { ContentStatus, SeoFields } from "@/data/props";

export type ArticleFAQ = { q: string; a: string };

export type ArticleItem = {
  thumbnail?: string; // dataURL or image URL，縮圖/封面圖（後台可上傳）
  videoUrl?: string; // YouTube 連結（後台可貼）
  status?: ContentStatus; // 草稿/公開
  order?: number; // 排序
  views?: number; // 瀏覽數（可手動調整）
  createdAt?: string; // ISO
  publishedAt?: string; // ISO
  updatedAt?: string; // ISO
  seo?: SeoFields; // SEO（可選）
  id: string;
  slug: string;
  title: string;
  category: string; // 後台可自訂類別
  tags?: string[]; // 標籤
  excerpt: string;
  date: string;
  content: string;
  relatedPropSlugs: string[];
  faq: ArticleFAQ[];
};

export const articles: ArticleItem[] = [
  {
    id: "a1",
    slug: "indoor-outdoor-checklist",
    title: "啟動道具怎麼選？室內飯店 vs 戶外廣場防雷清單",
    category: "實戰避雷",
    excerpt: "場地不同，風險也不同：用電、雨備、搬運、舞台高度…一次整理。",
    date: "2026-02-15",
    relatedPropSlugs: ["water-reveal-tank", "push-bar-launch-podium"],
    tags: ["戶外", "雨備", "舞台", "動線"],
    faq: [
      { q: "戶外一定不能用嗎？", a: "可以用，但必須先做雨備與電力保護，並評估風雨風險。" },
      { q: "沒有坡道怎麼辦？", a: "重型道具上台需要人力或額外規劃；建議事前提供舞台高度/動線照片。" },
      { q: "一定要彩排嗎？", a: "連動聲光/機構類道具強烈建議彩排，能大幅降低失誤。" },
    ],
    content: `## 先問三件事\n\n1. **室內/戶外？** 戶外一定要雨備與電力保護。\n2. **舞台高度有沒有坡道？** 沒坡道，重型道具上台需要人力或額外規劃。\n3. **有沒有彩排時間？** 連動聲光的道具，沒有彩排就等於賭運氣。\n\n## 室內飯店：你要注意\n\n- 電力迴路與插座位置（110V/220V）\n- 貨梯尺寸與搬運動線\n- 舞台上/下台的高度差\n\n## 戶外廣場：你要注意\n\n- 雨備：帳篷/頂蓬、設備防水\n- 風：大型結構要加重與固定\n- 光：白天燈光效果不一定明顯，建議搭配實體機關或可見度更高的道具\n\n> 想要最快落地的方案？把你的活動資訊丟給我們，我們會用『道具＋執行』角度幫你把風險先踩掉。\n`,
  },
  {
    id: "a2",
    slug: "water-reveal-secret",
    title: "注水台的秘密：為什麼水一倒，字就浮出來？",
    category: "怪獸實驗室",
    excerpt: "看起來像魔法，其實是材料、視覺與節奏的工程。",
    date: "2026-02-10",
    relatedPropSlugs: ["water-reveal-tank"],
    tags: ["注水", "顯字", "材料", "節奏"],
    faq: [
      { q: "為什麼需要測試？", a: "水位、材料與節奏需要配合；測試能避免顯字不完整或節奏不對。" },
      { q: "可以客製字樣嗎？", a: "可以。請提供主視覺與字樣，並預留製作期。" },
      { q: "可以自備水嗎？", a: "通常可以，但仍需確認水源位置與動線，以及地面防護。" },
    ],
    content: `## 這不是魔法，是『揭曉節奏』\n\n注水顯字台之所以強，是因為觀眾會不自覺盯著透明容器：\n\n- 倒數開始：注意力集中\n- 水位上升：期待拉滿\n- 字樣出現：瞬間爆點\n\n## 客製化通常包含\n\n- 字樣與造型外觀（品牌主視覺）\n- 導流設計（讓水位上升更順）\n- 現場操作 SOP（避免失誤）\n\n> 想要做出『一倒就準』的效果，彩排與測試是關鍵。\n`,
  },
];
