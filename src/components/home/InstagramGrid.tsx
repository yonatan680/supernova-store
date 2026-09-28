import Image from "next/image";
import { site } from "@/data/site";
import { img } from "@/lib/images";
import { InstagramIcon } from "../Icons";
import { Reveal } from "../Reveal";

/** Real post covers from @supernova.global, each linking to its original post. */
const POSTS = [
  { code: "Ddrt7qnjVof", alt: "BAPE Shark Hoodie" },
  { code: "DdmqJ37jYrd", alt: "AP Royal Pop" },
  { code: "Ddk7zUHDfA3", alt: "Numeris Sneakers" },
  { code: "DdOOQW6jVT4", alt: "Nike Tech Fleece" },
  { code: "Dcmc73uDYfZ", alt: "בשמי מעצבים" },
  { code: "Db7_3eUNs4F", alt: "Nike TN" },
];

export function InstagramGrid() {
  return (
    <section className="section ig" aria-labelledby="ig-title">
      <div className="container">
        <div className="section__head section__head--center">
          <p className="eyebrow">Instagram</p>
          <h2 id="ig-title" className="section__title section__title--latin">
            FOLLOW @{site.instagram.handle.toUpperCase()}
          </h2>
        </div>
        <Reveal as="ul" className="ig__grid" role="list">
          {POSTS.map((p) => {
            const image = img(`grid/${p.code}`);
            return (
              <li key={p.code}>
                <a href={`https://www.instagram.com/p/${p.code}/`} target="_blank" rel="noopener noreferrer" className="ig__item" aria-label={`פוסט באינסטגרם: ${p.alt}`}>
                  <Image src={image.src} alt={p.alt} fill sizes="(min-width: 1024px) 16vw, 33vw" placeholder="blur" blurDataURL={image.blur} />
                  <span className="ig__overlay" aria-hidden="true">
                    <InstagramIcon />
                  </span>
                </a>
              </li>
            );
          })}
        </Reveal>
        <div className="section__cta">
          <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
            <InstagramIcon width={18} height={18} /> לעמוד האינסטגרם
          </a>
        </div>
      </div>
    </section>
  );
}
