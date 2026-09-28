"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { mainNav } from "@/data/navigation";
import { useStore } from "@/lib/store";
import { BagIcon, MenuIcon, SearchIcon, UserIcon } from "../Icons";
import { Logo } from "../Logo";

export function Header() {
  const { totals, hydrated, openPanel, panel } = useStore();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = hydrated ? totals.count : 0;

  return (
    <header className="header" data-scrolled={scrolled}>
      <div className="header__inner container">
        <div className="header__start">
          <button
            type="button"
            className="icon-btn header__menu"
            aria-label="פתיחת תפריט"
            aria-expanded={panel === "menu"}
            aria-controls="mobile-menu"
            onClick={() => openPanel("menu")}
          >
            <MenuIcon />
          </button>
          <Link href="/" className="header__logo" aria-label="SUPERNOVA — דף הבית">
            <Logo />
          </Link>
        </div>

        <nav className="header__nav" aria-label="ניווט ראשי">
          <ul>
            {mainNav.map((item) => {
              const active = pathname === item.href || (item.href !== "/shop" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? "page" : undefined} className="header__link">
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="header__end">
          <button
            type="button"
            className="icon-btn"
            aria-label="חיפוש"
            aria-expanded={panel === "search"}
            aria-controls="search-overlay"
            onClick={() => openPanel("search")}
          >
            <SearchIcon />
          </button>
          <Link href="/account" className="icon-btn header__account" aria-label="החשבון שלי">
            <UserIcon />
          </Link>
          <button
            type="button"
            className="icon-btn header__cart"
            aria-label={`סל קניות, ${count} פריטים`}
            aria-expanded={panel === "cart"}
            aria-controls="cart-drawer"
            onClick={() => openPanel("cart")}
          >
            <BagIcon />
            <span className="header__count" data-empty={count === 0} aria-hidden="true">
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
