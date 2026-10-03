import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { z } from "zod";
import { CAT_EMOJI, CATEGORIES, TAGS, catalogQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { ProductCard } from "@/components/shop/bits";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const search = z.object({ c: z.string().optional(), tag: z.string().optional() });

export const Route = createFileRoute("/categories")({
  validateSearch: (s) => search.parse(s),
  head: () => ({
    meta: [
      { title: "Categories & dietary filters — Salla Smart" },
      { name: "description", content: "Browse groceries by category and filter by organic, gluten-free, keto, lactose-free, halal and sugar-free." },
      { property: "og:title", content: "Grocery categories — Salla Smart" },
      { property: "og:description", content: "Browse and filter groceries by diet across Saudi delivery apps." },
    ],
  }),
  component: Categories,
});

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("shrink-0 rounded-full border px-3 py-1.5 text-sm transition", active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted")}>
      {children}
    </button>
  );
}

function EmptyState({ category, filter }: { category?: string; filter?: string }) {
  const { t } = useI18n();
  const navigate = useNavigate({ from: "/categories" });

  return (
    <div className="grid place-items-center py-20 text-center">
      <span className="text-7xl">🔍</span>
      <h2 className="mt-4 font-display text-xl font-bold">{t("noResults")}</h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        {category && filter
          ? `No products found in ${category} with the "${filter}" filter.`
          : category
            ? `No products found in this category.`
            : filter
              ? `No products match this filter.`
              : "No products available."}
      </p>
      <Button onClick={() => navigate({ search: { c: undefined, tag: undefined } })} className="mt-6">
        {t("categories")}
      </Button>
    </div>
  );
}

function Categories() {
  const { t } = useI18n();
  const { c, tag } = Route.useSearch();
  const navigate = useNavigate({ from: "/categories" });
  const { data: cat, isLoading } = useQuery(catalogQuery);
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const items = (cat?.products ?? []).filter((p) => (!c || p.category === c) && (!tag || p.tags.includes(tag)));

  return (
    <div className="space-y-4 pb-6">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
        <Chip active={!c} onClick={() => navigate({ search: (s) => ({ ...s, c: undefined }) })}>{t("all")}</Chip>
        {CATEGORIES.map((k) => (
          <Chip key={k} active={c === k} onClick={() => navigate({ search: (s) => ({ ...s, c: k }) })}>
            {CAT_EMOJI[k]} {t(`cat_${k}` as never)}
          </Chip>
        ))}
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("dietary")}</p>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
          {TAGS.map((k) => (
            <Chip key={k} active={tag === k} onClick={() => navigate({ search: (s) => ({ ...s, tag: tag === k ? undefined : k }) })}>
              {t(`tag_${k}` as never)}
            </Chip>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} {t("items")}</p>
        <div className="flex rounded-full border p-0.5">
          <button aria-label={t("grid")} onClick={() => setLayout("grid")} className={cn("rounded-full p-1.5", layout === "grid" && "bg-secondary")}>
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button aria-label={t("list")} onClick={() => setLayout("list")} className={cn("rounded-full p-1.5", layout === "list" && "bg-secondary")}>
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState category={c} filter={tag} />
      ) : (
        <div className={layout === "grid" ? "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" : "grid gap-2"}>
          {items.map((p) => (
            <ProductCard key={p.id} product={p} layout={layout} />
          ))}
        </div>
      )}
    </div>
  );
}
