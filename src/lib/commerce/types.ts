/** Checkout / order types shared by the browser and the server. Nothing here is secret. */

export type PaymentMethodId = "card" | "bit" | "apple_pay" | "google_pay";

export const PAYMENT_METHODS: Record<PaymentMethodId, { label: string; description: string }> = {
  card: { label: "כרטיס אשראי", description: "הזנת פרטי הכרטיס מתבצעת בעמוד המאובטח של חברת הסליקה" },
  bit: { label: "Bit", description: "אישור התשלום באפליקציה" },
  apple_pay: { label: "Apple Pay", description: "במכשירים ודפדפנים תומכים" },
  google_pay: { label: "Google Pay", description: "במכשירים ודפדפנים תומכים" },
};

export interface ShippingDetails {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  street: string;
  houseNumber: string;
  apartment: string;
  zip: string;
  notes: string;
}

export const EMPTY_SHIPPING_DETAILS: ShippingDetails = {
  fullName: "",
  phone: "",
  email: "",
  city: "",
  street: "",
  houseNumber: "",
  apartment: "",
  zip: "",
  notes: "",
};

/** What the browser sends. Prices are deliberately absent — the server reprices from the catalogue. */
export interface CheckoutLineInput {
  handle: string;
  quantity: number;
  selections: Record<string, string>;
  size?: string;
}

export interface CheckoutRequest {
  lines: CheckoutLineInput[];
  customer: ShippingDetails;
  shippingMethod: string;
  paymentMethod: PaymentMethodId;
  acceptTerms: boolean;
  /** Total the customer saw. Only used to detect a stale cart — never charged. */
  expectedTotal: number;
}

export type CheckoutErrorCode =
  | "payments_disabled"
  | "rate_limited"
  | "invalid_request"
  | "invalid_customer"
  | "terms_required"
  | "empty_cart"
  | "invalid_items"
  | "unpriced_items"
  | "shipping_unavailable"
  | "payment_method_unavailable"
  | "price_changed"
  | "provider_error";

export interface CheckoutSuccess {
  ok: true;
  orderId: string;
  accessKey: string;
  /** Provider-hosted payment page. Card details are entered there, never on this site. */
  redirectUrl: string;
}

export interface CheckoutFailure {
  ok: false;
  code: CheckoutErrorCode;
  fields?: Partial<Record<keyof ShippingDetails, string>>;
}

export type OrderStatus = "pending_payment" | "paid" | "failed";

export interface OrderLine {
  handle: string;
  title: string;
  variant: string;
  image: string;
  quantity: number;
  unit: number;
  lineTotal: number;
}

/** Order as shown to the customer who holds its access key. */
export interface PublicOrder {
  id: string;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
  lines: OrderLine[];
  gross: number;
  discounts: { label: string; amount: number }[];
  shipping: { label: string; price: number };
  total: number;
  currency: "ILS";
  paymentMethod: PaymentMethodId;
  customer: Omit<ShippingDetails, "notes" | "phone">;
  confirmationEmail: "sent" | "not_configured" | "failed" | "pending";
}

/** Server-computed checkout availability, rendered into the checkout page. */
export interface CheckoutConfig {
  enabled: boolean;
  providerName: string | null;
  methods: PaymentMethodId[];
  /** Human-readable setup gaps. Shown only in development. */
  missing: string[];
}
