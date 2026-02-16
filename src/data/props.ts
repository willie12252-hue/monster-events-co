export type PropCategoryKey =
  | "balloon"
  | "lighting"
  | "card"
  | "water"
  | "sticker"
  | "electric"
  | "large";

export type PropFootprintCm = {
  lengthCm?: string; // 長
  widthCm?: string; // 寬
  heightCm?: string; // 高
};

export type PropQuickSpecs = {
  power: "need" | "none" | "optional";
  crew: string; // e.g. 2–6
  venue: "indoor" | "outdoor" | "both";
  // 兼容舊資料：可為純文字或長寬高（cm）
  footprint: string | PropFootprintCm;
};

export type SeoFields = {
  title?: string;
  description?: string;
  image?: string; // 分享圖（可用縮圖或另上傳）
};

export type ContentStatus = "draft" | "public";

export type PropItem = {
  thumbnail?: string; // dataURL or image URL，縮圖/封面圖（後台可上傳）
  status?: ContentStatus; // 草稿/公開（前台只顯示公開）
  order?: number; // 排序（前台依此顯示）
  views?: number; // 瀏覽數（可手動調整）
  createdAt?: string; // ISO
  publishedAt?: string; // ISO
  updatedAt?: string; // ISO
  seo?: SeoFields; // SEO（可選）
  id: string;
  slug: string;
  name: string;
  category: PropCategoryKey;
  tags: string[];
  heroType: "image" | "video";
  heroImage?: string;
  heroVideo?: string; // YouTube/Vimeo embed 連結（後台可貼）
  summary: string;
  highlights: string[];
  // 合併顯示用：icon 列與右側規格共用同一組資料
  quick: PropQuickSpecs;
  // 僅保留需要『文字說明』的欄位（不再有前置/運輸）
  specs: {
    size: string;
    power: string;
  };
  content?: string; // Markdown，後台圖文編輯
};

export const categoryMeta: Record<PropCategoryKey, { label: string; door: string; blurb: string }> = {
  balloon: {
    label: "氣球道具",
    door: "任意門｜氣球",
    blurb: "爆破、升空、禮盒開箱…用一口氣把氣氛拉滿。",
  },
  lighting: {
    label: "燈光道具",
    door: "任意門｜燈光",
    blurb: "光柱、雷射、發光物件…最適合倒數瞬間的能量爆發。",
  },
  card: {
    label: "插牌道具",
    door: "任意門｜插牌",
    blurb: "插卡、翻牌、揭牌…讓『揭曉』更有節奏。",
  },
  water: {
    label: "注水道具",
    door: "任意門｜注水",
    blurb: "倒下去才顯字，觀眾全程盯著看，超有儀式感。",
  },
  sticker: {
    label: "黏貼道具",
    door: "任意門｜黏貼",
    blurb: "拼圖、貼片、磁吸…多人同時參與，畫面很團結。",
  },
  electric: {
    label: "電動道具",
    door: "任意門｜電動",
    blurb: "推桿、捲軸、機關…整套連動燈光音效更震撼。",
  },
  large: {
    label: "其他大型道具",
    door: "任意門｜大型",
    blurb: "大型球體、機關裝置…主視覺一秒變主角。",
  },
};

export type CategoryGuide = {
  title: string;
  intro: string[];
  bestFor: string[];
  rentNotes: string[];
  faq: { q: string; a: string }[];
};

