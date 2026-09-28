"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PLACEHOLDER, site } from "@/data/site";
import { img } from "@/lib/images";
import { defaultSelections, galleryFor, sizesFor, unitPrice } from "@/lib/product";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { QuantityInput } from "../cart/QuantityInput";
import { InstagramIcon, LockIcon, TruckIcon } from "../Icons";
import { Price } from "./Price";
import { ProductGallery } from "./ProductGallery";
import { SizeGuide } from "./SizeGuide";

export function ProductView({ product, categoryTitle }: { product: Product; categoryTitle: string }) {
  const { addItem, trackView, closePanel } = useStore();
  const router = useRouter();
  const [selections, setSelections] = useState(() => defaultSelections(product));
  const [size, setSize] = useState<string | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const atcRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLFieldSetElement>(null);

  const sizes = sizesFor(product);
  const price = unitPrice(product, selections);
  const gallery = galleryFor(product, selections);

  useEffect(() => trackView(product.handle), [product.handle, trackView]);

  useEffect(() => {
    const node = atcRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([e]) => setStickyVisible(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const validate = () => {
    if (sizes.length > 0 && !size) {
      setSizeError(true);
      sizeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      sizeRef.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
      return false;
    }
    return true;
  };

  const add = () => {
    if (!validate()) return;
    addItem({ handle: product.handle, selections, size }, quantity);
  };

  const buyNow = () => {
    if (!validate()) return;
    addItem({ handle: product.handle, selections, size }, quantity);
    closePanel();
    router.push("/checkout");
  };

  return (
    <div className="pdp container">
      <div className="pdp__gallery">
        <ProductGallery images={gallery} title={product.title} />
      </div>

      <div className="pdp__info">
        <div className="pdp__sticky">
          <p className="eyebrow">
            {product.brand} · {categoryTitle}
          </p>
          <h1 className="pdp__title">{product.title}</h1>
          <div className="pdp__price-row">
            <Price value={price} className="pdp__price" />
            {product.isNew && <span className="badge badge--inline">חדש</span>}
          </div>
          {product.priceNote && (
            <p className="pdp__price-note">
              <span className="pdp__price-note-label">מהפוסט:</span> {product.priceNote}
            </p>
          )}
          {product.bundle && <p className="pdp__bundle">{product.bundle.label} — ההנחה מחושבת אוטומטית בסל</p>}

          {product.options.map((option) => {
            const current = option.values.find((v) => v.value === selections[option.id]);
            const visual = option.values.some((v) => v.image) && option.id !== "piece";
            return (
              <fieldset key={option.id} className="pdp__option">
                <legend>
                  {option.label}: <strong>{current?.label}</strong>
                </legend>
                <div className={visual ? "variant-grid" : "chip-row"}>
                  {option.values.map((v) => {
                    const checked = selections[option.id] === v.value;
                    const thumb = visual && v.image ? img(v.image) : null;
                    return (
                      <button
                        key={v.value}
                        type="button"
                        className={thumb ? "variant" : "chip"}
                        aria-pressed={checked}
                        aria-label={thumb ? v.label : undefined}
                        title={v.label}
                        onClick={() => setSelections((s) => ({ ...s, [option.id]: v.value }))}
                      >
                        {thumb ? (
                          <Image src={thumb.src} alt="" width={120} height={150} sizes="60px" />
                        ) : (
                          <>
                            {v.label}
                            {v.price != null && <span className="chip__meta">₪{v.price}</span>}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          {sizes.length > 0 && product.sizeScale && (
            <fieldset ref={sizeRef} className="pdp__option" aria-describedby="size-hint" aria-invalid={sizeError}>
              <legend className="pdp__size-legend">
                <span>
                  מידה{size && <>: <strong>{size}</strong></>}
                </span>
                <SizeGuide scale={product.sizeScale} />
              </legend>
              <div className="chip-row">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="chip chip--size"
                    aria-pressed={size === s}
                    onClick={() => {
                      setSize(s);
                      setSizeError(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p id="size-hint" className={sizeError ? "form-error" : "hint"} role={sizeError ? "alert" : undefined}>
                {sizeError ? "יש לבחור מידה" : `זמינות מידות: ${PLACEHOLDER.sizing}`}
              </p>
            </fieldset>
          )}

          <div className="pdp__buy" ref={atcRef}>
            <QuantityInput value={quantity} onChange={setQuantity} />
            <button type="button" className="btn btn--primary pdp__atc" onClick={add}>
              הוספה לסל
            </button>
          </div>
          <button type="button" className="btn btn--outline btn--block" onClick={buyNow}>
            קנו עכשיו
          </button>

          <ul className="pdp__facts">
            <li>
              <TruckIcon width={20} height={20} /> {site.voice.shipping}
            </li>
            <li>
              <LockIcon width={20} height={20} /> תשלום מאובטח בקופה. פרטי כרטיס לא נשמרים באתר.
            </li>
          </ul>

          <div className="accordion">
            <details open>
              <summary>תיאור המוצר</summary>
              <div className="accordion__content">
                {product.description ?? <p className="ph-block">{PLACEHOLDER.description}</p>}
              </div>
            </details>
            <details>
              <summary>משלוחים</summary>
              <div className="accordion__content">
                <p>{site.voice.shipping}</p>
                <p className="ph-block">{PLACEHOLDER.shipping}</p>
              </div>
            </details>
            <details>
              <summary>החזרות והחלפות</summary>
              <div className="accordion__content">
                <p className="ph-block">{PLACEHOLDER.returns}</p>
              </div>
            </details>
            <details>
              <summary>מקור המוצר</summary>
              <div className="accordion__content">
                <p>המוצר, המחיר והתמונות מתוך הפוסט הרשמי של SUPERNOVA באינסטגרם.</p>
                <a href={product.source.url} target="_blank" rel="noopener noreferrer" className="link-inline">
                  <InstagramIcon width={18} height={18} /> לצפייה בפוסט
                </a>
              </div>
            </details>
          </div>
        </div>
      </div>

      <div className="sticky-atc" data-visible={stickyVisible} inert={!stickyVisible}>
        <div className="sticky-atc__info">
          <span className="sticky-atc__title">{product.title}</span>
          <Price value={price} />
        </div>
        <button type="button" className="btn btn--primary" onClick={add}>
          {sizes.length > 0 && !size ? "בחירת מידה" : "הוספה לסל"}
        </button>
      </div>
    </div>
  );
}
