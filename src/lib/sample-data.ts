import type { Catalog } from "./data";

export function createSampleCatalog(): Catalog {
  const stores = [
    {
      id: "carrefour",
      name: "Carrefour",
      color: "#2F7D52",
      delivery_fee: 6.5,
      eta_min: 24,
      free_delivery_over: 90,
      min_order: 50,
      deeplink: "https://carrefour.com/sa-en",
    },
    {
      id: "lulu",
      name: "LuLu",
      color: "#F59E0B",
      delivery_fee: 7,
      eta_min: 30,
      free_delivery_over: 120,
      min_order: 60,
      deeplink: "https://www.luluhypermarket.com/sa-en",
    },
    {
      id: "panda",
      name: "Panda",
      color: "#E11D48",
      delivery_fee: 5.5,
      eta_min: 28,
      free_delivery_over: 85,
      min_order: 45,
      deeplink: "https://www.panda.sa",
    },
    {
      id: "noon",
      name: "Noon",
      color: "#2563EB",
      delivery_fee: 8,
      eta_min: 32,
      free_delivery_over: 110,
      min_order: 55,
      deeplink: "https://www.noon.com/saudi-en",
    },
    {
      id: "ninja",
      name: "Ninja",
      color: "#10B981",
      delivery_fee: 4.5,
      eta_min: 22,
      free_delivery_over: 80,
      min_order: 40,
      deeplink: "https://www.ninja.sa",
    },
    {
      id: "hungrystation",
      name: "HungerStation",
      color: "#8B5CF6",
      delivery_fee: 9,
      eta_min: 18,
      free_delivery_over: 95,
      min_order: 52,
      deeplink: "https://www.hungerstation.com/sa-en",
    },
  ] as const;

  const products = [
    {
      id: "milk-1l",
      name_en: "Fresh Milk 1L",
      name_ar: "حليب طازج ١ لتر",
      brand: "Nadec",
      category: "dairy",
      emoji: "🥛",
      size: "1 L",
      barcode: "6221045000012",
      tags: ["organic", "lactose_free"],
      is_fresh: true,
    },
    {
      id: "eggs-12",
      name_en: "Farm Eggs 12 pcs",
      name_ar: "بيض مزارع ١٢ حبة",
      brand: "Almarai",
      category: "dairy",
      emoji: "🥚",
      size: "12 pcs",
      barcode: "6221045000029",
      tags: ["organic", "keto"],
      is_fresh: true,
    },
    {
      id: "banana-bunch",
      name_en: "Banana Bunch",
      name_ar: "حزمة موز",
      brand: "Local Farm",
      category: "produce",
      emoji: "🍌",
      size: "1 kg",
      barcode: "6221045000036",
      tags: ["organic", "keto"],
      is_fresh: true,
    },
    {
      id: "tomato-pack",
      name_en: "Tomatoes Pack",
      name_ar: "طماطم موجه",
      brand: "Farm Fresh",
      category: "produce",
      emoji: "🍅",
      size: "1 kg",
      barcode: "6221045000043",
      tags: ["organic", "halal"],
      is_fresh: true,
    },
    {
      id: "chicken-breast",
      name_en: "Chicken Breast",
      name_ar: "صدر دجاج",
      brand: "Al-Watan",
      category: "meat",
      emoji: "🍗",
      size: "1 kg",
      barcode: "6221045000050",
      tags: ["halal", "keto"],
      is_fresh: true,
    },
    {
      id: "salmon-fillet",
      name_en: "Salmon Fillet",
      name_ar: "شرائح السلمون",
      brand: "Blue Sea",
      category: "meat",
      emoji: "🐟",
      size: "500 g",
      barcode: "6221045000067",
      tags: ["organic", "halal"],
      is_fresh: true,
    },
    {
      id: "basmati-rice",
      name_en: "Basmati Rice",
      name_ar: "أرز بسمتي",
      brand: "Royal",
      category: "pantry",
      emoji: "🍚",
      size: "5 kg",
      barcode: "6221045000074",
      tags: ["gluten_free", "halal"],
      is_fresh: false,
    },
    {
      id: "olive-oil",
      name_en: "Extra Virgin Olive Oil",
      name_ar: "زيت زيتون بكر ممتاز",
      brand: "Alma",
      category: "pantry",
      emoji: "🫒",
      size: "750 ml",
      barcode: "6221045000081",
      tags: ["organic", "keto"],
      is_fresh: false,
    },
    {
      id: "water-1l",
      name_en: "Mineral Water",
      name_ar: "ماء معدني",
      brand: "Aqua Pure",
      category: "beverages",
      emoji: "💧",
      size: "1 L x 6",
      barcode: "6221045000098",
      tags: ["sugar_free", "halal"],
      is_fresh: false,
    },
    {
      id: "sparkling-water",
      name_en: "Sparkling Water",
      name_ar: "ماء غازي",
      brand: "Soda Mint",
      category: "beverages",
      emoji: "🥤",
      size: "330 ml",
      barcode: "6221045000104",
      tags: ["sugar_free"],
      is_fresh: false,
    },
    {
      id: "whole-wheat-bread",
      name_en: "Whole Wheat Bread",
      name_ar: "خبز القمح الكامل",
      brand: "Bake House",
      category: "bakery",
      emoji: "🍞",
      size: "500 g",
      barcode: "6221045000111",
      tags: ["organic", "gluten_free"],
      is_fresh: true,
    },
    {
      id: "croissant-box",
      name_en: "Butter Croissant Box",
      name_ar: "علبة كرويسان الزبدة",
      brand: "Bakery Co.",
      category: "bakery",
      emoji: "🥐",
      size: "6 pcs",
      barcode: "6221045000128",
      tags: ["keto"],
      is_fresh: true,
    },
    {
      id: "dishwasher-tabs",
      name_en: "Dishwasher Tabs",
      name_ar: "أقراص غسالة الأطباق",
      brand: "CleanMax",
      category: "household",
      emoji: "🧼",
      size: "24 tabs",
      barcode: "6221045000135",
      tags: ["sugar_free"],
      is_fresh: false,
    },
    {
      id: "laundry-detergent",
      name_en: "Laundry Detergent",
      name_ar: "منظف غسيل الملابس",
      brand: "Eco Wash",
      category: "household",
      emoji: "🧺",
      size: "2 L",
      barcode: "6221045000142",
      tags: ["organic"],
      is_fresh: false,
    },
    {
      id: "yogurt-cups",
      name_en: "Greek Yogurt Cups",
      name_ar: "أكواب الزبادي اليوناني",
      brand: "Yami",
      category: "dairy",
      emoji: "🥣",
      size: "4 x 170 g",
      barcode: "6221045000159",
      tags: ["lactose_free", "organic"],
      is_fresh: true,
    },
  ] as const;

  const priceMatrix: Record<string, Record<string, number>> = {
    "milk-1l": { carrefour: 8.5, lulu: 9.2, panda: 8.2, noon: 9.5, ninja: 8.75, hungrystation: 9.1 },
    "eggs-12": { carrefour: 12, lulu: 11.6, panda: 12.4, noon: 12.2, ninja: 11.8, hungrystation: 12.8 },
    "banana-bunch": { carrefour: 7.5, lulu: 7.2, panda: 7.4, noon: 8.1, ninja: 7.8, hungrystation: 7.9 },
    "tomato-pack": { carrefour: 9.5, lulu: 9.7, panda: 9.1, noon: 10.2, ninja: 9.3, hungrystation: 10.1 },
    "chicken-breast": { carrefour: 29.5, lulu: 31.0, panda: 28.8, noon: 30.6, ninja: 29.1, hungrystation: 31.4 },
    "salmon-fillet": { carrefour: 39.0, lulu: 42.0, panda: 38.5, noon: 41.5, ninja: 40.2, hungrystation: 43.0 },
    "basmati-rice": { carrefour: 26.5, lulu: 25.8, panda: 27.2, noon: 26.9, ninja: 25.5, hungrystation: 27.5 },
    "olive-oil": { carrefour: 31.0, lulu: 30.5, panda: 32.0, noon: 31.8, ninja: 29.9, hungrystation: 33.4 },
    "water-1l": { carrefour: 14.0, lulu: 13.7, panda: 14.4, noon: 13.9, ninja: 14.8, hungrystation: 15.1 },
    "sparkling-water": { carrefour: 5.2, lulu: 5.5, panda: 5.1, noon: 5.8, ninja: 5.4, hungrystation: 6.0 },
    "whole-wheat-bread": { carrefour: 9.2, lulu: 9.8, panda: 9.5, noon: 10.1, ninja: 9.4, hungrystation: 9.9 },
    "croissant-box": { carrefour: 18.0, lulu: 18.4, panda: 17.9, noon: 18.8, ninja: 17.5, hungrystation: 18.9 },
    "dishwasher-tabs": { carrefour: 23.5, lulu: 22.8, panda: 23.0, noon: 24.2, ninja: 22.5, hungrystation: 24.9 },
    "laundry-detergent": { carrefour: 19.8, lulu: 18.9, panda: 20.1, noon: 19.3, ninja: 17.9, hungrystation: 20.5 },
    "yogurt-cups": { carrefour: 15.2, lulu: 15.7, panda: 15.4, noon: 16.1, ninja: 15.5, hungrystation: 16.8 },
  };

  const prices = products.flatMap((product) =>
    stores.map((store) => {
      const price = priceMatrix[product.id]?.[store.id] ?? 0;
      return {
        product_id: product.id,
        store_id: store.id,
        price,
        promo_price: price > 14 && product.category === "beverages" ? Math.max(0, price - 1.2) : null,
        stock: product.category === "meat" ? 8 : 12,
      };
    }),
  );

  const coupons = [
    { id: "coupon-1", code: "SAVE10", label_en: "10% off on essentials", label_ar: "خصم 10% على الضروريات", percent_off: 10, min_spend: 60, max_off: 12, store_id: "carrefour" },
    { id: "coupon-2", code: "FRESH5", label_en: "Fresh produce pick-up", label_ar: "خصم على المنتجات الطازجة", percent_off: 5, min_spend: 50, max_off: 8, store_id: "lulu" },
    { id: "coupon-3", code: "NINJA15", label_en: "15% off first order", label_ar: "خصم 15% على أول طلب", percent_off: 15, min_spend: 70, max_off: 15, store_id: "ninja" },
  ];

  const history: Catalog["prices"] = [];
  const dayCursor = new Date();
  for (const product of products) {
    for (const store of stores) {
      const base = priceMatrix[product.id]?.[store.id] ?? 0;
      for (let i = 29; i >= 0; i -= 1) {
        const d = new Date(dayCursor);
        d.setDate(d.getDate() - i);
        const price = Number((base * (1 + (Math.sin((i + product.id.length) / 3) * 0.08))).toFixed(2));
        history.push({
          product_id: product.id,
          store_id: store.id,
          price,
          promo_price: i % 5 === 0 ? Number((price * 0.9).toFixed(2)) : null,
          stock: 8,
        });
      }
    }
  }

  return {
    stores: stores as unknown as Catalog["stores"],
    products: products as unknown as Catalog["products"],
    prices: prices as unknown as Catalog["prices"],
    coupons: coupons as unknown as Catalog["coupons"],
    // @ts-expect-error sample history is kept in-memory for the demo catalog only
    history,
  } as Catalog & { history: typeof history };
}

export function createSampleHistory(productId: string) {
  const catalog = createSampleCatalog();
  return catalog.prices
    .filter((price) => price.product_id === productId)
    .map((price, index) => ({
      product_id: price.product_id,
      store_id: price.store_id,
      day: new Date(Date.now() - index * 86400000).toISOString().slice(0, 10),
      price: Number(price.price.toFixed(2)),
    }));
}
