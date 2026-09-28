"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { categories } from "@/data/categories";
import { ALL_SIZES, applyFilters, COLOR_FAMILIES, colorFamilies, parseFilters, PRICE_BUCKETS, SORTS, type FilterState } from "@/lib/filters";
import { searchProducts } from "@/lib/search";
import type { Product } from "@/lib/types";
import { CloseIcon, FilterIcon } from "../Icons";
import { Drawer } from "../layout/Drawer";
import { ProductGrid } from "../product/ProductGrid";

type ListKey = "category" | "brand" | "size" | "color" | "price";

export function CollectionView({ products, showCategoryFilter }: { products: Product[]; showCategoryFilter: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cols, setCols] = useState<1 | 2>(2);

  const filters = useMemo(() => parseFilters(new URLSearchParams(params.toString())), [params]);
  const hits = useMemo(() => (filters.q ? new Set(searchProducts(filters.q, 100).map((p) => p.handle)) : undefined), [filters.q]);
  const results = useMemo(() => applyFilters(products, filters, hits), [products, filters, hits]);

  const facets = useMemo(() => {
    const brands = [...new Set(products.map((p) => p.brand))];
    const colors = COLOR_FAMILIES.filter((c) => products.some((p) => colorFamilies(p).includes(c.id)));
    const sizes = ALL_SIZES.filter((s) => products.some((p) => p.sizeScale && (p.sizeScale === "shoe" ? /^\d+$/.test(s) : !/^\d+$/.test(s))));
    const cats = categories.filter((c) => products.some((p) => p.category === c.handle));
    return { brands, colors, sizes, cats };
  }, [products]);

  const update = (next: Partial<FilterState>) => {
    const merged = { ...filters, ...next };
    const sp = new URLSearchParams();
    if (merged.q) sp.set("q", merged.q);
    for (const key of ["category", "brand", "size", "color", "price"] as ListKey[]) {
      if (merged[key].length) sp.set(key, merged[key].join(","));
    }
    if (merged.sort !== "featured") sp.set("sort", merged.sort);
    const qs = sp.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };

  const toggle = (key: ListKey, value: string) => {
    const current = filters[key] as string[];
    update({ [key]: current.includes(value) ? current.filter((v) => v !== value) : [...current, value] });
  };

  const active: { key: ListKey | "q"; value: string; label: string }[] = [
    ...(filters.q ? [{ key: "q" as const, value: filters.q, label: `“${filters.q}”` }] : []),
    ...filters.category.map((v) => ({ key: "category" as const, value: v, label: categories.find((c) => c.handle === v)?.title ?? v })),
    ...filters.brand.map((v) => ({ key: "brand" as const, value: v, label: v })),
    ...filters.size.map((v) => ({ key: "size" as const, value: v, label: `מידה ${v}` })),
    ...filters.color.map((v) => ({ key: "color" as const, value: v, label: COLOR_FAMILIES.find((c) => c.id === v)?.label ?? v })),
    ...filters.price.map((v) => ({ key: "price" as const, value: v, label: PRICE_BUCKETS.find((b) => b.id === v)?.label ?? v })),
  ];

  const clearAll = () => update({ q: "", category: [], brand: [], size: [], color: [], price: [] });

  const panel = (prefix: string) => (
    <div className="filters">
      {showCategoryFilter && (
        <FilterGroup title="קטגוריה">
          {facets.cats.map((c) => (
            <Check key={c.handle} id={`${prefix}-cat-${c.handle}`} label={c.title} count={products.filter((p) => p.category === c.handle).length} checked={filters.category.includes(c.handle)} onChange={() => toggle("category", c.handle)} />
          ))}
        </FilterGroup>
      )}
      {facets.brands.length > 1 && (
        <FilterGroup title="מותג">
          {facets.brands.map((b) => (
            <Check key={b} id={`${prefix}-brand-${b}`} label={b} count={products.filter((p) => p.brand === b).length} checked={filters.brand.includes(b)} onChange={() => toggle("brand", b)} />
          ))}
        </FilterGroup>
      )}
      {facets.sizes.length > 0 && (
        <FilterGroup title="מידה">
          <div className="chip-row chip-row--tight">
            {facets.sizes.map((s) => (
              <button key={s} type="button" className="chip chip--size" aria-pressed={filters.size.includes(s)} onClick={() => toggle("size", s)}>
                {s}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}
      {facets.colors.length > 0 && (
        <FilterGroup title="צבע">
          <div className="color-filter">
            {facets.colors.map((c) => (
              <button key={c.id} type="button" className="color-filter__btn" aria-pressed={filters.color.includes(c.id)} onClick={() => toggle("color", c.id)}>
                <span className="color-filter__dot" style={{ background: c.hex }} aria-hidden="true" />
                {c.label}
              </button>
            ))}
          </div>
        </FilterGroup>
      )}
      <FilterGroup title="מחיר">
        {PRICE_BUCKETS.map((b) => (
          <Check key={b.id} id={`${prefix}-price-${b.id}`} label={b.label} checked={filters.price.includes(b.id)} onChange={() => toggle("price", b.id)} />
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="collection container">
      <div className="collection__bar">
        <button type="button" className="btn btn--outline btn--sm collection__filter-btn" onClick={() => setDrawerOpen(true)} aria-controls="filters-drawer" aria-expanded={drawerOpen}>
          <FilterIcon width={18} height={18} /> סינון{active.length > 0 && ` (${active.length})`}
        </button>
        <p className="collection__count" aria-live="polite">
          {results.length} מוצרים
        </p>
        <div className="collection__tools">
          <div className="cols-toggle" role="group" aria-label="תצוגת עמודות">
            <button type="button" aria-pressed={cols === 1} onClick={() => setCols(1)} aria-label="עמודה אחת">
              <span className="cols-toggle__icon" data-cols="1" />
            </button>
            <button type="button" aria-pressed={cols === 2} onClick={() => setCols(2)} aria-label="שתי עמודות">
              <span className="cols-toggle__icon" data-cols="2" />
            </button>
          </div>
          <label className="select">
            <span className="visually-hidden">מיון</span>
            <select value={filters.sort} onChange={(e) => update({ sort: e.target.value as FilterState["sort"] })}>
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {active.length > 0 && (
        <ul className="active-filters" aria-label="מסננים פעילים">
          {active.map((a) => (
            <li key={`${a.key}-${a.value}`}>
              <button type="button" className="chip chip--removable" onClick={() => (a.key === "q" ? update({ q: "" }) : toggle(a.key, a.value))} aria-label={`הסרת מסנן ${a.label}`}>
                {a.label} <CloseIcon width={14} height={14} />
              </button>
            </li>
          ))}
          <li>
            <button type="button" className="btn btn--link" onClick={clearAll}>
              ניקוי הכל
            </button>
          </li>
        </ul>
      )}

      <div className="collection__layout">
        <aside className="collection__sidebar" aria-label="מסננים">
          {panel("side")}
        </aside>
        <div className="collection__results" data-cols={cols}>
          {results.length > 0 ? (
            <ProductGrid products={results} priorityCount={4} />
          ) : (
            <div className="empty-state">
              <p className="empty-state__title">לא נמצאו מוצרים</p>
              <p>נסו להסיר חלק מהמסננים.</p>
              <button type="button" className="btn btn--primary" onClick={clearAll}>
                ניקוי מסננים
              </button>
            </div>
          )}
        </div>
      </div>

      <Drawer
        id="filters-drawer"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        side="start"
        label="סינון מוצרים"
        title="סינון"
        footer={
          <div className="filters__foot">
            <button type="button" className="btn btn--outline" onClick={clearAll}>
              ניקוי
            </button>
            <button type="button" className="btn btn--primary" onClick={() => setDrawerOpen(false)}>
              הצגת {results.length} מוצרים
            </button>
          </div>
        }
      >
        {panel("drawer")}
      </Drawer>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="filter-group" open>
      <summary>{title}</summary>
      <div className="filter-group__body">{children}</div>
    </details>
  );
}

function Check({ id, label, count, checked, onChange }: { id: string; label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <label htmlFor={id} className="check">
      <input id={id} type="checkbox" checked={checked} onChange={onChange} />
      <span className="check__box" aria-hidden="true" />
      <span className="check__label">{label}</span>
      {count != null && <span className="check__count">{count}</span>}
    </label>
  );
}