export const categoryGuides: Record<PropCategoryKey, CategoryGuide> = {
  balloon: {
    title: "氣球道具｜租借說明",
    intro: ["適合把氣氛『瞬間拉滿』的開場：爆破、升空、禮盒開箱都很吃鏡頭。", "若是戶外，請務必先評估風與雨備，避免臨場變數。"],
    bestFor: ["品牌開幕", "新品發表", "記者會倒數"],
    rentNotes: [
      "建議提前 7–14 天預訂（熱門檔期更早）。",
      "戶外需評估風速與固定方式；如遇強風需準備替代方案。",
      "若有爆破/升空效果，現場需安排安全距離與工作人員控場。",
    ],
    faq: [
      { q: "可以只租道具不含人員嗎？", a: "可，視道具複雜度。簡易氣球裝置可自取自用；涉及爆破/升空/安全控管者建議含人員執行。" },
      { q: "下雨怎麼辦？", a: "戶外活動請務必雨備（帳篷/頂蓬）。遇雨且無法安全執行時，將改以替代方案或延期處理（依正式條款）。" },
      { q: "可以做品牌客製嗎？", a: "可以。常見是外觀輸出、主題色、標語牌等，需提供 AI/向量檔或可協助設計。" },
    ],
  },
  lighting: {
    title: "燈光道具｜租借說明",
    intro: ["光柱、雷射、發光物件適合『倒數瞬間』，一亮就有掌聲。", "想更震撼可搭配音效與舞台燈控做同步。"],
    bestFor: ["科技論壇", "新品發表", "企業年會"],
    rentNotes: [
      "請先確認場地電力（110V/220V）、插座位置與走線路徑。",
      "燈光效果受環境亮度影響：白天戶外需提高亮度或搭配實體機關。",
      "若要連動音效/舞台燈控，建議安排彩排與控台對接。",
    ],
    faq: [
      { q: "需要提供控台嗎？", a: "可由我們提供或與既有舞台控台整合。若活動已有燈控/音控，建議事前對接協議與彩排。" },
      { q: "可以做同步倒數/按下就亮嗎？", a: "可以。可設計成按下觸發、感應觸發或時間碼觸發，依場地與需求評估。" },
      { q: "室外可以用嗎？", a: "可以，但需注意防水、防風與電力保護；必要時建議使用防雨設備或改成更適合戶外的方案。" },
    ],
  },
  card: {
    title: "插牌道具｜租借說明",
    intro: ["揭牌/翻牌/插卡是『揭曉節奏』的強項，適合媒體與合照。", "輸出設計好，畫面就會乾淨又專業。"],
    bestFor: ["開幕剪綵替代", "揭牌儀式", "產品亮點揭曉"],
    rentNotes: [
      "多用於揭牌/翻牌/插卡揭曉，重點在視覺輸出與動作節奏。",
      "建議提供主視覺尺寸與舞台攝影機位，確保鏡頭拍得到。",
      "輸出物（插卡/牌面）屬耗材，若需客製會另計費用。",
    ],
    faq: [
      { q: "插卡要做幾張？", a: "常見 1–6 張依貴賓人數。多人同時插卡畫面更有『共同啟動』感。" },
      { q: "牌面可以重複使用嗎？", a: "結構可重複使用；牌面/輸出可做可替換式，方便不同活動替換內容。" },
      { q: "需要彩排嗎？", a: "建議彩排 5–10 分鐘就能把動作節奏與主持口條對齊，效果會提升很多。" },
    ],
  },
  water: {
    title: "注水道具｜租借說明",
    intro: ["注水顯字是『期待值拉長 → 爆點揭曉』的經典。", "重點是 SOP 與測試：一倒就準、字才會完整。"],
    bestFor: ["動土落成", "新品上市", "大型記者會"],
    rentNotes: [
      "注水顯字類道具通常需要前置測試與現場操作 SOP。",
      "請確認舞台附近是否可補水/排水，與地面防護（避免濕滑）。",
      "戶外需雨備；若風雨影響安全，可能需改期或改方案。",
    ],
    faq: [
      { q: "為什麼一定要前置測試？", a: "注水顯字效果需要水位、材料與節奏配合；測試能避免『顯字不完整』或『節奏不對』。" },
      { q: "可以自備水嗎？", a: "可以，通常現場可就地取水，但仍需確認水源位置與動線。" },
      { q: "可以客製造型/字樣嗎？", a: "可以。請提供主視覺與字樣，並預留製作期（視複雜度）。" },
    ],
  },
  sticker: {
    title: "黏貼道具｜租借說明",
    intro: ["多人同時拼貼/磁吸，畫面會很『團結』，適合企業與組織活動。", "可做可回收材質版本，符合 ESG 需求。"],
    bestFor: ["企業啟動", "組織活動", "合作簽署"],
    rentNotes: [
      "適合多人同時參與（拼圖/貼片/磁吸），畫面『很團結』。",
      "建議確認舞台深度與站位，避免擋到攝影畫面。",
      "貼片/拼圖屬耗材，可做客製輸出與回收設計。",
    ],
    faq: [
      { q: "貼片會不會掉？", a: "會依材質與環境評估黏著/磁吸方式。正式執行前會做測試並提供備用。" },
      { q: "可以做 ESG/永續版本嗎？", a: "可以。可改用可回收材質、可替換面板與重複使用結構。" },
      { q: "需要幾位貴賓才好看？", a: "2 位以上就有互動感；4–8 位畫面更滿、更有『共同完成』的張力。" },
    ],
  },
  electric: {
    title: "電動道具｜租借說明",
    intro: ["推桿/捲軸/機關適合做『整套連動』，聲光一起來才夠震撼。", "建議安排彩排，把主持口條與觸發節奏對齊。"],
    bestFor: ["大型論壇", "企業年會", "科技品牌發表"],
    rentNotes: [
      "電動/連動道具建議安排彩排，並與燈光音效做同步測試。",
      "請先確認電力規格、走線與安全區域（避免觀眾接觸機構）。",
      "大型機構運送需確認貨梯與搬運動線。",
    ],
    faq: [
      { q: "能不能按下去就觸發全場燈光/音效？", a: "可以。可透過控台或訊號整合觸發（依現場設備而定）。" },
      { q: "沒有貨梯可以用嗎？", a: "視尺寸重量而定；若無貨梯且樓層搬運困難，建議改用可拆裝方案或調整道具形式。" },
      { q: "安全怎麼控？", a: "會設計安全距離、緊急停止與工作人員控場；正式版條款也會載明責任與配合事項。" },
    ],
  },
  large: {
    title: "其他大型道具｜租借說明",
    intro: ["大型裝置就是主視覺：一秒變主角，適合需要『氣派』的活動。", "請先提供場地尺寸與進場限制，避免搬運風險。"],
    bestFor: ["大型開幕", "展覽主舞台", "政府/企業典禮"],
    rentNotes: [
      "大型道具多為主視覺裝置，建議先看場勘圖與舞台尺寸。",
      "運送與進撤場時間會影響成本；請提供進場限制與車道資訊。",
      "如需客製造型，建議至少 2–4 週製作期（依案）。",
    ],
    faq: [
      { q: "可以做成品牌 IP 造型嗎？", a: "可以。會以原創方式設計並避開他人商標/角色，確保風格一致又安全。" },
      { q: "會不會太占空間？", a: "我們會依場地建議占地與觀眾視角，並提供可拆裝/縮小版本。" },
      { q: "要怎麼報價？", a: "通常會先確認：地點、尺寸、材質、是否含人員執行、運送與進撤場時間。" },
    ],
  },
};

