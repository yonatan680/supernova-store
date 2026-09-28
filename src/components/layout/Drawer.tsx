"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "../Icons";

interface DrawerProps {
  id: string;
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  label: string;
  /** Logical side: "start" = right in RTL, "end" = left in RTL, "top" = search sheet. */
  side: "start" | "end" | "top";
  children: ReactNode;
  footer?: ReactNode;
  initialFocus?: React.RefObject<HTMLElement | null>;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function Drawer({ id, open, onClose, title, label, side, children, footer, initialFocus }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.dataset.locks = String(Number(root.dataset.locks ?? 0) + 1);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      const n = Number(root.dataset.locks ?? 1) - 1;
      if (n <= 0) delete root.dataset.locks;
      else root.dataset.locks = String(n);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement as HTMLElement;
      const t = setTimeout(() => {
        (initialFocus?.current ?? panelRef.current?.querySelector<HTMLElement>(FOCUSABLE))?.focus();
      }, 60);
      return () => clearTimeout(t);
    }
    returnFocus.current?.focus?.();
  }, [open, initialFocus]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const nodes = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="drawer" data-open={open} data-side={side} inert={!open}>
      <div className="drawer__scrim" onClick={onClose} aria-hidden="true" />
      <div
        id={id}
        ref={panelRef}
        className="drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onKeyDown={onKeyDown}
      >
        <div className="drawer__head">
          <div className="drawer__title">{title}</div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="סגירה">
            <CloseIcon />
          </button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </div>
    </div>
  );
}
