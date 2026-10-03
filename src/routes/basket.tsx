import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { ExternalLink, Minus, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { catalogQuery, fmt } from "@/lib/data";
import { optimize, type StoreTotal } from "@/lib/optimizer";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/app-state";
import { StoreBadge } from "@/components/shop/bits";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/basket")({
  head: () => ({
    meta: [
      { title: "Smart Basket optimizer — Salla Smart" },
      { name: "description", content: "See your basket total at every store and how much you save by splitting your order." },
      { property: "og:title", content: "Smart Basket — Salla Smart" },
      { property: "og:description", content: "Cheapest single store vs. best split order, delivery and coupons included." },
    ],
  }),
  component: Basket,
});

function Basket() {
  const { t, lang } = useI18n();
  const { basket, setQty, user, clearBasket } = useApp();
  const qc = useQueryClient();
  const { data: cat } = useQuery(catalogQuery);
  const res = useMemo(() => (cat && basket.length ? optimize(cat, basket) : null), [cat, basket]);

  if (!basket.length)
    return (
      <div className="grid place-items-center py-20 text-center">
        <span className="text-7xl">🧺</span>
        <h1 className="mt-4 font-display text-2xl font-bold">{t("emptyBasket")}</h1>
        <p className="mt-2 max-w-xs text-muted-foreground">{t("emptyBasketHint")}</p>
        <Button asChild className="mt-6"><Link to="/categories">{t("categories")}</Link></Button>
      </div>
    );
  if (!cat || !res) return null;

  const plan: StoreTotal[] = res.bestSplit && res.savings > 0 ? res.bestSplit.parts : res.bestSingle ? [res.bestSingle] : [];
  const checkout = async () => {
    for (const p of plan) window.open(p.store.deeplink, "_blank", "noopener");
    if (user) {
      const total = plan.reduce((s, p) => s + p.total, 0);
      await supabase.from("orders").insert({
        user_id: user.id,
        strategy: plan.length > 1 ? "split" : "single",
        total,
        items: basket,
      });
      qc.invalidateQueries({ queryKey: ["orders"] });
    }
    toast.success(t("checkout"));
  };

  const pname = (id: string) => {
    const p = cat.products.find((x) => x.id === id);
    return p ? `${p.emoji} ${lang === "ar" ? p.name_ar : p.name_en}` : id;
  };

  return (
    <div className="grid gap-6 pb-6 lg:grid-cols-[1fr_1.3fr]">
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold">{t("basket")}</h1>
          <button onClick={clearBasket} className="text-sm text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
        <div className="grid gap-2">
          {basket.map((l) => (
            <div key={l.productId} className="flex items-center gap-3 rounded-2xl bg-card p-3 ring-1 ring-border">
              <Link to="/product/$id" params={{ id: l.productId }} className="min-w-0 flex-1 truncate text-sm font-medium">{pname(l.productId)}</Link>
              <div className="flex items-center gap-1 rounded-full border">
                <button aria-label="-" onClick={() => setQty(l.productId, l.qty - 1)} className="p-1.5"><Minus className="h-4 w-4" /></button>
                <span className="w-6 text-center text-sm tabular">{l.qty}</span>
                <button aria-label="+" onClick={() => setQty(l.productId, l.qty + 1)} className="p-1.5"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
        {!user && <p className="mt-3 rounded-xl bg-muted p-3 text-xs text-muted-foreground">{t("guestNote")} <Link to="/auth" className="text-primary underline">{t("signIn")}</Link></p>}
      </section>

      <section className="space-y-4">
        <div className={cn("rounded-3xl p-5", res.savings > 0.01 ? "bg-savings text-accent-foreground" : "bg-secondary text-secondary-foreground")}>
          <p className="flex items-center gap-2 font-display text-lg font-bold">
            <Sparkles className="h-5 w-5" />
            {res.savings > 0.01 ? t("saveBySplit", { n: fmt(res.savings) }) : t("splitNotWorth")}
          </p>
          <div className="mt-3 grid gap-2">
            {plan.map((p) => (
              <div key={p.store.id} className="rounded-2xl bg-card/80 p-3 text-card-foreground">
                <div className="flex items-center justify-between">
                  <StoreBadge store={p.store} />
                  <span className="font-display font-bold tabular">{fmt(p.total)} SAR</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{p.lines.map((l) => pname(l.productId)).join(" · ")}</p>
              </div>
            ))}
          </div>
          <Button onClick={checkout} className="mt-4 w-full" size="lg">
            {t("checkout")} <ExternalLink className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <h2 className="mb-2 font-display text-lg font-bold">{t("allStores")}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {res.singles.map((s) => (
              <div key={s.store.id} className={cn("rounded-2xl bg-card p-4 ring-1 ring-border", res.bestSingle?.store.id === s.store.id && "ring-2 ring-primary")}>
                <div className="flex items-center justify-between">
                  <StoreBadge store={s.store} />
                  <span className="font-display text-lg font-bold tabular">{fmt(s.total)}</span>
                </div>
                <dl className="mt-2 space-y-0.5 text-xs text-muted-foreground tabular">
                  <div className="flex justify-between"><dt>{t("base")}</dt><dd>{fmt(s.subtotal)}</dd></div>
                  <div className="flex justify-between"><dt>{t("delivery")}</dt><dd>{s.delivery ? `+${fmt(s.delivery)}` : t("free")}</dd></div>
                  {s.discount > 0 && <div className="flex justify-between text-success"><dt>{t("couponApplied")} {s.couponCode}</dt><dd>−{fmt(s.discount)}</dd></div>}
                  <div className="flex justify-between"><dt>{t("eta")}</dt><dd>{s.store.eta_min} {t("min")}</dd></div>
                </dl>
                {s.missing.length > 0 && <p className="mt-2 text-xs font-medium text-destructive">{t("missing", { n: s.missing.length })}</p>}
                {s.belowMin && <p className="mt-2 text-xs font-medium text-warning-foreground">{t("belowMin")} · {t("minOrder", { n: s.store.min_order })}</p>}
                {res.bestSingle?.store.id === s.store.id && <p className="mt-2 text-xs font-semibold text-primary">★ {t("bestSingle")}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
