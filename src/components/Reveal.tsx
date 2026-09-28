"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/** Adds data-revealed once the element scrolls into view. CSS owns the actual motion. */
export function Reveal({ as: Tag = "div", className = "", children, ...rest }: { as?: ElementType; className?: string; children: ReactNode; [k: string]: unknown }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-revealed", "true");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
