/**
 * CONFIGURATION FILE FOR SMART GROCERY AGGREGATOR
 * مرحبا في ملف الإعدادات الرئيسي
 */

export const appConfig = {
  // Application Identity
  app: {
    name: "مقاضي الذكية", // Default name
    nameEn: "Smart Basket",
    nameAr: "مقاضي الذكية",
    tagline: "مقارنة أسعار البقالة بذكاء",
    taglineEn: "Smart Grocery Price Comparison",
    logo: "/logo.svg",
  },

  // Email Configuration for Auth
  email: {
    autoConfirmEmails: true, // Set to true for development/demo
    provider: "supabase", // supabase, resend, sendgrid
    sendgridApiKey: process.env.SENDGRID_API_KEY || "",
    resendApiKey: process.env.RESEND_API_KEY || "",
    fromEmail: "noreply@smartbasket.local",
    fromName: "مقاضي الذكية",
  },

  // Geolocation
  geo: {
    enableReverseGeocoding: true,
    defaultLocation: {
      lat: 24.7136,
      lng: 46.6753,
      nameAr: "الرياض - حي العليا",
      nameEn: "Riyadh - Al-Olaya",
    },
    geoCodeProvider: "google", // google, nominatim, mapbox
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || "",
  },

  // Stores Configuration
  stores: [
    { id: "carrefour", nameAr: "كارفور", nameEn: "Carrefour" },
    { id: "lulu", nameAr: "لولو هايبر ماركت", nameEn: "LuLu" },
    { id: "panda", nameAr: "بنده", nameEn: "Panda" },
    { id: "noon", nameAr: "نون", nameEn: "Noon" },
    { id: "ninja", nameAr: "نينجا", nameEn: "Ninja" },
    { id: "hungrystation", nameAr: "هنجري ستيشن", nameEn: "HungerStation" },
  ],

  // Currency
  currency: {
    code: "SAR",
    symbol: "ر.س",
    symbolPosition: "end", // start or end
  },

  // Feature Flags
  features: {
    barcodeScanner: true,
    smartOptimizer: true,
    priceHistory: true,
    wishlist: true,
    couponCopy: true,
    geolocation: true,
  },

  // Demo/Sample Data Mode
  demo: {
    enabled: true,
    message: "تم تحديث الأسعار بناءً على بيانات المتاجر المتاحة اليوم",
    messageEn: "Prices updated from available store data today",
  },
};

export default appConfig;
