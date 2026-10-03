import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { signInWithEmail, signUpWithEmail, signInWithGoogle, resendConfirmation } from "@/lib/auth.service";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — السلة الذكية" },
      { name: "description", content: "سجل دخولك لحفظ سلتك وعناوينك والحصول على تنبيهات الأسعار." },
      { property: "og:title", content: "تسجيل الدخول — السلة الذكية" },
      { property: "og:description", content: "احفظ سلتك واحصل على تنبيهات انخفاض الأسعار." },
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

    try {
      if (mode === "in") {
        await signInWithEmail(email, password);
        navigate({ to: "/", replace: true });
      } else {
        await signUpWithEmail(email, password);
        // If auto-confirm is enabled, allow navigation
        setTimeout(() => navigate({ to: "/", replace: true }), 1500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "حدث خطأ";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : "فشل تسجيل الدخول عبر Google";
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto max-w-sm space-y-5 py-8">
      <h1 className="text-center font-display text-3xl font-bold">{mode === "in" ? t("signIn") : t("signUp")}</h1>
      <Button variant="outline" className="w-full" size="lg" onClick={google}>{t("google")}</Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />{t("or")}<span className="h-px flex-1 bg-border" /></div>
      <form onSubmit={submit} className="space-y-3">
        <div className="space-y-1.5"><Label htmlFor="email">{t("email")}</Label><Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" /></div>
        <div className="space-y-1.5"><Label htmlFor="pw">{t("password")}</Label><Input id="pw" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" /></div>
        <Button type="submit" className="w-full" size="lg" disabled={busy}>{mode === "in" ? t("signIn") : t("signUp")}</Button>
      </form>
      {mode === "up" && email && (
        <button
          type="button"
          className="block w-full text-center text-sm font-medium text-primary underline-offset-4 hover:underline"
          onClick={() => resendConfirmation(email).catch(() => {})}
        >
          {t("resendConfirm")}
        </button>
      )}
      <p className="text-center text-sm text-muted-foreground">
        {mode === "in" ? t("noAccount") : t("haveAccount")}{" "}
        <button className="font-semibold text-primary" onClick={() => setMode(mode === "in" ? "up" : "in")}>{mode === "in" ? t("signUp") : t("signIn")}</button>
      </p>
      <p className="text-center text-xs text-muted-foreground">{t("guestNote")}</p>
    </div>
  );
}
