import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, X, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { catalogQuery, effective, fmt, lowestFor, pricesFor, type Product, type Store } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/app-state";
import { cn } from "@/lib/utils";

const STORE_DOMAINS: Record<string, string> = {
  carrefour: "carrefourksa.com",
  lulu: "luluhypermarket.com",
  panda: "panda.sa",
  noon: "noon.com",
  ninja: "ananinja.com",
  hungrystation: "hungerstation.com",
};

const STORE_COLORS: Record<string, string> = {
  carrefour: "#0E5AA7",
  lulu: "#E31E24",
  panda: "#00A651",
  noon: "#FEEE00",
  ninja: "#6C2BD9",
  hungrystation: "#FFC800",
};

export function StoreLogo({ storeId, size = 32 }: { storeId: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const domain = STORE_DOMAINS[storeId];
  if (domain && !failed) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-lg bg-white object-contain p-0.5 ring-1 ring-border"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-lg text-[10px] font-bold text-white ring-1 ring-border"
      style={{ width: size, height: size, background: STORE_COLORS[storeId] ?? "var(--color-primary)" }}
    >
      {storeId.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function ProductThumb({ product, className }: { product: Product; className?: string }) {
  const { lang } = useI18n();
  const image = getProductImage(product) ?? `/categories/${product.category}.png`;
  return (
    <img
      src={image}
      alt={lang === "ar" ? product.name_ar : product.name_en}
      className={cn("h-full w-full object-cover", className)}
      loading="lazy"
    />
  );
}

export function StoreBadge({ store, size = "sm" }: { store: Store; size?: "sm" | "md" }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold", size === "md" ? "text-base" : "text-sm")}>
      <StoreLogo storeId={store.id} size={size === "md" ? 36 : 28} />
      <span className="text-card-foreground">{store.name}</span>
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

function getProductImage(product: Product) {
  const record = product as Product & { image?: string; image_url?: string; imageUrl?: string; photo?: string; thumbnail?: string };
  return record.image || record.image_url || record.imageUrl || record.photo || record.thumbnail || null;
}

export function ProductCard({ product, layout = "grid" }: { product: Product; layout?: "grid" | "list" }) {
  const { t, lang } = useI18n();
  const { addItem } = useApp();
  const { data: cat } = useQuery(catalogQuery);
  const [showCompare, setShowCompare] = useState(false);
  const low = cat ? lowestFor(cat, product.id) : null;
  const allPrices = cat ? pricesFor(cat, product.id).filter((p) => p.stock > 0) : [];
  const highPrice = allPrices.length > 1 ? Math.max(...allPrices.map(effective)) : 0;
  const count = allPrices.length;
  const name = lang === "ar" ? product.name_ar : product.name_en;
  const image = getProductImage(product);
  const lowestPrice = low ? Number(low.promo_price ?? low.price) : null;
  const savings = highPrice > 0 && lowestPrice ? highPrice - lowestPrice : 0;
  const cheapestStore = cat?.stores.find((s) => s.id === low?.store_id);

  const add = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.id);
    toast.success(t("added"), { description: name });
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter") setShowCompare(true);
        }}
        className={cn(
          "group relative flex cursor-pointer overflow-hidden rounded-2xl bg-card p-3 text-card-foreground shadow-card ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-lg",
          layout === "grid" ? "h-full flex-col" : "items-center gap-3",
        )}
        onClick={() => setShowCompare(true)}
      >
        <div
          className={cn(
            "relative shrink-0 overflow-hidden rounded-xl bg-white",
            layout === "grid" ? "aspect-square w-full" : "h-16 w-16",
          )}
        >
          <img
            src={image ?? `/categories/${product.category}.png`}
            alt={name}
            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
            loading="lazy"
          />
          {savings > 0 && layout === "grid" && (
            <span className="absolute start-2 top-2 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-accent-foreground shadow-sm tabular">
              {t("saveAmount", { n: fmt(savings) })}
            </span>
          )}
        </div>

        <div className={cn("flex min-w-0 flex-1 flex-col", layout === "grid" && "mt-3")}>
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-card-foreground">{name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {product.size ? `${product.size} · ` : ""}
            {count} {t("stores")}
          </p>

          {cheapestStore && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <StoreLogo storeId={cheapestStore.id} size={18} />
              <span className="truncate">
                {t("cheapestStore")}: <span className="font-medium text-card-foreground">{cheapestStore.name}</span>
              </span>
            </p>
          )}

          <div className={cn("mt-auto flex items-center justify-between gap-2", layout === "grid" && "pt-3")}>
            {lowestPrice !== null ? (
              <p className="flex items-baseline gap-1">
                <span className="font-display text-lg font-bold text-primary tabular">{fmt(lowestPrice)}</span>
                <span className="text-xs text-muted-foreground">{t("sar")}</span>
              </p>
            ) : (
              <StockBadge stock={0} />
            )}
            {layout === "grid" && (
              <button
                type="button"
                onClick={add}
                className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" aria-hidden />
                {t("add")}
              </button>
            )}
          </div>
        </div>

        {layout === "list" && (
          <button
            type="button"
            onClick={add}
            aria-label={t("add")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {showCompare && <CompareModal product={product} onClose={() => setShowCompare(false)} />}
    </>
  );
}

export function CompareModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { t, lang } = useI18n();
  const { addItem } = useApp();
  const { data: cat } = useQuery(catalogQuery);
  if (!cat) return null;

  const name = lang === "ar" ? product.name_ar : product.name_en;
  const image = getProductImage(product);
  const rows = pricesFor(cat, product.id)
    .map((p) => {
      const store = cat.stores.find((s) => s.id === p.store_id)!;
      const unit = effective(p);
      const fee = Number(store.delivery_fee);
      return { p, store, unit, fee, total: unit + fee };
    })
    .sort((a, b) => (a.p.stock > 0 ? 0 : 1) - (b.p.stock > 0 ? 0 : 1) || a.total - b.total);

  const best = rows.find((r) => r.p.stock > 0);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-card p-5 shadow-2xl ring-1 ring-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-white">
              <img src={image ?? `/categories/${product.category}.png`} alt={name} className="h-full w-full object-cover" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-card-foreground">{name}</h2>
              <p className="text-xs text-muted-foreground">{product.brand} · {product.size}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label={t("closeBtn")} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="mt-4 mb-2 text-sm font-semibold text-card-foreground">{t("compareTitle")}</h3>
        <div className="grid gap-2">
          {rows.map((r, i) => (
            <div
              key={r.store.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl p-3 ring-1",
                i === 0 && r.p.stock > 0 ? "bg-primary/10 ring-2 ring-primary" : "bg-muted/50 ring-border",
              )}
            >
              <StoreLogo storeId={r.store.id} size={36} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-card-foreground">{r.store.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" /> {r.store.eta_min} {t("min")}
                </p>
              </div>
              <div className="text-end">
                {r.p.stock > 0 ? (
                  <>
                    <p className="font-display text-lg font-bold text-primary tabular">{fmt(r.unit)}</p>
                    <p className="text-xs text-muted-foreground tabular">+{fmt(r.fee)} {t("delivery")}</p>
                  </>
                ) : (
                  <StockBadge stock={0} />
                )}
              </div>
              {i === 0 && r.p.stock > 0 && (
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-bold text-success">{t("bestPrice")}</span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            if (best) {
              addItem(product.id);
              toast.success(t("added"), { description: name });
              onClose();
            }
          }}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-5 w-5" /> {t("add")}
        </button>
      </div>
    </div>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 font-display text-lg font-bold text-card-foreground">{children}</h2>;
}
