"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { categories } from "@/data/categories";
import { site } from "@/data/site";
import { img } from "@/lib/images";
import { useStore } from "@/lib/store";
import { ChevronIcon, InstagramIcon, UserIcon } from "../Icons";
import { Logo } from "../Logo";
import { Drawer } from "./Drawer";

export function MobileMenu() {
  const { panel, closePanel } = useStore();
  const pathname = usePathname();

  useEffect(() => {
    closePanel();
  }, [pathname, closePanel]);

  return (
    <Drawer id="mobile-menu" open={panel === "menu"} onClose={closePanel} side="start" label="תפריט" title={<Logo />}>
      <nav aria-label="ניווט מובייל" className="mmenu">
        <Link href="/shop" className="mmenu__all">
          לכל המוצרים <ChevronIcon className="flip" />
        </Link>
        <ul className="mmenu__list">
          {categories.map((c) => {
            const image = img(c.image);
            return (
              <li key={c.handle}>
                <Link href={`/collections/${c.handle}`} className="mmenu__item">
                  <span className="mmenu__thumb">
                    <Image src={image.src} alt="" width={96} height={96} sizes="48px" />
                  </span>
                  <span>
                    <span className="mmenu__label">{c.title}</span>
                    <span className="mmenu__en">{c.titleEn}</span>
                  </span>
                  <ChevronIcon className="flip mmenu__chev" />
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mmenu__meta">
          <Link href="/account" className="mmenu__meta-link">
            <UserIcon /> החשבון שלי
          </Link>
          <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="mmenu__meta-link">
            <InstagramIcon /> {site.instagram.at}
          </a>
          <Link href="/pages/faq" className="mmenu__meta-link">שאלות נפוצות</Link>
          <Link href="/pages/contact" className="mmenu__meta-link">צור קשר</Link>
        </div>
      </nav>
    </Drawer>
  );
}
