import type { Metadata } from "next";
import Link from "next/link";
import { CollectionHeader } from "@/components/collection/CollectionHeader";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "החשבון שלי",
  robots: { index: false, follow: false },
  alternates: { canonical: "/account" },
};

export default function AccountPage() {
  return (
    <>
      <CollectionHeader eyebrow="Account" title="החשבון שלי" />
      <div className="container prose-page">
        <div className="notice">
          <p className="ph-block">[CUSTOMER ACCOUNTS — requires commerce backend]</p>
          <p>
            חשבונות לקוח והיסטוריית הזמנות יופעלו עם חיבור מערכת מסחר (למשל Shopify Customer Accounts). בינתיים {site.bio.ordering} — מעקב אחר הזמנה מתבצע בשיחה עם {site.instagram.at}.
          </p>
          <div className="notice__actions">
            <a href={site.instagram.dm} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
              שליחת הודעה
            </a>
            <Link href="/shop" className="btn btn--outline">
              לחנות
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
