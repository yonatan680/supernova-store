import { absoluteUrl, isSameOrigin, json, rateLimited, readJson } from "@/server/http";
import { attachPaymentReference, createOrder, markPaymentFailed } from "@/server/orders/service";
import { getCheckoutConfig, getPaymentProvider } from "@/server/payments";
import type { CheckoutFailure, CheckoutSuccess } from "@/lib/commerce/types";

export const runtime = "nodejs";

const fail = (code: CheckoutFailure["code"], status: number, fields?: CheckoutFailure["fields"]) => json({ ok: false, code, fields } satisfies CheckoutFailure, status);

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return fail("invalid_request", 403);
  if (rateLimited(request)) return fail("rate_limited", 429);

  const provider = getPaymentProvider();
  if (!provider || !getCheckoutConfig().enabled) return fail("payments_disabled", 503);

  const body = await readJson(request);
  const created = await createOrder(body, provider);
  if (!created.ok) {
    const status = created.code === "price_changed" ? 409 : created.code === "invalid_request" ? 400 : 422;
    return fail(created.code, status, created.fields);
  }
  const order = created.value;
  const returnUrl = absoluteUrl(`/checkout/confirmation?order=${order.id}&key=${order.accessKey}`);

  try {
    const payment = await provider.createPayment({
      order,
      amountMinor: order.total * 100,
      currency: order.currency,
      method: order.paymentMethod,
      description: `SUPERNOVA ${order.id}`,
      successUrl: returnUrl,
      cancelUrl: `${returnUrl}&returned=cancel`,
      notifyUrl: absoluteUrl("/api/payments/webhook"),
    });
    if (!payment.redirectUrl.startsWith("https://")) throw new Error("Provider returned a non-https payment URL");
    await attachPaymentReference(order.id, payment.reference);
    return json({ ok: true, orderId: order.id, accessKey: order.accessKey, redirectUrl: payment.redirectUrl } satisfies CheckoutSuccess);
  } catch (err) {
    console.error(`[checkout] ${order.id}: could not create payment`, err instanceof Error ? err.message : err);
    await markPaymentFailed(order.id, "create_payment_failed");
    return fail("provider_error", 502);
  }
}
