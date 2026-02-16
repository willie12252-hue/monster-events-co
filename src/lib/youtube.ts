// YouTube URL helpers
// Goal: Always produce an embeddable player URL (no watch page sidebar UI).

export function toYouTubeEmbedUrl(input: string): string {
  const raw = String(input || "").trim();
  if (!raw) return raw;

  const withParams = (base: string) => {
    try {
      const u = new URL(base);
      u.searchParams.set("rel", "0");
      u.searchParams.set("modestbranding", "1");
      u.searchParams.set("playsinline", "1");
      return u.toString();
    } catch {
      return base;
    }
  };

  const asEmbed = (id: string) => withParams(`https://www.youtube.com/embed/${id}`);

  // If user pasted just the ID
  if (/^[a-zA-Z0-9_-]{6,}$/.test(raw) && !raw.includes("/") && !raw.includes(".")) {
    return asEmbed(raw);
  }

  try {
    const u = new URL(raw);

    // youtu.be/<id>
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").trim();
      return id ? asEmbed(id) : raw;
    }

    // youtube.com/embed/<id>
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return withParams(raw);
    }

    // youtube.com/shorts/<id>
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/shorts/")) {
      const id = u.pathname.split("/shorts/")[1]?.split("/")[0]?.trim();
      return id ? asEmbed(id) : raw;
    }

    // youtube.com/watch?v=<id>
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v")?.trim();
      if (id) return asEmbed(id);
    }

    return raw;
  } catch {
    // Fallback regex extraction
    const m = raw.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/)([a-zA-Z0-9_-]{6,})/);
    return m?.[1] ? asEmbed(m[1]) : raw;
  }
}
