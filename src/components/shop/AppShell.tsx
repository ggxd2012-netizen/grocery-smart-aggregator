import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Bell, ChevronDown, MapPin, Moon, ShoppingBag } from "lucide-react";
import { useApp } from "@/lib/app-state";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { appConfig } from "@/config/app.config";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { location, basket, dark, toggleDark } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const itemCount = basket.reduce((sum, item) => sum + item.qty, 0);

  const navItems = [
    { to: "/", label: t("home"), icon: "🏠" },
    { to: "/categories", label: t("categories"), icon: "🛒" },
    { to: "/scan", label: t("scan"), icon: "📷" },
    { to: "/basket", label: t("basket"), icon: "🧺" },
    { to: "/profile", label: t("profile"), icon: "👤" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Link to="/" className="font-display text-lg font-black text-primary">
            {appConfig.app.nameAr}
          </Link>

          <button className="flex items-center gap-2 rounded-full bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span className="max-w-[120px] truncate">{location.label || "الرياض - حي العليا"}</span>
          </button>

          <div className="ms-auto hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "bg-primary text-primary-foreground" }}
                className="rounded-full px-3 py-2 text-sm transition hover:bg-muted"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="rounded-full border px-2 py-1 text-xs font-semibold"
            >
              {lang === "ar" ? "EN" : "AR"}
            </button>
            <button onClick={toggleDark} className="rounded-full border p-2">
              <Moon className="h-4 w-4" />
            </button>
            <button onClick={() => setMenuOpen((v) => !v)} className="rounded-full border p-2 md:hidden">
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t bg-card md:hidden">
            <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3">
              {navItems.map((item) => (
                <Link key={item.to} to={item.to} className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-muted">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-4">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-card md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-2 px-3 py-2">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-primary" }}
              className="relative flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px]"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {item.to === "/basket" && itemCount > 0 && (
                <span className="absolute -right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
