"use client";

import { useEffect, useState } from "react";
import { announcements } from "@/data/site";

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % announcements.length), 4500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div
      className="announce"
      role="region"
      aria-label="הודעות"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="announce__track" aria-live="polite">
        {announcements.map((text, i) => (
          <p key={text} className="announce__item" data-active={i === index} aria-hidden={i !== index}>
            {text}
          </p>
        ))}
      </div>
    </div>
  );
}
