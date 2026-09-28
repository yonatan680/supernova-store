/**
 * Brand facts for SUPERNOVA.
 * Everything here was taken from https://www.instagram.com/supernova.global/ (bio, captions, highlights).
 * Anything that could not be verified is a bracketed PLACEHOLDER and must be replaced by the brand.
 */

export const PLACEHOLDER = {
  price: "[PRODUCT PRICE]",
  description: "[PRODUCT DESCRIPTION]",
  shipping: "[SUPERNOVA SHIPPING POLICY]",
  returns: "[RETURN POLICY]",
  sizing: "[SUPERNOVA SIZE GUIDE]",
  payments: "[PAYMENT METHODS]",
  tracking: "[ORDER TRACKING PROCESS]",
  privacy: "[PRIVACY POLICY]",
  terms: "[TERMS OF SERVICE]",
  email: "[CONTACT EMAIL]",
  phone: "[CONTACT PHONE / WHATSAPP]",
  newsletter: "[NEWSLETTER PROVIDER]",
  checkout: "[CHECKOUT / PAYMENT PROVIDER]",
} as const;

/** Absolute origin for metadata, sitemap, and payment return URLs. Never throws. */
function resolveSiteUrl() {
  const candidates = [process.env.NEXT_PUBLIC_SITE_URL];
  // Vercel sets these at build time. An empty NEXT_PUBLIC_SITE_URL must not win (`??` does not treat "").
  if (typeof window === "undefined") {
    candidates.push(process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_URL);
  }
  for (const raw of candidates) {
    const value = raw?.trim();
    if (!value) continue;
    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      return new URL(withProtocol).origin;
    } catch {
      continue;
    }
  }
  return "http://localhost:3000";
}

export const site = {
  name: "SUPERNOVA",
  legalName: "SuperNova",
  url: resolveSiteUrl(),
  locale: "he_IL",
  instagram: {
    handle: "supernova.global",
    /** "@handle" wrapped in Unicode isolates so it renders correctly inside Hebrew text. */
    at: "\u2066@supernova.global\u2069",
    url: "https://www.instagram.com/supernova.global/",
    dm: "https://ig.me/m/supernova.global",
  },
  /** Bio, verbatim. */
  bio: {
    proof: "מעל 100+ לקוחות סטייל מרוצים!",
    welcome: "ברוכים הבאים ל-SUPERNOVA",
    promise: "בגדי מעצבים ונעלי יוקרה רק כאן!",
    ordering: "הזמנות בפרטי בלבד",
  },
  /** Recurring caption copy, verbatim. */
  voice: {
    headline: "אלגנטיות אמיתית מתחילה בפרטים הקטנים",
    statement: "שילוב מושלם של יוקרה, נוחות וסגנון. חוויה שלא מתפשרת.",
    shipping: "משלוח זמין לכל רחבי ישראל, משלוחים בפרטי.",
    tags: ["#style", "#clean", "#streetwear"],
  },
  /** Giveaway reel, 26.08.2026. */
  giveaway: {
    url: "https://www.instagram.com/supernova.global/reel/DcgEkQztBI-/",
    trigger: "ההגרלה תתקיים ברגע שנגיע ל-500 עוקבים",
    prizes: ["₪500 לקנייה בחנות", "זוג נעליים במתנה", "₪100 הנחה במתנה"],
  },
} as const;

export const announcements = [
  "משלוח זמין לכל רחבי ישראל",
  "בגדי מעצבים ונעלי יוקרה — רק ב-SUPERNOVA",
  "הגרלת ענק באינסטגרם: ₪500 לקנייה, זוג נעליים ו-₪100 הנחה",
];
