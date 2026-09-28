import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionHeader } from "@/components/collection/CollectionHeader";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { pages } from "@/data/content";
import { site } from "@/data/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return pages.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = pages.find((p) => p.slug === slug);
  if (!page) return {};
  return { title: page.title, description: page.description, alternates: { canonical: `/pages/${page.slug}` } };
}

export default async function InfoPage({ params }: Props) {
  const { slug } = await params;
  const page = pages.find((p) => p.slug === slug);
  if (!page) notFound();

  const faqLd =
    slug === "faq"
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: page.sections
            .filter((s) => s.known)
            .map((s) => ({ "@type": "Question", name: s.heading, acceptedAnswer: { "@type": "Answer", text: s.known } })),
        }
      : null;

  return (
    <>
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <CollectionHeader eyebrow={site.name} title={page.title} description={page.description} crumbs={[{ href: "/", label: "דף הבית" }]} />
      <div className="container prose-page">
        {slug === "faq" ? (
          <FaqAccordion />
        ) : (
          page.sections.map((s) => (
            <section key={s.heading} className="prose-page__section">
              <h2>{s.heading}</h2>
              {s.known && <p>{s.known}</p>}
              {s.placeholder && <p className="ph-block">{s.placeholder}</p>}
            </section>
          ))
        )}
        {slug === "contact" && (
          <a href={site.instagram.dm} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
            שליחת הודעה באינסטגרם
          </a>
        )}
      </div>
    </>
  );
}
