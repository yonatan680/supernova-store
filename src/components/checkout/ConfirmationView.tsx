"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PAYMENT_METHODS, type PublicOrder } from "@/lib/commerce/types";
import { clearDetails, clearPendingOrder, getPendingOrder } from "@/lib/commerce/session";
import { formatPrice } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AlertIcon, CheckCircleIcon, LockIcon } from "../Icons";
import { OrderSummary } from "./OrderSummary";

type View = "loading" | "missing" | "pending" | "paid" | "failed";

export function ConfirmationView({ orderId, accessKey, returned }: { orderId: string; accessKey: string; returned?: string }) {
  const { clear } = useStore();
  const [view, setView] = useState<View>(orderId && accessKey ? "loading" : "missing");
  const [order, setOrder] = useState<PublicOrder | null>(null);

  useEffect(() => {
    if (!orderId || !accessKey) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempts = 0;

    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}?key=${encodeURIComponent(accessKey)}`, { cache: "no-store" });
        const data = (await res.json()) as { ok: boolean; order?: PublicOrder };
        if (cancelled) return;
        if (!data.ok || !data.order) {
          setView("missing");
          return;
        }
        setOrder(data.order);
        if (data.order.status === "paid") {
          if (getPendingOrder() === data.order.id) {
            clear();
            clearPendingOrder();
            clearDetails();
          }
          setView("paid");
          return;
        }
        if (data.order.status === "failed" || returned === "cancel") {
          setView("failed");
          return;
        }
        setView("pending");
        if (attempts < 8) {
          attempts += 1;
          timer = setTimeout(load, 1600);
        }
      } catch {
        if (!cancelled) setView(attempts === 0 ? "missing" : "pending");
      }
    };

    void load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, accessKey, returned, clear]);

  if (view === "loading") {
    return <div className="container checkout checkout--loading" aria-busy="true" />;
  }

  if (view === "missing") {
    return (
      <div className="container empty-state empty-state--page">
        <p className="empty-state__title">לא מצאנו את ההזמנה</p>
        <p>ייתכן שהקישור שגוי או שפג תוקפו.</p>
        <Link href="/checkout" className="btn btn--primary">
          חזרה לתשלום
        </Link>
      </div>
    );
  }

  const summary = order ? (
    <OrderSummary
      heading={view === "paid" ? "מה הוזמן" : "סיכום הזמנה"}
      lines={order.lines.map((l, i) => ({
        id: `${l.handle}-${i}`,
        title: l.title,
        variant: l.variant,
        image: l.image,
        quantity: l.quantity,
        lineTotal: l.lineTotal,
      }))}
      gross={order.gross}
      discounts={order.discounts}
      shippingLabel={order.shipping.label}
      shippingPrice={order.shipping.price}
      total={order.total}
    />
  ) : null;

  if (view === "paid" && order) {
    return (
      <div className="container checkout checkout--confirm">
        <div className="confirm">
          <p className="confirm__icon confirm__icon--ok" aria-hidden="true">
            <CheckCircleIcon width={36} height={36} />
          </p>
          <h2 className="confirm__title">ההזמנה התקבלה</h2>
          <p className="confirm__lead">תודה. התשלום אושר ונתחיל לטפל בהזמנה.</p>
          <p className="confirm__number">
            מספר הזמנה <strong>{order.id}</strong>
          </p>
          <p className="hint">
            {order.confirmationEmail === "sent"
              ? `אישור נשלח אל ${order.customer.email}`
              : "שמרו את מספר ההזמנה. אישור במייל יישלח כשיחובר שירות דיוור."}
          </p>
          <address className="confirm__ship">
            {order.customer.fullName}
            <br />
            {order.customer.street} {order.customer.houseNumber}
            {order.customer.apartment ? `, דירה ${order.customer.apartment}` : ""}
            <br />
            {order.customer.city}
            {order.customer.zip ? `, ${order.customer.zip}` : ""}
          </address>
          <p className="hint">
            {PAYMENT_METHODS[order.paymentMethod].label} · {formatPrice(order.total)}
          </p>
          <div className="confirm__actions">
            <Link href="/shop" className="btn btn--primary">
              המשך לקניות
            </Link>
          </div>
        </div>
        {summary}
      </div>
    );
  }

  return (
    <div className="container checkout checkout--confirm">
      <div className="confirm">
        {view === "failed" ? (
          <>
            <p className="confirm__icon" aria-hidden="true">
              <AlertIcon width={36} height={36} />
            </p>
            <h2 className="confirm__title">התשלום לא הושלם</h2>
            <p className="confirm__lead">לא חייבנו את הכרטיס, והסל שלכם נשמר. אפשר לנסות שוב מתי שנוח.</p>
          </>
        ) : (
          <>
            <p className="confirm__icon" aria-hidden="true">
              <LockIcon width={36} height={36} />
            </p>
            <h2 className="confirm__title">ממתינים לאישור התשלום</h2>
            <p className="confirm__lead">עדיין אין אישור מחברת הסליקה. אם חויבתם, האישור יופיע כאן — לא נסמן את ההזמנה כשולמה לפני כן.</p>
          </>
        )}
        {order && (
          <p className="confirm__number">
            מספר הזמנה <strong>{order.id}</strong>
          </p>
        )}
        <div className="confirm__actions">
          <Link href="/checkout" className="btn btn--primary">
            ניסיון תשלום נוסף
          </Link>
          <Link href="/shop" className="btn btn--outline">
            חזרה לחנות
          </Link>
        </div>
      </div>
      {summary}
    </div>
  );
}
