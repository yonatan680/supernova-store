import Image from "next/image";
import type { ReactNode } from "react";
import { PLACEHOLDER } from "@/data/site";
import { formatPrice } from "@/lib/format";
import { img } from "@/lib/images";

export interface SummaryLine {
  id: string;
  title: string;
  variant?: string;
  image: string;
  quantity: number;
  lineTotal: number | null;
}

export function OrderSummary({
  heading = "סיכום הזמנה",
  lines,
  gross,
  discounts,
  shippingLabel,
  shippingPrice,
  total,
  unpricedCount = 0,
  extra,
}: {
  heading?: string;
  lines: SummaryLine[];
  gross: number;
  discounts: { label: string; amount: number }[];
  shippingLabel: string;
  shippingPrice: number | null;
  total: number | null;
  unpricedCount?: number;
  extra?: ReactNode;
}) {
  const allUnpriced = unpricedCount > 0 && unpricedCount === lines.length;
  return (
    <aside className="checkout__summary" aria-labelledby="co-summary">
      <h2 id="co-summary" className="checkout__heading">
        {heading}
      </h2>
      <ul className="summary__lines">
        {lines.map((l) => {
          const image = img(l.image);
          return (
            <li key={l.id} className="summary__line">
              <span className="summary__media">
                <Image src={image.src} alt="" width={120} height={150} sizes="60px" />
                <span className="summary__qty">{l.quantity}</span>
              </span>
              <span className="summary__info">
                <span className="summary__title">{l.title}</span>
                {l.variant && <span className="summary__variant">{l.variant}</span>}
              </span>
              <span className={`summary__price ${l.lineTotal == null ? "price--ph" : ""}`}>{formatPrice(l.lineTotal)}</span>
            </li>
          );
        })}
      </ul>
      <dl className="summary__totals">
        <div>
          <dt>סכום ביניים</dt>
          <dd>{formatPrice(allUnpriced ? null : gross)}</dd>
        </div>
        {discounts.map((d) => (
          <div key={d.label} className="summary__discount">
            <dt>{d.label}</dt>
            <dd>-{formatPrice(d.amount)}</dd>
          </div>
        ))}
        <div>
          <dt>{shippingLabel}</dt>
          <dd>{shippingPrice == null ? <span className="ph">{PLACEHOLDER.shipping}</span> : formatPrice(shippingPrice)}</dd>
        </div>
        <div className="summary__grand">
          <dt>סה״כ לתשלום</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
      {unpricedCount > 0 && (
        <p className="cart__note">
          {unpricedCount === 1
            ? "פריט אחד ללא מחיר מפורסם — לא ניתן לשלם עליו אונליין עד שהמחיר יאושר."
            : `${unpricedCount} פריטים ללא מחיר מפורסם — לא ניתן לשלם עליהם אונליין עד שהמחיר יאושר.`}
        </p>
      )}
      {extra}
    </aside>
  );
}
