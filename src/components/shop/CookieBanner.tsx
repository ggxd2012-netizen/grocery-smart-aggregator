import { useEffect, useState } from "react";
import { Cookie } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useApp } from "@/lib/app-state";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function CookieBanner() {
  const { t } = useI18n();
  const { consent, setConsent, consentOpen, setConsentOpen } = useApp();
  const [custom, setCustom] = useState(false);
  const [a, setA] = useState(consent.analytics);
  const [m, setM] = useState(consent.marketing);

  useEffect(() => {
    if (consentOpen) { setCustom(true); setA(consent.analytics); setM(consent.marketing); }
  }, [consentOpen, consent]);

  if (consent.decided && !consentOpen) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-lg rounded-3xl bg-card p-5 shadow-card ring-1 ring-border md:bottom-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground"><Cookie className="h-5 w-5" /></span>
        <div>
          <p className="font-display font-bold text-card-foreground">{t("cookieTitle")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("cookieBody")}</p>
        </div>
      </div>
      {custom && (
        <div className="mt-4 space-y-3 rounded-2xl bg-muted p-4 text-sm text-card-foreground">
          <label className="flex items-center justify-between">{t("essential")}<Switch checked disabled /></label>
          <label className="flex items-center justify-between">{t("analytics")}<Switch checked={a} onCheckedChange={setA} /></label>
          <label className="flex items-center justify-between">{t("marketing")}<Switch checked={m} onCheckedChange={setM} /></label>
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        {custom ? (
          <Button className="flex-1" onClick={() => setConsent({ analytics: a, marketing: m })}>{t("savePrefs")}</Button>
        ) : (
          <>
            <Button className="flex-1" onClick={() => setConsent({ analytics: true, marketing: true })}>{t("acceptAll")}</Button>
            <Button variant="outline" onClick={() => setConsent({ analytics: false, marketing: false })}>{t("rejectAll")}</Button>
            <Button variant="ghost" onClick={() => setCustom(true)}>{t("customize")}</Button>
          </>
        )}
        {consentOpen && <Button variant="ghost" onClick={() => setConsentOpen(false)}>✕</Button>}
      </div>
    </div>
  );
}
