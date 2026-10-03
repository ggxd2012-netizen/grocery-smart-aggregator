import { effective, type Catalog, type Store } from "./data";

export type BasketLine = { productId: string; qty: number };

export type StoreTotal = {
  store: Store;
  subtotal: number;
  delivery: number;
  discount: number;
  couponCode: string | null;
  total: number;
  missing: string[];
  belowMin: boolean;
  lines: { productId: string; qty: number; unit: number }[];
};

function priceAt(cat: Catalog, productId: string, storeId: string) {
  const p = cat.prices.find((x) => x.product_id === productId && x.store_id === storeId);
  return p && p.stock > 0 ? effective(p) : null;
}

function totalFor(cat: Catalog, store: Store, lines: BasketLine[]): StoreTotal {
  let subtotal = 0;
  const missing: string[] = [];
  const out: StoreTotal["lines"] = [];
  for (const l of lines) {
    const unit = priceAt(cat, l.productId, store.id);
    if (unit == null) missing.push(l.productId);
    else {
      subtotal += unit * l.qty;
      out.push({ productId: l.productId, qty: l.qty, unit });
    }
  }
  const freeOver = store.free_delivery_over == null ? Infinity : Number(store.free_delivery_over);
  const delivery = out.length === 0 ? 0 : subtotal >= freeOver ? 0 : Number(store.delivery_fee);
  let discount = 0;
  let couponCode: string | null = null;
  for (const c of cat.coupons.filter((c) => c.store_id === store.id)) {
    if (subtotal >= Number(c.min_spend)) {
      const d = Math.min((subtotal * Number(c.percent_off)) / 100, c.max_off == null ? Infinity : Number(c.max_off));
      if (d > discount) {
        discount = d;
        couponCode = c.code;
      }
    }
  }
  return {
    store, subtotal, delivery, discount, couponCode,
    total: subtotal + delivery - discount,
    missing, belowMin: out.length > 0 && subtotal < Number(store.min_order), lines: out,
  };
}

export type SplitPlan = { parts: StoreTotal[]; total: number };

export function optimize(cat: Catalog, lines: BasketLine[]) {
  const singles = cat.stores.map((s) => totalFor(cat, s, lines)).sort((a, b) => {
    if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
    return a.total - b.total;
  });
  const complete = singles.filter((s) => s.missing.length === 0 && !s.belowMin);
  const bestSingle = complete[0] ?? null;

  let bestSplit: SplitPlan | null = null;
  for (let i = 0; i < cat.stores.length; i++) {
    for (let j = i + 1; j < cat.stores.length; j++) {
      const a = cat.stores[i]!, b = cat.stores[j]!;
      const la: BasketLine[] = [], lb: BasketLine[] = [];
      let ok = true;
      for (const l of lines) {
        const pa = priceAt(cat, l.productId, a.id), pb = priceAt(cat, l.productId, b.id);
        if (pa == null && pb == null) { ok = false; break; }
        if (pb == null || (pa != null && pa <= pb)) la.push(l); else lb.push(l);
      }
      if (!ok || !la.length || !lb.length) continue;
      const ta = totalFor(cat, a, la), tb = totalFor(cat, b, lb);
      if (ta.belowMin || tb.belowMin) continue;
      const total = ta.total + tb.total;
      if (!bestSplit || total < bestSplit.total) bestSplit = { parts: [ta, tb], total };
    }
  }
  const savings = bestSingle && bestSplit ? bestSingle.total - bestSplit.total : 0;
  return { singles, bestSingle, bestSplit, savings };
}
