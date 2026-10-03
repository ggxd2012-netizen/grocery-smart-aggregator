import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bell, Cookie, LogOut, MapPin, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { catalogQuery, fmt, lowestFor } from "@/lib/data";
import type { BasketLine } from "@/lib/optimizer";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My account — Salla Smart" },
      { name: "description", content: "Saved addresses, order history, price-drop wishlist and notification preferences." },
      { property: "og:title", content: "My account — Salla Smart" },
      { property: "og:description", content: "Manage addresses, orders and price alerts." },
    ],
  }),
  component: Profile,
});

function Card({ title, icon: Icon, children }: { title: string; icon: typeof Bell; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-card p-5 shadow-card ring-1 ring-border">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Icon className="h-5 w-5 text-primary" />{title}</h2>
      {children}
    </section>
  );
}

function Profile() {
  const { t, lang } = useI18n();
  const { user, authReady, setConsentOpen, addItem } = useApp();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: cat } = useQuery(catalogQuery);
  const [label, setLabel] = useState("Home");
  const [details, setDetails] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const uid = user?.id;
  const profile = useQuery({ queryKey: ["profile", uid], enabled: !!uid, queryFn: async () => (await supabase.from("profiles").select("*").maybeSingle()).data });
  const addresses = useQuery({ queryKey: ["addresses", uid], enabled: !!uid, queryFn: async () => (await supabase.from("addresses").select("*").order("created_at")).data ?? [] });
  const orders = useQuery({ queryKey: ["orders", uid], enabled: !!uid, queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(10)).data ?? [] });
  const wish = useQuery({ queryKey: ["wish", "all", uid], enabled: !!uid, queryFn: async () => (await supabase.from("wishlist").select("*")).data ?? [] });

  if (!authReady) return null;
  if (!user)
    return (
      <div className="mx-auto grid max-w-sm place-items-center gap-4 py-16 text-center">
        <span className="text-6xl">👤</span>
        <p className="text-muted-foreground">{t("guestNote")}</p>
        <Button asChild size="lg"><Link to="/auth">{t("signIn")}</Link></Button>
        <Button variant="ghost" onClick={() => setConsentOpen(true)}><Cookie className="h-4 w-4" />{t("cookieSettings")}</Button>
      </div>
    );

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("addresses").insert({ user_id: user.id, label, details, lat: coords?.lat ?? null, lng: coords?.lng ?? null });
    if (error) { toast.error(error.message); return; }
    setDetails(""); setCoords(null);
    qc.invalidateQueries({ queryKey: ["addresses"] });
  };
  const gps = () => navigator.geolocation?.getCurrentPosition((p) => setCoords({ lat: p.coords.latitude, lng: p.coords.longitude }));

  const setNotify = async (field: "notify_whatsapp" | "notify_push" | "notify_email", v: boolean) => {
    await supabase.from("profiles").update({ [field]: v } as { notify_push: boolean }).eq("id", user.id);
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const pname = (id: string) => {
    const p = cat?.products.find((x) => x.id === id);
    return p ? (lang === "ar" ? p.name_ar : p.name_en) : id;
  };

  return (
    <div className="grid gap-4 pb-6 md:grid-cols-2">
      <section className="bg-hero rounded-3xl p-5 text-primary-foreground md:col-span-2">
        <p className="text-sm opacity-80">{user.email}</p>
        <h1 className="font-display text-2xl font-bold">{profile.data?.display_name ?? "…"}</h1>
      </section>

      <Card title={t("addresses")} icon={MapPin}>
        <div className="grid gap-2">
          {addresses.data?.map((a) => (
            <div key={a.id} className="flex items-center gap-2 rounded-xl bg-muted p-3 text-sm">
              <div className="flex-1"><b>{a.label}</b> · {a.details}{a.lat != null && <span className="block text-xs text-muted-foreground">📍 {a.lat.toFixed(4)}, {a.lng?.toFixed(4)}</span>}</div>
              <button aria-label="delete" onClick={async () => { await supabase.from("addresses").delete().eq("id", a.id); qc.invalidateQueries({ queryKey: ["addresses"] }); }}><Trash2 className="h-4 w-4 text-muted-foreground" /></button>
            </div>
          ))}
        </div>
        <form onSubmit={addAddress} className="mt-3 grid gap-2">
          <div className="flex gap-2">
            {["Home", "Work", "Family"].map((l) => (
              <button type="button" key={l} onClick={() => setLabel(l)} className={`rounded-full border px-3 py-1 text-xs ${label === l ? "border-primary bg-secondary" : ""}`}>{l}</button>
            ))}
          </div>
          <Input required placeholder={t("details")} value={details} onChange={(e) => setDetails(e.target.value)} />
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={gps}><MapPin className="h-4 w-4" />{coords ? `${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)}` : t("useGps")}</Button>
            <Button type="submit" size="sm" className="ms-auto">{t("addAddress")}</Button>
          </div>
        </form>
      </Card>

      <Card title={t("orders")} icon={RotateCcw}>
        {!orders.data?.length && <p className="text-sm text-muted-foreground">{t("noOrders")}</p>}
        <div className="grid gap-2">
          {orders.data?.map((o) => {
            const items = o.items as unknown as BasketLine[];
            return (
              <div key={o.id} className="rounded-xl bg-muted p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-GB")} · {o.strategy}</span>
                  <b className="tabular">{fmt(Number(o.total))} SAR</b>
                </div>
                <p className="mt-1 truncate text-xs">{items.map((i) => pname(i.productId)).join(" · ")}</p>
                <Button size="sm" variant="secondary" className="mt-2" onClick={() => { items.forEach((i) => addItem(i.productId, i.qty)); toast.success(t("added")); }}>
                  <RotateCcw className="h-3.5 w-3.5" />{t("reorder")}
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title={t("wishlist")} icon={Bell}>
        {!wish.data?.length && <p className="text-sm text-muted-foreground">—</p>}
        <div className="grid gap-2">
          {wish.data?.map((w) => {
            const low = cat ? lowestFor(cat, w.product_id!) : null;
            const now = low ? Number(low.promo_price ?? low.price) : 0;
            const dropped = w.target_price != null && now < Number(w.target_price);
            return (
              <Link key={w.product_id} to="/product/$id" params={{ id: w.product_id! }} className="flex items-center justify-between rounded-xl bg-muted p-3 text-sm">
                <span className="truncate">{pname(w.product_id!)}</span>
                <span className={`tabular font-semibold ${dropped ? "text-success" : ""}`}>{fmt(now)}{dropped && " ↓"}</span>
              </Link>
            );
          })}
        </div>
      </Card>

      <Card title={t("notifications")} icon={Bell}>
        <div className="space-y-3 text-sm">
          <label className="flex items-center justify-between">WhatsApp<Switch checked={!!profile.data?.notify_whatsapp} onCheckedChange={(v) => setNotify("notify_whatsapp", v)} /></label>
          <label className="flex items-center justify-between">Push<Switch checked={!!profile.data?.notify_push} onCheckedChange={(v) => setNotify("notify_push", v)} /></label>
          <label className="flex items-center justify-between">Email<Switch checked={!!profile.data?.notify_email} onCheckedChange={(v) => setNotify("notify_email", v)} /></label>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setConsentOpen(true)}><Cookie className="h-4 w-4" />{t("cookieSettings")}</Button>
          <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="h-4 w-4" />{t("signOut")}</Button>
        </div>
      </Card>
    </div>
  );
}
