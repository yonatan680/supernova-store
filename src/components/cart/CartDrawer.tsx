"use client";

import Image from "next/image";
import Link from "next/link";
import { site } from "@/data/site";
import { formatPrice } from "@/lib/format";
import { img } from "@/lib/images";
import { useStore } from "@/lib/store";
import { BagIcon, TrashIcon } from "../Icons";
import { Drawer } from "../layout/Drawer";
import { QuantityInput } from "./QuantityInput";

export function CartDrawer() {
  const { panel, closePanel, totals, setQuantity, removeItem, hydrated } = useStore();
  const empty = !hydrated || totals.lines.length === 0;

  return (
    <Drawer
      id="cart-drawer"
      open={panel === "cart"}
      onClose={closePanel}
      side="end"
      label="סל קניות"
      title={
        <span className="cart__title">
          הסל שלי <span className="cart__title-count">({totals.count})</span>
        </span>
      }
      footer={
        empty ? undefined : (
          <div className="cart__foot">
            {totals.discounts.map((d) => (
              <div key={d.label} className="cart__row cart__row--discount">
                <span>{d.label}</span>
                <span>-{formatPrice(d.amount)}</span>
              </div>
            ))}
            <div className="cart__row cart__row--total">
              <span>סכום ביניים</span>
              <span>{formatPrice(totals.unpriced.length === totals.lines.length ? null : totals.subtotal)}</span>
            </div>
            {totals.unpriced.length > 0 && (
              <p className="cart__note">חלק מהפריטים ללא מחיר מפורסם — המחיר יאושר בהודעה פרטית.</p>
            )}
            <p className="cart__note">{site.voice.shipping}</p>
            <Link href="/checkout" className="btn btn--primary btn--block" onClick={closePanel}>
              מעבר לתשלום
            </Link>
            <button type="button" className="btn btn--link" onClick={closePanel}>
              המשך בקניות
            </button>
          </div>
        )
      }
    >
      {empty ? (
        <div className="cart__empty">
          <BagIcon width={40} height={40} />
          <p>הסל שלך ריק</p>
          <Link href="/shop" className="btn btn--primary" onClick={closePanel}>
            לחנות
          </Link>
        </div>
      ) : (
        <ul className="cart__lines">
          {totals.lines.map((line) => {
            const image = img(line.image);
            return (
              <li key={line.id} className="cart-line">
                <Link href={`/products/${line.handle}`} className="cart-line__media" onClick={closePanel}>
                  <Image src={image.src} alt={line.product.title} width={160} height={200} sizes="80px" placeholder="blur" blurDataURL={image.blur} />
                </Link>
                <div className="cart-line__info">
                  <Link href={`/products/${line.handle}`} className="cart-line__title" onClick={closePanel}>
                    {line.product.title}
                  </Link>
                  {line.variant && <p className="cart-line__variant">{line.variant}</p>}
                  <p className="cart-line__unit">{formatPrice(line.unit)}</p>
                  <div className="cart-line__actions">
                    <QuantityInput size="sm" value={line.quantity} onChange={(n) => setQuantity(line.id, n)} label={`כמות ${line.product.title}`} />
                    <button type="button" className="icon-btn icon-btn--sm" onClick={() => removeItem(line.id)} aria-label={`הסרת ${line.product.title}`}>
                      <TrashIcon width={18} height={18} />
                    </button>
                  </div>
                </div>
                {line.lineTotal != null && <p className="cart-line__total">{formatPrice(line.lineTotal)}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
