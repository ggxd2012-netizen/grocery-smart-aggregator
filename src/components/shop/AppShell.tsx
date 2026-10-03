import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Home, ShoppingBag, ScanLine, ShoppingBasket, User, ChevronDown, MapPin, Moon, Sun, Navigation } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { appConfig } from "@/config/app.config";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { location, basket, dark, toggleDark, detectLocation, locating } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = basket.reduce((sum, item) => sum + item.qty, 0);

  const navItems = [
    { to: "/", label: t("home"), icon: Home },
    { to: "/categories", label: t("categories"), icon: ShoppingBag },
    { to: "/scan", label: t("scan"), icon: ScanLine },
    { to: "/basket", label: t("basket"), icon: ShoppingBasket },
    { to: "/profile", label: t("profile"), icon: User },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Link to="/" className="font-display text-lg font-black text-primary">
            {lang === "ar" ? appConfig.app.nameAr : appConfig.app.nameEn}
          </Link>

          <button
            onClick={detectLocation}
            className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition hover:bg-muted"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {locating ? (
              <span className="animate-pulse">{t("detectingLocation")}</span>
            ) : (
              <span className="max-w-[120px] truncate">{location.label || appConfig.geo.defaultLocation.nameAr}</span>
            )}
            <Navigation className="h-3 w-3 shrink-0 opacity-50" />
          </button>

          <div className="ms-auto hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  activeProps={{ className: "bg-primary text-primary-foreground" }}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-card-foreground transition hover:bg-muted"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="rounded-full border border-border px-2 py-1 text-xs font-semibold text-card-foreground"
            >
              {lang === "ar" ? "EN" : "AR"}
            </button>
            <button
              onClick={toggleDark}
              className="rounded-full border border-border p-2 text-card-foreground"
            >
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-full border border-border p-2 text-card-foreground md:hidden"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-card md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    activeProps={{ className: "bg-primary/10 text-primary" }}
                    className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-card-foreground hover:bg-muted"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4 pb-24 md:pb-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-primary" }}
                className="relative flex flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[11px] text-muted-foreground"
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
                {item.to === "/basket" && itemCount > 0 && (
                  <span className="absolute -end-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {itemCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
