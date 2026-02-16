export function normalizeMarkdownImageUrls(md: string) {
  if (!md) return md;
  // Fix legacy relative image links copied from uim.com.tw
  // Examples:
  // ![]( /Uld/imgs/_cnt/xxx.jpg )
  // ![]( Uld/imgs/_cnt/xxx.jpg )
  return md
    .replace(/\]\(\s*\/Uld\/imgs\/_cnt\//g, "](https://uim.com.tw/Uld/imgs/_cnt/")
    .replace(/\]\(\s*Uld\/imgs\/_cnt\//g, "](https://uim.com.tw/Uld/imgs/_cnt/");
}
