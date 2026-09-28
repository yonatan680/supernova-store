"use client";

import { MinusIcon, PlusIcon } from "../Icons";

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 20,
  label = "כמות",
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md";
}) {
  return (
    <div className="qty" data-size={size} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="הוספת יחידה">
        <PlusIcon width={16} height={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="הפחתת יחידה">
        <MinusIcon width={16} height={16} />
      </button>
    </div>
  );
}
