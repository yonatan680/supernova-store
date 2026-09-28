import { PLACEHOLDER, site } from "./site";

export interface FaqItem {
  q: string;
  /** Verified sentence(s) from SUPERNOVA, if any. */
  known?: string;
  /** Unverified part — rendered as a visible placeholder. */
  placeholder?: string;
}

export const faq: FaqItem[] = [
  {
    q: "איך מזמינים?",
    known: `בוחרים מוצר, מוסיפים לסל ועוברים לתשלום. ${site.bio.ordering} נשאר זמין כגיבוי דרך ${site.instagram.at}.`,
  },
  {
    q: "משלוחים",
    known: site.voice.shipping,
    placeholder: `${PLACEHOLDER.shipping} — זמני אספקה ועלויות משלוח`,
  },
  { q: "מידות", placeholder: PLACEHOLDER.sizing },
  { q: "החזרות והחלפות", placeholder: PLACEHOLDER.returns },
  { q: "אמצעי תשלום", known: "בקופה בוחרים אמצעי תשלום. פרטי כרטיס מוזנים בעמוד המאובטח של חברת הסליקה ולא נשמרים באתר.", placeholder: PLACEHOLDER.payments },
  { q: "מעקב הזמנה", placeholder: PLACEHOLDER.tracking },
];

export interface PolicyPage {
  slug: string;
  title: string;
  description: string;
  sections: { heading: string; known?: string; placeholder?: string }[];
}

export const pages: PolicyPage[] = [
  {
    slug: "faq",
    title: "שאלות נפוצות",
    description: "הזמנות, משלוחים, מידות, החזרות ותשלום ב-SUPERNOVA.",
    sections: faq.map((f) => ({ heading: f.q, known: f.known, placeholder: f.placeholder })),
  },
  {
    slug: "shipping",
    title: "מדיניות משלוחים",
    description: "משלוח זמין לכל רחבי ישראל.",
    sections: [
      { heading: "אזורי משלוח", known: site.voice.shipping },
      { heading: "זמני אספקה", placeholder: `${PLACEHOLDER.shipping} — זמני אספקה` },
      { heading: "עלויות משלוח", placeholder: `${PLACEHOLDER.shipping} — עלויות` },
    ],
  },
  {
    slug: "returns",
    title: "החזרות והחלפות",
    description: "מדיניות החזרות והחלפות.",
    sections: [
      { heading: "החזרות", placeholder: PLACEHOLDER.returns },
      { heading: "החלפת מידה", placeholder: `${PLACEHOLDER.returns} — החלפות` },
    ],
  },
  {
    slug: "privacy",
    title: "מדיניות פרטיות",
    description: "מדיניות הפרטיות של SUPERNOVA.",
    sections: [{ heading: "פרטיות", placeholder: PLACEHOLDER.privacy }],
  },
  {
    slug: "terms",
    title: "תקנון ותנאי שימוש",
    description: "תנאי השימוש באתר SUPERNOVA.",
    sections: [{ heading: "תקנון", placeholder: PLACEHOLDER.terms }],
  },
  {
    slug: "contact",
    title: "צור קשר",
    description: "הזמנות ושאלות — בהודעה פרטית באינסטגרם.",
    sections: [
      { heading: "אינסטגרם", known: `${site.instagram.at} — ${site.bio.ordering}` },
      { heading: "אימייל", placeholder: PLACEHOLDER.email },
      { heading: "טלפון / וואטסאפ", placeholder: PLACEHOLDER.phone },
    ],
  },
];
