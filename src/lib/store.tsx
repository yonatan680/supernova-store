"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { computeTotals, type CartTotals } from "./pricing";
import type { CartLine } from "./types";

const CART_KEY = "supernova.cart.v1";
const RECENT_KEY = "supernova.recent.v1";

type Panel = "cart" | "search" | "menu" | null;

interface StoreValue {
  lines: CartLine[];
  totals: CartTotals;
  hydrated: boolean;
  addItem: (item: Omit<CartLine, "id" | "quantity">, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  panel: Panel;
  openPanel: (panel: Exclude<Panel, null>) => void;
  closePanel: () => void;
  recent: string[];
  trackView: (handle: string) => void;
  toast: string | null;
}

const StoreContext = createContext<StoreValue | null>(null);

function lineId(item: Omit<CartLine, "id" | "quantity">) {
  const opts = Object.entries(item.selections)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `${item.handle}?${opts}${item.size ? `&size=${item.size}` : ""}`;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setLines(read(CART_KEY, []));
    setRecent(read(RECENT_KEY, []));
    setHydrated(true);
    const sync = (e: StorageEvent) => {
      if (e.key === CART_KEY) setLines(read(CART_KEY, []));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  }, [recent, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const addItem = useCallback<StoreValue["addItem"]>((item, quantity = 1) => {
    const id = lineId(item);
    setLines((prev) => {
      const existing = prev.find((l) => l.id === id);
      if (existing) return prev.map((l) => (l.id === id ? { ...l, quantity: Math.min(l.quantity + quantity, 20) } : l));
      return [...prev, { ...item, id, quantity }];
    });
    setToast("נוסף לסל");
    setPanel("cart");
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, quantity: Math.min(quantity, 20) } : l)),
    );
  }, []);

  const removeItem = useCallback((id: string) => setLines((prev) => prev.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);
  const openPanel = useCallback((p: Exclude<Panel, null>) => setPanel(p), []);
  const closePanel = useCallback(() => setPanel(null), []);
  const trackView = useCallback((handle: string) => {
    setRecent((prev) => [handle, ...prev.filter((h) => h !== handle)].slice(0, 8));
  }, []);

  const totals = useMemo(() => computeTotals(lines), [lines]);

  const value = useMemo<StoreValue>(
    () => ({ lines, totals, hydrated, addItem, setQuantity, removeItem, clear, panel, openPanel, closePanel, recent, trackView, toast }),
    [lines, totals, hydrated, addItem, setQuantity, removeItem, clear, panel, openPanel, closePanel, recent, trackView, toast],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
