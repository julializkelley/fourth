export type Product = {
  name: string;
  description: string;
  priceRange: string;
  category: string;
  searchUrl: string;
  keywords: string[];
};

function amazonSearch(query: string) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
}

// Curated, editorially independent -- not paid placements. See conversation
// context: recommendations stay unbiased even if brand sponsorships are
// added elsewhere on the site later (e.g. registry suggestions).
export const PRODUCT_CATALOG: Product[] = [
  {
    name: "Nursing-friendly pajama set",
    description: "Button or clip-front pajamas for easy nighttime feeding access.",
    priceRange: "$25–45",
    category: "PJs & comfort",
    searchUrl: amazonSearch("nursing pajama set postpartum"),
    keywords: ["pajama", "pjs", "sleepwear", "nightgown"],
  },
  {
    name: "Postpartum robe",
    description: "Soft, easy-access robe for hospital stays and early recovery at home.",
    priceRange: "$30–50",
    category: "PJs & comfort",
    searchUrl: amazonSearch("postpartum nursing robe"),
    keywords: ["robe", "hospital bag"],
  },
  {
    name: "Nursing bra (wireless)",
    description: "Wireless, stretchy support that adjusts as your size changes.",
    priceRange: "$20–40",
    category: "PJs & comfort",
    searchUrl: amazonSearch("wireless nursing bra"),
    keywords: ["nursing bra", "bra", "wireless bra"],
  },
  {
    name: "Nursing tank top",
    description: "Built-in shelf bra with clip access, easy to layer under anything.",
    priceRange: "$15–30",
    category: "PJs & comfort",
    searchUrl: amazonSearch("nursing tank top"),
    keywords: ["nursing shirt", "nursing top", "tank"],
  },
  {
    name: "Perineal spray",
    description: "Cooling witch hazel spray for postpartum perineal discomfort.",
    priceRange: "$8–15",
    category: "Body care",
    searchUrl: amazonSearch("perineal spray postpartum"),
    keywords: ["perineal", "postpartum spray", "recovery spray"],
  },
  {
    name: "Sitz bath soak",
    description: "Herbal soak for perineal or C-section recovery baths.",
    priceRange: "$10–18",
    category: "Body care",
    searchUrl: amazonSearch("postpartum sitz bath soak"),
    keywords: ["sitz bath", "soak"],
  },
  {
    name: "Nipple cream",
    description: "Lanolin or plant-based balm for sore, cracked nipples.",
    priceRange: "$8–16",
    category: "Body care",
    searchUrl: amazonSearch("nipple cream breastfeeding"),
    keywords: ["nipple cream", "lanolin", "sore nipples"],
  },
  {
    name: "Postpartum belly wrap",
    description: "Gentle compression support for core recovery.",
    priceRange: "$20–40",
    category: "Body care",
    searchUrl: amazonSearch("postpartum belly wrap"),
    keywords: ["belly wrap", "belly band", "compression"],
  },
  {
    name: "C-section recovery underwear",
    description: "High-waisted, soft-band underwear that sits above an incision.",
    priceRange: "$18–35",
    category: "Body care",
    searchUrl: amazonSearch("c section recovery underwear"),
    keywords: ["c-section", "cesarean", "recovery underwear"],
  },
  {
    name: "Postnatal vitamins",
    description: "Continued prenatal-level nutrients, often with added support for breastfeeding.",
    priceRange: "$15–30",
    category: "Supplements",
    searchUrl: amazonSearch("postnatal vitamins"),
    keywords: ["postnatal vitamin", "vitamins"],
  },
  {
    name: "Lactation support supplement",
    description: "Fenugreek or blessed thistle blends some moms use to support supply.",
    priceRange: "$12–25",
    category: "Supplements",
    searchUrl: amazonSearch("lactation supplement fenugreek"),
    keywords: ["lactation supplement", "fenugreek", "milk supply"],
  },
  {
    name: "Magnesium supplement",
    description: "Commonly used for sleep and muscle recovery postpartum.",
    priceRange: "$10–20",
    category: "Supplements",
    searchUrl: amazonSearch("magnesium supplement postpartum"),
    keywords: ["magnesium"],
  },
  {
    name: "Nursing pillow",
    description: "Supportive, angled pillow for feeding positioning.",
    priceRange: "$30–50",
    category: "Feeding",
    searchUrl: amazonSearch("nursing pillow"),
    keywords: ["nursing pillow", "boppy", "feeding pillow"],
  },
  {
    name: "Manual or electric breast pump",
    description: "For building a stash, relief pumping, or exclusive pumping.",
    priceRange: "$40–200",
    category: "Feeding",
    searchUrl: amazonSearch("breast pump"),
    keywords: ["breast pump", "pump", "pumping"],
  },
  {
    name: "Burp cloths (set)",
    description: "Absorbent cloths for feeding, spit-up, and general mess control.",
    priceRange: "$10–20",
    category: "Feeding",
    searchUrl: amazonSearch("burp cloths set"),
    keywords: ["burp cloth", "burp rag"],
  },
  {
    name: "Bottle warmer",
    description: "Quick, even warming for pumped milk or formula.",
    priceRange: "$25–45",
    category: "Feeding",
    searchUrl: amazonSearch("baby bottle warmer"),
    keywords: ["bottle warmer"],
  },
  {
    name: "Blackout curtains",
    description: "Helps create a sleep-friendly room for daytime naps, hers or baby's.",
    priceRange: "$20–40",
    category: "Sleep & recovery",
    searchUrl: amazonSearch("blackout curtains"),
    keywords: ["blackout curtains", "curtains"],
  },
  {
    name: "White noise machine",
    description: "Consistent sound to help mask household noise during naps.",
    priceRange: "$20–35",
    category: "Sleep & recovery",
    searchUrl: amazonSearch("white noise machine baby"),
    keywords: ["white noise", "sound machine"],
  },
  {
    name: "Heating pad",
    description: "For cramping, engorgement relief, or general aches.",
    priceRange: "$15–30",
    category: "Sleep & recovery",
    searchUrl: amazonSearch("heating pad"),
    keywords: ["heating pad"],
  },
  {
    name: "Compression socks",
    description: "Helps with postpartum swelling, especially after a hospital stay.",
    priceRange: "$10–20",
    category: "Sleep & recovery",
    searchUrl: amazonSearch("compression socks postpartum"),
    keywords: ["compression socks", "swelling"],
  },
];

export function searchProducts(query: string, limit = 4): Product[] {
  const q = query.toLowerCase();
  const scored = PRODUCT_CATALOG.map((p) => {
    let score = 0;
    if (p.name.toLowerCase().includes(q)) score += 3;
    if (p.category.toLowerCase().includes(q)) score += 2;
    for (const kw of p.keywords) {
      if (q.includes(kw) || kw.includes(q)) score += 2;
    }
    const queryWords = q.split(/\s+/).filter(Boolean);
    for (const word of queryWords) {
      if (word.length < 3) continue;
      if (p.name.toLowerCase().includes(word)) score += 1;
      if (p.keywords.some((kw) => kw.includes(word))) score += 1;
    }
    return { product: p, score };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.product);
}
