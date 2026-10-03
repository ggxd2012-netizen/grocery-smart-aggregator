import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "ar";

const dict = {
  appName: { en: "Smart Basket", ar: "السلة الذكية" },
  tagline: { en: "Compare every grocery app. Pay the least.", ar: "قارن كل تطبيقات البقالة. وادفع الأقل." },
  search: { en: "Search milk, rice, eggs…", ar: "ابحث عن حليب، أرز، بيض…" },
  home: { en: "Home", ar: "الرئيسية" },
  categories: { en: "Categories", ar: "الأقسام" },
  scan: { en: "Scan", ar: "مسح" },
  basket: { en: "Basket", ar: "السلة" },
  profile: { en: "Profile", ar: "حسابي" },
  deliverTo: { en: "Deliver to", ar: "التوصيل إلى" },
  chooseLocation: { en: "Choose location", ar: "اختر الموقع" },
  useGps: { en: "Use my current location", ar: "استخدم موقعي الحالي" },
  orPickCity: { en: "Or pick a district", ar: "أو اختر حيًا" },
  topDeals: { en: "Biggest price gaps today", ar: "أكبر فروقات الأسعار اليوم" },
  browseCats: { en: "Shop by category", ar: "تسوق حسب القسم" },
  from: { en: "from", ar: "من" },
  stores: { en: "stores", ar: "متاجر" },
  add: { en: "Add", ar: "أضف" },
  added: { en: "Added to basket", ar: "أُضيف إلى السلة" },
  compare: { en: "Compare prices", ar: "قارن الأسعار" },
  base: { en: "Price", ar: "السعر" },
  delivery: { en: "Delivery", ar: "التوصيل" },
  total: { en: "Total", ar: "الإجمالي" },
  eta: { en: "ETA", ar: "الوقت" },
  min: { en: "min", ar: "د" },
  inStock: { en: "In stock", ar: "متوفر" },
  onlyLeft: { en: "Only {n} left", ar: "تبقى {n} فقط" },
  outOfStock: { en: "Out of stock", ar: "غير متوفر" },
  free: { en: "Free", ar: "مجاني" },
  priceHistory: { en: "Price history", ar: "تاريخ السعر" },
  days: { en: "days", ar: "يوم" },
  lowest: { en: "Lowest", ar: "الأدنى" },
  highest: { en: "Highest", ar: "الأعلى" },
  nearLow: { en: "Near its lowest price — good time to buy", ar: "قريب من أدنى سعر — وقت مناسب للشراء" },
  nearHigh: { en: "Near its highest price — consider waiting", ar: "قريب من أعلى سعر — قد يكون الانتظار أفضل" },
  freshness: { en: "Community freshness", ar: "تقييم الطزاجة" },
  rateFresh: { en: "Rate freshness at", ar: "قيّم الطزاجة في" },
  signInToRate: { en: "Sign in to rate", ar: "سجّل الدخول للتقييم" },
  wishlist: { en: "Price-drop wishlist", ar: "قائمة تنبيه انخفاض السعر" },
  watch: { en: "Watch price", ar: "راقب السعر" },
  watching: { en: "Watching", ar: "قيد المراقبة" },
  emptyBasket: { en: "Your basket is empty", ar: "سلتك فارغة" },
  emptyBasketHint: { en: "Add items and we'll find the cheapest way to buy them.", ar: "أضف منتجات وسنجد لك أرخص طريقة لشرائها." },
  bestSingle: { en: "Cheapest single store", ar: "أرخص متجر واحد" },
  bestSplit: { en: "Best split order", ar: "أفضل طلب مقسّم" },
  saveBySplit: { en: "Save {n} SAR by splitting your order", ar: "وفّر {n} ريال بتقسيم طلبك" },
  splitNotWorth: { en: "One store is cheapest — splitting won't save you money.", ar: "متجر واحد هو الأرخص — التقسيم لن يوفر لك." },
  missing: { en: "{n} item(s) unavailable", ar: "{n} منتج غير متوفر" },
  couponApplied: { en: "Coupon", ar: "كوبون" },
  checkout: { en: "Go to checkout", ar: "انتقل للدفع" },
  checkoutAt: { en: "Order at {s}", ar: "اطلب من {s}" },
  allStores: { en: "All stores", ar: "كل المتاجر" },
  dietary: { en: "Dietary", ar: "النظام الغذائي" },
  all: { en: "All", ar: "الكل" },
  grid: { en: "Grid", ar: "شبكة" },
  list: { en: "List", ar: "قائمة" },
  scanTitle: { en: "Scan a barcode", ar: "امسح الباركود" },
  scanHint: { en: "Point your camera at a product barcode.", ar: "وجّه الكاميرا نحو باركود المنتج." },
  startCamera: { en: "Start camera", ar: "شغّل الكاميرا" },
  stopCamera: { en: "Stop", ar: "إيقاف" },
  enterBarcode: { en: "Or type a barcode", ar: "أو اكتب الباركود" },
  find: { en: "Find", ar: "بحث" },
  tryThese: { en: "Try one of these", ar: "جرّب أحدها" },
  notFound: { en: "No product with that barcode yet.", ar: "لا يوجد منتج بهذا الباركود بعد." },
  signIn: { en: "Sign in", ar: "تسجيل الدخول" },
  signUp: { en: "Create account", ar: "إنشاء حساب" },
  signOut: { en: "Sign out", ar: "تسجيل الخروج" },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  password: { en: "Password", ar: "كلمة المرور" },
  google: { en: "Continue with Google", ar: "المتابعة عبر Google" },
  checkEmail: { en: "Check your email to confirm your account.", ar: "تحقق من بريدك لتأكيد حسابك." },
  haveAccount: { en: "Already have an account?", ar: "لديك حساب؟" },
  noAccount: { en: "New here?", ar: "جديد هنا؟" },
  guestNote: { en: "Your basket is saved on this device and moves to your account when you sign in.", ar: "سلتك محفوظة على هذا الجهاز وتنتقل إلى حسابك عند تسجيل الدخول." },
  addresses: { en: "Saved addresses", ar: "العناوين المحفوظة" },
  addAddress: { en: "Add address", ar: "أضف عنوانًا" },
  label: { en: "Label", ar: "الاسم" },
  details: { en: "Details", ar: "التفاصيل" },
  save: { en: "Save", ar: "حفظ" },
  orders: { en: "Order history", ar: "سجل الطلبات" },
  reorder: { en: "Re-order all", ar: "أعد الطلب" },
  noOrders: { en: "No orders yet.", ar: "لا توجد طلبات بعد." },
  notifications: { en: "Notifications", ar: "الإشعارات" },
  cookieSettings: { en: "Cookie preferences", ar: "تفضيلات ملفات الارتباط" },
  cookieTitle: { en: "We use cookies", ar: "نستخدم ملفات الارتباط" },
  cookieBody: { en: "Essential cookies keep your basket and sign-in working. You choose the rest.", ar: "ملفات الارتباط الأساسية تحفظ سلتك وتسجيل دخولك. والباقي باختيارك." },
  essential: { en: "Essential (required)", ar: "أساسية (مطلوبة)" },
  analytics: { en: "Analytics", ar: "التحليلات" },
  marketing: { en: "Personalization & marketing", ar: "التخصيص والتسويق" },
  acceptAll: { en: "Accept all", ar: "قبول الكل" },
  rejectAll: { en: "Essential only", ar: "الأساسية فقط" },
  savePrefs: { en: "Save choices", ar: "حفظ الاختيارات" },
  customize: { en: "Customize", ar: "تخصيص" },
  qty: { en: "Qty", ar: "الكمية" },
  items: { en: "items", ar: "منتجات" },
  coupons: { en: "Active coupons & bank offers", ar: "الكوبونات وعروض البنوك" },
  voiceUnsupported: { en: "Voice search isn't supported in this browser.", ar: "البحث الصوتي غير مدعوم في هذا المتصفح." },
  noResults: { en: "No matching products yet — try another word or browse categories.", ar: "ما لقينا منتج مطابق — جرّب كلمة ثانية أو تصفّح الأقسام." },
  minOrder: { en: "Min. order {n} SAR", ar: "حد أدنى {n} ريال" },
  belowMin: { en: "Below minimum order", ar: "أقل من الحد الأدنى" },
  sample: { en: "Prices are sample data for demonstration.", ar: "الأسعار بيانات تجريبية للعرض." },
  cat_dairy: { en: "Dairy & Eggs", ar: "الألبان والبيض" },
  cat_produce: { en: "Fruits & Veg", ar: "الخضار والفواكه" },
  cat_meat: { en: "Meat & Poultry", ar: "اللحوم والدواجن" },
  cat_pantry: { en: "Pantry", ar: "المؤن" },
  cat_beverages: { en: "Beverages", ar: "المشروبات" },
  cat_bakery: { en: "Bakery", ar: "المخبوزات" },
  cat_household: { en: "Household", ar: "المنزل" },
  tag_organic: { en: "Organic", ar: "عضوي" },
  tag_gluten_free: { en: "Gluten-free", ar: "خالٍ من الجلوتين" },
  tag_keto: { en: "Keto", ar: "كيتو" },
  tag_lactose_free: { en: "Lactose-free", ar: "خالٍ من اللاكتوز" },
  tag_halal: { en: "Halal", ar: "حلال" },
  tag_sugar_free: { en: "Sugar-free", ar: "خالٍ من السكر" },
  or: { en: "or", ar: "أو" },
  saveAmount: { en: "Save {n} SAR", ar: "توفير {n} ر.س" },
  cheapestStore: { en: "Cheapest store", ar: "المتجر الأوفر" },
  maxSavings: { en: "Maximum savings", ar: "التوفير الأقصى" },
  singleStore: { en: "Buy all from one store", ar: "اشتر الكل من متجر واحد" },
  splitStores: { en: "Split across two stores", ar: "قسّم على متجرين" },
  optimizeBasket: { en: "Optimize basket", ar: "تحسين السلة الذكي" },
  compareTitle: { en: "Price comparison", ar: "مقارنة الأسعار" },
  compareHint: { en: "Compare this product across all stores", ar: "قارن هذا المنتج في كل المتاجر" },
  importList: { en: "Import text list", ar: "استيراد قائمة نصية" },
  importHint: { en: "Paste your grocery list and we'll find the cheapest products", ar: "الصق قائمة مقاضيك وسنجد لك أرخص المنتجات" },
  importPlaceholder: { en: "e.g. milk, eggs, rice, banana", ar: "مثال: حليب، بيض، أرز، موز" },
  importBtn: { en: "Find & add to basket", ar: "ابحث وأضف للسلة" },
  imported: { en: "Added {n} items to basket", ar: "تمت إضافة {n} منتجات للسلة" },
  importedNone: { en: "No matching products found", ar: "لم نجد منتجات مطابقة" },
  copyCode: { en: "Copy code", ar: "نسخ الكود" },
  copied: { en: "Copied to clipboard", ar: "تم نسخ الكود" },
  storeLogo: { en: "Store logo", ar: "شعار المتجر" },
  productImage: { en: "Product image", ar: "صورة المنتج" },
  priceGap: { en: "Price gap", ar: "فرق السعر" },
  deliveryTime: { en: "Delivery time", ar: "وقت التوصيل" },
  bestPrice: { en: "Best price", ar: "أفضل سعر" },
  closeBtn: { en: "Close", ar: "إغلاق" },
  detectingLocation: { en: "Detecting your location…", ar: "نحدد موقعك…" },
  locationError: { en: "Couldn't get your location. Please pick a district.", ar: "تعذّر تحديد موقعك. اختر حيًا." },
  sar: { en: "SAR", ar: "ر.س" },
} as const;

export type DictKey = keyof typeof dict;

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (k: DictKey, vars?: Record<string, string | number>) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar");
  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang | null;
    if (saved === "ar" || saved === "en") setLangState(saved);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };
  const t: Ctx["t"] = (k, vars) => {
    let s: string = dict[k]?.[lang] ?? String(k);
    if (vars) for (const [key, v] of Object.entries(vars)) s = s.replace(`{${key}}`, String(v));
    return s;
  };
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const c = useContext(I18nContext);
  if (!c) throw new Error("useI18n outside provider");
  return c;
}
