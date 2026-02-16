import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { loadData, saveData, type AppData, getDefaultData, resetData } from "@/lib/data-store";
import { loadDataFromSupabase, saveDataToSupabase } from "@/lib/supabase-store";

type DataCtx = {
  data: AppData;
  setData: (next: AppData) => void;
  reset: () => void;
};

const Ctx = createContext<DataCtx | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<AppData>(() => {
    if (typeof window === "undefined") return getDefaultData();
    // Start with local snapshot for instant paint; then hydrate from Supabase.
    return loadData();
  });

  const setData = (next: AppData) => {
    setDataState(next);

    // Always keep a local fallback snapshot.
    if (typeof window !== "undefined") {
      try {
        saveData(next);
      } catch {
        toast.error("儲存失敗：瀏覽器儲存空間已滿。建議改用較小的圖片或清除部分縮圖。", { duration: 6000 });
      }
    }

    // Try to persist to Supabase when logged in.
    saveDataToSupabase(next).catch((e) => {
      if (String(e?.message || e).includes("not_authenticated")) return;
      // eslint-disable-next-line no-console
      console.warn("saveDataToSupabase failed", e);
      toast.error("Supabase 儲存失敗（可能尚未登入或權限不足）。", { duration: 5000 });
    });
  };

  const reset = () => {
    if (typeof window !== "undefined") resetData();
    setDataState(getDefaultData());
  };

  useEffect(() => {
    let alive = true;

    // Hydrate from Supabase on first mount.
    const withTimeout = <T,>(p: Promise<T>, ms: number) =>
      new Promise<T>((resolve, reject) => {
        const t = window.setTimeout(() => reject(new Error("timeout")), ms);
        p.then((v) => {
          window.clearTimeout(t);
          resolve(v);
        }).catch((e) => {
          window.clearTimeout(t);
          reject(e);
        });
      });

    withTimeout(loadDataFromSupabase(), 6000)
      .then((remote) => {
        if (!alive) return;
        setDataState(remote);
        try {
          saveData(remote);
        } catch {
          // ignore
        }
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.warn("loadDataFromSupabase failed, fallback to local", e);
      });

    // Keep local snapshot sync (useful while we are still in hybrid mode)
    const onStorage = (e: StorageEvent) => {
      if (!e.key) return;
      if (e.key.includes("meco.appData")) setDataState(loadData());
    };
    window.addEventListener("storage", onStorage);

    let last = "";
    try {
      last = localStorage.getItem("meco.appData.v1") ?? "";
    } catch {}

    const t = window.setInterval(() => {
      try {
        const now = localStorage.getItem("meco.appData.v1") ?? "";
        if (now !== last) {
          last = now;
          setDataState(loadData());
        }
      } catch {}
    }, 1000);

    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
      window.clearInterval(t);
    };
  }, []);

  const value = useMemo(() => ({ data, setData, reset }), [data]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppData() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppData must be used within DataProvider");
  return v;
}
