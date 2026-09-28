"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { img } from "@/lib/images";
import type { ImageKey } from "@/lib/types";
import { ChevronIcon } from "../Icons";

export function ProductGallery({ images, title }: { images: ImageKey[]; title: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const lead = images[0];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: 0, behavior: "instant" as ScrollBehavior });
    setActive(0);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.index));
        }
      },
      { root: track, threshold: 0.6 },
    );
    track.querySelectorAll("[data-index]").forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [lead, images.length]);

  const go = (i: number) => {
    const track = trackRef.current;
    const slide = track?.querySelector<HTMLElement>(`[data-index="${i}"]`);
    if (!track || !slide) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delta = slide.getBoundingClientRect().left - track.getBoundingClientRect().left;
    track.scrollBy({ left: delta, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div className="gallery" aria-roledescription="גלריה" aria-label={`תמונות ${title}`}>
      <div
        ref={trackRef}
        className="gallery__track"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(Math.min(images.length - 1, active + 1));
          if (e.key === "ArrowRight") go(Math.max(0, active - 1));
        }}
      >
        {images.map((key, i) => {
          const image = img(key);
          return (
            <div key={key} className="gallery__slide" data-index={i} aria-label={`תמונה ${i + 1} מתוך ${images.length}`} role="group">
              <Image
                src={image.src}
                alt={i === 0 ? title : `${title} — תמונה ${i + 1}`}
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                preload={i === 0}
                fetchPriority={i === 0 ? "high" : "auto"}
                placeholder="blur"
                blurDataURL={image.blur}
                className="gallery__img"
              />
            </div>
          );
        })}
      </div>

      {images.length > 1 && (
        <>
          <button type="button" className="gallery__arrow gallery__arrow--prev" onClick={() => go(Math.max(0, active - 1))} disabled={active === 0} aria-label="תמונה קודמת">
            <ChevronIcon />
          </button>
          <button type="button" className="gallery__arrow gallery__arrow--next" onClick={() => go(Math.min(images.length - 1, active + 1))} disabled={active === images.length - 1} aria-label="תמונה הבאה">
            <ChevronIcon className="flip" />
          </button>
          <div className="gallery__dots" aria-hidden="true">
            {images.map((key, i) => (
              <span key={key} data-active={i === active} />
            ))}
          </div>
          <ul className="gallery__thumbs" aria-label="תמונות ממוזערות">
            {images.map((key, i) => {
              const image = img(key);
              return (
                <li key={key}>
                  <button type="button" onClick={() => go(i)} aria-current={i === active ? "true" : undefined} aria-label={`הצגת תמונה ${i + 1}`}>
                    <Image src={image.src} alt="" width={128} height={160} sizes="64px" />
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
