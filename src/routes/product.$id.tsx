import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Bell, BellRing, Clock, LayoutGrid, List, Plus, Star, TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { catalogQuery, effective, fmt, historyQuery, pricesFor } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/app-state";
import { StockBadge, StoreBadge } from "@/components/shop/bits";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Compare prices — Salla Smart" },
      { name: "description", content: "Price, delivery fee, ETA and 90-day price history across Saudi grocery apps." },
      { property: "og:title", content: "Compare this product's price — Salla Smart" },
      { property: "og:description", content: "See which store sells it cheapest, delivery included." },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { t, lang } = useI18n();
  const { addItem, user } = useApp();
  const qc = useQueryClient();
  const { data: cat } = useQuery(catalogQuery);
  const { data: hist } = useQuery(historyQuery(id));
  const [layout, setLayout] = useState<"list" | "grid">("list");
  const [range, setRange] = useState<30 | 90>(30);

  const wish = useQuery({
    queryKey: ["wish", id, user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("wishlist").select("product_id").eq("product_id", id).maybeSingle()).data,
  });
  const ratings = useQuery({
    queryKey: ["fresh", id],
    queryFn: async () => (await supabase.from("freshness_ratings").select("store_id, rating, user_id").eq("product_id", id)).data ?? [],
  });

  const product = cat?.products.find((p) => p.id === id);
  const rows = useMemo(() => {
    if (!cat) return [];
    return pricesFor(cat, id)
      .map((p) => {
        const store = cat.stores.find((s) => s.id === p.store_id)!;
        const unit = effective(p);
        const fee = Number(store.delivery_fee);
        return { p, store, unit, fee, total: unit + fee };
      })
      .sort((a, b) => (a.p.stock > 0 ? 0 : 1) - (b.p.stock > 0 ? 0 : 1) || a.total - b.total);
  }, [cat, id]);

  const chart = useMemo(() => {
    if (!hist || !cat) return { data: [], low: 0, high: 0 };
    const cutoff = new Date(Date.now() - range * 864e5).toISOString().slice(0, 10);
    const byDay = new Map<string, Record<string, number | string>>();
    let low = Infinity, high = 0;
    for (const h of hist) {
      if (h.day < cutoff) continue;
      const r = byDay.get(h.day) ?? { day: h.day.slice(5) };
      r[h.store_id!] = Number(h.price);
      byDay.set(h.day, r);
      low = Math.min(low, Number(h.price));
      high = Math.max(high, Number(h.price));
    }
    return { data: [...byDay.values()], low, high };
  }, [hist, cat, range]);

  if (!cat) return <div className="py-20 text-center text-muted-foreground">…</div>;
  if (!product) return <div className="py-20 text-center">404 · <Link to="/" className="text-primary underline">{t("home")}</Link></div>;

  const name = lang === "ar" ? product.name_ar : product.name_en;
  const best = rows.find((r) => r.p.stock > 0);
  const nowLow = best ? best.unit : 0;
  const alert = chart.high > 0 && nowLow <= chart.low * 1.03 ? "low" : chart.high > 0 && nowLow >= chart.high * 0.97 ? "high" : null;

  const toggleWish = async (): Promise<void> => {
    if (!user) { toast(t("signIn")); return; }
    if (wish.data) await supabase.from("wishlist").delete().eq("product_id", id);
    else await supabase.from("wishlist").insert({ user_id: user.id, product_id: id, target_price: nowLow });
    qc.invalidateQueries({ queryKey: ["wish"] });
  };

  const rate = async (storeId: string, rating: number) => {
    if (!user) return;
    await supabase.from("freshness_ratings").upsert({ user_id: user.id, product_id: id, store_id: storeId, rating }, { onConflict: "user_id,product_id,store_id" });
    qc.invalidateQueries({ queryKey: ["fresh", id] });
  };

  return (
    <div className="space-y-6 pb-6">
      <section className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-card ring-1 ring-border sm:flex-row sm:items-center">
        <div className="grid h-32 w-32 shrink-0 place-items-center self-center rounded-3xl bg-muted text-7xl">{product.emoji}</div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{product.brand} · {product.size}</p>
          <h1 className="mt-1 font-display text-2xl font-bold leading-tight">{name}</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {product.tags.map((tg) => <span key={tg} className="rounded-full bg-secondary px-2 py-0.5 text-xs">{t(`tag_${tg}` as never)}</span>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => { addItem(id); toast.success(t("added")); }}><Plus className="h-4 w-4" />{t("add")}</Button>
            <Button variant="outline" onClick={toggleWish}>
              {wish.data ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              {wish.data ? t("watching") : t("watch")}
            </Button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{t("compare")}</h2>
          <div className="flex rounded-full border p-0.5">
            <button aria-label={t("list")} onClick={() => setLayout("list")} className={cn("rounded-full p-1.5", layout === "list" && "bg-secondary")}><List className="h-4 w-4" /></button>
            <button aria-label={t("grid")} onClick={() => setLayout("grid")} className={cn("rounded-full p-1.5", layout === "grid" && "bg-secondary")}><LayoutGrid className="h-4 w-4" /></button>
          </div>
        </div>
        <div className={layout === "grid" ? "grid grid-cols-2 gap-3 md:grid-cols-3" : "grid gap-2"}>
          {rows.map((r, i) => (
            <div key={r.store.id} className={cn("rounded-2xl bg-card p-4 ring-1 ring-border", i === 0 && r.p.stock > 0 && "ring-2 ring-primary", r.p.stock <= 0 && "opacity-60")}>
              <div className="flex items-center justify-between gap-2">
                <StoreBadge store={r.store} />
                <StockBadge stock={r.p.stock} />
              </div>
              <div className={cn("mt-3 grid gap-2 text-sm tabular", layout === "list" ? "grid-cols-4" : "grid-cols-2")}>
                <div><p className="text-xs text-muted-foreground">{t("base")}</p>
                  <p className="font-semibold">{fmt(r.unit)}{r.p.promo_price != null && <span className="ms-1 text-xs text-muted-foreground line-through">{fmt(Number(r.p.price))}</span>}</p></div>
                <div><p className="text-xs text-muted-foreground">{t("delivery")}</p><p className="font-semibold">+{fmt(r.fee)}</p></div>
                <div><p className="text-xs text-muted-foreground">{t("eta")}</p><p className="flex items-center gap-1 font-semibold"><Clock className="h-3.5 w-3.5" />{r.store.eta_min} {t("min")}</p></div>
                <div><p className="text-xs text-muted-foreground">{t("total")}</p><p className="font-display text-lg font-bold text-primary">{fmt(r.total)}</p></div>
              </div>
              {product.is_fresh && (
                <FreshRow
                  ratings={(ratings.data ?? []).filter((x) => x.store_id === r.store.id)}
                  mine={(ratings.data ?? []).find((x) => x.store_id === r.store.id && x.user_id === user?.id)?.rating}
                  canRate={!!user}
                  onRate={(n) => rate(r.store.id, n)}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{t("priceHistory")}</h2>
          <div className="flex rounded-full border p-0.5 text-xs">
            {([30, 90] as const).map((d) => (
              <button key={d} onClick={() => setRange(d)} className={cn("rounded-full px-3 py-1", range === d && "bg-secondary font-semibold")}>{d} {t("days")}</button>
            ))}
          </div>
        </div>
        {alert && (
          <p className={cn("mb-3 flex items-center gap-2 rounded-xl px-3 py-2 text-sm", alert === "low" ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground")}>
            {alert === "low" ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            {alert === "low" ? t("nearLow") : t("nearHigh")}
          </p>
        )}
        <div className="mb-2 flex gap-4 text-sm tabular">
          <span>{t("lowest")}: <b>{fmt(chart.low === Infinity ? 0 : chart.low)}</b></span>
          <span>{t("highest")}: <b>{fmt(chart.high)}</b></span>
        </div>
        <div className="h-64" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chart.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} minTickGap={24} />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={40} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }} />
              {cat.stores.map((s) => (
                <Line key={s.id} type="monotone" dataKey={s.id} name={s.name} stroke={s.color} dot={false} strokeWidth={2} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function FreshRow({ ratings, mine, canRate, onRate }: { ratings: { rating: number }[]; mine?: number | undefined; canRate: boolean; onRate: (n: number) => void }) {
  const { t } = useI18n();
  const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
  return (
    <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
      <span className="text-muted-foreground">{t("freshness")}: <b className="text-foreground">{avg ? avg.toFixed(1) : "–"}</b> ({ratings.length})</span>
      {canRate ? (
        <span className="flex">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} aria-label={`${n}`} onClick={() => onRate(n)}>
              <Star className={cn("h-4 w-4", (mine ?? 0) >= n ? "fill-accent text-accent" : "text-muted-foreground")} />
            </button>
          ))}
        </span>
      ) : (
        <Link to="/auth" className="text-primary underline">{t("signInToRate")}</Link>
      )}
    </div>
  );
}
