import type { Metadata } from "next";
import { ConfirmationView } from "@/components/checkout/ConfirmationView";
import { CollectionHeader } from "@/components/collection/CollectionHeader";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "אישור הזמנה",
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; key?: string; returned?: string }>;
}) {
  const q = await searchParams;
  return (
    <>
      <CollectionHeader eyebrow="Checkout" title={q.returned === "cancel" ? "התשלום לא הושלם" : "אישור הזמנה"} />
      <ConfirmationView orderId={q.order ?? ""} accessKey={q.key ?? ""} returned={q.returned} />
    </>
  );
}
