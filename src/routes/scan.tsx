import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Camera, ScanLine } from "lucide-react";
import { toast } from "sonner";
import { catalogQuery } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductThumb } from "@/components/shop/bits";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Barcode scanner — Salla Smart" },
      { name: "description", content: "Scan a product barcode with your camera and compare its price across stores instantly." },
      { property: "og:title", content: "Scan & compare — Salla Smart" },
      { property: "og:description", content: "Scan items in your kitchen and find them cheaper." },
    ],
  }),
  component: Scan,
});

function Scan() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const { data: cat } = useQuery(catalogQuery);
  const [running, setRunning] = useState(false);
  const [code, setCode] = useState("");
  const scanner = useRef<{ stop: () => Promise<void> } | null>(null);
  const catRef = useRef(cat);
  catRef.current = cat;

  const lookup = (bc: string) => {
    const p = catRef.current?.products.find((x) => x.barcode === bc.trim());
    if (p) navigate({ to: "/product/$id", params: { id: p.id } });
    else toast.error(t("notFound"));
  };

  const start = async () => {
    const { Html5Qrcode } = await import("html5-qrcode");
    const s = new Html5Qrcode("reader");
    scanner.current = s;
    setRunning(true);
    try {
      await s.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 140 } },
        async (text) => {
          await s.stop().catch(() => {});
          setRunning(false);
          lookup(text);
        },
        () => {},
      );
    } catch (e) {
      setRunning(false);
      toast.error(String(e));
    }
  };
  const stop = async () => {
    await scanner.current?.stop().catch(() => {});
    setRunning(false);
  };
  useEffect(() => () => { void scanner.current?.stop().catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-md space-y-5 pb-6">
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold">{t("scanTitle")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("scanHint")}</p>
      </div>
      <div className="relative overflow-hidden rounded-3xl bg-foreground/90 ring-1 ring-border">
        <div id="reader" className="aspect-[4/3] w-full" />
        {!running && (
          <div className="absolute inset-0 grid place-items-center">
            <ScanLine className="h-24 w-24 text-background/40" />
          </div>
        )}
      </div>
      {running ? (
        <Button variant="outline" className="w-full" onClick={stop}>{t("stopCamera")}</Button>
      ) : (
        <Button className="w-full" size="lg" onClick={start}><Camera className="h-5 w-5" />{t("startCamera")}</Button>
      )}
      <form onSubmit={(e) => { e.preventDefault(); lookup(code); }} className="flex gap-2">
        <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("enterBarcode")} inputMode="numeric" />
        <Button type="submit" variant="secondary">{t("find")}</Button>
      </form>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("tryThese")}</p>
        <div className="grid gap-2">
          {cat?.products.filter((p) => !p.barcode?.startsWith("2000")).slice(0, 4).map((p) => (
            <button key={p.id} onClick={() => lookup(p.barcode!)} className="flex items-center gap-3 rounded-xl bg-card px-3 py-2 text-start text-sm ring-1 ring-border hover:bg-muted">
              <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-border">
                <ProductThumb product={p} />
              </span>
              <span className="flex-1 truncate">{lang === "ar" ? p.name_ar : p.name_en}</span>
              <span className="font-mono text-xs text-muted-foreground">{p.barcode}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
