import { categories } from "./categories";

export const mainNav = [
  { href: "/shop", label: "חנות" },
  ...categories.map((c) => ({ href: `/collections/${c.handle}`, label: c.title })),
];

export const footerNav = {
  shop: [{ href: "/shop", label: "כל המוצרים" }, { href: "/shop?sort=new", label: "חדש באתר" }, ...mainNav.slice(1, 4)],
  collections: mainNav.slice(4),
  help: [
    { href: "/pages/faq", label: "שאלות נפוצות" },
    { href: "/pages/shipping", label: "משלוחים" },
    { href: "/pages/returns", label: "החזרות" },
    { href: "/pages/contact", label: "צור קשר" },
  ],
  legal: [
    { href: "/pages/privacy", label: "פרטיות" },
    { href: "/pages/terms", label: "תקנון" },
  ],
};
