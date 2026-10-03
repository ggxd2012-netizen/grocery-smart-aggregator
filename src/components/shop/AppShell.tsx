import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Camera, Home, LayoutGrid, MapPin, Mic, Moon, ScanLine, Search, ShoppingBasket, Sun, User } from "lucide-react";
import { catalogQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/app-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CookieBanner } from "./CookieBanner";

const DISTRICTS = ["Riyadh · Al Olaya", "Riyadh · Al Malqa", "Jeddah · Al Rawdah", "Dammam · Al Faisaliyah", "Makkah · Al Aziziyah"];

function LocationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n();
  const { setLocation, location } = useApp();
  const [busy, setBusy] = useState(false);
  const gps = () => {
    if (!navigator.geolocation) return;
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocation({ label: `📍 ${p.coords.latitude.toFixed(3)}, ${p.coords.longitude.toFixed(3)}`, lat: p.coords.latitude, lng: p.coords.longitude });
        setBusy(false);
        onOpenChange(false);
      },
      () => setBusy(false),
    );
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("chooseLocation")}</DialogTitle>
        </DialogHeader>
        <Button onClick={gps} disabled={busy} className="w-full">
          <MapPin className="h-4 w-4" /> {t("useGps")}
        </Button>
        <p className="mt-2 text-sm text-muted-foreground">{t("orPickCity")}</p>
        <div className="grid gap-2">
          {DISTRICTS.map((d) => (
            <button
              key={d}
              onClick={() => { setLocation({ label: d }); onOpenChange(false); }}
              className={`rounded-xl border px-4 py-3 text-start text-sm transition hover:bg-muted ${location.label === d ? "border-primary bg-secondary" : ""}`}
            >
              {d}
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SearchBar() {
  const { t, lang } = useI18n();
  const { data: cat } = useQuery(catalogQuery);
  const { recent, pushRecent } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!cat || !q.trim()) return [];
    const norm = (x: string) => x.toLowerCase().replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/[\u064B-\u0652]/g, "");
    const words = norm(q.trim()).split(/\s+/);
    const hay = (p: (typeof cat.products)[number]) => norm(`${p.name_en} ${p.name_ar} ${p.brand ?? ""} ${p.category ?? ""}`);
    const full = cat.products.filter((p) => words.every((w) => hay(p).includes(w)));
    if (full.length) return full.slice(0, 6);
    // fallback: partial match on word stems (e.g. "لبنة" → "لبن")
    const stems = words.map((w) => (w.length > 3 ? w.slice(0, -1) : w));
    return cat.products.filter((p) => stems.some((w) => hay(p).includes(w))).slice(0, 6);
  }, [cat, q]);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setFocus(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const voice = () => {
    const W = window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any };
    const SR = W.SpeechRecognition ?? W.webkitSpeechRecognition;
    if (!SR) return alert(t("voiceUnsupported"));
    const r = new SR();
    r.lang = lang === "ar" ? "ar-SA" : "en-US";
    r.onresult = (e: any) => { setQ(e.results[0][0].transcript); setFocus(true); };
    r.start();
  };

  const go = (id: string) => {
    pushRecent(q);
    setFocus(false);
    setQ("");
    navigate({ to: "/product/$id", params: { id } });
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2 shadow-card ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onKeyDown={(e) => { if (e.key === "Enter" && results[0]) go(results[0].id); }}
          placeholder={t("search")}
          className="min-w-0 flex-1 bg-transparent py-1 text-base outline-none placeholder:text-muted-foreground"
        />
        <button onClick={voice} aria-label="Voice search" className="rounded-full p-2 text-muted-foreground hover:bg-muted">
          <Mic className="h-5 w-5" />
        </button>
        <Link to="/scan" aria-label={t("scan")} className="rounded-full bg-secondary p-2 text-secondary-foreground hover:bg-muted">
          <Camera className="h-5 w-5" />
        </Link>
      </div>
      {focus && (q.trim() || recent.length > 0) && (
        <div className="absolute inset-x-0 top-full z-40 mt-2 overflow-hidden rounded-2xl bg-popover shadow-card ring-1 ring-border">
          {q.trim() && results.length === 0 && (
            <Link to="/categories" onClick={() => setFocus(false)} className="block px-4 py-3 text-sm text-muted-foreground hover:bg-muted">{t("noResults")}</Link>
          )}
          {q ? results.map((p) => (
            <button key={p.id} onClick={() => go(p.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-start hover:bg-muted">
              <span className="text-2xl">{p.emoji}</span>
              <span className="text-sm">{lang === "ar" ? p.name_ar : p.name_en}</span>
            </button>
          )) : recent.map((r) => (
            <button key={r} onClick={() => setQ(r)} className="block w-full px-4 py-2.5 text-start text-sm text-muted-foreground hover:bg-muted">
              ↺ {r}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const NAV = [
  { to: "/", icon: Home, key: "home" },
  { to: "/categories", icon: LayoutGrid, key: "categories" },
  { to: "/scan", icon: ScanLine, key: "scan" },
  { to: "/basket", icon: ShoppingBasket, key: "basket" },
  { to: "/profile", icon: User, key: "profile" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { location, basket, dark, toggleDark } = useApp();
  const [locOpen, setLocOpen] = useState(false);
  const count = basket.reduce((s, l) => s + l.qty, 0);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 pt-3">
          <div className="flex items-center gap-2">
            <Link to="/" className="whitespace-nowrap font-display text-lg font-extrabold text-primary">{t("appName")}</Link>
            <button onClick={() => setLocOpen(true)} className="ms-2 flex min-w-0 items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs text-secondary-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{location.label}</span>
            </button>
            <nav className="ms-auto hidden items-center gap-1 md:flex">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted" activeProps={{ className: "bg-secondary text-secondary-foreground font-semibold" }}>
                  {t(n.key)}{n.key === "basket" && count > 0 ? ` (${count})` : ""}
                </Link>
              ))}
            </nav>
            <span className="ms-auto rounded-full border px-2 py-1 text-xs font-semibold md:ms-1">SAR</span>
            <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="rounded-full border px-2.5 py-1 text-xs font-semibold">
              {lang === "en" ? "ع" : "EN"}
            </button>
            <button onClick={toggleDark} aria-label="Theme" className="rounded-full border p-1.5">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
          <div className="py-3">
            <SearchBar />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] text-muted-foreground"
              activeProps={{ className: "text-primary font-semibold" }}
            >
              {n.key === "scan" ? (
                <span className="-mt-6 grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-card ring-4 ring-background">
                  <n.icon className="h-6 w-6" />
                </span>
              ) : (
                <n.icon className="h-5 w-5" />
              )}
              {t(n.key)}
              {n.key === "basket" && count > 0 && (
                <span className="absolute end-[22%] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">{count}</span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      <LocationDialog open={locOpen} onOpenChange={setLocOpen} />
      <CookieBanner />
    </div>
  );
}
