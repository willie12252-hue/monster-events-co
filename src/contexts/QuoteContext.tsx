import React, { createContext, useContext, useMemo, useState } from "react";

export type QuoteLine = {
  propId: string;
  slug: string;
  name: string;
  qty: number;
  note?: string;
};

type QuoteContextValue = {
  lines: QuoteLine[];
  addLine: (line: Omit<QuoteLine, "qty"> & { qty?: number }) => void;
  removeLine: (propId: string) => void;
  updateQty: (propId: string, qty: number) => void;
  updateNote: (propId: string, note: string) => void;
  clear: () => void;
  count: number;
};

const QuoteContext = createContext<QuoteContextValue | null>(null);

const QUOTE_KEY = "meco.quote.v1";

function loadQuote(): QuoteLine[] {
  try {
    const raw = localStorage.getItem(QUOTE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQuote(lines: QuoteLine[]) {
  try {
    localStorage.setItem(QUOTE_KEY, JSON.stringify(lines));
  } catch {
    // ignore
  }
}

export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<QuoteLine[]>(() => {
    if (typeof window === "undefined") return [];
    return loadQuote();
  });

  const addLine: QuoteContextValue["addLine"] = (line) => {
    setLines((prev) => {
      const found = prev.find((p) => p.propId === line.propId);
      const next = found
        ? prev.map((p) => (p.propId === line.propId ? { ...p, qty: p.qty + (line.qty ?? 1) } : p))
        : [...prev, { ...line, qty: line.qty ?? 1 }];
      saveQuote(next);
      return next;
    });
  };

  const removeLine: QuoteContextValue["removeLine"] = (propId) =>
    setLines((prev) => {
      const next = prev.filter((p) => p.propId !== propId);
      saveQuote(next);
      return next;
    });

  const updateQty: QuoteContextValue["updateQty"] = (propId, qty) =>
    setLines((prev) => {
      const next = prev.map((p) => (p.propId === propId ? { ...p, qty } : p));
      saveQuote(next);
      return next;
    });

  const updateNote: QuoteContextValue["updateNote"] = (propId, note) =>
    setLines((prev) => {
      const next = prev.map((p) => (p.propId === propId ? { ...p, note } : p));
      saveQuote(next);
      return next;
    });

  const clear = () =>
    setLines(() => {
      saveQuote([]);
      return [];
    });

  // Also persist changes in case other paths update lines.
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    saveQuote(lines);
  }, [lines]);

  const value = useMemo<QuoteContextValue>(() => {
    const count = lines.reduce((acc, cur) => acc + cur.qty, 0);
    return { lines, addLine, removeLine, updateQty, updateNote, clear, count };
  }, [lines]);

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

export function useQuote() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuote must be used within QuoteProvider");
  return ctx;
}
