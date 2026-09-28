"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { categories } from "@/data/categories";
import { getProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { img } from "@/lib/images";
import { fromPrice } from "@/lib/product";
import { searchProducts } from "@/lib/search";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import { SearchIcon } from "../Icons";
import { Drawer } from "../layout/Drawer";

function ResultRow({ product, onNavigate }: { product: Product; onNavigate: () => void }) {
  const image = img(product.images[0]);
  const { min, varies } = fromPrice(product);
  return (
    <li>
      <Link href={`/products/${product.handle}`} className="sresult" onClick={onNavigate}>
        <span className="sresult__media">
          <Image src={image.src} alt="" width={112} height={140} sizes="56px" placeholder="blur" blurDataURL={image.blur} />
        </span>
        <span className="sresult__text">
          <span className="sresult__brand">{product.brand}</span>
          <span className="sresult__title">{product.title}</span>
        </span>
        <span className="sresult__price">
          {varies && "החל מ-"}
          {formatPrice(min)}
        </span>
      </Link>
    </li>
  );
}

export function SearchOverlay() {
  const { panel, closePanel, recent } = useStore();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const results = useMemo(() => searchProducts(deferred, 8), [deferred]);
  const open = panel === "search";

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const recentProducts = recent.map(getProduct).filter(Boolean).slice(0, 4) as Product[];
  const hasQuery = deferred.trim().length > 0;

  return (
    <Drawer id="search-overlay" open={open} onClose={closePanel} side="top" label="חיפוש מוצרים" title="חיפוש" initialFocus={inputRef}>
      <form
        role="search"
        className="search__form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!query.trim()) return;
          closePanel();
          router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
        }}
      >
        <SearchIcon className="search__icon" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חפשו מותג, דגם או קטגוריה…"
          aria-label="חיפוש"
          aria-controls="search-results"
          autoComplete="off"
          enterKeyHint="search"
        />
      </form>

      <div id="search-results" className="search__results" aria-live="polite">
        {hasQuery ? (
          results.length > 0 ? (
            <>
              <p className="search__heading">{results.length} תוצאות</p>
              <ul className="search__list">
                {results.map((p) => (
                  <ResultRow key={p.handle} product={p} onNavigate={closePanel} />
                ))}
              </ul>
              <Link href={`/shop?q=${encodeURIComponent(deferred.trim())}`} className="btn btn--outline btn--block" onClick={closePanel}>
                לכל התוצאות
              </Link>
            </>
          ) : (
            <div className="search__empty">
              <p className="search__empty-title">לא נמצאו תוצאות עבור “{deferred}”</p>
              <p>נסו מותג אחר (למשל Nike, Jordan, Burberry) או דפדפו בקטגוריות:</p>
            </div>
          )
        ) : null}

        {(!hasQuery || results.length === 0) && (
          <>
            <p className="search__heading">קטגוריות</p>
            <ul className="search__chips">
              {categories.map((c) => (
                <li key={c.handle}>
                  <Link href={`/collections/${c.handle}`} className="chip" onClick={closePanel}>
                    {c.title}
                  </Link>
                </li>
              ))}
            </ul>
            {!hasQuery && recentProducts.length > 0 && (
              <>
                <p className="search__heading">נצפו לאחרונה</p>
                <ul className="search__list">
                  {recentProducts.map((p) => (
                    <ResultRow key={p.handle} product={p} onNavigate={closePanel} />
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </div>
    </Drawer>
  );
}
