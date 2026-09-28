import type { CheckoutErrorCode } from "./types";

export const CHECKOUT_ERRORS: Record<CheckoutErrorCode, string> = {
  payments_disabled: "התשלום המקוון עדיין לא פעיל. הסל נשמר.",
  rate_limited: "יותר מדי ניסיונות. נסו שוב בעוד רגע.",
  invalid_request: "לא ניתן לשלוח את ההזמנה. רעננו את העמוד ונסו שוב.",
  invalid_customer: "יש לתקן את פרטי המשלוח המסומנים.",
  terms_required: "יש לאשר את תנאי השימוש כדי להמשיך.",
  empty_cart: "הסל ריק.",
  invalid_items: "חלק מהפריטים בסל כבר לא זמינים. בדקו את הסל ונסו שוב.",
  unpriced_items: "חלק מהפריטים ללא מחיר מפורסם, ולכן לא ניתן לשלם עליהם אונליין.",
  shipping_unavailable: "עלות המשלוח עדיין לא הוגדרה, ולכן לא ניתן לגבות תשלום אונליין.",
  payment_method_unavailable: "אמצעי התשלום שנבחר אינו זמין כרגע.",
  price_changed: "המחיר התעדכן. בדקו את סיכום ההזמנה ונסו שוב.",
  provider_error: "לא ניתן להתחיל את התשלום כרגע. הסל נשמר — אפשר לנסות שוב.",
};
