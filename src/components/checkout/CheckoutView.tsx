"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent, type HTMLAttributes } from "react";
import { shippingMethods } from "@/data/shipping";
import { PLACEHOLDER, site } from "@/data/site";
import { buildOrderMessage } from "@/lib/checkout";
import { quote } from "@/lib/commerce/quote";
import { CHECKOUT_ERRORS } from "@/lib/commerce/errors";
import { clearPendingOrder, getPendingOrder, loadDetails, saveDetails, setPendingOrder } from "@/lib/commerce/session";
import type { CheckoutConfig, CheckoutFailure, CheckoutRequest, CheckoutSuccess, PaymentMethodId, ShippingDetails } from "@/lib/commerce/types";
import { EMPTY_SHIPPING_DETAILS, PAYMENT_METHODS } from "@/lib/commerce/types";
import { normalizeShipping, validateShipping } from "@/lib/commerce/validation";
import { formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AlertIcon, InstagramIcon, LockIcon } from "../Icons";
import { OrderSummary } from "./OrderSummary";

const FULL_FIELDS = new Set<keyof ShippingDetails>(["fullName", "street"]);

const FIELDS: {
  key: keyof ShippingDetails;
  label: string;
  required?: boolean;
  optional?: boolean;
  autoComplete?: string;
  type?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  dir?: "ltr";
}[] = [
  { key: "fullName", label: "שם מלא", required: true, autoComplete: "name" },
  { key: "phone", label: "טלפון", required: true, autoComplete: "tel", type: "tel", inputMode: "tel", dir: "ltr" },
  { key: "email", label: "אימייל", required: true, autoComplete: "email", type: "email", dir: "ltr" },
  { key: "city", label: "עיר", required: true, autoComplete: "address-level2" },
  { key: "zip", label: "מיקוד", optional: true, autoComplete: "postal-code", inputMode: "numeric", dir: "ltr" },
  { key: "street", label: "רחוב", required: true, autoComplete: "address-line1" },
  { key: "houseNumber", label: "מספר בית", required: true, autoComplete: "address-line2" },
  { key: "apartment", label: "דירה", optional: true, autoComplete: "address-line2" },
];

