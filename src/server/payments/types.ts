import "server-only";
import type { PaymentMethodId } from "@/lib/commerce/types";
import type { OrderRecord } from "../orders/repository";

/**
 * Contract every payment-provider adapter implements.
 *
 * The site only ever uses the provider's HOSTED payment page / hosted fields: the customer types card
 * details on the provider's domain, so card numbers never reach this server, its logs or its storage.
 * Most Israeli acquirers (PayPlus, Grow/Meshulam, CardCom, Tranzila, Hyp) and international ones
 * (Stripe Checkout, PayPal) fit this shape: create a payment page → redirect → server-to-server callback.
 */
export interface PaymentProvider {
  /** Matches the PAYMENT_PROVIDER env value. */
  id: string;
  /** Shown to the customer ("התשלום מעובד על ידי …"). Must be the real provider name. */
  displayName: string;
  /** Methods actually enabled on the merchant account. */
  methods: PaymentMethodId[];

  /** Creates a payment page for the order with credentials read from server-only env vars. */
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;

  /**
   * Asks the provider, server-to-server, for the current state of the order's payment.
   * Must never trust query-string values from the customer's browser.
   */
  verifyPayment(order: OrderRecord): Promise<VerifiedPayment>;

  /**
   * Authenticates a provider callback (signature / shared secret, and ideally a re-query via verifyPayment)
   * and returns which order it concerns. Return null for anything that cannot be authenticated.
   */
  parseWebhook(request: Request): Promise<{ orderId: string; payment: VerifiedPayment } | null>;
}

export interface CreatePaymentInput {
  order: OrderRecord;
  /** Amount in agorot, computed on the server. */
  amountMinor: number;
  currency: "ILS";
  method: PaymentMethodId;
  description: string;
  /** Where the provider sends the customer after a completed payment. */
  successUrl: string;
  /** Where the provider sends the customer after cancelling / failing. */
  cancelUrl: string;
  /** Server-to-server callback (webhook / IPN) URL. */
  notifyUrl: string;
}

export interface CreatePaymentResult {
  /** https URL of the provider-hosted payment page. */
  redirectUrl: string;
  /** Provider's id for this payment/session, stored on the order for later verification. */
  reference: string;
}

export type VerifiedPayment =
  | { status: "paid"; amountMinor: number; currency: string; reference: string }
  | { status: "failed"; reason?: string }
  | { status: "pending" };
