import type { NextRequest } from "next/server";
import { json } from "@/server/http";
import { applyVerifiedPayment, getOrderWithKey, toPublicOrder } from "@/server/orders/service";
import { getPaymentProvider } from "@/server/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const key = request.nextUrl.searchParams.get("key") ?? "";
  let order = await getOrderWithKey(id, key);
  if (!order) return json({ ok: false }, 404);

  // The customer's return from the payment page proves nothing; ask the provider directly.
  const provider = getPaymentProvider();
  if (order.status === "pending_payment" && provider?.id === order.payment.provider) {
    try {
      order = (await applyVerifiedPayment(order.id, await provider.verifyPayment(order))) ?? order;
    } catch (err) {
      console.error(`[orders] ${order.id}: verification failed`, err instanceof Error ? err.message : err);
    }
  }
  return json({ ok: true, order: toPublicOrder(order) });
}
