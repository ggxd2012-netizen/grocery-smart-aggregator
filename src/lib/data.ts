import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { createSampleCatalog, createSampleHistory } from "./sample-data";

export type Store = Tables<"stores">;
export type Product = Tables<"products">;
export type Price = Tables<"product_prices">;
export type Coupon = Tables<"coupons">;

export type Catalog = {
  stores: Store[];
  products: Product[];
  prices: Price[];
  coupons: Coupon[];
};

const hasSupabaseConfig = () => {
  const url = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SUPABASE_URL : undefined;
  const key = typeof import.meta !== "undefined" ? import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY : undefined;
  return Boolean((url && key) || (typeof process !== "undefined" && process.env?.SUPABASE_URL && process.env?.SUPABASE_PUBLISHABLE_KEY));
};

async function fetchCatalogFromSupabase(): Promise<Catalog> {
  const [s, p, pr, c] = await Promise.all([
    supabase.from("stores").select("*"),
    supabase.from("products").select("*").order("name_en"),
    supabase.from("product_prices").select("*"),
    supabase.from("coupons").select("*"),
  ]);
  const err = s.error || p.error || pr.error || c.error;
  if (err) throw err;
  return { stores: s.data ?? [], products: p.data ?? [], prices: pr.data ?? [], coupons: c.data ?? [] };
}

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  staleTime: 5 * 60_000,
  queryFn: async (): Promise<Catalog> => {
    if (!hasSupabaseConfig()) return createSampleCatalog();

    try {
      const catalog = await fetchCatalogFromSupabase();
      if (catalog.products.length || catalog.stores.length || catalog.prices.length) return catalog;
    } catch (error) {
      console.warn("Falling back to sample catalog because Supabase is unavailable or empty:", error);
    }

    return createSampleCatalog();
  },
});

export const historyQuery = (productId: string) =>
  queryOptions({
    queryKey: ["history", productId],
    queryFn: async () => {
      if (!hasSupabaseConfig()) return createSampleHistory(productId);

      try {
        const { data, error } = await supabase
          .from("price_history")
          .select("store_id, day, price")
          .eq("product_id", productId)
          .order("day");
        if (error) throw error;
        return data ?? createSampleHistory(productId);
      } catch (error) {
        console.warn("Price history unavailable, using demo values:", error);
        return createSampleHistory(productId);
      }
    },
  });

export const CATEGORIES = ["dairy", "produce", "meat", "pantry", "beverages", "bakery", "household"] as const;
export const CAT_EMOJI: Record<string, string> = {
  dairy: "🥛", produce: "🥬", meat: "🥩", pantry: "🫙", beverages: "🧃", bakery: "🥐", household: "🧽",
};
export const TAGS = ["organic", "gluten_free", "keto", "lactose_free", "halal", "sugar_free"] as const;

export const effective = (p: Price) => Number(p.promo_price ?? p.price);
export const fmt = (n: number) => n.toFixed(2);

export function pricesFor(cat: Catalog, productId: string) {
  return cat.prices.filter((p) => p.product_id === productId);
}

export function lowestFor(cat: Catalog, productId: string) {
  const ps = pricesFor(cat, productId).filter((p) => p.stock > 0);
  if (!ps.length) return null;
  return ps.reduce((a, b) => (effective(a) <= effective(b) ? a : b));
}
