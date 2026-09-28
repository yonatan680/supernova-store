/**
 * Shipping methods offered at checkout.
 * SUPERNOVA has not published shipping costs, so `price` is null → shown as [SUPERNOVA SHIPPING POLICY]
 * and online payment stays blocked until a real price (0 for free shipping) is set here.
 * The server reads this same file, so the price shown is the price charged.
 */
export interface ShippingMethod {
  id: string;
  label: string;
  description: string;
  /** ILS. null = not published yet. */
  price: number | null;
}

export const shippingMethods: ShippingMethod[] = [
  {
    id: "home-delivery",
    label: "משלוח עד הבית",
    description: "משלוח זמין לכל רחבי ישראל",
    price: null,
  },
];

export function getShippingMethod(id: string): ShippingMethod | undefined {
  return shippingMethods.find((m) => m.id === id);
}
