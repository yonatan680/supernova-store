import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";
import { CollectionHeader } from "@/components/collection/CollectionHeader";
import { getCheckoutConfig } from "@/server/payments";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "תשלום",
  robots: { index: false, follow: false },
  alternates: { canonical: "/checkout" },
};

export default function CheckoutPage() {
  const config = getCheckoutConfig();
  return (
    <>
      <CollectionHeader eyebrow="Checkout" title="תשלום מאובטח" />
      <CheckoutView
        config={{
          ...config,
          missing: process.env.NODE_ENV === "development" ? config.missing : [],
        }}
      />
    </>
  );
}
