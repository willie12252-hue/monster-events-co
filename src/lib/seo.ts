export type SeoInput = {
  title?: string;
  description?: string;
  image?: string;
};

function upsertMeta(nameOrProp: "name" | "property", key: string, content: string) {
  if (typeof document === "undefined") return;
  const selector = `meta[${nameOrProp}="${key}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(nameOrProp, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function applySeo(input: SeoInput) {
  if (typeof document === "undefined") return;

  const title = (input.title ?? "").trim();
  if (title) document.title = title;

  const desc = (input.description ?? "").trim();
  if (desc) upsertMeta("name", "description", desc);

  const img = (input.image ?? "").trim();
  if (img) {
    upsertMeta("property", "og:image", img);
    upsertMeta("property", "twitter:image", img);
  }

  if (title) {
    upsertMeta("property", "og:title", title);
    upsertMeta("property", "twitter:title", title);
  }
  if (desc) {
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "twitter:description", desc);
  }
}
