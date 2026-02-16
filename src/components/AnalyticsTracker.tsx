import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAppData } from "@/contexts/DataContext";

function todayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export default function AnalyticsTracker() {
  const { data, setData } = useAppData();
  const [loc] = useLocation();
  const lastRef = useRef<string>("");

  useEffect(() => {
    if (!loc) return;

    // Avoid double count in dev / strict-mode re-renders
    const key = `${loc}@@${todayKey()}`;
    if (lastRef.current === key) return;
    lastRef.current = key;

    // Ignore admin routes to avoid inflating
    if (loc.startsWith("/admin")) return;

    const day = todayKey();
    const prev = data.analytics?.pageviewsDaily?.[day] ?? 0;
    const byPath = (data.analytics as any)?.pageviewsDailyByPath ?? {};
    const prevPath = byPath?.[day]?.[loc] ?? 0;

    setData({
      ...(data as any),
      analytics: {
        ...(data.analytics as any),
        pageviewsDaily: {
          ...(data.analytics?.pageviewsDaily ?? {}),
          [day]: prev + 1,
        },
        pageviewsDailyByPath: {
          ...byPath,
          [day]: {
            ...(byPath?.[day] ?? {}),
            [loc]: prevPath + 1,
          },
        },
      },
    } as any);
  }, [loc]);

  return null;
}
