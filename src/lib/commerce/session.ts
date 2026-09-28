"use client";

import { EMPTY_SHIPPING_DETAILS, type ShippingDetails } from "./types";

const PENDING_KEY = "supernova.checkout.pending.v1";
const DETAILS_KEY = "supernova.checkout.details.v1";

/** The order the current cart was sent to payment as. The cart is cleared only when this order is confirmed paid. */
export function setPendingOrder(orderId: string) {
  try {
    localStorage.setItem(PENDING_KEY, orderId);
  } catch {}
}

export function getPendingOrder(): string | null {
  try {
    return localStorage.getItem(PENDING_KEY);
  } catch {
    return null;
  }
}

export function clearPendingOrder() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch {}
}

/** Shipping details survive a failed payment for this tab only (sessionStorage), never persisted long-term. */
export function saveDetails(details: ShippingDetails) {
  try {
    sessionStorage.setItem(DETAILS_KEY, JSON.stringify(details));
  } catch {}
}

export function loadDetails(): ShippingDetails {
  try {
    const raw = sessionStorage.getItem(DETAILS_KEY);
    return raw ? { ...EMPTY_SHIPPING_DETAILS, ...(JSON.parse(raw) as Partial<ShippingDetails>) } : EMPTY_SHIPPING_DETAILS;
  } catch {
    return EMPTY_SHIPPING_DETAILS;
  }
}

export function clearDetails() {
  try {
    sessionStorage.removeItem(DETAILS_KEY);
  } catch {}
}