export function CheckoutView({ config }: { config: CheckoutConfig }) {
  const { totals, hydrated } = useStore();
  const [customer, setCustomer] = useState<ShippingDetails>(EMPTY_SHIPPING_DETAILS);
  const [shippingId, setShippingId] = useState(shippingMethods[0]?.id ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>(config.methods[0] ?? "card");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingDetails, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [igStatus, setIgStatus] = useState<"idle" | "copied" | "manual">("idle");

  const shipping = shippingMethods.find((m) => m.id === shippingId) ?? shippingMethods[0];
  const quoted = quote(totals, shipping);
  const canPayOnline = config.enabled && quoted.total != null && quoted.total > 0 && totals.unpriced.length === 0;
  const methods = config.methods.length > 0 ? config.methods : (["card"] as PaymentMethodId[]);

  useEffect(() => {
    setCustomer(loadDetails());
  }, []);

  useEffect(() => {
    if (hydrated) saveDetails(customer);
  }, [customer, hydrated]);

  useEffect(() => {
    if (config.methods.length && !config.methods.includes(paymentMethod)) setPaymentMethod(config.methods[0]);
  }, [config.methods, paymentMethod]);

  const message = useMemo(() => buildOrderMessage(totals, customer), [totals, customer]);

  if (!hydrated) return <div className="container checkout checkout--loading" aria-busy="true" />;

  if (totals.lines.length === 0) {
    return (
      <div className="container empty-state empty-state--page">
        <p className="empty-state__title">הסל ריק</p>
        <Link href="/shop" className="btn btn--primary">
          לחנות
        </Link>
      </div>
    );
  }

  const setField = (key: keyof ShippingDetails, value: string) => {
    setCustomer((c) => ({ ...c, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validateForm = () => {
    const next = normalizeShipping(customer);
    setCustomer(next);
    const fields = validateShipping(next);
    setErrors(fields);
    if (Object.keys(fields).length > 0) {
      setFormError(CHECKOUT_ERRORS.invalid_customer);
      queueMicrotask(() => document.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return null;
    }
    if (!acceptTerms) {
      setFormError(CHECKOUT_ERRORS.terms_required);
      return null;
    }
    return next;
  };

  const pay = async (e: FormEvent) => {
    e.preventDefault();
    const details = validateForm();
    if (!details) return;
    if (!canPayOnline || quoted.total == null) {
      setFormError(totals.unpriced.length > 0 ? CHECKOUT_ERRORS.unpriced_items : CHECKOUT_ERRORS.payments_disabled);
      return;
    }

    setBusy(true);
    setFormError(null);
    const body: CheckoutRequest = {
      lines: totals.lines.map(({ handle, quantity, selections, size }) => ({ handle, quantity, selections, size })),
      customer: details,
      shippingMethod: shipping.id,
      paymentMethod,
      acceptTerms: true,
      expectedTotal: quoted.total,
    };

    try {
      const res = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = (await res.json()) as CheckoutSuccess | CheckoutFailure;
      if (!data.ok) {
        if (data.fields) setErrors(data.fields);
        setFormError(CHECKOUT_ERRORS[data.code]);
        setBusy(false);
        return;
      }
      if (!/^https:\/\//.test(data.redirectUrl) && !/^http:\/\/localhost\b/.test(data.redirectUrl)) {
        setFormError(CHECKOUT_ERRORS.provider_error);
        setBusy(false);
        return;
      }
      if (getPendingOrder() && getPendingOrder() !== data.orderId) clearPendingOrder();
      setPendingOrder(data.orderId);
      window.location.assign(data.redirectUrl);
    } catch {
      setFormError(CHECKOUT_ERRORS.provider_error);
      setBusy(false);
    }
  };

  const sendViaInstagram = async () => {
    const details = validateForm();
    if (!details) return;
    try {
      await navigator.clipboard.writeText(buildOrderMessage(totals, details));
      setIgStatus("copied");
    } catch {
      setIgStatus("manual");
    }
    window.open(site.instagram.dm, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="container checkout">
      <form className="checkout__form" onSubmit={pay} noValidate>
        <section className="checkout__block" aria-labelledby="co-details">
          <h2 id="co-details" className="checkout__heading">
            <span className="checkout__step">1</span> פרטי משלוח
          </h2>
          <div className="form-grid">
            {FIELDS.map((f) => (
              <label key={f.key} className={`field ${FULL_FIELDS.has(f.key) ? "field--full" : ""}`}>
                <span>
                  {f.label}
                  {f.optional ? " (לא חובה)" : ""}
                </span>
                <input
                  name={f.key}
                  type={f.type ?? "text"}
                  autoComplete={f.autoComplete}
                  inputMode={f.inputMode}
                  dir={f.dir}
                  required={f.required}
                  value={customer[f.key]}
                  aria-invalid={errors[f.key] ? true : undefined}
                  aria-describedby={errors[f.key] ? `${f.key}-err` : undefined}
                  onChange={(e) => setField(f.key, e.target.value)}
                />
                {errors[f.key] && (
                  <span id={`${f.key}-err`} className="field__error">
                    {errors[f.key]}
                  </span>
                )}
              </label>
            ))}
            <label className="field field--full">
              <span>הערות להזמנה (לא חובה)</span>
              <textarea name="notes" rows={3} value={customer.notes} onChange={(e) => setField("notes", e.target.value)} />
            </label>
          </div>
        </section>

        <section className="checkout__block" aria-labelledby="co-ship">
          <h2 id="co-ship" className="checkout__heading">
            <span className="checkout__step">2</span> משלוח
          </h2>
          <div className="choice-list">
            {shippingMethods.map((m) => (
              <label key={m.id} className="choice">
                <input type="radio" name="shippingMethod" checked={shippingId === m.id} onChange={() => setShippingId(m.id)} />
                <span className="choice__body">
                  <span className="choice__title">{m.label}</span>
                  <span className="choice__desc">{m.description}</span>
                </span>
                <span className="choice__price">{m.price == null ? <span className="ph">{PLACEHOLDER.shipping}</span> : formatPrice(m.price)}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="checkout__block" aria-labelledby="co-pay">
          <h2 id="co-pay" className="checkout__heading">
            <span className="checkout__step">3</span> תשלום
          </h2>
          <p className="hint">
            <LockIcon width={16} height={16} />
            {config.providerName
              ? `פרטי הכרטיס מוזנים בעמוד המאובטח של ${config.providerName} — לא נשמרים באתר.`
              : "פרטי כרטיס אשראי לא מוזנים באתר. התשלום יתבצע בעמוד מאובטח של חברת הסליקה אחרי חיבור הספק."}
          </p>
          <div className="choice-list">
            {methods.map((id) => {
              const meta = PAYMENT_METHODS[id];
              const available = config.methods.includes(id);
              return (
                <label key={id} className={`choice ${available ? "" : "choice--disabled"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === id}
                    disabled={!available}
                    onChange={() => setPaymentMethod(id)}
                  />
                  <span className="choice__body">
                    <span className="choice__title">{meta.label}</span>
                    <span className="choice__desc">{available ? meta.description : "יהיה זמין אחרי חיבור ספק הסליקה"}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {!canPayOnline && (
            <p className="checkout__notice">
              <AlertIcon width={18} height={18} />
              {totals.unpriced.length > 0
                ? CHECKOUT_ERRORS.unpriced_items
                : shipping?.price == null
                  ? CHECKOUT_ERRORS.shipping_unavailable
                  : CHECKOUT_ERRORS.payments_disabled}
            </p>
          )}
          {process.env.NODE_ENV === "development" && config.missing.length > 0 && (
            <details className="checkout__setup">
              <summary>מה חסר כדי להפעיל תשלום אמיתי (מוצג רק בפיתוח)</summary>
              <ul>
                {config.missing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </details>
          )}
        </section>

        <section className="checkout__block checkout__block--last">
          <label className="check check--terms">
            <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} />
            <span className="check__box" aria-hidden="true" />
            <span className="check__label">
              קראתי ואני מאשר/ת את{" "}
              <Link href="/pages/terms" target="_blank">
                תנאי השימוש
              </Link>
            </span>
          </label>

          <div className="checkout__cta">
            <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={busy || !canPayOnline}>
              <LockIcon width={18} height={18} />
              {busy ? "מעביר לתשלום מאובטח…" : canPayOnline ? `תשלום מאובטח · ${formatPrice(quoted.total)}` : "תשלום מאובטח — ממתין לחיבור סליקה"}
            </button>
            <p className="checkout__trust">הסל נשמר אם התשלום לא יושלם. לא נסמן הזמנה כשולמה בלי אישור מחברת הסליקה.</p>
          </div>

          <div aria-live="polite">
            {formError && <p className="form-error">{formError}</p>}
          </div>

          {!canPayOnline && (
            <div className="checkout__fallback">
              <p className="hint">בינתיים אפשר לשלוח את ההזמנה ל-{site.instagram.at} — זה תהליך ההזמנה הקיים של המותג.</p>
              <button type="button" className="btn btn--outline btn--block" onClick={sendViaInstagram}>
                <InstagramIcon width={18} height={18} /> שליחת ההזמנה באינסטגרם
              </button>
              <div aria-live="polite">
                {igStatus === "copied" && <p className="form-success">ההזמנה הועתקה ✓ הדביקו אותה בצ׳אט ושלחו.</p>}
                {igStatus === "manual" && <p className="form-error">לא ניתן היה להעתיק אוטומטית — העתיקו מהתיבה למטה.</p>}
              </div>
              <details className="checkout__preview" open={igStatus === "manual"}>
                <summary>תצוגה מקדימה של ההודעה</summary>
                <textarea readOnly value={message} rows={10} aria-label="הודעת ההזמנה" onFocus={(e) => e.currentTarget.select()} />
              </details>
            </div>
          )}
        </section>
      </form>

      <OrderSummary
        lines={totals.lines.map((l) => ({
          id: l.id,
          title: l.product.title,
          variant: l.variant,
          image: l.image,
          quantity: l.quantity,
          lineTotal: l.lineTotal,
        }))}
        gross={totals.gross}
        discounts={totals.discounts}
        shippingLabel={shipping?.label ?? "משלוח"}
        shippingPrice={quoted.shipping}
        total={quoted.total}
        unpricedCount={totals.unpriced.length}
        extra={
          <p className="hint">
            <LockIcon width={16} height={16} /> {site.voice.shipping}
          </p>
        }
      />
    </div>
  );
}
