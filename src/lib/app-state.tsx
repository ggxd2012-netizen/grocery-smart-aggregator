import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { BasketLine } from "./optimizer";

export type Consent = { analytics: boolean; marketing: boolean; decided: boolean };
type Loc = { label: string; lat?: number; lng?: number };

type Ctx = {
  user: User | null;
  authReady: boolean;
  basket: BasketLine[];
  setQty: (productId: string, qty: number) => void;
  addItem: (productId: string, qty?: number) => void;
  clearBasket: () => void;
  consent: Consent;
  setConsent: (c: Omit<Consent, "decided">) => void;
  consentOpen: boolean;
  setConsentOpen: (v: boolean) => void;
  location: Loc;
  setLocation: (l: Loc) => void;
  recent: string[];
  pushRecent: (q: string) => void;
  dark: boolean;
  toggleDark: () => void;
};

const AppCtx = createContext<Ctx | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [basket, setBasket] = useState<BasketLine[]>([]);
  const [consent, setConsentState] = useState<Consent>({ analytics: false, marketing: false, decided: true });
  const [consentOpen, setConsentOpen] = useState(false);
  const [location, setLocationState] = useState<Loc>({ label: "الرياض - حي العليا" });
  const [recent, setRecent] = useState<string[]>([]);
  const [dark, setDark] = useState(false);
  const userRef = useRef<User | null>(null);

  // hydrate guest state
  useEffect(() => {
    setBasket(read("guest_basket", []));
    const c = read<Consent | null>("cookie_consent", null);
    if (c) setConsentState(c);
    else setConsentState({ analytics: false, marketing: false, decided: false });
    setLocationState(read("delivery_location", { label: "الرياض - حي العليا" }));
    setRecent(read("recent_searches", []));
    setDark(read("dark", false));
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  }, [dark]);

  const loadRemote = useCallback(async (u: User) => {
    const guest = read<BasketLine[]>("guest_basket", []);
    if (guest.length) {
      const { data: existing } = await supabase.from("basket_items").select("product_id, qty");
      const map = new Map((existing ?? []).map((r) => [r.product_id!, r.qty]));
      for (const g of guest) map.set(g.productId, (map.get(g.productId) ?? 0) + g.qty);
      await supabase.from("basket_items").upsert(
        [...map].map(([product_id, qty]) => ({ user_id: u.id, product_id, qty })),
      );
      localStorage.removeItem("guest_basket");
    }
    const { data } = await supabase.from("basket_items").select("product_id, qty");
    setBasket((data ?? []).map((r) => ({ productId: r.product_id!, qty: r.qty })));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      const prev = userRef.current;
      userRef.current = u;
      setUser(u);
      setAuthReady(true);
      if (u && prev?.id !== u.id) setTimeout(() => void loadRemote(u), 0);
      if (!u && prev) setBasket([]);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) setAuthReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [loadRemote]);

  const persist = (next: BasketLine[], changed: BasketLine[]) => {
    const u = userRef.current;
    if (!u) {
      localStorage.setItem("guest_basket", JSON.stringify(next));
      return;
    }
    for (const c of changed) {
      if (c.qty <= 0) void supabase.from("basket_items").delete().eq("product_id", c.productId);
      else void supabase.from("basket_items").upsert({ user_id: u.id, product_id: c.productId, qty: c.qty });
    }
  };

  const setQty = (productId: string, qty: number) => {
    setBasket((b) => {
      const exists = b.some((l) => l.productId === productId);
      const next = qty <= 0
        ? b.filter((l) => l.productId !== productId)
        : exists ? b.map((l) => (l.productId === productId ? { ...l, qty } : l)) : [...b, { productId, qty }];
      persist(next, [{ productId, qty }]);
      return next;
    });
  };
  const addItem = (productId: string, qty = 1) => {
    const cur = basket.find((l) => l.productId === productId)?.qty ?? 0;
    setQty(productId, cur + qty);
  };
  const clearBasket = () => {
    const old = basket;
    setBasket([]);
    persist([], old.map((l) => ({ ...l, qty: 0 })));
  };

  const setConsent = (c: Omit<Consent, "decided">) => {
    const v = { ...c, decided: true };
    setConsentState(v);
    localStorage.setItem("cookie_consent", JSON.stringify(v));
    setConsentOpen(false);
  };
  const setLocation = (l: Loc) => {
    setLocationState(l);
    localStorage.setItem("delivery_location", JSON.stringify(l));
  };
  const pushRecent = (q: string) => {
    if (!consent.marketing && !consent.analytics && !q) return;
    setRecent((r) => {
      const next = [q, ...r.filter((x) => x !== q)].slice(0, 6);
      localStorage.setItem("recent_searches", JSON.stringify(next));
      return next;
    });
  };
  const toggleDark = () => {
    setDark((d) => {
      localStorage.setItem("dark", JSON.stringify(!d));
      return !d;
    });
  };

  return (
    <AppCtx.Provider
      value={{
        user, authReady, basket, setQty, addItem, clearBasket, consent, setConsent,
        consentOpen, setConsentOpen, location, setLocation, recent, pushRecent, dark, toggleDark,
      }}
    >
      {children}
    </AppCtx.Provider>
  );
}

export function useApp() {
  const c = useContext(AppCtx);
  if (!c) throw new Error("useApp outside provider");
  return c;
}
