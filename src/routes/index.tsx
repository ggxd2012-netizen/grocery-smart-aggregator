import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BadgePercent } from "lucide-react";
import { CAT_EMOJI, CATEGORIES, catalogQuery, effective, fmt, pricesFor } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { ProductCard, SectionTitle } from "@/components/shop/bits";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Salla Smart — Compare grocery prices across Saudi apps" },
      { name: "description", content: "One search across Noon, Ninja, Carrefour, Panda, LuLu and HungerStation. Find the cheapest basket, delivery included." },
      { property: "og:title", content: "Salla Smart — Compare grocery prices" },
      { property: "og:description", content: "Find the cheapest grocery basket across Saudi delivery apps." },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, lang } = useI18n();
  const { data: cat, isLoading } = useQuery(catalogQuery);

  const gaps = cat
    ? cat.products
        .map((p) => {
          const ps = pricesFor(cat, p.id).filter((x) => x.stock > 0).map(effective);
          return { p, gap: ps.length > 1 ? Math.max(...ps) - Math.min(...ps) : 0 };
        })
        .sort((a, b) => b.gap - a.gap)
        .slice(0, 8)
    : [];

  return (
    <div className="space-y-8 pb-6">
      <section className="bg-hero relative overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-card md:p-10">
        <p className="text-sm opacity-80">{cat?.stores.length ?? 6} {t("stores")} · SAR</p>
        <h1 className="mt-2 max-w-md font-display text-3xl font-extrabold leading-tight md:text-5xl">{t("tagline")}</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {cat?.stores.map((s) => (
            <span key={s.id} className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">{s.name}</span>
          ))}
        </div>
        <span aria-hidden className="pointer-events-none absolute -bottom-6 end-4 text-[7rem] opacity-90 md:text-[10rem]">🧺</span>
      </section>

      <section>
        <SectionTitle>{t("browseCats")}</SectionTitle>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {CATEGORIES.map((c) => (
            <Link key={c} to="/categories" search={{ c }} className="flex w-20 shrink-0 flex-col items-center gap-1.5 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-secondary text-3xl">{CAT_EMOJI[c]}</span>
              <span className="text-xs font-medium leading-tight">{t(`cat_${c}` as never)}</span>
            </Link>
          ))}
        </div>
      </section>

      {cat && cat.coupons.length > 0 && (
        <section>
          <SectionTitle>{t("coupons")}</SectionTitle>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {cat.coupons.map((c) => {
              const s = cat.stores.find((x) => x.id === c.store_id);
              return (
                <div key={c.id} className="bg-savings w-64 shrink-0 rounded-2xl p-4 text-accent-foreground">
                  <p className="flex items-center gap-1.5 text-xs font-semibold"><BadgePercent className="h-4 w-4" />{s?.name}</p>
                  <p className="mt-1 text-sm font-medium">{lang === "ar" ? c.label_ar : c.label_en}</p>
                  <p className="mt-2 inline-block rounded-md border border-dashed border-accent-foreground/40 px-2 py-0.5 font-mono text-xs">{c.code}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <SectionTitle>{t("topDeals")}</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading && Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />)}
          {gaps.map(({ p, gap }) => (
            <div key={p.id} className="relative">
              <ProductCard product={p} />
              {gap > 0 && (
                <span className="absolute start-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground tabular">
                  ↕ {fmt(gap)}
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">{t("sample")}</p>
      </section>
    </div>
  );
}
