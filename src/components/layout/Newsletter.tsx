"use client";

import { useState } from "react";
import { PLACEHOLDER } from "@/data/site";

/** UI is complete; subscription is not sent anywhere until a provider is connected. */
export function Newsletter() {
  const [state, setState] = useState<"idle" | "done">("idle");

  return (
    <form
      className="newsletter"
      onSubmit={(e) => {
        e.preventDefault();
        setState("done");
      }}
    >
      <label htmlFor="newsletter-email" className="newsletter__label">
        עדכונים על דרופים חדשים
      </label>
      <div className="newsletter__row">
        <input id="newsletter-email" type="email" required placeholder="האימייל שלך" autoComplete="email" dir="ltr" />
        <button type="submit" className="btn btn--light">
          הרשמה
        </button>
      </div>
      <p className="newsletter__hint" aria-live="polite">
        {state === "done" ? `תודה! (טרם חובר ספק דיוור — ${PLACEHOLDER.newsletter})` : PLACEHOLDER.newsletter}
      </p>
    </form>
  );
}
