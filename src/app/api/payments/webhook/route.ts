import { json } from "@/server/http";
import { applyVerifiedPayment } from "@/server/orders/service";
import { getPaymentProvider } from "@/server/payments";

export const runtime = "nodejs";

/** Server-to-server payment notifications (webhook / IPN). Register `${NEXT_PUBLIC_SITE_URL}/api/payments/webhook` with the provider. */
export async function POST(request: Request) {
  const provider = getPaymentProvider();
  if (!provider) return json({ ok: false }, 404);

  let event: Awaited<ReturnType<typeof provider.parseWebhook>>;
  try {
    event = await provider.parseWebhook(request);
  } catch (err) {
    console.error("[webhook] rejected:", err instanceof Error ? err.message : err);
    return json({ ok: false }, 400);
  }
  if (!event) return json({ ok: false }, 401);
  if (!event.orderId) return json({ ok: true });

  const order = await applyVerifiedPayment(event.orderId, event.payment);
  if (!order) return json({ ok: false }, 404);
  return json({ ok: true });
}
