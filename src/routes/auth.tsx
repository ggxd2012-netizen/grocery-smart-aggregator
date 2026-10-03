import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Salla Smart" },
      { name: "description", content: "Sign in to save your basket, addresses, price alerts and order history." },
      { property: "og:title", content: "Sign in — Salla Smart" },
      { property: "og:description", content: "Save your basket and get price-drop alerts." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/profile", replace: true }); }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) toast.error(error.message);
      else toast.success(t("checkEmail"));
    }
    setBusy(false);
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error(String(r.error.message ?? r.error));
  };

  return (
    <div className="mx-auto max-w-sm space-y-5 py-8">
      <h1 className="text-center font-display text-3xl font-bold">{mode === "in" ? t("signIn") : t("signUp")}</h1>
      <Button variant="outline" className="w-full" size="lg" onClick={google}>{t("google")}</Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />·<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5"><Label htmlFor="email">{t("email")}</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="space-y-1.5"><Label htmlFor="pw">{t("password")}</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Button type="submit" className="w-full" size="lg" disabled={busy}>{mode === "in" ? t("signIn") : t("signUp")}</Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        {mode === "in" ? t("noAccount") : t("haveAccount")}{" "}
        <button className="font-semibold text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? t("signUp") : t("signIn")}</button>
      </p>
      <p className="text-center text-xs text-muted-foreground">{t("guestNote")}</p>
    </div>
  );
}
