import type { ShippingDetails } from "./types";

type Errors = Partial<Record<keyof ShippingDetails, string>>;

const LIMITS: Record<keyof ShippingDetails, number> = {
  fullName: 80,
  phone: 20,
  email: 120,
  city: 60,
  street: 80,
  houseNumber: 10,
  apartment: 20,
  zip: 10,
  notes: 500,
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Trims, strips control characters and enforces length caps. */
export function normalizeShipping(input: Partial<Record<keyof ShippingDetails, unknown>>): ShippingDetails {
  const out = {} as ShippingDetails;
  for (const key of Object.keys(LIMITS) as (keyof ShippingDetails)[]) {
    const raw = typeof input[key] === "string" ? (input[key] as string) : "";
    const clean = key === "notes" ? raw.replace(/[^\P{C}\n]/gu, "") : raw.replace(/\p{C}/gu, "").replace(/\s+/g, " ");
    out[key] = clean.trim().slice(0, LIMITS[key]);
  }
  return out;
}

export function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("972") ? `0${digits.slice(3)}` : digits;
}

export function validateShipping(d: ShippingDetails): Errors {
  const e: Errors = {};
  if (d.fullName.length < 2 || !d.fullName.includes(" ")) e.fullName = "יש להזין שם פרטי ושם משפחה";
  if (!/^0\d{8,9}$/.test(phoneDigits(d.phone))) e.phone = "יש להזין מספר טלפון ישראלי תקין";
  if (!EMAIL.test(d.email)) e.email = "יש להזין כתובת אימייל תקינה";
  if (d.city.length < 2) e.city = "יש להזין עיר";
  if (d.street.length < 2) e.street = "יש להזין רחוב";
  if (!/\d/.test(d.houseNumber)) e.houseNumber = "יש להזין מספר בית";
  if (d.zip && !/^\d{5}(\d{2})?$/.test(d.zip.replace(/\s/g, ""))) e.zip = "יש להזין מיקוד תקין (5 או 7 ספרות)";
  return e;
}
