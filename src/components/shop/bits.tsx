import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { catalogQuery, fmt, lowestFor, pricesFor, type Product, type Store } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/app-state";
import { cn } from "@/lib/utils";

export function StoreBadge({ store, size = "sm" }: { store: Store; size?: "sm" | "md" }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold", size === "md" ? "text-base" : "text-sm")}>
      <span
        className={cn("grid place-items-center rounded-lg font-display font-bold text-foreground ring-1 ring-border", size === "md" ? "h-9 w-9 text-sm" : "h-7 w-7 text-xs")}
        style={{ backgroundColor: store.color }}
      >
        <span className="rounded bg-card/90 px-1 leading-tight">{store.name[0]}</span>
      </span>
      {store.name}
    </span>
  );
}

export function StockBadge({ stock }: { stock: number }) {
  const { t } = useI18n();
  if (stock <= 0)
    return <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">{t("outOfStock")}</span>;
  if (stock <= 3)
    return <span className="rounded-full bg-warning/20 px-2 py-0.5 text-xs font-medium text-warning-foreground">{t("onlyLeft", { n: stock })}</span>;
  return <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success">{t("inStock")}</span>;
}

export function ProductCard({ product, layout = "grid" }: { product: Product; layout?: "grid" | "list" }) {
  const { t, lang } = useI18n();
  const { addItem } = useApp();
  const { data: cat } = useQuery(catalogQuery);
  const low = cat ? lowestFor(cat, product.id) : null;
  const count = cat ? pricesFor(cat, product.id).filter((p) => p.stock > 0).length : 0;
  const name = lang === "ar" ? product.name_ar : product.name_en;

  const add = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product.id);
    toast.success(t("added"), { description: name });
  };

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      className={cn(
        "group relative rounded-2xl bg-card p-3 shadow-card ring-1 ring-border transition hover:-translate-y-0.5",
        layout === "list" && "flex items-center gap-3",
      )}
    >
      <div className={cn("grid place-items-center rounded-xl bg-muted text-5xl", layout === "grid" ? "aspect-square" : "h-16 w-16 shrink-0 text-3xl")}>
        {product.emoji}
      </div>
      <div className={cn("min-w-0", layout === "grid" && "mt-2")}>
        <p className="line-clamp-2 text-sm font-medium leading-snug">{name}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {count} {t("stores")}
        </p>
        {low && (
          <p className="mt-1 tabular">
            <span className="text-xs text-muted-foreground">{t("from")} </span>
            <span className="font-display text-lg font-bold text-primary">{fmt(Number(low.promo_price ?? low.price))}</span>
            <span className="text-xs text-muted-foreground"> SAR</span>
          </p>
        )}
      </div>
      <button
        onClick={add}
        aria-label={t("add")}
        className={cn("grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-card transition hover:scale-105", layout === "grid" ? "absolute end-3 top-3" : "ms-auto shrink-0")}
      >
        <Plus className="h-5 w-5" />
      </button>
    </Link>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 font-display text-lg font-bold">{children}</h2>;
}
