"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { img } from "@/lib/images";
import { defaultSelections, fromPrice, imageFor, sizesFor } from "@/lib/product";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { CloseIcon, PlusIcon } from "../Icons";
import { Price } from "./Price";

const MAX_SWATCHES = 4;

export function ProductCard({ product, priority = false, sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" }: { product: Product; priority?: boolean; sizes?: string }) {
  const { addItem } = useStore();
  const [selections, setSelections] = useState(() => defaultSelections(product));
  const [quickOpen, setQuickOpen] = useState(false);

  const primaryKey = imageFor(product, selections);
  const primary = img(primaryKey);
  const hoverKey = product.images.find((k) => k !== primaryKey);
  const hover = hoverKey ? img(hoverKey) : null;

  const swatchOption = product.options.find((o) => o.id === "color" || o.id === "brand" || o.id === "model");
  const sizeList = sizesFor(product);
  const { min, varies } = fromPrice(product);
  const href = `/products/${product.handle}`;

  const quickAdd = (size?: string) => {
    addItem({ handle: product.handle, selections, size });
    setQuickOpen(false);
  };

  return (
    <article className="card">
      <div className="card__media">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="card__media-link">
          <Image
            src={primary.src}
            alt=""
            fill
            sizes={sizes}
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL={primary.blur}
            className="card__img"
          />
          {hover && (
            <Image src={hover.src} alt="" fill sizes={sizes} loading="lazy" className="card__img card__img--hover" />
          )}
        </Link>
        {product.isNew && <span className="badge">חדש</span>}

        {sizeList.length > 0 || product.options.some((o) => o.id === "piece") ? (
          <>
            <button
              type="button"
              className="card__quick"
              aria-label={`הוספה מהירה: ${product.title}`}
              aria-expanded={quickOpen}
              onClick={() => setQuickOpen((o) => !o)}
            >
              {quickOpen ? <CloseIcon width={18} height={18} /> : <PlusIcon width={18} height={18} />}
            </button>
            <div className="card__quick-panel" data-open={quickOpen} inert={!quickOpen}>
              {product.options
                .filter((o) => o.id === "piece")
                .map((o) => (
                  <div key={o.id} className="card__quick-row" role="radiogroup" aria-label={o.label}>
                    {o.values.map((v) => (
                      <button
                        key={v.value}
                        type="button"
                        role="radio"
                        aria-checked={selections[o.id] === v.value}
                        className="mini-chip"
                        onClick={() => setSelections((s) => ({ ...s, [o.id]: v.value }))}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                ))}
              {sizeList.length > 0 ? (
                <>
                  <p className="card__quick-label">בחרו מידה</p>
                  <div className="card__quick-row">
                    {sizeList.map((s) => (
                      <button key={s} type="button" className="mini-chip" onClick={() => quickAdd(s)}>
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button type="button" className="btn btn--primary btn--block btn--sm" onClick={() => quickAdd()}>
                  הוספה לסל
                </button>
              )}
            </div>
          </>
        ) : (
          <button type="button" className="card__quick" aria-label={`הוספה לסל: ${product.title}`} onClick={() => quickAdd()}>
            <PlusIcon width={18} height={18} />
          </button>
        )}
      </div>

      <div className="card__body">
        <p className="card__brand">{product.brand}</p>
        <h3 className="card__title">
          <Link href={href}>{product.title}</Link>
        </h3>
        <Price value={min} from={varies} className="card__price" />
        {swatchOption && swatchOption.values.length > 1 && (
          <div className="swatches" role="radiogroup" aria-label={`${swatchOption.label} — ${product.title}`}>
            {swatchOption.values.slice(0, MAX_SWATCHES).map((v) => {
              const thumb = v.image ? img(v.image) : null;
              return (
                <button
                  key={v.value}
                  type="button"
                  role="radio"
                  aria-checked={selections[swatchOption.id] === v.value}
                  aria-label={v.label}
                  title={v.label}
                  className="swatch"
                  onClick={() => setSelections((s) => ({ ...s, [swatchOption.id]: v.value }))}
                  style={v.swatch ? { background: v.swatch } : undefined}
                >
                  {!v.swatch && thumb && <Image src={thumb.src} alt="" width={48} height={48} sizes="24px" />}
                </button>
              );
            })}
            {swatchOption.values.length > MAX_SWATCHES && (
              <Link href={href} className="swatches__more" aria-label={`עוד ${swatchOption.values.length - MAX_SWATCHES} אפשרויות`}>
                +{swatchOption.values.length - MAX_SWATCHES}
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