export const propsData: PropItem[] = [
  {
    id: "p1",
    slug: "water-reveal-tank",
    name: "注水顯字台（透明水箱）",
    category: "water",
    tags: ["顯字", "多人啟動", "品牌主視覺"],
    heroType: "video",
    heroVideo: "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0",
    summary: "倒下去才揭曉，最適合新品上市/動土/落成典禮。",
    highlights: [
      "啟動瞬間『字浮出來』，鏡頭很吃香",
      "可依主視覺客製字樣與造型外觀",
      "適合 2–6 位貴賓同時啟動",
    ],
    quick: { power: "optional", crew: "2–6", venue: "both", footprint: "寬 180–240cm" },
    specs: {
      size: "依案客製（常見寬 180–240cm）",
      power: "不一定（視燈光/特效配置）",
    },
  },
  {
    id: "p2",
    slug: "push-bar-launch-podium",
    name: "電動推桿啟動台（連動聲光）",
    category: "electric",
    tags: ["推桿", "連動", "科技感"],
    heroType: "image",
    heroImage: "hero",
    summary: "多人同步推動，燈光/音效/畫面可做節奏同步。",
    highlights: [
      "推桿阻尼手感，畫面『很有事』",
      "可擴充：彩帶/乾冰/燈柱同時觸發",
      "適合大型論壇、企業年會、記者會",
    ],
    quick: { power: "need", crew: "2–4", venue: "both", footprint: "寬 200–300cm" },
    specs: {
      size: "常見寬 200–300cm（可客製）",
      power: "110V/220V 依配置",
    },
  },
  {
    id: "p3",
    slug: "portal-door-category-wall",
    name: "任意門揭幕牆（插卡/翻牌）",
    category: "card",
    tags: ["揭牌", "任意門", "合照點"],
    heroType: "image",
    heroImage: "pattern",
    summary: "把『揭曉』做成任意門，開門就是活動主題。",
    highlights: ["可做品牌化門片輸出", "適合合照與媒體拍攝", "可與燈光道具一起做發光效果"],
    quick: { power: "optional", crew: "1–2", venue: "both", footprint: "依版位客製" },
    specs: {
      size: "依版位客製",
      power: "可選（發光/燈條）",
    },
  },
];
