export const appConfig = {
  app: {
    name: "السلة الذكية",
    nameEn: "Smart Basket",
    nameAr: "السلة الذكية",
    tagline: "مقارنة أسعار البقالة بذكاء",
    taglineEn: "Smart Grocery Price Comparison",
    logo: "/logo.svg",
  },

  email: {
    autoConfirmEmails: true,
    provider: "supabase",
    sendgridApiKey: process.env.SENDGRID_API_KEY || "",
    resendApiKey: process.env.RESEND_API_KEY || "",
    fromEmail: "noreply@smartbasket.local",
    fromName: "السلة الذكية",
  },

  geo: {
    enableReverseGeocoding: true,
    defaultLocation: {
      lat: 24.7136,
      lng: 46.6753,
      nameAr: "الرياض - حي العليا",
      nameEn: "Riyadh - Al-Olaya",
    },
    geoCodeProvider: "nominatim",
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  },

  stores: [
    { id: "carrefour", nameAr: "كارفور", nameEn: "Carrefour", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Carrefour_logo.svg/120px-Carrefour_logo.svg.png" },
    { id: "lulu", nameAr: "لولو", nameEn: "LuLu", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8e/Lulu_Hypermarket_logo.svg/120px-Lulu_Hypermarket_logo.svg.png" },
    { id: "panda", nameAr: "بنده", nameEn: "Panda", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/Panda_logo.svg/120px-Panda_logo.svg.png" },
    { id: "noon", nameAr: "نون", nameEn: "Noon", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Noon_logo.svg/120px-Noon_logo.svg.png" },
    { id: "ninja", nameAr: "نينجا", nameEn: "Ninja", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Ninja.svg/120px-Ninja.svg.png" },
    { id: "hungrystation", nameAr: "هنجري ستيشن", nameEn: "HungerStation", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/3/3a/HungerStation_logo.svg/120px-HungerStation_logo.svg.png" },
  ],

  currency: {
    code: "SAR",
    symbol: "ر.س",
    symbolPosition: "end",
  },

  features: {
    barcodeScanner: true,
    smartOptimizer: true,
    priceHistory: true,
    wishlist: true,
    couponCopy: true,
    geolocation: true,
    textImport: true,
    compareModal: true,
  },

  demo: {
    enabled: true,
    message: "تم تحديث الأسعار بناءً على بيانات المتاجر المتاحة اليوم",
    messageEn: "Prices updated from available store data today",
  },
};

export default appConfig;
