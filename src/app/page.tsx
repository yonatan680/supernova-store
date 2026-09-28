import Image from "next/image";
import Link from "next/link";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { InstagramGrid } from "@/components/home/InstagramGrid";
import { ArrowIcon, InstagramIcon, SendIcon } from "@/components/Icons";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Reveal } from "@/components/Reveal";
import { site } from "@/data/site";
import { getCategories, getNewProducts, getProducts, getProductsByCategory } from "@/lib/catalog";
import { img } from "@/lib/images";

const HERO = ["grid/Dbaibixt13s", "Dba4VIEDaYU/06", "grid/Db7_3eUNs4F"];

export default function HomePage() {
  const categories = getCategories();
  const newDrops = getNewProducts();
  const loved = [...getProducts()].sort((a, b) => (b.source.likes ?? 0) - (a.source.likes ?? 0)).slice(0, 8);
  const sneakers = getProductsByCategory("sneakers");
  const featured = categories.filter((c) => ["sneakers", "hoodies", "sets"].includes(c.handle));
  const editorial = img("Ddk7zUHDfA3/01");
  const editorial2 = img("grid/Dbg34t3N0nb");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: site.name,
    url: site.url,
    description: site.bio.promise,
    sameAs: [site.instagram.url],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="hero" aria-label="SUPERNOVA">
        <div className="hero__media">
          {HERO.map((key, i) => {
            const image = img(key);
            return (
              <div key={key} className="hero__panel" data-index={i}>
                <Image
                  src={image.src}
                  alt=""
                  fill
                  preload={i === 1}
                  fetchPriority={i === 1 ? "high" : "auto"}
                  sizes={i === 1 ? "(min-width: 768px) 34vw, 100vw" : "(min-width: 768px) 33vw, 1px"}
                  placeholder="blur"
                  blurDataURL={image.blur}
                  className="hero__img"
                />
              </div>
            );
          })}
        </div>
        <div className="hero__content">
          <p className="hero__eyebrow">Designer Clothing · Luxury Sneakers</p>
          <h1 className="hero__title">
            <span className="hero__wordmark">SUPERNOVA</span>
            <span className="hero__tagline">{site.voice.headline}</span>
          </h1>
          <div className="hero__ctas">
            <Link href="/shop" className="btn btn--light">
              לחנות
            </Link>
            <Link href="/collections/sneakers" className="btn btn--ghost-light">
              נעליים
            </Link>
          </div>
        </div>
      </section>

      <nav className="highlights container" aria-label="קטגוריות">
        <ul>
          {categories.map((c) => {
            const image = img(c.image);
            return (
              <li key={c.handle}>
                <Link href={`/collections/${c.handle}`} className="highlight">
                  <span className="highlight__ring">
                    <Image src={image.src} alt="" width={160} height={160} sizes="(min-width: 768px) 88px, 68px" />
                  </span>
                  <span className="highlight__label">{c.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className="section container" aria-labelledby="new-title">
        <div className="section__head">
          <div>
            <p className="eyebrow">New Drops</p>
            <h2 id="new-title" className="section__title">חדש ב-SUPERNOVA</h2>
          </div>
          <Link href="/shop?sort=new" className="link-arrow">
            לכל החדשים <ArrowIcon width={18} height={18} />
          </Link>
        </div>
        <Reveal>
          <ProductGrid products={newDrops} variant="grid-4" />
        </Reveal>
      </section>

      <section className="section container" aria-labelledby="collections-title">
        <div className="section__head">
          <div>
            <p className="eyebrow">Collections</p>
            <h2 id="collections-title" className="section__title">קולקציות</h2>
          </div>
        </div>
        <Reveal as="ul" className="collections" role="list">
          {featured.map((c) => {
            const image = img(c.image);
            return (
              <li key={c.handle}>
                <Link href={`/collections/${c.handle}`} className="collection-card">
                  <Image src={image.src} alt="" fill sizes="(min-width: 768px) 33vw, 85vw" placeholder="blur" blurDataURL={image.blur} className="collection-card__img" />
                  <span className="collection-card__text">
                    <span className="collection-card__en">{c.titleEn}</span>
                    <span className="collection-card__title">{c.title}</span>
                    <span className="collection-card__cta">
                      לקולקציה <ArrowIcon width={16} height={16} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </Reveal>
      </section>

      <section className="editorial" aria-labelledby="editorial-title">
        <div className="container editorial__inner">
          <Reveal className="editorial__media">
            <div className="editorial__img editorial__img--a">
              <Image src={editorial.src} alt="Numeris Sneakers" fill sizes="(min-width: 1024px) 30vw, 60vw" placeholder="blur" blurDataURL={editorial.blur} />
            </div>
            <div className="editorial__img editorial__img--b">
              <Image src={editorial2.src} alt="Dior B30" fill sizes="(min-width: 1024px) 20vw, 40vw" placeholder="blur" blurDataURL={editorial2.blur} />
            </div>
          </Reveal>
          <Reveal className="editorial__text">
            <p className="eyebrow eyebrow--light">{site.bio.welcome}</p>
            <h2 id="editorial-title" className="editorial__title">
              {site.voice.statement}
            </h2>
            <p className="editorial__body">{site.bio.promise}</p>
            <Link href="/shop" className="btn btn--light">
              לכל הקולקציה
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section container" aria-labelledby="sneakers-title">
        <div className="section__head">
          <div>
            <p className="eyebrow">Luxury Sneakers</p>
            <h2 id="sneakers-title" className="section__title">נעלי יוקרה</h2>
          </div>
          <Link href="/collections/sneakers" className="link-arrow">
            לכל הנעליים <ArrowIcon width={18} height={18} />
          </Link>
        </div>
        <ProductGrid products={sneakers} variant="rail" />
      </section>

      <section className="section container" aria-labelledby="loved-title">
        <div className="section__head">
          <div>
            <p className="eyebrow">Most Loved</p>
            <h2 id="loved-title" className="section__title">הכי אהובים באינסטגרם</h2>
          </div>
          <Link href="/shop?sort=popular" className="link-arrow">
            לכל המוצרים <ArrowIcon width={18} height={18} />
          </Link>
        </div>
        <Reveal>
          <ProductGrid products={loved} variant="grid-4" />
        </Reveal>
      </section>

      <section className="proof container" aria-labelledby="proof-title">
        <Reveal className="proof__card">
          <p className="proof__number" aria-hidden="true">100+</p>
          <h2 id="proof-title" className="proof__title">{site.bio.proof}</h2>
          <p className="proof__body">להיילייט “לקוחות” בעמוד האינסטגרם של SUPERNOVA.</p>
          <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
            <InstagramIcon width={18} height={18} /> לצפייה בהיילייט
          </a>
        </Reveal>
        <Reveal className="proof__card proof__card--dark">
          <p className="eyebrow eyebrow--light">Giveaway</p>
          <h2 className="proof__title">הגרלת ענק לעוקבים</h2>
          <ul className="proof__list">
            {site.giveaway.prizes.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="proof__body">{site.giveaway.trigger}</p>
          <a href={site.giveaway.url} target="_blank" rel="noopener noreferrer" className="btn btn--light">
            לפרטים באינסטגרם
          </a>
        </Reveal>
        <Reveal className="proof__card">
          <p className="eyebrow">How to order</p>
          <h2 className="proof__title">{site.bio.ordering}</h2>
          <ol className="proof__steps">
            <li>בוחרים מוצרים, צבע ומידה ומוסיפים לסל</li>
            <li>בעמוד ההזמנה — ההודעה נבנית אוטומטית</li>
            <li>שולחים ל-{site.instagram.at} וממשיכים בפרטי</li>
          </ol>
          <a href={site.instagram.dm} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
            <SendIcon width={18} height={18} /> שליחת הודעה
          </a>
        </Reveal>
      </section>

      <InstagramGrid />

      <section className="section container faq-section" aria-labelledby="faq-title">
        <div className="faq-section__head">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-title" className="section__title">שאלות נפוצות</h2>
          <Link href="/pages/faq" className="link-arrow">
            לכל השאלות <ArrowIcon width={18} height={18} />
          </Link>
        </div>
        <FaqAccordion />
      </section>
    </>
  );
}
