"use client";

import { useStore } from "@/lib/store";

/** Screen-reader announcement for cart updates; the opening drawer is the visual feedback. */
export function Toast() {
  const { toast } = useStore();
  return (
    <div className="visually-hidden" role="status" aria-live="polite">
      {toast}
    </div>
  );
}
