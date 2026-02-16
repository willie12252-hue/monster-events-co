import type { ContentStatus, SeoFields } from "@/data/props";

export type CaseItem = {
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
  title: string;
  type: "動土" | "發表會" | "開幕" | "論壇";
  city: string;
  image: "hero" | "pattern" | "mascot";
  video?: string;
  highlight: string;
  content?: string; // Markdown，後台圖文編輯
};

export const cases: CaseItem[] = [
  {
    id: "c_uim_22",
    title: "立體翻書道具｜臺灣銀行永續信用卡上市記者會",
    type: "發表會",
    city: "台北",
    image: "hero",
    status: "public",
    thumbnail:
      "https://uim.com.tw/Uld/imgs/_cnt/b779c3a2273b943305da8b72e8ae3a9e.jpg",
    highlight:
      "客製化立體翻書道具，結合燈光視覺與舞台節奏，讓啟動瞬間成為全場焦點。",
    content: `
## 讓啟動瞬間，成為值得記憶的時刻

你還在租借「爛大街」的儀式道具嗎？

我們可以依照活動主題，打造*與眾不同的客製道具*，把品牌訊息與儀式流程更漂亮地整合在一起。

---

## 服務亮點

- **啟動道具**：觸摸燈柱、發光地球儀、翻牌牆、互動裝置等
- **典禮配件**：剪彩台、彩球升空裝置、專屬標語背景牆
- **定制化設計**：依主視覺、尺寸、材質與數量調整製作規格

---

## 成功案例：立體翻書道具

![立體翻書道具-1](https://uim.com.tw/Uld/imgs/_cnt/b779c3a2273b943305da8b72e8ae3a9e.jpg)

![立體翻書道具-2](https://uim.com.tw/Uld/imgs/_cnt/21bd1eb1edf5757b7f4d196bdbf7a346.jpg)

![立體翻書道具-3](https://uim.com.tw/Uld/imgs/_cnt/4670d220574585615e601919d9717548.jpg)

![立體翻書道具-4](https://uim.com.tw/Uld/imgs/_cnt/21a2e3f5576a51c7b4f08caa8470b133.jpg)

---

## 報價與執行說明（節錄）

1. **地點**：廠商在台北，外縣市將加收遠距運費
2. **規格差異**：造型、尺寸、數量、材質不同，費用也會不同
3. **設計方式**：可由主辦自行出圖，我方協助製作；或由我方提供設計

### 其他注意事項

- 本訂單包含 2 位工作人員協助運送與施作（不含場控/上下道具）
- 道具抵達現場後需約 **30 分鐘** 前置作業
- 若需即時上下舞台，建議舞台有斜坡道；若舞台高度高於 45 公分，需主辦方人力協助
- 戶外活動需雨備；雨天且無頂蓬/帳篷，將不提供服務

---

### 其他道具目錄

https://uim.com.tw/prop-40

> 本篇內容與圖片來源： https://uim.com.tw/news_dtl-22
`
  },
  {
    id: "c1",
    title: "科技園區動土典禮｜注水顯字啟動",
    type: "動土",
    city: "新北",
    image: "hero",
    highlight: "多人同時注水，字樣浮現瞬間全場定格拍照。",
  },
  {
    id: "c2",
    title: "新品發表會｜推桿連動聲光",
    type: "發表會",
    city: "台北",
    image: "pattern",
    highlight: "推桿觸發燈光與音效同步，倒數節奏完全貼合。",
  },
  {
    id: "c3",
    title: "品牌旗艦店開幕｜任意門揭幕牆",
    type: "開幕",
    city: "台中",
    image: "mascot",
    highlight: "揭幕 + 合照點一次到位，媒體畫面更乾淨。",
  },
];
